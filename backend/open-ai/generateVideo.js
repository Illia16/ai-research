const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { apiKey } = require("../secrets");
const openai = new OpenAI({ apiKey });

const helper = require("../helper");
const { aiModelNames } = require("./ENUM");

async function remixVideo({ remixPrompt, videoId }) {
    const video = await openai.videos.remix(videoId, { prompt: remixPrompt });
    console.log("Response Remix Video:", video);
    helper.savePrompt(video.id, video, "openai", "generated-videos");
    return video;
}

async function generateVideo({ videoGenPrompt, aiModel, imageReference, seconds, size }) {
    console.log("generateVideo", videoGenPrompt, aiModel, imageReference, size);

    const form = new FormData();
    form.append("prompt", videoGenPrompt);
    form.append("model", aiModel);
    form.append("size", size); // Supported values are: '720x1280', '1280x720', '1024x1792', and '1792x1024'.",
    form.append("seconds", seconds);

    if (imageReference) {
        imageReference.forEach((file) => {
            const fileBuffer = fs.readFileSync(file.path);
            form.append("input_reference", new Blob([fileBuffer], { type: file.mimetype }), file.originalname);
        });
    }

    try {
        const res = await fetch("https://api.openai.com/v1/videos", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            body: form,
        });

        const data = await res.json();

        // Save video data if there's no error
        if (!data?.error?.message) {
            helper.savePrompt(data.id, data, "openai", "generated-videos");
        }

        console.log("response generateVideo:", data);
        return data;
    } catch (err) {
        console.error("Error:", err);
    }
}

async function pollVideoGeneration(videoId) {
    const res = await openai.videos.retrieve(videoId);
    console.log("response:", res);

    // Once video is completed(or failed), update the entry in prompts.json with the final data
    if (res.status === "completed" || res.status === "failed") {
        helper.savePrompt(videoId, res, "openai", "generated-videos");
    }

    return res;
}

async function downloadVideo(videoId) {
    const content = await openai.videos.downloadContent(videoId);
    const body = content.arrayBuffer();
    const buffer = Buffer.from(await body);
    const directory = path.join(path.resolve(__dirname, "..", ".."), "frontend", "public", "videos", "openai");
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    fs.writeFileSync(path.join(directory, `${videoId}.mp4`), buffer);
    console.log("Wrote video.mp4");
}

async function listVideos() {
    let videos = [];
    for await (const video of openai.videos.list()) {
        videos.push(video);
    }

    return videos;
}

async function deleteVideo(videoId) {
    const video = await openai.videos.delete(videoId);
    console.log("response deleteVideo:", video);
    return video;
}

module.exports = {
    pollVideoGeneration,
    generateVideo,
    downloadVideo,
    listVideos,
    remixVideo,
    deleteVideo,
};
