const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function convertFileToBase64(filePath) {
    const fileData = fs.readFileSync(filePath);
    const base64Image = fileData.toString("base64");
    return base64Image;
}

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

const saveImg = (base64Str, imgTypeDirr, imageName) => {
    const uniqueId = uuidv4();
    const binaryData = Buffer.from(base64Str, "base64");
    // Define the directory to save the image (go 1 lvl up of backend/ dirr)
    const directory = path.join(path.resolve(__dirname, ".."), "frontend", "public", "images", imgTypeDirr, "openai");

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

    return { filePath, fileName };
};

const savePrompt = (revisedPromptKey, revisedPromptVal, parentKey, childKey) => {
    // Read the existing JSON file
    let filePath = "prompts.json";
    let data;

    try {
        data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        console.error("Error reading JSON file:", error);
        return;
    }

    // Update it
    data[parentKey][childKey][revisedPromptKey] = revisedPromptVal;

    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        console.log("JSON file updated successfully.");
    } catch (error) {
        console.error("Error writing JSON file:", error);
    }
};

module.exports = {
    convertFileToBase64,
    reactComponentNames,
    saveImg,
    savePrompt,
};
