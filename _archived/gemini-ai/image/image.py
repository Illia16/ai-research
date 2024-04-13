# import vertexai
# from vertexai.generative_models import GenerativeModel, Part, Image
# import os

# # this fn grabs file itself from local dirr
# def generate_text(project_id: str, location: str) -> str:
#     vertexai.init(project=project_id, location=location)
#     multimodal_model = GenerativeModel("gemini-1.0-pro-vision")

#     current_directory = os.getcwd()
#     file_path = os.path.join(current_directory, "accordion.png")
#     print("file_path of", file_path)

#     response = multimodal_model.generate_content(
#         [
#             Part.from_image(Image.load_from_file(file_path)),
#             "what is shown in this image?",
#         ]
#     )
#     print(response)
#     return response.text

# generate_text("omega-tenure-418822", "us-central1")








# import vertexai
# from vertexai.generative_models import GenerativeModel, Part
# import base64


# # # this fn grabs file from local dirr, converts it to base64
# def generate_text(project_id: str, location: str) -> str:
#     vertexai.init(project=project_id, location=location)
#     multimodal_model = GenerativeModel("gemini-1.0-pro-vision")

#     with open("accordion.png", "rb") as f:
#         image_bytes = f.read()
    
#     image_base64 = base64.b64encode(image_bytes).decode("utf-8")

#     response = multimodal_model.generate_content(
#         [
#             Part.from_data(image_base64, mime_type="image/png"),
#             "what is shown in this image?",
#         ]
#     )
#     print(response)
#     return response.text

# generate_text("omega-tenure-418822", "us-central1")