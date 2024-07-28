const fs = require("fs");

const OpenAI = require("openai");
const { apiKey } = require("../secrets");
const openai = new OpenAI({ apiKey });

const helper = require("../helper");

module.exports = async function main(imageToEdit, imageName) {
    const res = await openai.images.createVariation({
        image: fs.createReadStream(imageToEdit),
        response_format: "b64_json",
    });

    const savedImgRes = helper.saveImg(res.data[0].b64_json, "variation-images", imageName);
    helper.savePrompt(savedImgRes.fileName, res.data[0].revised_prompt || imageName, "openai", "variationImages");
    return res.data;
};
