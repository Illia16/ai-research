import { useState } from "react";

const EditImage = () => {
    const [image, setImage] = useState(null);
    const [imageMask, setImageMask] = useState(null);
    const [imageEditPrompt, setImageEditPrompt] = useState("");
    const [aiModel, setAiModel] = useState("gpt-image-1");
    const [imageBackground, setImageBackground] = useState('auto');
    const [input_fidelity, setInputFidelity] = useState('low');
    const [numberOfImages, setNumberOfImages] = useState(1);

    const handleImage = (e, isMask) => {
        if (isMask) setImageMask(e.target.files[0]);
        else setImage(e.target.files);
    };

    const editImageOpenAI = async () => {
        if (!image || !imageEditPrompt) return;

        const formData = new FormData();
        Array.from(image).forEach((file) => {
            formData.append("imageToEdit", file);
        });
        formData.append("imageMask", imageMask);
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
        if (!image || !imageEditPrompt) return;

        const formData = new FormData();
        formData.append("file", image);
        formData.append("prompt", imageEditPrompt);

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
                <p>Select image to edit</p>
                <label>
                    <input
                        className="kf-fileInput__field"
                        type="file"
                        name="file_image"
                        id="file_image"
                        multiple
                        onChange={(e) => handleImage(e, false)}
                    />
                </label>
            </div>
            <div className="form_el">
                <p>Select a mask</p>
                <label>
                    <input
                        className="kf-fileInput__field"
                        type="file"
                        name="file_image_mask"
                        id="file_image_mask"
                        onChange={(e) => handleImage(e, true)}
                    />
                </label>
            </div>
            <div className="form_el">
                <label>
                    <input
                        type="text"
                        name="imageGen"
                        id="imageGen"
                        placeholder="Enter image edit prompt"
                        value={imageEditPrompt}
                        onChange={(e) => setImageEditPrompt(e.target.value)}
                    />
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
                        max="10"
                        value={numberOfImages}
                        onChange={(e) => setNumberOfImages(Number(e.target.value))}
                    />
                </label>
            </div>

            <div>
                <button onClick={editImageOpenAI} className="btn-primary">Edit Image with OpenAI</button>
            </div>
            <div>
                <button onClick={editImageGeminiAI} className="btn-primary">Edit Image with GeminiAI</button>
            </div>
        </section>
    );
};

export default EditImage;
