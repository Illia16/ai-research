import { useState } from "react";

const VariationImage = () => {
    const [image, setImage] = useState(null);
    const [numberOfImages, setNumberOfImages] = useState(1);


    const handleImage = (e) => {
        setImage(e.target.files[0]);
    };

    const editImageOpenAI = async () => {
        if (!image) return;
        const formData = new FormData();
        formData.append("imageVariation", image);
        formData.append("numberOfImages", numberOfImages);

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

            <button onClick={editImageOpenAI} className="btn-primary">Create variation image with OpenAI</button>
        </section>
    );
};

export default VariationImage;
