from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import base64
import json
import uuid
from pathlib import Path
import argparse
import os
from datetime import datetime
from django.conf import settings

# GeminiAI
# import vertexai
# from vertexai.generative_models import GenerativeModel, Part
# from vertexai.preview.vision_models import Image, ImageGenerationModel

from google import genai
from google.genai.types import HttpOptions, Part, GenerateContentConfig, RawReferenceImage
from google.genai import types

# Helpers
from .helpers import react_component_names, save_prompt

PROJECT_ID = os.getenv('PROJECT_ID')

@csrf_exempt
def handleImage(request):
    if request.method == 'POST' and request.FILES['file']:
        image_file = request.FILES['file']
        image_data = image_file.read()

        prompt = (
            f"Based on the provided image, what JavaScript component can it be? "
            f"Return a JSON object with keys: name, description. "
            f"'name' should only have one of these: {', '.join(react_component_names)}. "
            f"'description' should outline the image content and if any javascript functionalities, "
            f"explicit css styles (example: color, background, font-size, width, display, position etc.)"
        )
        client = genai.Client(vertexai=True, project=PROJECT_ID, location="us-central1");
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=image_data, mime_type='image/png'),
                types.Part.from_text(text=prompt)
            ],
            config=GenerateContentConfig(
                response_mime_type="application/json",
            )
        )

        json_string = response.text
        res = json.loads(json_string)

        return JsonResponse({'success': True, 'message': 'Image converted to base64', 'data': res, 'ai': 'geminiai'})
    else:
        return JsonResponse({'success': False, 'message': 'No image provided', 'ai': 'geminiai'})

def helloworld(request):
    print(request)
    return HttpResponse(f"Hello, world! Env var PROJECT_ID:{PROJECT_ID}, DIRECTORY: {os.getcwd()}")

@csrf_exempt
def generateImage(request):
    data = json.loads(request.body)
    text = data.get('prompt', None)
    modelName = data.get('modelName', None)
    number_of_images = data.get('numberOfImages', None)
    uniqueId = str(uuid.uuid4())

    client = genai.Client(vertexai=True, project=PROJECT_ID, location="us-central1");
    # Generate Image
    response1 = client.models.generate_images(
        model=modelName,
        prompt=text,
        config=types.GenerateImagesConfig(
            number_of_images=number_of_images,
            include_rai_reason=True,
            output_mime_type='image/jpeg',
        ),
    )
    print(response1)

    fileName = (
        '_'.join(text.split(" ")[:5])
        .replace(r"[^\w\s]+", "")
        .lower()
    )
    fileName += f"___{uniqueId}"

    dirrProject = Path(settings.BASE_DIR_PROJECT)    

    saved_paths = []
    for i, img in enumerate(response1.generated_images, start=1):
        fileImg = (dirrProject/ 'frontend' / 'public' / 'images' / 'generated-images' / 'geminiai'/ f"{fileName}__{i}.png")

        with open(fileImg, "wb") as f:
            f.write(img.image.image_bytes)

        save_prompt(fileName + f"__{i}", img.enhanced_prompt or text, "geminiai", "generated-images")
        print(f"Created output image {i} using {len(img.image.image_bytes)} bytes")

        saved_paths.append(f"/images/generated-images/geminiai/{fileName}__{i}.png")

    return JsonResponse({'success': True, 'message': saved_paths, 'ai': 'geminiai'})

@csrf_exempt
def editImage(request):
    uniqueId = str(uuid.uuid4())
    image_file = request.FILES['file']
    image_bytes = image_file.read()
    text = request.POST.get('prompt')
    modelName = request.POST.get('modelName')
    number_of_images = request.POST.get('numberOfImages', None)

    print(f"Uploaded image size: {len(image_bytes)} bytes")
    print(f"text: {text}")
    print(f"modelName: {modelName}")
    print(f"number_of_images: {number_of_images}")

    client = genai.Client(vertexai=True, project=PROJECT_ID, location="us-central1");
    # Edit Image
    raw_ref_image = RawReferenceImage(
        reference_id=1,
        reference_image=types.Image(image_bytes=image_bytes),
    )
    
    response = client.models.edit_image(
        model=modelName,
        prompt=text,
        reference_images=[raw_ref_image],
        config=types.EditImageConfig(
            # edit_mode= "EDIT_MODE_INPAINT_INSERTION",
            # person_generation="allow_all",
            number_of_images=number_of_images,
            include_rai_reason=True,
            output_mime_type='image/png',
            # output_compression_quality=100
        ),
    )
    print(response)

    fileName = (
        '_'.join(text.split(" ")[:5])
        .replace(r"[^\w\s]+", "")
        .lower()
    )
    fileName += f"___{uniqueId}"

    dirrProject = Path(settings.BASE_DIR_PROJECT)

    saved_paths = []
    for i, img in enumerate(response.generated_images, start=1):
        fileImg = (dirrProject/ 'frontend' / 'public' / 'images' / 'edited-images' / 'geminiai'/ f"{fileName}__{i}.png")

        with open(fileImg, "wb") as f:
            f.write(img.image.image_bytes)

        save_prompt(fileName + f"__{i}", img.enhanced_prompt or text, "geminiai", "edited-images")
        print(f"Created output image {i} using {len(img.image.image_bytes)} bytes")

        saved_paths.append(f"/images/edited-images/geminiai/{fileName}__{i}.png")

    return JsonResponse({'success': True, 'message': saved_paths, 'ai': 'geminiai'})

@csrf_exempt
def get_saved_images(request):
    dirrProject = Path(settings.BASE_DIR_PROJECT)
    imgTypeDirr = request.GET.get('images')
    imageFolderPath = Path(dirrProject / 'frontend' / 'public' / 'images' / imgTypeDirr / 'geminiai')

    if not imageFolderPath.exists():
        json_file_path = str(dirrProject / 'backend' / 'prompts.json')
        with open(json_file_path, 'r') as file:
            imagePromts = json.load(file)
        return JsonResponse({'success': True, 'imageFiles': [], 'imagePromts': imagePromts, 'ai': 'geminiai'})

    allowed_extensions = ['.png', '.jpeg', '.jpg', '.webp']

    imageFiles = []
    for f in imageFolderPath.iterdir():
        if f.is_file() and f.suffix.lower() in allowed_extensions:
            try:
                stat = f.stat()
                # Convert timestamp to ISO 8601 format with Z timezone (e.g., 2024-05-07T20:38:54.662Z)
                timestamp = stat.st_mtime
                dt = datetime.fromtimestamp(timestamp)
                # Format as ISO 8601 with milliseconds and Z timezone
                createdAt = dt.strftime('%Y-%m-%dT%H:%M:%S') + '.' + f'{dt.microsecond // 1000:03d}' + 'Z'
                imageFiles.append({'filename': f.name, 'createdAt': createdAt})
            except OSError:
                # If we can't get file stats, still include the file but without createdAt
                imageFiles.append({'filename': f.name, 'createdAt': None})

    # Sort from newest to oldest by creation date
    imageFiles.sort(key=lambda x: x['createdAt'] if x['createdAt'] is not None else '', reverse=True)

    json_file_path = str(dirrProject / 'backend' / 'prompts.json')
    with open(json_file_path, 'r') as file:
        imagePromts = json.load(file)

    return JsonResponse({'success': True, 'imageFiles': imageFiles, 'imagePromts': imagePromts, 'ai': 'geminiai'})
