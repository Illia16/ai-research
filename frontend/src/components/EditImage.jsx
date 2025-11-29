import { useState } from "react";

const EditImage = () => {
    const [ai, setAi] = useState("openai");

    // for all AI provides
    const [image, setImage] = useState(null); // can be multiple images
    const [image2, setImage2] = useState(null); // 2nd image (just one)
    const [imageEditPrompt, setImageEditPrompt] = useState("");
    const [aiModel, setAiModel] = useState("gpt-image-1");
    const [numberOfImages, setNumberOfImages] = useState(1);

    // openai
    const [imageBackground, setImageBackground] = useState("auto");
    const [input_fidelity, setInputFidelity] = useState("low");

    // geminiai
    const [resolution, setResolution] = useState("");

    const editImageOpenAI = async () => {
        if (!image || !imageEditPrompt) return;

        const formData = new FormData();
        Array.from(image).forEach((file) => {
            formData.append("imageToEdit", file);
        });
        image2?.[0] && formData.append("imageMask", image2[0]);
        formData.append("imageEditPrompt", imageEditPrompt);
        formData.append("aiModel", aiModel);
        imageBackground && formData.append("background", imageBackground);
        input_fidelity && formData.append("input_fidelity", input_fidelity);
        formData.append("numberOfImages", numberOfImages);

        try {
            await fetch("http://localhost:4000/api/edit-image", { method: "POST", body: formData })
                .then((response) => {
                    if (!response.ok) {
                        console.log("Upload failed:", response);
                    }
                    return response.text();
                })
                .then((data) => {
                    console.log("Upload successful:", data, typeof data);
                });
        } catch (error) {
            console.log("error", error);
        }
    };

    const editImageGeminiAI = async () => {
        if (!image || !imageEditPrompt || !aiModel || !numberOfImages) return;

        const formData = new FormData();
        formData.append("file", image[0]); // for Gemini, attach one (1st image)
        image[1] && formData.append("fileSecond", image[1]); // for Gemini, attach 2nd (2nd image) // input file attaches in aplhabetical order
        formData.append("prompt", imageEditPrompt);
        formData.append("modelName", aiModel);
        formData.append("numberOfImages", numberOfImages);
        resolution && formData.append("resolution", resolution);

        try {
            await fetch("http://127.0.0.1:4010/api/edit-image", { method: "POST", body: formData })
                .then((response) => {
                    if (!response.ok) {
                        console.log("Upload failed:", response);
                    }
                    return response.text();
                })
                .then((data) => {
                    console.log("Upload successful:", data, typeof data);
                });
        } catch (error) {
            console.log("error", error);
        }
    };

    return (
        <section>
            <h2>AI: Edit Image</h2>
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

            <div className="form_el">
                <p>Select image(s) to edit</p>
                <label>
                    <input
                        className="kf-fileInput__field"
                        type="file"
                        name="file_image"
                        id="file_image"
                        multiple
                        onChange={(e) => setImage(e.target.files)}
                    />
                </label>
            </div>
            <div className="form_el">
                <p>Select a mask (or the 2nd image)</p>
                <label>
                    <input
                        className="kf-fileInput__field"
                        type="file"
                        name="file_image_mask"
                        id="file_image_mask"
                        onChange={(e) => setImage2(e.target.files)}
                    />
                </label>
            </div>
            <div className="form_el">
                <label>
                    <textarea
                        id="imageGen"
                        name="imageGen"
                        rows={10}
                        cols={100}
                        value={imageEditPrompt}
                        placeholder="Enter image edit prompt"
                        onChange={(e) => setImageEditPrompt(e.target.value)}></textarea>
                </label>
            </div>

            {ai === "openai" && (
                <>
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
                            <label>
                                <select
                                    name="input_fidelity"
                                    id="input_fidelity"
                                    value={input_fidelity}
                                    onChange={(e) => setInputFidelity(e.target.value)}>
                                    <option value="">Select input fidelity</option>
                                    <option value="low">low</option>
                                    <option value="high">high</option>
                                </select>
                            </label>
                        </div>
                    )}

                    <div className="form_el">
                        <label>
                            <input
                                type="number"
                                name="numberOfImages"
                                id="numberOfImages"
                                min="1"
                                max="4"
                                value={numberOfImages}
                                onChange={(e) => setNumberOfImages(Number(e.target.value))}
                            />
                        </label>
                    </div>

                    <div>
                        <button onClick={editImageOpenAI} className="btn-primary">
                            Edit Image with OpenAI
                        </button>
                    </div>
                </>
            )}

            {ai === "geminiai" && (
                <>
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
                                <option value="imagen-3.0-capability-001">imagen-3.0-capability-001</option>
                                {/* todo: the below do not work with the current setup */}
                                {/* <option value="imagen-3.0-capability-002">imagen-3.0-capability-002</option> */}
                                {/* <option value="imagegeneration@006">imagegeneration@006</option> */}
                                {/* <option value="imagegeneration@002">imagegeneration@002</option> */}
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

                    <div>
                        <button onClick={editImageGeminiAI} className="btn-primary">
                            Edit Image with GeminiAI
                        </button>
                    </div>
                </>
            )}
        </section>
    );
};

export default EditImage;
