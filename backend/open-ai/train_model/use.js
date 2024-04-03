const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
// const util = require('node:util');
const { apiKey } = require("../../secrets");
const openai = new OpenAI({ apiKey });
const componentsPath = path.resolve(__dirname, "../../../frontend/src/components");

module.exports = async function use(data) {
    const componentName = data?.name;
    const componentDescription = data?.description;
    const filePath = path.join(componentsPath, `${componentName}.jsx`);

    try {
        const completion = await openai.chat.completions.create({
            // messages: [{ role: "assistant", content: 'Is this positive or negative:' + userInput }], // personal
            // model: "ft:gpt-3.5-turbo-0125:personal::98ZOaHnh", // personal
            messages: [
                {
                    role: "assistant",
                    content:
                        "Based on the description:" +
                        componentDescription +
                        ", generate a valid React JSX component only.",
                },
            ], // components
            model: "ft:gpt-3.5-turbo-0125:personal::99L9L19J", // components
        });
        // console.log(completion.choices[0]);
        // console.log("------");

        let jsxContent = completion.choices[0].message.content;
        jsxContent = jsxContent.trim().replace(/^```jsx\n|```$/g, "");
        // jsxContent = jsxContent.replace(/\n/g, "");

        // the following (insert/replace component) works only locally
        if (fs.existsSync(filePath)) {
            console.log("file exists... deleting content... and inserting new content...");
            fs.writeFile(filePath, "", function () {
                fs.appendFileSync(filePath, jsxContent);
            });
        } else {
            console.log("file does not exist... creating file...");
            fs.writeFileSync(filePath, jsxContent, "utf8");
        }
        //
    } catch (error) {
        console.error("Error training model:", error);
    }
};
