from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import base64
import json
import uuid
from pathlib import Path
import argparse
from django.conf import settings

# GeminiAI
import vertexai
from vertexai.generative_models import GenerativeModel, Part
from vertexai.preview.vision_models import ImageGenerationModel

# Helpers
from .helpers import react_component_names

@csrf_exempt
def handleImage(request):
    if request.method == 'POST' and request.FILES['file']:
        image_file = request.FILES['file']
        image_data = image_file.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')

        vertexai.init(project="omega-tenure-418822", location="us-central1")
        multimodal_model = GenerativeModel("gemini-1.0-pro-vision")

        response = multimodal_model.generate_content(
            [
                Part.from_data(base64_image, mime_type="image/png"),
                f"Based on the provided image, what JavaScript component can it be? Return a JSON object with keys: name, description. 'name' should only have one of these: {','.join(react_component_names)}. 'description' should outline the image content and if any javascript functionalities, explicit css styles (example: color, background, font-size, width, display, position etc.)",
            ]
        )

        json_string = response.text.replace("```json", "").replace('```', '')
        res = json.loads(json_string)

        return JsonResponse({'success': True, 'message': 'Image converted to base64', 'data': res, 'ai': 'geminiai'})
    else:
        return JsonResponse({'success': False, 'message': 'No image provided', 'ai': 'geminiai'})

def helloworld(request):
    print(request)
    return HttpResponse("Hello, world!")

@csrf_exempt
def generateImage(request):
    data = json.loads(request.body)
    text = data.get('prompt', None)
    uniqueId = str(uuid.uuid4())

    vertexai.init(project="omega-tenure-418822", location="us-central1")
    model = ImageGenerationModel.from_pretrained("imagegeneration@006")
    images = model.generate_images(
        prompt=text,
        number_of_images=1,
        language="en",
        # add_watermark=False,
        # seed=100,
        aspect_ratio="1:1",  # "9:16" "16:9" "4:3" "3:4"
        safety_filter_level="block_some",
        person_generation="allow_adult",
    )

    fileName = (
        '_'.join(text.split(" ")[:5])
        .replace(r"[^\w\s]+", "")
        .lower()
    )
    fileName += f"___{uniqueId}"

    dirrProject = Path(settings.BASE_DIR_PROJECT)
    fileImg = str(dirrProject / 'frontend' / 'public' / 'images' / 'generated-images' / 'geminiai' / (fileName + '.png'))
    images[0].save(location=fileImg, include_generation_parameters=True)
    print(f"Created output image using {len(images[0]._image_bytes)} bytes")

    return JsonResponse({'success': True, 'message': fileImg, 'ai': 'geminiai'})

@csrf_exempt
def get_saved_images(request):
    dirrProject = Path(settings.BASE_DIR_PROJECT)
    imageFolderPath = str(dirrProject / 'frontend' / 'public' / 'images' / 'generated-images' / 'geminiai')
    imageFiles = [f for f in Path(imageFolderPath).iterdir() if f.is_file()]
    imageFiles = [f.name for f in imageFiles]
    return JsonResponse({'success': True, 'message': imageFiles, 'ai': 'geminiai'})