import os
import pandas as pd
from tempfile import NamedTemporaryFile

from backend.models.image_processor import ImageProcessor
from backend.models.llm_service import PixtralVisionService
from backend.utils.helpers import get_all_items_for_image, process_response
import backend.models.config as config

class StyleFinderApp:
    """
    Classe principale de l'application qui orchestre le workflow Style Finder.
    """

    def __init__(self, dataset_path):
        """
        Initialise l'application Style Finder.

        Args:
            dataset_path (str): Chemin vers le fichier du dataset

        Raises:
            FileNotFoundError: Si le fichier du dataset est introuvable
            ValueError: Si le dataset est vide ou invalide
        """
        if isinstance(dataset_path, pd.DataFrame):
            self.data = dataset_path
        else:
            # Sinon, charger depuis le fichier
            if not os.path.exists(dataset_path):
                raise FileNotFoundError(f"Fichier du dataset introuvable : {dataset_path}")
            self.data = pd.read_pickle(dataset_path)

        if self.data.empty:
            raise ValueError("Le dataset chargé est vide")

        # Initialiser les composants
        self.image_processor = ImageProcessor(
            image_size=config.IMAGE_SIZE,
            norm_mean=config.NORMALIZATION_MEAN,
            norm_std=config.NORMALIZATION_STD
        )

        self.llm_service = PixtralVisionService()

    def process_image(self, image):
        """
        Traite une image uploadée par l'utilisateur et génère une réponse mode.

        Args:
            image: Image PIL uploadée via Gradio

        Returns:
            str: Réponse formatée avec l'analyse mode
        """
        # Sauvegarder l'image temporairement si ce n'est pas déjà un chemin de fichier
        if not isinstance(image, str):
            temp_file = NamedTemporaryFile(delete=False, suffix=".jpg")
            image_path = temp_file.name
            image.save(image_path)
        else:
            image_path = image

        # Étape 1 : Encoder l'image
        user_encoding = self.image_processor.encode_image(image_path, is_url=False)
        if user_encoding['vector'] is None:
            return "Erreur : Impossible de traiter l'image. Veuillez essayer une autre image."

        # Étape 2 : Trouver les correspondances les plus proches
        closest_matches = self.image_processor.find_closest_match(
            user_encoding['vector'],
            dataset=self.data,
            metric='cosine',
            top_k=15
        )
        if not closest_matches:
            return "Erreur : Impossible de trouver une correspondance. Veuillez essayer une autre image."

        # Extraire les noms des articles de toutes les lignes
        matched_rows = [closest_rows.get('Item Name', 'N/A') for closest_rows, similarity_score, index in closest_matches]

        # Étape 3 : Récupérer tous les articles liés (utiliser le premier résultat)
        if closest_matches:
            print("Top 15 des correspondances les plus proches :")
            for i, (closest_rows, similarity_score, index) in enumerate(closest_matches, 1):
                print(f"{i}. {closest_rows.get('Item Name', 'N/A')} - Score: {similarity_score:.4f}")

            first_match = closest_matches[0]
            closest_rows, similarity_score, index = first_match

            all_items = get_all_items_for_image(closest_rows.get('Image URL', ''), self.data)
            if all_items.empty:
                return "Erreur : Aucun article trouvé pour l'image correspondante."

            bot_response = self.llm_service.generate_fashion_response(
                user_image_base64=user_encoding['base64'],
                matched_rows=matched_rows,
                all_items=all_items,
                similarity_score=similarity_score,
                threshold=config.SIMILARITY_THRESHOLD
            )
        else:
            return "Erreur : Aucune correspondance trouvée."

        # Nettoyer le fichier temporaire
        if not isinstance(image, str):
            try:
                os.unlink(image_path)
            except:
                pass

        return {
            "bot_response": process_response(bot_response),
            "closest_image_url": closest_rows.get('Image URL', '')
        }