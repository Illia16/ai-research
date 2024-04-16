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
    return image.data;
};
