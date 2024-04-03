import { useEffect, useState } from "react";
import "./App.css";
// import Cta from "./components/Cta";

const App = () => {
    const [file, setFile] = useState(null);
    const [imageDescription, setImageDescription] = useState(null);
    const handleFile = (e) => {
        setFile(e.target.files[0]);
    };

    const getImageDescription = async () => {
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
                    setImageDescription(result.data);
                });
        } catch (error) {
            console.log("error", error);
        }
    };

    const getComponent = async () => {
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

    const submit = async () => {
        if (!file) return;
        await getImageDescription();
    };

    useEffect(() => {
        if (imageDescription && Object.keys(imageDescription).length) {
            console.log("imageDescription", imageDescription);
            getComponent();
        }
    }, [imageDescription]);

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
                    <button onClick={submit}>Submit</button>
                </div>
                {imageDescription && (
                    <p id="image-prompt">
                        <strong>Name:</strong> {imageDescription?.name} <br />
                        <strong>Description:</strong> {imageDescription?.description}
                    </p>
                )}
                {/* <Cta /> */}
            </main>
        </div>
    );
};

export default App;
