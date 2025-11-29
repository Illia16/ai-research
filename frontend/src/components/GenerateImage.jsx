import { useState, useEffect } from "react";

// const img1 = require("../../src/images/generated-images/geminiai/React vs Vue as giant monsters.png");

const GenerateImage = () => {
    const [ai, setAi] = useState("openai");

    // for all AI provides
    const [imagePrompt, setImagePrompt] = useState("");
    const [aiModel, setAiModel] = useState("gpt-image-1");
    const [numberOfImages, setNumberOfImages] = useState(1);

    // openai
    const [imageStyle, setImageStyle] = useState("");
    const [imageOpenAI, setImageOpenAI] = useState(""); // img result output
    const [imageBackground, setImageBackground] = useState("auto");

    const [imageGeminiAI, setImageGeminiAI] = useState(""); // tbd: geminiai: not using since GeminiAI does not return base64 nor url.

    // geminiai
    const [resolution, setResolution] = useState("");

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
                    setImageOpenAI(data?.data);
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
                body: JSON.stringify({ prompt: imagePrompt, modelName: aiModel, numberOfImages, resolution }),
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
                        type="radio"
                        name="ai"
                        value="openai"
                        checked={ai === "openai"}
                        onChange={(e) => setAi(e.target.value)}
                    />
                    OpenAI
                </label>

                <label>
                    <input
                        type="radio"
                        name="ai"
                        value="geminiai"
                        checked={ai === "geminiai"}
                        onChange={(e) => setAi(e.target.value)}
                    />
                    GeminiAI
                </label>
            </div>
            {ai === "openai" && (
                <>
                    <div className="form_el">
                        <label>
                            <textarea
                                id="imageGen"
                                name="imageGen"
                                rows={10}
                                cols={100}
                                value={imagePrompt}
                                placeholder="Enter image prompt"
                                onChange={(e) => setImagePrompt(e.target.value)}></textarea>
                        </label>
                    </div>
                    <div className="form_el">
                        <label>
                            <select
                                name="aiModel"
                                id="aiModel"
                                value={aiModel}
                                onChange={(e) => setAiModel(e.target.value)}>
                                <option value="">Select model</option>
                                <option value="gpt-image-1">gpt-image-1 (default)</option>
                                <option value="dall-e-3">Dall-e 3</option>
                                <option value="dall-e-2">Dall-e 2</option>
                            </select>
                        </label>
                    </div>

                    {aiModel === "gpt-image-1" && (
                        <>
                            <div className="form_el">
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
                            </div>
                            <div className="form_el">
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
                            </div>
                        </>
                    )}
                    {aiModel === "dall-e-3" && (
                        <div className="form_el">
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
                        </div>
                    )}
                    <button onClick={generateImageOpenAI} className="btn-primary">
                        Generage image OpenAI
                    </button>
                </>
            )}
            {ai === "geminiai" && (
                <>
                    <div className="form_el">
                        <label>
                            <textarea
                                id="imageGen"
                                name="imageGen"
                                rows={10}
                                cols={100}
                                value={imagePrompt}
                                placeholder="Enter image prompt"
                                onChange={(e) => setImagePrompt(e.target.value)}></textarea>
                        </label>
                    </div>
                    <div className="form_el">
                        <label>
                            <select
                                name="aiModel"
                                id="aiModel"
                                value={aiModel}
                                onChange={(e) => setAiModel(e.target.value)}>
                                <option value="">Select model</option>
                                <option value="gemini-3-pro-image-preview">gemini-3-pro-image-preview</option>
                                <option value="gemini-2.5-flash-image">gemini-2.5-flash-image</option>
                                <option value="imagen-4.0-generate-001">imagen-4.0-generate-001</option>
                                <option value="imagen-3.0-generate-002">imagen-3.0-generate-002</option>
                                <option value="imagen-3.0-generate-001">imagen-3.0-generate-001</option>
                            </select>
                        </label>
                    </div>
                    <div className="form_el">
                        <label>
                            <select
                                name="resolution"
                                id="resolution"
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}>
                                <option value="">Select resolution</option>
                                <option value="1K">1K</option>
                                <option value="2K">2K</option>
                                <option value="4K">4K</option>
                            </select>
                        </label>
                    </div>
                    {aiModel !== "gemini-2.5-flash-image" && (
                        <div className="form_el">
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
                        </div>
                    )}
                    <button onClick={generateImageGeminiAI} className="btn-primary">
                        Generage image GeminiAI
                    </button>
                </>
            )}
            {imageOpenAI &&
                imageOpenAI.length &&
                imageOpenAI.map((generatedImg, i) => {
                    return (
                        (generatedImg?.url || generatedImg?.b64_json) && (
                            <li style={{ maxWidth: "300px" }} key={`generated-image--${i}`}>
                                <img
                                    src={
                                        generatedImg?.url ||
                                        (generatedImg?.b64_json &&
                                            "data:imageOpenAI/png;base64," + generatedImg?.b64_json)
                                    }
                                    style={{ maxWidth: "100%" }}
                                    alt={generatedImg.revised_prompt || imagePrompt}
                                />
                                <p>{generatedImg.revised_prompt || imagePrompt}</p>
                            </li>
                        )
                    );
                })}
        </section>
    );
};

export default GenerateImage;
