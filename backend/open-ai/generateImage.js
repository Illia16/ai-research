const fs = require("fs");
const path = require("path");

const OpenAI = require("openai");

const { apiKey } = require("../secrets");
const openai = new OpenAI({ apiKey });

module.exports = async function main(text) {
    const image = await openai.images.generate({
        model: "dall-e-3",
        prompt: text,
        response_format: "b64_json",
        // quality: "hd",
    });

    // Decode base64 string to binary data
    const binaryData = Buffer.from(image.data[0].b64_json, "base64");
    // Define the directory to save the image (go 1 lvl up of backend/ dirr)
    const directory = path.join(
        path.resolve(__dirname, "..", ".."),
        "frontend",
        "public",
        "images",
        "generated-images",
        "openai"
    );

    // Ensure the directory exists, create it if it doesn't
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    const filePath = path.join(directory, `${text}.png`);

    // Save binary data to file
    fs.writeFileSync(filePath, binaryData);

    console.log("Image saved successfully.");

    return image.data;
};
