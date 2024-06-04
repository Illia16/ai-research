const fs = require("fs");
const OpenAI = require("openai");
const path = require("path");

const { apiKey } = require("../secrets");
const openai = new OpenAI({ apiKey });
const { v4: uuidv4 } = require("uuid");

module.exports = async function main(imageToEdit, imageName) {
    const uniqueId = uuidv4();
    const res = await openai.images.createVariation({
        image: fs.createReadStream(imageToEdit),
        response_format: "b64_json",
    });

    console.log(res.data);
    const binaryData = Buffer.from(res.data[0].b64_json, "base64");
    // Define the directory to save the image (go 1 lvl up of backend/ dirr)
    const directory = path.join(
        path.resolve(__dirname, "..", ".."),
        "frontend",
        "public",
        "images",
        "variation-images",
        "openai"
    );

    // Ensure the directory exists, create it if it doesn't
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    const fileName =
        imageName
            .split(" ")
            .slice(0, 5)
            .join("_")
            .replace(/[^\w\s]+/g, "")
            .toLowerCase() +
        "___" +
        uniqueId;
    const filePath = path.join(directory, `${fileName}.png`);

    // Save binary data to file
    fs.writeFileSync(filePath, binaryData);
    return res.data;
};
