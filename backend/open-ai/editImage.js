const fs = require("fs");

const OpenAI = require("openai");
const { apiKey } = require("../secrets");
const openai = new OpenAI({ apiKey });

const helper = require("../helper");
const { aiModelNames } = require("./ENUM");

module.exports = async function main({ imageToEdit, imageMask, imageEditPrompt, aiModel, background, input_fidelity, numberOfImages }) {

    const images = await Promise.all(
        imageToEdit.map(async (file) =>
            await OpenAI.toFile(fs.createReadStream(file.path), null, {
                type: "image/png",
            })
        ),
    );

    const payload = {
        image: images,
        prompt: imageEditPrompt,
        ...(aiModel === aiModelNames.gptImage1 && { background: background }),
        ...(aiModel === aiModelNames.gptImage1 && { input_fidelity: input_fidelity }),
        ...(imageMask && { mask: fs.createReadStream(imageMask) }),
        model: aiModel,
        n: numberOfImages,
        // output_compression: 100,
        // output_format: "png",
        // partial_images: 0,
        // quality: "auto",
        ...([aiModelNames.dallE2, aiModelNames.dallE3].includes(aiModel) && { response_format: "b64_json" }),
        // size: "auto",
        // stream: false,
        // user: "string",
    };
    console.log('payload', payload);
    const res = await openai.images.edit(payload);
    console.log('res', res);

    // Save each generated image (can be more than 1)
    const savedImgRes = res.data.map((imgData) => {
        const savedImgRes = helper.saveImg(imgData.b64_json, "edited-images", imageEditPrompt)
        helper.savePrompt(savedImgRes.fileName, res.data[0]?.revised_prompt || imageEditPrompt, "openai", "edited-images");
        return savedImgRes;
    });
    console.log('savedImgRes', savedImgRes);
    return res.data;
};
