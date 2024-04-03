const fs = require("fs");

async function convertFileToBase64(filePath) {
    const fileData = fs.readFileSync(filePath);
    const base64Image = fileData.toString("base64");
    return base64Image;
}

module.exports = {
    convertFileToBase64,
};
