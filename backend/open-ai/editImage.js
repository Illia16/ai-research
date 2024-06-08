const fs = require("fs");

const OpenAI = require("openai");
const { apiKey } = require("../secrets");
const openai = new OpenAI({ apiKey });

const helper = require("../helper");

module.exports = async function main(imageToEdit, imageMask, imageEditPrompt) {
    const res = await openai.images.edit({
        image: fs.createReadStream(imageToEdit),
        mask: fs.createReadStream(imageMask),
        prompt: imageEditPrompt,
        response_format: "b64_json",
    });

    helper.saveImg(res.data[0].b64_json, "edited-images", imageEditPrompt);
    return res.data;
};
