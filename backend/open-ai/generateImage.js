const OpenAI = require("openai");
const { apiKey } = require("../secrets");
const openai = new OpenAI({ apiKey });

const helper = require("../helper");

module.exports = async function main(text, imageStyle) {
    const res = await openai.images.generate({
        model: "dall-e-3",
        prompt: text,
        response_format: "b64_json",
        ...(imageStyle && { style: imageStyle }),
        // quality: "hd",
    });

    const savedImgRes = helper.saveImg(res.data[0].b64_json, "generated-images", text);
    helper.savePrompt(savedImgRes.fileName, res.data[0].revised_prompt, "openai", "generatedImages");
    return res.data;
};
