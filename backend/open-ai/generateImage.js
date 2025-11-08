const OpenAI = require("openai");
const { apiKey } = require("../secrets");
const openai = new OpenAI({ apiKey });

const helper = require("../helper");
const { aiModelNames } = require("./ENUM");

module.exports = async function main(text, imageStyle, aiModel, background, numberOfImages) {
    const payload = {
        prompt: text,
        ...(aiModel === aiModelNames.gptImage1 && { background: background }),
        model: aiModel,
        ...(aiModel === aiModelNames.gptImage1 && { moderation: 'low' }),
        ...(aiModel === aiModelNames.gptImage1 ? { n: numberOfImages } : { n: 1 }),
        // output_compression: 100,
        // output_format: "png",
        // partial_images: 0,
        // quality: "auto",
        ...([aiModelNames.dallE2, aiModelNames.dallE3].includes(aiModel) && { response_format: "b64_json" }),
        // size: "auto",
        // stream: false,
        ...([aiModelNames.dallE3].includes(aiModel) && { style: imageStyle }),
        // user: "string",
    };
    console.log('payload', payload);
    const res = await openai.images.generate(payload);
    console.log('res', res);

    // Save each generated image (can be more than 1)
    const savedImgRes = res.data.map((imgData) => {
        const savedImgRes = helper.saveImg(imgData.b64_json, "generated-images", text)
        helper.savePrompt(savedImgRes.fileName, res.data[0]?.revised_prompt || text, "openai", "generated-images");

        return savedImgRes;
    });
    console.log('savedImgRes', savedImgRes);
    return res.data;
};
