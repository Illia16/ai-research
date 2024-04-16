const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
// const util = require('node:util');
const { apiKey } = require("../../secrets");
const openai = new OpenAI({ apiKey });
const componentsPath = path.resolve(__dirname, "../../../frontend/src/components/ai-generated");
const helper = require("../../helper");

module.exports = async function use(data) {
    const componentName = data?.name || "Component";
    const componentDescription = data?.description || "Test react component";
    const filePath = path.join(componentsPath, `${componentName}.jsx`);

    try {
        const completion = await openai.chat.completions.create({
            // messages: [{ role: "assistant", content: 'Is this positive or negative:' + userInput }], // personal
            // model: "ft:gpt-3.5-turbo-0125:personal::98ZOaHnh", // personal
            messages: [
                {
                    role: "system",
                    content: `You are a React developer and you are tasked with creating a new component for a website. The component should be a valid React JSX component. The component name should be one of the following ${helper.reactComponentNames.join(
                        ","
                    )} The component should be based on the description provided. Also, it should have the functionality from training data from the same component.`,
                },
                {
                    role: "user",
                    content: `This is a ${componentName} React jsx component. Based on the description: ${componentDescription}, generate a valid React JSX component only.`,
                },
            ], // components
            model: "ft:gpt-3.5-turbo-0125:personal::9A08Mk51", // components
        });

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
