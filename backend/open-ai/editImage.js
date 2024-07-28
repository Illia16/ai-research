const fs = require("fs");

const OpenAI = require("openai");
const { apiKey } = require("../secrets");
const openai = new OpenAI({ apiKey });

const helper = require("../helper");

module.exports = async function main(imageToEdit, imageMask, imageEditPrompt) {
    const res = await openai.images.edit({
        image: fs.createReadStream(imageToEdit),
        ...(imageMask && { mask: fs.createReadStream(imageMask) }),
        prompt: imageEditPrompt,
        response_format: "b64_json",
    });

    const savedImgRes = helper.saveImg(res.data[0].b64_json, "edited-images", imageEditPrompt);
    helper.savePrompt(savedImgRes.fileName, res.data[0].revised_prompt || imageEditPrompt, "openai", "editedImages");
    return res.data;
};
