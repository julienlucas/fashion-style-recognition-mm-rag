import logging
import re
import backend.models.config as config

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_all_items_for_image(image_url, dataset):
    """
    Récupère tous les articles liés à une image spécifique depuis le dataset.

    Args:
        image_url (str): L'URL de l'image trouvée
        dataset (DataFrame): Dataset contenant les informations de tenues

    Returns:
        DataFrame: Tous les articles liés à l'image
    """
    related_items = dataset[dataset['Image URL'] == image_url]
    logger.info(f"Trouvé {len(related_items)} articles liés à l'URL de l'image : {image_url}")
    return related_items

def format_alternatives_response(user_response, alternatives, similarity_score, threshold=config.SIMILARITY_THRESHOLD):
    """
    Ajoute les alternatives à la réponse utilisateur de façon formatée.

    Args:
        user_response (str): Réponse originale du modèle
        alternatives (dict): Dictionnaire des alternatives pour chaque article
        similarity_score (float): Score de similarité de la correspondance
        threshold (float): Seuil pour déterminer la qualité de la correspondance

    Returns:
        str: Réponse enrichie avec les alternatives
    """
    # Vérifier si user_response est problématique
    if not user_response or any(phrase in user_response for phrase in [
            "Je ne peux pas fournir",
            "Je ne peux pas",
            "Je suis désolé, mais",
            "Je ne me sens pas à l'aise"]):
        # Créer une réponse basique si le modèle a refusé
        user_response = "## Résultats de l'analyse mode\n\nVoici les articles détectés dans votre image :"

    if similarity_score >= threshold:
        enhanced_response = user_response + "\n\n## Articles similaires trouvés\n\nVoici quelques articles similaires que nous avons trouvés :\n"
    else:
        enhanced_response = user_response + "\n\n## Articles similaires trouvés\n\nVoici quelques articles visuellement similaires :\n"

    # Compter les articles ajoutés pour s'assurer qu'on ne dépasse pas les limites raisonnables
    items_added = 0
    max_items = 10

    for item, alts in alternatives.items():
        enhanced_response += f"\n### {item} :\n"
        if alts:
            for alt in alts[:3]:  # Limiter à 3 alternatives par article
                if items_added < max_items:
                    enhanced_response += f"- {alt['title']} pour {alt['price']} de {alt['source']} ([Achetez ici]({alt['link']}))\n"
                    items_added += 1
        else:
            enhanced_response += "- Aucune alternative trouvée.\n"

    return enhanced_response

def process_response(response: str) -> str:
    """
    Traite et échappe les caractères problématiques dans la réponse.

    Args:
        response (str): Le texte de réponse original

    Returns:
        str: Réponse traitée avec caractères échappés et bon formatage
    """
    if not response:
        logger.warning("Réponse vide reçue")
        return "# Analyse Mode\n\nAucune analyse détaillée n'a été générée. Veuillez vous référer aux détails des articles ci-dessous."

    # Vérifier les messages de rejet
    rejection_phrases = [
        "Je ne peux pas fournir",
        "Je ne suis pas en mesure de fournir",
        "Je suis désolé, mais je ne peux pas",
        "Je ne me sens pas à l'aise",
        "a enfreint notre politique de contenu"
    ]

    # Si le modèle a rejeté mais qu'on a quand même des détails d'articles, extraire et formater
    if any(phrase in response for phrase in rejection_phrases):
        logger.warning("Le modèle a rejeté la requête, extraction des détails d'articles")

        # Essayer d'extraire la section des articles
        items_section = None

        if "DÉTAILS DES ARTICLES :" in response:
            # Extraire tout après DÉTAILS DES ARTICLES :
            items_section = "## Détails des articles\n\n" + response.split("DÉTAILS DES ARTICLES :")[1].strip()
        elif "ARTICLES SIMILAIRES :" in response:
            # Extraire tout après ARTICLES SIMILAIRES :
            items_section = "## Articles similaires\n\n" + response.split("ARTICLES SIMILAIRES :")[1].strip()

        if items_section:
            # Formater les détails avec le Markdown approprié
            formatted_items = re.sub(r'^\* ', '- ', items_section, flags=re.MULTILINE)
            return "# Analyse Mode\n\nVoici les articles détectés dans votre image :\n\n" + formatted_items
        else:
            # Retourner ce qu'on a avec un traitement minimal
            return response.replace("$", "\\$")

    # Échapper les signes $ pour le Markdown
    processed = response.replace("$", "\\$")

    # S'assurer que les sections importantes sont bien formatées
    if "DÉTAILS DES ARTICLES :" in processed:
        processed = processed.replace("DÉTAILS DES ARTICLES :", "## Détails des articles")

    if "ARTICLES SIMILAIRES :" in processed:
        processed = processed.replace("ARTICLES SIMILAIRES :", "## Articles similaires")

    # Ajouter un formatage pour un affichage esthétique
    if not processed.startswith("#"):
        processed = "# Analyse Mode\n\n" + processed

    # S'assurer que tous les points utilisent le Markdown cohérent
    processed = re.sub(r'^\* ', '- ', processed, flags=re.MULTILINE)

    return processed