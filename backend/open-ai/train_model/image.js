const fs = require("fs");
const OpenAI = require("openai");

const { apiKey } = require("../../secrets");
const openai = new OpenAI({ apiKey });
const helper = require("../../helper");

module.exports = async function main(base64_image) {
    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `Based on the provided image, what JavaScript component can it be? Return a JSON object with keys: name, description. 'name' should only have one of these: ${helper.reactComponentNames.join(
                            ","
                        )}. 'description' should outline the image content and if any javascript functionalities, explicit css styles (example: color, background, font-size, width, display, position etc.)`,
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/png;base64,${base64_image}`,
                            // detail: "low",
                        },
                    },
                ],
            },
        ],
    });

    console.log("img", response.choices[0]);
    const resultParsed = JSON.parse(response.choices[0]?.message?.content?.match(/\{(.|\n)*\}/)?.[0]);
    return resultParsed;
};
