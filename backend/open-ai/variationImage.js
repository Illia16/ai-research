const fs = require("fs");

const OpenAI = require("openai");
const { apiKey } = require("../secrets");
const openai = new OpenAI({ apiKey });

const helper = require("../helper");

module.exports = async function main({ imageToEdit, imageName, numberOfImages }) {
  const payload = {
    image: fs.createReadStream(imageToEdit),
    // model: "dall-e-2",
    n: numberOfImages,
    response_format: "b64_json",
    // size: "1024x1024",
    // user: "string",
  };
  console.log('payload', payload);
  const res = await openai.images.createVariation(payload);
  console.log('res', res);

  // Save each variation image (can be more than 1)
  const savedImgRes = res.data.map((imgData, index) => {
    const savedImgRes = helper.saveImg(imgData.b64_json, "variation-images", imageName)
    // Use each image's own revised_prompt, or fall back to the first one, or original imageName
    const prompt = imgData.revised_prompt || res.data[0]?.revised_prompt || imageName;
    helper.savePrompt(
      savedImgRes.fileName,
      prompt,
      "openai",
      "variation-images",
      {
        imageType: "variation-images",
        ai: "openai",
      }
    );
    return savedImgRes;
  });
  console.log('savedImgRes', savedImgRes);
  return res.data;
};
