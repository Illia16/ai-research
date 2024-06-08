import React, { useState, useEffect } from "react";

const ImgLibrary = ({ ai, imgTypeDirr, imgTypeDirrKey }) => {
    const [imgLibraryData, setImgLibraryData] = useState({});
    const apiUrl = ai === "openai" ? "http://localhost:4000" : "http://127.0.0.1:4010"; // local only for now

    const getSavedImages = async () => {
        try {
            await fetch(`${apiUrl}/api/get_saved_images?images=${imgTypeDirr}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log("data", data);
                    setImgLibraryData(data);
                });
        } catch (error) {
            console.log("error", error);
        }
    };

    useEffect(() => {
        getSavedImages();
    }, []);

    return (
        <>
            {Object.keys(imgLibraryData).length ? (
                <div className="image-library">
                    <div className={`image-library--${ai}`}>
                        <h3>
                            {ai} {imgTypeDirr} library
                        </h3>
                        <ul className={`image-library-images image-library-images--${ai}`}>
                            {imgLibraryData.imageFiles.map((img, index) => {
                                const imgPrompt =
                                    imgLibraryData?.imagePromts?.[ai][imgTypeDirrKey]?.[img.split(".")[0]];

                                return (
                                    <li key={`image-library-images--openai___${index}`}>
                                        <img key={index} src={`/images/${imgTypeDirr}/${ai}/${img}`} alt="" />
                                        {imgPrompt && (
                                            <div className="image-library--image-prompt">
                                                <p>{imgPrompt}</p>
                                            </div>
                                        )}
                                        <a
                                            href={`/images/${imgTypeDirr}/${ai}/${img}`}
                                            target="_blank"
                                            rel="noreferrer">
                                            <img src="/images/download.svg" alt="" />
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            ) : (
                <>Loading...</>
            )}
        </>
    );
};

export default ImgLibrary;
