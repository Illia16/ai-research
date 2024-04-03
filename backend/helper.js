const fs = require("fs");

async function convertFileToBase64(filePath) {
    const fileData = fs.readFileSync(filePath);
    const base64Image = fileData.toString("base64");
    return base64Image;
}

const reactComponentNames = [
    "Header",
    "Modal",
    "SkipToContent",
    "Accordion",
    "Breadcrumb",
    "Cta",
    "Isi",
    "Form",
    "FormInput",
    "StickyIsi",
    "Footer",
];

module.exports = {
    convertFileToBase64,
    reactComponentNames,
};
