import React, { useState, useEffect } from "react";

const MediaLibrary = () => {
  const [imgLibraryData, setImgLibraryData] = useState({});
  const [filters, setFilters] = useState({
    all: true,
    "generated-images": false,
    "edited-images": false,
    "variation-images": false,
    openai: false,
    geminiai: false,
    "generated-videos": false
  });
  const [zoomedImage, setZoomedImage] = useState(null);
  const [zoomedVideo, setZoomedVideo] = useState(null);

  const get_saved_media = async () => {
    try {
      await fetch("http://localhost:4000/api/get_saved_media")
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
    get_saved_media();
  }, []);

  // Handle Escape key to close zoom modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && (zoomedImage || zoomedVideo)) {
        setZoomedImage(null);
        setZoomedVideo(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [zoomedImage, zoomedVideo]);

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
          "generated-videos": false,
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

  // Filter images and videos based on selected filters
  const getFilteredItems = () => {
    const allFiltersUnchecked = Object.keys(filters).every(key => !filters[key]);
    const imageFiles = imgLibraryData.imageFiles || [];
    const videoFiles = imgLibraryData.videoFiles || [];

    if (allFiltersUnchecked) return { images: [], videos: [] };

    const filteredImages = imageFiles.filter((img) => {
      // If "all" is selected, show everything
      if (filters.all) return true;

      // Check image type filters (exclude videos from image type check)
      const matchesImageType =
        (!filters["generated-images"] && !filters["edited-images"] && !filters["variation-images"] && !filters["generated-videos"]) ||
        filters[img.imageType];

      // Check AI provider filters
      const matchesAi =
        (!filters.openai && !filters.geminiai) ||
        filters[img.ai];

      return matchesImageType && matchesAi;
    });

    const filteredVideos = videoFiles.filter((video) => {
      // If "all" is selected, show everything
      if (filters.all) return true;

      // Check if videos should be shown
      const matchesVideoType =
        (!filters["generated-images"] && !filters["edited-images"] && !filters["variation-images"] && !filters["generated-videos"]) ||
        filters["generated-videos"];

      // Check AI provider filters
      const matchesAi =
        (!filters.openai && !filters.geminiai) ||
        filters[video.ai];

      return matchesVideoType && matchesAi;
    });

    return { images: filteredImages, videos: filteredVideos };
  };

  const { images: filteredImages, videos: filteredVideos } = getFilteredItems();
  const totalItems = filteredImages.length + filteredVideos.length;
  const totalAvailable = (imgLibraryData.imageFiles?.length || 0) + (imgLibraryData.videoFiles?.length || 0);

  return (
    <>
      {(imgLibraryData.imageFiles || imgLibraryData.videoFiles) ? (
        <div className="media-library-container">
          <div className="media-library--all">
            <h3>Media Library</h3>

            {/* Filter Checkboxes */}
            <div className="media-library-filters" style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "5px" }}>
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
                <label style={{ marginRight: "15px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={filters["generated-videos"]}
                    onChange={() => handleFilterChange("generated-videos")}
                    style={{ marginRight: "5px" }}
                  />
                  Generated Videos
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
                Showing {totalItems} of {totalAvailable} items ({filteredImages.length} images, {filteredVideos.length} videos)
              </div>
            </div>

            <ul className="media-library">
              {filteredImages.map((img, index) => {
                // Get the correct key for prompt lookup based on imageType
                const promptKey = img.imageType;
                // Get filename without extension for prompt lookup
                const filenameWithoutExt = img.filename.split(".")[0];
                // Look up prompt using img.ai (the AI provider from the image) and the prompt key
                const imgPrompt =
                  imgLibraryData?.imagePromts?.[img.ai]?.[promptKey]?.[filenameWithoutExt];

                return (
                  <li key={`media-library--${img.ai}___${index}`}>
                    <img key={index} src={img.path} alt="" />
                    <div className="media-library--image-prompt--date">
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
              {filteredVideos.map((video, index) => {
                // Get filename without extension for prompt lookup (video ID)
                const filenameWithoutExt = video.filename.split(".")[0];
                // Look up video data using video.ai and "generated-videos" key
                const videoData = imgLibraryData?.imagePromts?.[video.ai]?.["generated-videos"]?.[filenameWithoutExt];

                return (
                  <li key={`video-library-videos--${video.ai}___${index}`}>
                    <video
                      id={videoData.id}
                      key={index}
                      src={video.path}
                      controls
                      style={{ width: "100%", height: "auto" }}
                    />
                    <div className="media-library--video-prompt--date">
                      <p>Created at: {video.createdAt ? new Date(video.createdAt).toLocaleString() : "Unknown date"}</p>
                      {videoData && (
                        <>
                          <p>{videoData.prompt}</p>
                          <p>Model:{videoData.model}</p>
                        </>

                      )}
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => setZoomedVideo(video.path)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0",
                          margin: "0",
                        }}
                        title="View fullscreen"
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
                      <a href={video.path} target="_blank" rel="noreferrer">
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

      {/* Zoom Modal for Images */}
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

      {/* Zoom Modal for Videos */}
      {zoomedVideo && (
        <div
          onClick={() => setZoomedVideo(null)}
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
          <video
            src={zoomedVideo}
            controls
            autoPlay
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain"
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setZoomedVideo(null)}
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

export default MediaLibrary;
