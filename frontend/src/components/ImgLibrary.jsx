import React, { useState, useEffect } from "react";

const ImgLibrary = () => {
    const [imgLibraryData, setImgLibraryData] = useState({});
    const [filters, setFilters] = useState({
        all: true,
        "generated-images": false,
        "edited-images": false,
        "variation-images": false,
        openai: false,
        geminiai: false
    });
    const [zoomedImage, setZoomedImage] = useState(null);

    const getSavedImages = async () => {
        try {
            await fetch("http://localhost:4000/api/get_saved_images")
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

    // Handle Escape key to close zoom modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && zoomedImage) {
                setZoomedImage(null);
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [zoomedImage]);

    // Handle filter checkbox changes
    const handleFilterChange = (filterName) => {
        setFilters((prevFilters) => {
            const newFilters = { ...prevFilters };

            // If "all" is clicked, toggle it and reset all other filters
            if (filterName === "all") {
                const newAllValue = !prevFilters.all;
                return {
                    all: newAllValue,
                    "generated-images": false,
                    "edited-images": false,
                    "variation-images": false,
                    openai: false,
                    geminiai: false
                };
            }

            // Toggle the clicked filter
            newFilters[filterName] = !newFilters[filterName];
            newFilters.all = false; // Uncheck "all" when any specific filter is selected
            return newFilters;
        });
    };

    // Filter images based on selected filters
    const getFilteredImages = () => {
        const allFiltersUnchecked = Object.keys(filters).every(key => !filters[key]);
        if (!imgLibraryData.imageFiles || allFiltersUnchecked) return [];

        return imgLibraryData.imageFiles.filter((img) => {
            // If "all" is selected, show everything
            if (filters.all) return true;

            // Check image type filters
            const matchesImageType =
                (!filters["generated-images"] && !filters["edited-images"] && !filters["variation-images"]) ||
                filters[img.imageType];

            // Check AI provider filters
            const matchesAi =
                (!filters.openai && !filters.geminiai) ||
                filters[img.ai];

            return matchesImageType && matchesAi;
        });
    };

    const filteredImages = getFilteredImages();

    return (
        <>
            {imgLibraryData.imageFiles ? (
                <div className="image-library">
                    <div className="image-library--all">
                        <h3>Image Library</h3>

                        {/* Filter Checkboxes */}
                        <div className="image-library-filters" style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "5px" }}>
                            <div style={{ marginBottom: "10px" }}>
                                <label style={{ marginRight: "15px", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={filters.all}
                                        onChange={() => handleFilterChange("all")}
                                        style={{ marginRight: "5px" }}
                                    />
                                    All (default)
                                </label>
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <strong style={{ display: "block", marginBottom: "5px" }}>Image Type:</strong>
                                <label style={{ marginRight: "15px", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={filters["generated-images"]}
                                        onChange={() => handleFilterChange("generated-images")}
                                        style={{ marginRight: "5px" }}
                                    />
                                    Generated Images
                                </label>
                                <label style={{ marginRight: "15px", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={filters["edited-images"]}
                                        onChange={() => handleFilterChange("edited-images")}
                                        style={{ marginRight: "5px" }}
                                    />
                                    Edited Images
                                </label>
                                <label style={{ marginRight: "15px", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={filters["variation-images"]}
                                        onChange={() => handleFilterChange("variation-images")}
                                        style={{ marginRight: "5px" }}
                                    />
                                    Variation Images
                                </label>
                            </div>
                            <div>
                                <strong style={{ display: "block", marginBottom: "5px" }}>AI Provider:</strong>
                                <label style={{ marginRight: "15px", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={filters.openai}
                                        onChange={() => handleFilterChange("openai")}
                                        style={{ marginRight: "5px" }}
                                    />
                                    OpenAI
                                </label>
                                <label style={{ marginRight: "15px", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={filters.geminiai}
                                        onChange={() => handleFilterChange("geminiai")}
                                        style={{ marginRight: "5px" }}
                                    />
                                    Gemini AI
                                </label>
                            </div>
                            <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
                                Showing {filteredImages.length} of {imgLibraryData.imageFiles.length} images
                            </div>
                        </div>

                        <ul className="image-library-images">
                            {filteredImages.map((img, index) => {
                                // Get the correct key for prompt lookup based on imageType
                                const promptKey = img.imageType;
                                // Get filename without extension for prompt lookup
                                const filenameWithoutExt = img.filename.split(".")[0];
                                // Look up prompt using img.ai (the AI provider from the image) and the prompt key
                                const imgPrompt =
                                    imgLibraryData?.imagePromts?.[img.ai]?.[promptKey]?.[filenameWithoutExt];

                                return (
                                    <li key={`image-library-images--${img.ai}___${index}`}>
                                        <img key={index} src={img.path} alt="" />
                                        <div className="image-library--image-prompt--date">
                                            <p>Created at: {img.createdAt ? new Date(img.createdAt).toLocaleString() : "Unknown date"}</p>
                                            {imgPrompt && (
                                                <p>{imgPrompt}</p>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button
                                                onClick={() => setZoomedImage(img.path)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    padding: "0",
                                                    margin: "0",
                                                }}
                                                title="Zoom in"
                                            >
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="white"
                                                    stroke="black"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <circle cx="11" cy="11" r="8"></circle>
                                                    <path d="m21 21-4.35-4.35"></path>
                                                    <line x1="11" y1="8" x2="11" y2="14"></line>
                                                    <line x1="8" y1="11" x2="14" y2="11"></line>
                                                </svg>
                                            </button>
                                            <a href={img.path} target="_blank" rel="noreferrer">
                                                <img src="/images/download.svg" alt="" />
                                            </a>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            ) : (
                <>Loading...</>
            )}

            {/* Zoom Modal */}
            {zoomedImage && (
                <div
                    onClick={() => setZoomedImage(null)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        cursor: "pointer"
                    }}
                >
                    <img
                        src={zoomedImage}
                        alt="Zoomed"
                        style={{
                            maxWidth: "90%",
                            maxHeight: "90%",
                            objectFit: "contain"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setZoomedImage(null)}
                        style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            background: "rgba(255, 255, 255, 0.2)",
                            border: "none",
                            color: "white",
                            fontSize: "24px",
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                        title="Close"
                    >
                        ×
                    </button>
                </div>
            )}
        </>
    );
};

export default ImgLibrary;
