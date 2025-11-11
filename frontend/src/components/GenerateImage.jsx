import { useState, useEffect } from "react";

// const img1 = require("../../src/images/generated-images/geminiai/React vs Vue as giant monsters.png");

const GenerateImage = () => {
    const [imagePrompt, setImagePrompt] = useState("");
    const [imageStyle, setImageStyle] = useState(""); // openai only for now
    const [imageOpenAI, setImageOpenAI] = useState("");
    const [imageGeminiAI, setImageGeminiAI] = useState(""); // not using since GeminiAI does not return base64 nor url.
    const [aiModel, setAiModel] = useState("gpt-image-1");
    const [imageBackground, setImageBackground] = useState("auto");
    const [numberOfImages, setNumberOfImages] = useState(1);

    const generateImageOpenAI = async () => {
        try {
            await fetch("http://localhost:4000/api/generate-image", {
                method: "POST",
                body: JSON.stringify({
                    prompt: imagePrompt,
                    imageStyle: imageStyle,
                    aiModel: aiModel,
                    background: imageBackground,
                    numberOfImages: numberOfImages,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        console.log("Image generation failed:", response);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Image generation successful:", data, typeof data);
                    setImageOpenAI(data?.data?.[0]);
                });
        } catch (error) {
            console.log("error", error);
        }
    };

    const generateImageGeminiAI = async () => {
        if (!imagePrompt || !aiModel) return;

        try {
            await fetch("http://127.0.0.1:4010/api/generate-image", {
                method: "POST",
                body: JSON.stringify({ prompt: imagePrompt, modelName: aiModel, numberOfImages }),
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Image generation successful:", data, typeof data);
                    // setImageGeminiAI(data);
                });
        } catch (error) {
            console.log("error", error);
        }
    };

    return (
        <section>
            <h2>AI: Generate Image</h2>
            <div className="form_el">
                <label>
                    <input
                        type="text"
                        name="imageGen"
                        id="imageGen"
                        placeholder="Enter image prompt"
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                    />
                </label>
                <label>
                    <select name="aiModel" id="aiModel" value={aiModel} onChange={(e) => setAiModel(e.target.value)}>
                        <option value="">Select model</option>
                        <option value="gpt-image-1">gpt-image-1 (default)</option>
                        <option value="dall-e-3">Dall-e 3</option>
                        <option value="dall-e-2">Dall-e 2</option>
                    </select>
                </label>

                {aiModel === "gpt-image-1" && (
                    <>
                        <label>
                            <select
                                name="imageBackground"
                                id="imageBackground"
                                value={imageBackground}
                                onChange={(e) => setImageBackground(e.target.value)}>
                                <option value="">Select background</option>
                                <option value="auto">auto</option>
                                <option value="transparent">transparent</option>
                                <option value="opaque">opaque</option>
                            </select>
                        </label>
                        <label>
                            <input
                                type="number"
                                name="numberOfImages"
                                id="numberOfImages"
                                min="1"
                                max="10"
                                value={numberOfImages}
                                onChange={(e) => setNumberOfImages(Number(e.target.value))}
                            />
                        </label>
                    </>
                )}
                {aiModel === "dall-e-3" && (
                    <label>
                        <select
                            name="imageStyle"
                            id="imageStyle"
                            value={imageStyle}
                            onChange={(e) => setImageStyle(e.target.value)}>
                            <option value="">Select style</option>
                            <option value="natural">Natural</option>
                            <option value="vivid">Vivid</option>
                        </select>
                    </label>
                )}
                <button onClick={generateImageOpenAI} className="btn-primary">
                    Generage image OpenAI
                </button>

                <label>
                    <select name="aiModel" id="aiModel" value={aiModel} onChange={(e) => setAiModel(e.target.value)}>
                        <option value="">Select model</option>
                        <option value="imagen-4.0-generate-001">imagen-4.0-generate-001</option>
                        <option value="imagen-3.0-generate-002">imagen-3.0-generate-002</option>
                        <option value="imagen-3.0-generate-001">imagen-3.0-generate-001</option>
                    </select>
                </label>
                <label>
                    <input
                        type="number"
                        name="numberOfImagesGeminiAi"
                        id="numberOfImagesGeminiAi"
                        min="1"
                        max="4"
                        value={numberOfImages}
                        onChange={(e) => setNumberOfImages(Number(e.target.value))}
                    />
                </label>
                <button onClick={generateImageGeminiAI} className="btn-primary">
                    Generage image GeminiAI
                </button>
            </div>

            {(imageOpenAI?.url || imageOpenAI?.b64_json) && (
                <>
                    <div>
                        <img
                            src={
                                imageOpenAI?.url ||
                                (imageOpenAI?.b64_json && "data:imageOpenAI/png;base64," + imageOpenAI?.b64_json)
                            }
                            alt={imageOpenAI.revised_prompt || imagePrompt}
                        />
                    </div>
                    <p>{imageOpenAI.revised_prompt || imagePrompt}</p>
                </>
            )}
        </section>
    );
};

export default GenerateImage;
