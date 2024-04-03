// server.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 4000;

// Functions
const image = require("./open-ai/train_model/image");
const use = require("./open-ai/train_model/use");
const helper = require("./helper");

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

        res.json({ message: "Image processed successfully.", data: imgRes });
    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.post("/api/use", async (req, res) => {
    const body = req.body;

    try {
        const result = await use(body);
        res.json({ message: "Code generated successfully.", data: result });
    } catch (error) {
        console.error("Error processing use:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
