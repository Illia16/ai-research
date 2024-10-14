import { useState } from "react";
import ImgLibrary from "./ImgLibrary";

const EditImage = () => {
    const [image, setImage] = useState(null);
    const [imageMask, setImageMask] = useState(null);
    const [imageEditPrompt, setImageEditPrompt] = useState("");

    const handleImage = (e, isMask) => {
        if (isMask) setImageMask(e.target.files[0]);
        else setImage(e.target.files[0]);
    };

    const editImageOpenAI = async () => {
        if (!image || !imageEditPrompt) return;

        const formData = new FormData();
        formData.append("imageToEdit", image);
        formData.append("imageMask", imageMask);
        formData.append("imageEditPrompt", imageEditPrompt);

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
                        value={imageEditPrompt}
                        onChange={(e) => setImageEditPrompt(e.target.value)}
                    />
                </label>
            </div>

            <div>
                <button onClick={editImageOpenAI}>Edit Image with OpenAI</button>
            </div>
            <div>
                <button onClick={editImageGeminiAI}>Edit Image with GeminiAI</button>
            </div>
            <ImgLibrary ai="openai" imgTypeDirr="edited-images" imgTypeDirrKey="editedImages" />
            <ImgLibrary ai="geminiai" imgTypeDirr="edited-images" imgTypeDirrKey="editedImages" />
        </section>
    );
};

export default EditImage;
