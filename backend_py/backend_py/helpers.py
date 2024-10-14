import json
import os

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

def save_prompt(revised_prompt_key, revised_prompt_val, parent_key, child_key):
    # Read the existing JSON file
    file_path = os.path.join(os.path.dirname(os.getcwd()), "backend", "prompts.json")
    data = {}

    # Read the JSON file
    try:
        with open(file_path, "r", encoding="utf-8") as file:
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

    # Update it
    if parent_key in data and child_key in data[parent_key]:
        data[parent_key][child_key][revised_prompt_key] = revised_prompt_val
    else:
        print("Error: Specified parent or child key does not exist.")
        return

    # Write the updated data back to the JSON file
    try:
        with open(file_path, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4)
        print("JSON file updated successfully.")
    except Exception as error:
        print(f"Error writing to JSON file: {error}")