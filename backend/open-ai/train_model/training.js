const OpenAI = require("openai");
// Set your OpenAI API key
const { apiKey } = require("../../secrets");
const openai = new OpenAI({ apiKey });

// Define a function to train the model based on user input
async function trainModel(userInput) {
    try {
        // Train the model
        const fineTune = await openai.fineTuning.jobs.create({
            training_file: "file-3y6jhfVUVquWubhD8BCpYzXW",
            model: "gpt-3.5-turbo",
        });
        console.log("fineTune", fineTune);
    } catch (error) {
        console.error("Error training model:", error);
    }
}

const userInput = process.argv[2];
trainModel(userInput);
