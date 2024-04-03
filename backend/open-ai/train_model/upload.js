const fs = require("fs");
const OpenAI = require("openai");
// Set your OpenAI API key
const { apiKey } = require("../../secrets");
const openai = new OpenAI({ apiKey });

async function upload() {
    try {
        const createFile = await openai.files.create({
            file: fs.createReadStream("training_data_components.jsonl"),
            purpose: "fine-tune",
        });
        console.log("createFile", createFile);
    } catch (error) {
        console.error("Error training model:", error);
    }
}

upload();
