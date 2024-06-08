import { useState } from "react";
import ImgLibrary from "./ImgLibrary";

const VariationImage = () => {
    const [image, setImage] = useState(null);

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
            <ImgLibrary ai="openai" imgTypeDirr="variation-images" imgTypeDirrKey="variationImages" />
        </section>
    );
};

export default VariationImage;
