import json
import os
from pathlib import Path

react_component_names = [
    "Header",
    "Modal",
    "SkipToContent",
    "Accordion",
    "Breadcrumb",
    "Cta",
    "Isi",
    "Form",
    "FormInput",
    "StickyIsi",
    "Footer",
]

def save_prompt(revised_prompt_key, revised_prompt_val, parent_key, child_key, additional_data=None):
    # Read the existing JSON file
    # Calculate project root: backend_py/backend_py/helpers.py -> backend_py -> project root -> backend/prompts.json
    project_root = Path(__file__).resolve().parent.parent.parent
    file_path = project_root / "backend" / "prompts.json"
    data = {}

    # Read the JSON file
    try:
        with open(str(file_path), "r", encoding="utf-8") as file:
            data = json.load(file)
    except FileNotFoundError:
        print(f"Error: {file_path} not found.")
        return
    except json.JSONDecodeError as error:
        print(f"Error decoding JSON file: {error}")
        return
    except Exception as error:
        print(f"Error reading file: {error}")
        return

    # Ensure parent key exists
    if parent_key not in data:
        data[parent_key] = {}

    # Ensure child key exists
    if child_key not in data[parent_key]:
        data[parent_key][child_key] = {}

    # If additional_data is provided (for images), create an object structure
    # Otherwise, revised_prompt_val is already an object (for videos)
    if additional_data:
        # For images: save as object with prompt and additional metadata
        data[parent_key][child_key][revised_prompt_key] = {
            "prompt": revised_prompt_val,
            **additional_data,
        }
    else:
        # For videos: revised_prompt_val is already an object
        data[parent_key][child_key][revised_prompt_key] = revised_prompt_val

    # Write the updated data back to the JSON file
    try:
        with open(str(file_path), "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4)
        print(f"JSON file updated successfully: {file_path}")
    except Exception as error:
        print(f"Error writing to JSON file: {error}")