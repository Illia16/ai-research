// server.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000;

// Functions
const image = require("./open-ai/train_model/image");
const use = require("./open-ai/train_model/use");

const generateImage = require("./open-ai/generateImage");
const editImage = require("./open-ai/editImage");
const variationImage = require("./open-ai/variationImage");

const helper = require("./helper");
const imagePromts = require("./prompts.json");

// Set storage engine for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
// Initialize multer
const upload = multer({ storage: storage });

app.use(
    cors({
        origin: "http://localhost:3000",
    }),
    express.json()
);

// Generate React component:
// 1) generate prompt from image input
app.post("/api/image", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        const uploadedFilePath = req.file.path;
        const processedImage = await helper.convertFileToBase64(uploadedFilePath);
        const imgRes = await image(processedImage);

        // Delete the uploaded file from the server
        // fs.unlinkSync(uploadedFilePath);

        res.json({ message: "Image processed successfully.", data: imgRes, ai: "openai" });
    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// 2) Generate React component from prompt and write it to frontend components dirr
app.post("/api/use", async (req, res) => {
    const body = req.body;

    try {
        const result = await use(body);
        res.json({ message: "Code generated successfully.", data: result, ai: "openai" });
    } catch (error) {
        console.error("Error processing use:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
//

// Generate image endpoint
app.post("/api/generate-image", async (req, res) => {
    const body = req.body;
    const { prompt, imageStyle } = body;

    try {
        const result = await generateImage(prompt, imageStyle);
        res.json({ message: "Code generated successfully.", data: result, ai: "openai" });
    } catch (error) {
        console.error("Error processing use:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
//

// Edit image endpoint
app.post("/api/edit-image", upload.fields([{ name: "imageToEdit" }, { name: "imageMask" }]), async (req, res) => {
    const files = req.files;
    const { imageEditPrompt } = req.body;
    const imageToEditPath = files.imageToEdit[0].path;
    const imageMaskPath = files?.imageMask?.[0]?.path || null; // mask can be skipped if included in imageToEdit

    try {
        const result = await editImage(imageToEditPath, imageMaskPath, imageEditPrompt);
        res.json({ message: "Image edited successfully.", data: result, ai: "openai" });
    } catch (error) {
        console.error("Error processing use:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Variation image endpoint
app.post("/api/variation-image", upload.single("imageVariation"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }
    // example:
    // req.file {
    //     fieldname: 'imageVariation',
    //     originalname: 'valley.png',
    //     encoding: '7bit',
    //     mimetype: 'image/png',
    //     destination: 'uploads/',
    //     filename: 'valley.png',
    //     path: 'uploads/valley.png',
    //     size: 1219370
    //   }

    try {
        const result = await variationImage(req.file.path, req.file.originalname);
        res.json({ message: "Image variation processed successfully.", data: result, ai: "openai" });
    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Get locally saved images
app.get("/api/get_saved_images", (req, res) => {
    const imageFolderPath = path.join(
        path.resolve(__dirname, ".."),
        "frontend",
        "public",
        "images",
        req.query.images,
        "openai"
    );

    if (!fs.existsSync(imageFolderPath)) {
        res.json([]);
        return;
    }

    fs.readdir(imageFolderPath, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            res.status(500).send("Internal Server Error");
            return;
        }

        const imageFiles = files.filter((file) => file);
        res.json({ success: true, imageFiles: imageFiles, imagePromts: imagePromts, ai: "openai" });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
