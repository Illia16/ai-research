const OpenAI = require("openai");
const { apiKey } = require("../secrets");
const openai = new OpenAI({ apiKey });

async function main() {
    const list = await openai.files.list();
    for await (const file of list) {
        console.log(file);
    }
}

main();
