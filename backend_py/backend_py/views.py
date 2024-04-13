from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import base64
import json

# GeminiAI
import vertexai
from vertexai.generative_models import GenerativeModel, Part

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
