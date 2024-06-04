import { useEffect, useState } from "react";

const VariationImage = () => {
    const [image, setImage] = useState(null);
    // Saved images
    const [savedImagesOpenAi, setSavedImagesOpenAi] = useState([]);

    const handleImage = (e) => {
        setImage(e.target.files[0]);
    };

    const editImageOpenAI = async () => {
        if (!image) return;
        const formData = new FormData();
        formData.append("imageVariation", image);

        try {
            await fetch("http://localhost:4000/api/variation-image", { method: "POST", body: formData })
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
            await fetch("http://localhost:4000/api/get_saved_images?images=variation-images")
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
            <h2>AI: Variation Image</h2>
            <div className="form_el">
                <p>Select image to create a variation from</p>
                <label>
                    <input
                        className="kf-fileInput__field"
                        type="file"
                        name="file_image"
                        id="file_image"
                        onChange={(e) => handleImage(e)}
                    />
                </label>
            </div>

            <button onClick={editImageOpenAI}>Create variation image with OpenAI</button>

            {savedImagesOpenAi && savedImagesOpenAi.length ? (
                <div className="image-library">
                    <div className="image-library--openai">
                        <h3>OpenAI Variation images library</h3>
                        <ul className="image-library-images image-library-images--openai">
                            {savedImagesOpenAi.map((img, index) => (
                                <li key={`image-library-images--openai___${index}`}>
                                    <img key={index} src={`/images/variation-images/openai/${img}`} alt="" />
                                    <a href={`/images/variation-images/openai/${img}`} target="_blank" rel="noreferrer">
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

export default VariationImage;
