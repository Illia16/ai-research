import { useEffect, useState } from "react";

const EditImage = () => {
    const [image, setImage] = useState(null);
    const [imageMask, setImageMask] = useState(null);
    const [imageEditPrompt, setImageEditPrompt] = useState("");

    // Saved images
    const [savedImagesOpenAi, setSavedImagesOpenAi] = useState([]);

    const handleImage = (e, isMask) => {
        if (isMask) setImageMask(e.target.files[0]);
        else setImage(e.target.files[0]);
    };

    const editImageOpenAI = async () => {
        if (!image || !imageMask || !imageEditPrompt) return;

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

    const getSavedImages = async () => {
        try {
            await fetch("http://localhost:4000/api/get_saved_images?images=edited-images")
                .then((response) => response.json())
                .then((data) => {
                    console.log("success openai:", data, typeof data);
                    setSavedImagesOpenAi(data);
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

            <button onClick={editImageOpenAI}>Edit Image with OpenAI</button>

            {savedImagesOpenAi && savedImagesOpenAi.length ? (
                <div className="image-library">
                    <div className="image-library--openai">
                        <h3>OpenAI Edited images library</h3>
                        <ul className="image-library-images image-library-images--openai">
                            {savedImagesOpenAi.map((img, index) => (
                                <li key={`image-library-images--openai___${index}`}>
                                    <img key={index} src={`/images/edited-images/openai/${img}`} alt="" />
                                    <a href={`/images/edited-images/openai/${img}`} target="_blank" rel="noreferrer">
                                        <img src="/images/download.svg" alt="" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : null}
        </section>
    );
};

export default EditImage;
