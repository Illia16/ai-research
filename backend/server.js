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
const {
    generateVideo,
    pollVideoGeneration,
    downloadVideo,
    listVideos,
    remixVideo,
    deleteVideo,
} = require("./open-ai/generateVideo");

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
    const { prompt, imageStyle, aiModel, background, numberOfImages } = body;

    try {
        const result = await generateImage(prompt, imageStyle, aiModel, background, numberOfImages);
        res.json({ message: "Code generated successfully.", data: result, ai: "openai" });
    } catch (error) {
        console.error("Error processing use:", error);
        res.status(500).json({ error: error.message });
    }
});
//

// Edit image endpoint
app.post("/api/edit-image", upload.fields([{ name: "imageToEdit" }, { name: "imageMask" }]), async (req, res) => {
    const files = req.files;
    const { imageEditPrompt, aiModel, background, input_fidelity, numberOfImages } = req.body;
    const imageToEditPath = files.imageToEdit[0].path; // only one image to edit
    const imageMaskPath = files?.imageMask?.[0]?.path || null; // mask can be skipped if included in imageToEdit

    try {
        const result = await editImage({
            imageToEdit: files.imageToEdit,
            imageMask: imageMaskPath,
            imageEditPrompt,
            aiModel,
            background,
            input_fidelity,
            numberOfImages,
        });
        res.json({ message: "Image edited successfully.", data: result, ai: "openai" });
    } catch (error) {
        console.error("Error processing use:", error);
        res.status(500).json({ error: error.message });
    }
});

// Variation image endpoint
app.post("/api/variation-image", upload.single("imageVariation"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }
    const { numberOfImages } = req.body;

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
        const result = await variationImage({
            imageToEdit: req.file.path,
            imageName: req.file.originalname,
            numberOfImages,
        });
        res.json({ message: "Image variation processed successfully.", data: result, ai: "openai" });
    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// List videos endpoint
app.get("/api/list-videos", async (req, res) => {
    const videos = await listVideos();
    res.json({ message: "Videos listed successfully.", data: videos });
});

// Delete video from Openai DB only (keep the actual file on the hardrive)
app.post("/api/delete-video", upload.none(), async (req, res) => {
    const body = req.body;
    const { videoId } = body;
    const video = await deleteVideo(videoId);
    res.json({ message: "Video deleted successfully.", data: video });
});

// Generate video endpoint
app.post("/api/generate-video", upload.fields([{ name: "imageReference" }]), async (req, res) => {
    const files = req.files;
    const { videoGenPrompt, aiModel, videoId, seconds, remixPrompt, size } = req.body;

    try {
        if (videoId) {
            if (remixPrompt) {
                const result = await remixVideo({ remixPrompt, videoId });
                return res.json({ message: "Video remix started successfully.", data: result, ai: "openai" });
            } else {
                const result = await pollVideoGeneration(videoId);
                if (result.status === "completed") {
                    await downloadVideo(videoId);
                    return res.json({
                        message: "Video generation completed successfully.",
                        data: result,
                        ai: "openai",
                    });
                }

                return res.json({ message: "Video generation in progress.", data: result, ai: "openai" });
            }
        } else {
            const result = await generateVideo({
                videoGenPrompt,
                aiModel,
                imageReference: files.imageReference,
                seconds,
                size,
            });
            res.json({ message: "Video generation started successfully.", data: result, ai: "openai" });
        }
    } catch (error) {
        console.error("Error processing use:", error);
        res.status(500).json({ error: error.message });
    }
});
//

// Get locally saved images and videos
app.get("/api/get_saved_media", (req, res) => {
    const baseImagesPath = path.join(path.resolve(__dirname, ".."), "frontend", "public", "images");

    const baseVideosPath = path.join(path.resolve(__dirname, ".."), "frontend", "public", "videos");

    const imageTypes = ["edited-images", "generated-images", "variation-images"];
    const aiProviders = ["openai", "geminiai"];
    const allowedImageExtensions = [".png", ".jpeg", ".jpg", ".webp"];
    const allowedVideoExtensions = [".mp4", ".webm", ".mov", ".avi"];

    // Initialize the new structure
    const aiData = {
        openai: {
            "generated-images": {},
            "edited-images": {},
            "variation-images": {},
            "generated-videos": {},
        },
        geminiai: {
            "generated-images": {},
            "edited-images": {},
            "variation-images": {},
            "generated-videos": {},
        },
    };

    // Read images from all three directories and both AI providers
    imageTypes.forEach((imageType) => {
        aiProviders.forEach((aiProvider) => {
            const imageFolderPath = path.join(baseImagesPath, imageType, aiProvider);

            if (fs.existsSync(imageFolderPath)) {
                try {
                    const files = fs.readdirSync(imageFolderPath);

                    files.forEach((file) => {
                        const ext = path.extname(file).toLowerCase();
                        if (allowedImageExtensions.includes(ext)) {
                            const filePath = path.join(imageFolderPath, file);
                            let createdAt = null;
                            try {
                                const stat = fs.statSync(filePath);
                                createdAt = stat.birthtime;
                            } catch (err) {
                                createdAt = null;
                            }

                            // Get filename without extension for prompt lookup
                            const filenameWithoutExt = path.basename(file, ext);

                            // Get prompt data from imagePromts (object format)
                            const promptData = imagePromts?.[aiProvider]?.[imageType]?.[filenameWithoutExt] || null;

                            // Extract prompt and aiModel from promptData
                            const prompt = promptData?.prompt || null;
                            const aiModel = promptData?.aiModel || null;

                            // Format createdAt as ISO string
                            const createdAtISO = createdAt ? createdAt.toISOString() : null;

                            // Create the entry
                            aiData[aiProvider][imageType][filenameWithoutExt] = {
                                prompt: prompt,
                                createdAt: createdAtISO,
                                imageType: imageType,
                                ai: aiProvider,
                                aiModel: aiModel,
                                path: `/images/${imageType}/${aiProvider}/${file}`,
                            };
                        }
                    });
                } catch (err) {
                    console.error(`Error reading directory ${imageType}/${aiProvider}:`, err);
                }
            }
        });
    });

    // Read videos from all AI providers
    aiProviders.forEach((aiProvider) => {
        const videoFolderPath = path.join(baseVideosPath, aiProvider);

        if (fs.existsSync(videoFolderPath)) {
            try {
                const files = fs.readdirSync(videoFolderPath);

                files.forEach((file) => {
                    const ext = path.extname(file).toLowerCase();
                    if (allowedVideoExtensions.includes(ext)) {
                        const filePath = path.join(videoFolderPath, file);
                        let createdAt = null;
                        try {
                            const stat = fs.statSync(filePath);
                            createdAt = stat.birthtime;
                        } catch (err) {
                            createdAt = null;
                        }

                        // Get filename without extension for video data lookup
                        const filenameWithoutExt = path.basename(file, ext);

                        // Format createdAt as ISO string
                        const createdAtISO = createdAt ? createdAt.toISOString() : null;

                        // Get video data from imagePromts (for OpenAI videos)
                        const videoData = imagePromts?.[aiProvider]?.["generated-videos"]?.[filenameWithoutExt] || null;

                        // Create the entry
                        const videoEntry = {
                            createdAt: createdAtISO,
                            ai: aiProvider,
                            path: `/videos/${aiProvider}/${file}`,
                        };

                        // Add OpenAI-specific data if available
                        if (aiProvider === "openai" && videoData) {
                            videoEntry.openaiData = videoData;
                        } else if (aiProvider === "geminiai" && videoData) {
                            // For Gemini, you might want to add similar structure
                            videoEntry.geminiaiData = videoData;
                        }

                        aiData[aiProvider]["generated-videos"][filenameWithoutExt] = videoEntry;
                    }
                });
            } catch (err) {
                console.error(`Error reading directory videos/${aiProvider}:`, err);
            }
        }
    });

    res.json({ success: true, ai_data: aiData });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
