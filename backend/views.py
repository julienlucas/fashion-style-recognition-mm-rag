import io
import os
from PIL import Image
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .app import StyleFinderApp

@csrf_exempt
@require_http_methods(["GET"])
def index(request):
    return render(request, 'frontend/dist/index.html')

@csrf_exempt
@require_http_methods(["POST"])
def analyze(request):
    try:
        image_file = request.FILES['image']

        # Convertir en objet PIL Image
        image_data = image_file.read()
        pil_image = Image.open(io.BytesIO(image_data))

        # Chemin absolu vers le dataset
        current_dir = os.path.dirname(os.path.abspath(__file__))
        dataset_path = os.path.join(current_dir, 'dataset', 'swift-style-embeddings.pkl')

        app = StyleFinderApp(dataset_path)

        result = app.process_image(pil_image)
        print(result)
        return JsonResponse({"message": result})

    except Exception as e:
        return JsonResponse({"Erreur": str(e)}, status=500)