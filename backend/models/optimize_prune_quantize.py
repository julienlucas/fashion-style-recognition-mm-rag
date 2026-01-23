import argparse
import os
import sys
from pathlib import Path

import numpy as np
import torch
import torch.nn.utils.prune as prune
from torchvision.models import ConvNeXt_Tiny_Weights, convnext_tiny

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))


def load_convnext_tiny() -> torch.nn.Module:
    """Charge ConvNeXt Tiny avec les poids ImageNet."""
    print("📦 Chargement du modèle ConvNeXt Tiny...")
    weights = ConvNeXt_Tiny_Weights.IMAGENET1K_V1
    model = convnext_tiny(weights=weights)
    model.eval()
    print(f"   ✓ Modèle chargé avec succès")
    return model


def apply_global_pruning(
    model: torch.nn.Module, amount: float = 0.3
) -> torch.nn.Module:
    """
    Applique le pruning L1 global à toutes les couches Conv2d et Linear.

    Le pruning global considère tous les poids du modèle ensemble pour décider
    lesquels pruner, plutôt que de pruner un pourcentage fixe par couche.

    Args:
        model: Modèle PyTorch à pruner
        amount: Fraction de connexions à pruner (0.0 à 1.0)

    Returns:
        Modèle pruné avec les masques de pruning rendus permanents
    """
    print(f"✂️  Application du pruning L1 GLOBAL (amount={amount})...")

    # Compter les paramètres avant le pruning
    total_params_before = sum(p.numel() for p in model.parameters())
    nonzero_before = sum((p != 0).sum().item() for p in model.parameters())

    # Collecter toutes les couches à pruner
    parameters_to_prune = []
    for name, module in model.named_modules():
        if isinstance(module, (torch.nn.Conv2d, torch.nn.Linear)):
            parameters_to_prune.append((module, "weight"))

    print(f"   ✓ {len(parameters_to_prune)} couches identifiées pour le pruning")

    # Appliquer le pruning global L1
    prune.global_unstructured(
        parameters_to_prune,
        pruning_method=prune.L1Unstructured,
        amount=amount,
    )

    # Rendre le pruning permanent (retirer les masques)
    for module, param_name in parameters_to_prune:
        prune.remove(module, param_name)

    # Compter les paramètres après le pruning
    nonzero_after = sum((p != 0).sum().item() for p in model.parameters())

    sparsity = 1 - (nonzero_after / nonzero_before)
    print(f"   ✓ Paramètres: {total_params_before:,}")
    print(f"   ✓ Non-nuls avant: {nonzero_before:,}")
    print(f"   ✓ Non-nuls après: {nonzero_after:,}")
    print(f"   ✓ Sparsité réelle: {sparsity:.2%}")

    return model


def export_to_onnx(
    model: torch.nn.Module, output_path: str, opset_version: int = 17
) -> str:
    """
    Exporte le modèle PyTorch au format ONNX.

    Args:
        model: Modèle PyTorch à exporter
        output_path: Chemin pour le fichier ONNX
        opset_version: Version de l'opset ONNX

    Returns:
        Chemin vers le fichier ONNX exporté
    """
    print(f"📤 Export vers ONNX (opset {opset_version})...")

    # Créer une entrée factice (batch_size=1, channels=3, height=224, width=224)
    dummy_input = torch.randn(1, 3, 224, 224)

    # S'assurer que le répertoire de sortie existe
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    # Exporter vers ONNX
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=opset_version,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={
            "input": {0: "batch_size"},
            "output": {0: "batch_size"},
        },
    )

    file_size = os.path.getsize(output_path) / (1024 * 1024)
    print(f"   ✓ Exporté vers: {output_path}")
    print(f"   ✓ Taille du fichier: {file_size:.2f} MB")

    return output_path


def quantize_onnx_int8(input_path: str, output_path: str) -> str:
    """
    Applique la quantification INT8 dynamique au modèle ONNX en utilisant le format QDQ.

    Args:
        input_path: Chemin vers le fichier ONNX d'entrée
        output_path: Chemin pour le fichier ONNX quantifié

    Returns:
        Chemin vers le fichier ONNX quantifié
    """
    print("🔢 Application de la quantification INT8 (format QDQ)...")

    try:
        from onnxruntime.quantization import QuantType, quantize_dynamic
    except ImportError:
        print("   ⚠️  onnxruntime.quantization non disponible, quantification ignorée")
        return input_path

    # Appliquer la quantification dynamique avec QUInt8 (meilleure compatibilité)
    # Utiliser extra_options pour assurer le format QDQ qui est plus largement supporté
    quantize_dynamic(
        model_input=input_path,
        model_output=output_path,
        weight_type=QuantType.QUInt8,
        extra_options={"MatMulConstBOnly": True},
    )

    original_size = os.path.getsize(input_path) / (1024 * 1024)
    quantized_size = os.path.getsize(output_path) / (1024 * 1024)
    reduction = (1 - quantized_size / original_size) * 100

    print(f"   ✓ Modèle quantifié sauvegardé vers: {output_path}")
    print(f"   ✓ Taille originale: {original_size:.2f} MB")
    print(f"   ✓ Taille quantifiée: {quantized_size:.2f} MB")
    print(f"   ✓ Réduction de taille: {reduction:.1f}%")

    return output_path


def verify_onnx_model(onnx_path: str) -> bool:
    """Vérifie que le modèle ONNX est valide et peut être chargé."""
    print("🔍 Vérification du modèle ONNX...")

    try:
        import onnx
        import onnxruntime as ort

        # Vérifier la validité du modèle
        model = onnx.load(onnx_path)
        onnx.checker.check_model(model)
        print("   ✓ Modèle ONNX valide")

        # Test d'inférence
        session = ort.InferenceSession(onnx_path)
        dummy_input = np.random.randn(1, 3, 224, 224).astype(np.float32)
        output = session.run(None, {"input": dummy_input})
        print(f"   ✓ Test d'inférence réussi, forme de sortie: {output[0].shape}")

        return True

    except Exception as e:
        print(f"   ✗ Vérification échouée: {e}")
        return False


def compare_outputs(
    pytorch_model: torch.nn.Module, onnx_path: str, tolerance: float = 1e-4
) -> bool:
    """Compare les sorties des modèles PyTorch et ONNX."""
    print("🔬 Comparaison des sorties PyTorch vs ONNX...")

    import onnxruntime as ort

    # Créer une entrée de test
    test_input = torch.randn(1, 3, 224, 224)

    # Inférence PyTorch
    pytorch_model.eval()
    with torch.no_grad():
        pytorch_output = pytorch_model(test_input).numpy()

    # Inférence ONNX
    session = ort.InferenceSession(onnx_path)
    onnx_output = session.run(None, {"input": test_input.numpy()})[0]

    # Comparer
    max_diff = np.abs(pytorch_output - onnx_output).max()
    mean_diff = np.abs(pytorch_output - onnx_output).mean()

    print(f"   ✓ Différence maximale: {max_diff:.6f}")
    print(f"   ✓ Différence moyenne: {mean_diff:.6f}")

    if max_diff < tolerance:
        print(f"   ✓ Les sorties correspondent dans la tolérance ({tolerance})")
        return True
    else:
        print(f"   ⚠️  Les sorties diffèrent plus que la tolérance ({tolerance})")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Optimise ConvNeXt Tiny avec pruning et quantification"
    )
    parser.add_argument(
        "--pruning-amount",
        type=float,
        default=0.3,
        help="Fraction de poids à pruner (0.0-1.0, défaut: 0.3)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="backend/models/convnext_tiny_optimized.onnx",
        help="Chemin de sortie pour le modèle ONNX optimisé",
    )
    parser.add_argument(
        "--no-pruning",
        action="store_true",
        help="Ignorer le pruning, appliquer uniquement la quantification",
    )
    parser.add_argument(
        "--no-quantization",
        action="store_true",
        help="Ignorer la quantification, appliquer uniquement le pruning",
    )
    parser.add_argument(
        "--keep-intermediate",
        action="store_true",
        help="Conserver le fichier ONNX intermédiaire (avant quantification)",
    )

    args = parser.parse_args()

    print("=" * 60)
    print("🚀 Pipeline d'optimisation ConvNeXt Tiny")
    print("=" * 60)
    print(f"   Quantité de pruning: {args.pruning_amount if not args.no_pruning else 'désactivé'}")
    print(f"   Quantification: {'INT8' if not args.no_quantization else 'désactivée'}")
    print(f"   Sortie: {args.output}")
    print("=" * 60)

    # Étape 1: Charger le modèle
    model = load_convnext_tiny()

    # Étape 2: Appliquer le pruning global (optionnel)
    if not args.no_pruning:
        model = apply_global_pruning(model, amount=args.pruning_amount)

    # Étape 3: Exporter vers ONNX
    if args.no_quantization:
        onnx_path = args.output
    else:
        # Utiliser un fichier intermédiaire pour la quantification
        onnx_path = args.output.replace(".onnx", "_fp32.onnx")

    export_to_onnx(model, onnx_path)

    # Vérifier le modèle FP32 et comparer les sorties
    verify_onnx_model(onnx_path)
    compare_outputs(model, onnx_path)

    # Étape 4: Appliquer la quantification INT8 (optionnel)
    if not args.no_quantization:
        final_path = quantize_onnx_int8(onnx_path, args.output)

        # Vérifier le modèle quantifié
        verify_onnx_model(final_path)

        # Nettoyer le fichier intermédiaire
        if not args.keep_intermediate and os.path.exists(onnx_path):
            os.remove(onnx_path)
            print(f"   ✓ Fichier intermédiaire supprimé: {onnx_path}")

    print("=" * 60)
    print("✅ Optimisation terminée !")
    print("=" * 60)


if __name__ == "__main__":
    main()
