const fs = require("fs");
const { VertexAI } = require("@google-cloud/vertexai");

const reactComponentNames = [
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
];

const vertexAI = new VertexAI({ project: "omega-tenure-418822", location: "us-central1" });
const textModel = "gemini-1.0-pro";
const visionModel = "gemini-1.0-pro-vision";

async function run() {
    const base64_image = fs.readFileSync("accordion.png", {
        encoding: "base64",
    });

    const generativeVisionModel = vertexAI.getGenerativeModel({
        model: visionModel,
    });

    const filePart = { inline_data: { data: base64_image, mimeType: "image/png" } };
    const textPart = {
        text: `Based on the provided image, what JavaScript component can it be? Return a JSON object with keys: name, description. 'name' should only have one of these: ${reactComponentNames.join(
            ","
        )}. 'description' should outline the image content and if any javascript functionalities, explicit css styles (example: color, background, font-size, width, display, position etc.)`,
    };
    const request = {
        contents: [{ role: "user", parts: [textPart, filePart] }],
    };

    const result = await generativeVisionModel.generateContent(request);
    const response = result.response;
    console.log("Response: ", JSON.stringify(response));
}

run();
