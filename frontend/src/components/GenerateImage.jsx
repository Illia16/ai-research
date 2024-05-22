import { useEffect, useState } from "react";

// const img1 = require("../../src/images/generated-images/geminiai/React vs Vue as giant monsters.png");

const GenerateImage = () => {
    const [imagePrompt, setImagePrompt] = useState("");
    const [imageOpenAI, setImageOpenAI] = useState("");
    const [imageGeminiAI, setImageGeminiAI] = useState(""); // not using since GeminiAI does not return base64 nor url.

    // Saved images
    const [savedImagesOpenAi, setSavedImagesOpenAi] = useState([]);
    const [savedImagesGeminiAi, setSavedImagesGeminiAi] = useState([]);

    const generateImageOpenAI = async () => {
        try {
            await fetch("http://localhost:4000/api/generate-image", {
                method: "POST",
                body: JSON.stringify({ prompt: imagePrompt }),
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
                    getSavedImages();
                });
        } catch (error) {
            console.log("error", error);
        }
    };

    const generateImageGeminiAI = async () => {
        try {
            await fetch("http://127.0.0.1:4010/api/generate-image", {
                method: "POST",
                body: JSON.stringify({ prompt: imagePrompt }),
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Image generation successful:", data, typeof data);
                    // setImageGeminiAI(data);
                    getSavedImages();
                });
        } catch (error) {
            console.log("error", error);
        }
    };

    const getSavedImages = async () => {
        try {
            await fetch("http://localhost:4000/api/get_saved_images?images=generated-images")
                .then((response) => response.json())
                .then((data) => {
                    console.log("success openai:", data, typeof data);
                    setSavedImagesOpenAi(data);
                });
        } catch (error) {
            console.log("error", error);
        }

        try {
            await fetch("http://127.0.0.1:4010/api/get_saved_images")
                .then((response) => response.json())
                .then((data) => {
                    console.log("success geminiai:", data, typeof data);
                    setSavedImagesGeminiAi(data.message);
                });
        } catch (error) {
            console.log("error", error);
        }
    };

    useEffect(() => {
        getSavedImages();
    }, []);

    return (
        <section>
            <h2>AI: Generate Image</h2>
            <div className="form_el">
                <label>
                    <input
                        type="text"
                        name="imageGen"
                        id="imageGen"
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                    />
                </label>
                <button onClick={generateImageOpenAI}>Generage image OpenAI</button>
                <button onClick={generateImageGeminiAI}>Generage image GeminiAI</button>
            </div>

            {(imageOpenAI?.url || imageOpenAI?.b64_json) && (
                <>
                    <div>
                        <img
                            src={
                                imageOpenAI?.url ||
                                (imageOpenAI?.b64_json && "data:imageOpenAI/png;base64," + imageOpenAI?.b64_json)
                            }
                            alt={imageOpenAI.revised_prompt}
                        />
                    </div>
                    <p>{imageOpenAI.revised_prompt}</p>
                </>
            )}

            <h2>Image library:</h2>

            <div className="image-library">
                <div className="image-library--openai">
                    {savedImagesOpenAi && savedImagesOpenAi.length ? (
                        <>
                            <h3>OpenAI</h3>
                            <ul className="image-library-images image-library-images--openai">
                                {savedImagesOpenAi.map((img, index) => (
                                    <li key={`image-library-images--openai___${index}`}>
                                        <img key={index} src={`/images/generated-images/openai/${img}`} alt="" />
                                        <a
                                            href={`/images/generated-images/openai/${img}`}
                                            target="_blank"
                                            rel="noreferrer">
                                            <img src="/images/download.svg" alt="" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : null}
                </div>

                <div className="image-library--geminiai">
                    {savedImagesGeminiAi && savedImagesGeminiAi.length ? (
                        <>
                            <h3>GeminiAI</h3>
                            <ul className="image-library-images image-library-images--geminiai">
                                {savedImagesGeminiAi.map((img, index) => (
                                    <li key={`image-library-images--geminiai___${index}`}>
                                        <img key={index} src={`/images/generated-images/geminiai/${img}`} alt="" />
                                        <a
                                            href={`/images/generated-images/geminiai/${img}`}
                                            target="_blank"
                                            rel="noreferrer">
                                            <img src="/images/download.svg" alt="" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : null}
                </div>
            </div>
        </section>
    );
};

export default GenerateImage;
