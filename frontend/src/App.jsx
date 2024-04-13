import { useEffect, useState } from "react";
import "./App.css";
// import Cta from "./components/Cta";

const App = () => {
    const [file, setFile] = useState(null);
    const [imageDescription, setImageDescription] = useState(null);
    const handleFile = (e) => {
        setFile(e.target.files[0]);
    };

    const getImageDescriptionOpenAI = async () => {
        console.log("file", file);
        const formData = new FormData();
        formData.append("file", file);

        try {
            await fetch("http://localhost:4000/api/image", { method: "POST", body: formData })
                .then((response) => {
                    if (!response.ok) {
                        console.log("Upload failed:", response);
                    }
                    return response.text();
                })
                .then((data) => {
                    console.log("Upload successful:", data, typeof data);
                    const result = JSON.parse(data);
                    setImageDescription(result);
                });
        } catch (error) {
            console.log("error", error);
        }
    };

    const getComponentOpenAI = async () => {
        console.log("imageDescription", imageDescription);
        try {
            const response = await fetch("http://localhost:4000/api/use", {
                method: "POST",
                body: JSON.stringify(imageDescription),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            console.log("data", data);
        } catch (error) {
            console.log("error", error);
        }
    };

    const submitOpenAI = async () => {
        if (!file) return;
        await getImageDescriptionOpenAI();
    };

    useEffect(() => {
        if (imageDescription && Object.keys(imageDescription).length) {
            console.log("imageDescription", imageDescription);
            if (imageDescription.ai === "openai") {
                getComponentOpenAI();
            }

            if (imageDescription.ai === "geminiai") {
                // TODO
            }
        }
    }, [imageDescription]);

    // Gemini
    const submitGeminiAI = async () => {
        if (!file) return;
        await getImageDescriptionGeminiAI();
    };

    const getImageDescriptionGeminiAI = async () => {
        console.log("file", file);
        const formData = new FormData();
        formData.append("file", file);

        try {
            await fetch("http://127.0.0.1:4010/api/image", { method: "POST", body: formData })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Upload successful:", data, typeof data);
                    setImageDescription(data);
                });
        } catch (error) {
            console.log("error", error);
        }
    };

    return (
        <div className="App">
            <main className="App-main">
                <p>AI Image Description</p>
                <div className="form_el">
                    <label htmlFor="file">
                        <input
                            className="kf-fileInput__field"
                            type="file"
                            name="file"
                            id="file"
                            onChange={handleFile}
                        />
                    </label>
                    <button onClick={submitOpenAI}>Submit to OpenAI</button>
                    <button onClick={submitGeminiAI}>Submit to Google GeminiAI</button>
                </div>
                {imageDescription && imageDescription?.data && (
                    <p id="image-prompt">
                        <strong>AI:</strong> {imageDescription?.ai} <br />
                        <strong>Name:</strong> {imageDescription?.data?.name} <br />
                        <strong>Description:</strong> {imageDescription?.data?.description}
                    </p>
                )}
                {/* <Cta /> */}
            </main>
        </div>
    );
};

export default App;
