import { useEffect, useState } from "react";

const GenerateImage = () => {
    const [imagePrompt, setImagePrompt] = useState("");
    const [imageOpenAI, setImageOpenAI] = useState("");
    const [imageGeminiAI, setImageGeminiAI] = useState("");

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
                });
        } catch (error) {
            console.log("error", error);
        }
    };

    useEffect(() => {}, []);

    return (
        <div>
            <p>AI: Generate Image</p>
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
        </div>
    );
};

export default GenerateImage;
