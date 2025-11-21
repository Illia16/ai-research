import { useState, useEffect, useRef } from "react";

const GenerateVideo = () => {
    const [ai, setAi] = useState("openai");

    // for all AI provides
    const [imageReference, setImageReference] = useState(null); // can be multiple images?
    const [videoGenPrompt, setVideoGenPrompt] = useState("");
    const [aiModel, setAiModel] = useState("sora-2-pro");

    // openai
    const [videoId, setVideoId] = useState(null);
    const [seconds, setSeconds] = useState(4);
    const [videoSize, setVideoSize] = useState("1280x720");

    // openai: (fe states)
    const [videoStatus, setVideoStatus] = useState(null);
    const [videoProgress, setVideoProgress] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [videoData, setVideoData] = useState(null);
    const [error, setError] = useState(null);

    // openai remix
    const [remixPrompt, setRemixPrompt] = useState("");
    const [allVideos, setAllVideos] = useState(null);

    const pollingIntervalRef = useRef(null);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const listVideosOpenAI = async () => {
        try {
            const res = await fetch("http://localhost:4000/api/list-videos");
            const data = await res.json();
            console.log("data listVideosOpenAI:", data);
            setAllVideos(data.data);
        } catch (error) {
            console.log("error", error);
        }
    };
    const deleteVideo = async (videoId) => {
        const formData = new FormData();
        formData.append("videoId", videoId);

        try {
            const res = await fetch("http://localhost:4000/api/delete-video", { method: "POST", body: formData });
            const data = await res.json();
            console.log("data deleteVideo:", data);

            const deletedId = data.data.id;
            setAllVideos((prev) => (prev ? prev.filter((video) => video.id !== deletedId) : prev));
        } catch (error) {
            console.log("error", error);
        }
    };

    const pollVideoOpenAI = async (videoId) => {
        const formData = new FormData();
        formData.append("videoId", videoId);
        try {
            const res = await fetch("http://localhost:4000/api/generate-video", { method: "POST", body: formData });
            const data = await res.json();

            if (data.data) {
                const videoInfo = data.data;
                setVideoStatus(videoInfo.status);
                setVideoProgress(videoInfo.progress || 0);
                setVideoData(videoInfo);

                // Stop polling if video is completed or failed
                if (videoInfo.status === "completed" || videoInfo.status === "failed") {
                    if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                        pollingIntervalRef.current = null;
                    }
                    setIsGenerating(false);

                    if (videoInfo.status === "failed") {
                        setError("Video generation failed");
                    }
                    return true; // Indicates polling should stop
                }
            }
            return false; // Continue polling
        } catch (error) {
            console.log("error", error);
            setError("Error polling video status: " + error.message);
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
            setIsGenerating(false);
            return true; // Stop polling on error
        }
    };

    const generateVideoOpenAI = async (existingVideoId = null) => {
        // For remix: need remixPrompt and existingVideoId
        // For new generation: need videoGenPrompt
        const isRemix = remixPrompt && existingVideoId;
        const isNewGeneration = videoGenPrompt && !existingVideoId;

        if (!isRemix && !isNewGeneration) {
            setError("Please provide either a video generation prompt or a remix prompt with video ID");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setVideoStatus(null);
        setVideoProgress(0);
        setVideoData(null);

        const formData = new FormData();
        if (imageReference && imageReference.length > 0) {
            Array.from(imageReference).forEach((file) => {
                formData.append("imageReference", file);
            });
        }

        // Only append videoGenPrompt for new generations
        if (videoGenPrompt) {
            formData.append("videoGenPrompt", videoGenPrompt);
        }
        formData.append("aiModel", aiModel);
        formData.append("seconds", seconds);
        formData.append("size", videoSize);
        if (remixPrompt) {
            formData.append("remixPrompt", remixPrompt);
        }
        if (existingVideoId) {
            formData.append("videoId", existingVideoId);
        }

        try {
            const res = await fetch("http://localhost:4000/api/generate-video", { method: "POST", body: formData });
            const data = await res.json();

            if (data.data?.error) {
                setError(data.data?.error.message);
                setIsGenerating(false);
                setTimeout(() => {
                    document.getElementById("error-msg").scrollIntoView({ behavior: "smooth", block: "start" });
                }, 1000);
                return;
            }

            if (data.data) {
                const videoInfo = data.data;
                const newVideoId = videoInfo.id;
                setVideoId(newVideoId);
                setVideoStatus(videoInfo.status);
                setVideoProgress(videoInfo.progress || 0);
                setVideoData(videoInfo);

                // Start polling if video is queued or in progress
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }

                // Poll immediately, then every 2 seconds
                pollVideoOpenAI(newVideoId);

                pollingIntervalRef.current = setInterval(async () => {
                    const shouldStop = await pollVideoOpenAI(newVideoId);
                    if (shouldStop && pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                        pollingIntervalRef.current = null;
                    }
                }, 5000);
            }
        } catch (error) {
            console.log("error", error);
            setError("Error generating video: " + error.message);
            setIsGenerating(false);
        }
    };

    return (
        <section>
            <h2>AI: Generate Video</h2>
            <div className="form_el">
                <label>
                    <input
                        type="radio"
                        name="ai"
                        value="openai"
                        checked={ai === "openai"}
                        onChange={(e) => setAi(e.target.value)}
                    />
                    OpenAI
                </label>

                <label>
                    <input
                        type="radio"
                        name="ai"
                        value="geminiai"
                        checked={ai === "geminiai"}
                        onChange={(e) => setAi(e.target.value)}
                    />
                    GeminiAI
                </label>
            </div>

            <div className="form_el">
                <p>Select image reference</p>
                <label>
                    <input
                        className="kf-fileInput__field"
                        type="file"
                        name="file_image"
                        id="file_image"
                        // multiple
                        onChange={(e) => setImageReference(e.target.files)}
                    />
                </label>
            </div>
            <div className="form_el">
                <label>
                    <textarea
                        id="videoGen"
                        name="videoGen"
                        rows={10}
                        cols={100}
                        value={videoGenPrompt}
                        placeholder="Enter video generation prompt"
                        onChange={(e) => setVideoGenPrompt(e.target.value)}></textarea>
                </label>
            </div>

            {ai === "openai" && (
                <>
                    <div className="form_el">
                        <label>
                            <select
                                name="aiModel"
                                id="aiModel"
                                value={aiModel}
                                onChange={(e) => setAiModel(e.target.value)}>
                                <option value="">Select model</option>
                                <option value="sora-2-pro">sora-2-pro (default)</option>
                                <option value="sora-2">sora-2</option>
                            </select>
                        </label>
                    </div>
                    <div className="form_el">
                        <label>
                            <select
                                name="seconds"
                                id="seconds"
                                value={seconds}
                                onChange={(e) => setSeconds(e.target.value)}>
                                <option value="">Select seconds</option>
                                <option value="4">4 (default)</option>
                                <option value="8">8</option>
                                <option value="12">12</option>
                            </select>
                        </label>
                    </div>
                    <div className="form_el">
                        <label>
                            <select
                                name="videoSize"
                                id="videoSize"
                                value={videoSize}
                                onChange={(e) => setVideoSize(e.target.value)}>
                                <option value="720x1280">720x1280</option>
                                <option value="1280x720">1280x720 (default)</option>
                                <option value="1024x1792">1024x1792</option>
                                <option value="1792x1024">1792x1024</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <button
                            onClick={() => generateVideoOpenAI(null)}
                            className="btn-primary"
                            disabled={isGenerating}>
                            {isGenerating ? "Generating..." : "Generate Video with OpenAI"}
                        </button>
                    </div>

                    {allVideos && allVideos.length > 0 ? (
                        <div style={{ marginTop: "7rem" }}>
                            <div className="form_el">
                                <label>
                                    <textarea
                                        id="remixPrompt"
                                        name="remixPrompt"
                                        rows={5}
                                        cols={100}
                                        value={remixPrompt}
                                        placeholder="Enter remix prompt"
                                        onChange={(e) => setRemixPrompt(e.target.value)}></textarea>
                                </label>
                            </div>
                            <ul className="media-library-list">
                                {allVideos.map((video) => (
                                    <li key={video.id}>
                                        <p>{video.prompt}</p>
                                        {video?.error?.message ? (
                                            <p>{video?.error?.message}</p>
                                        ) : (
                                            <>
                                                <video
                                                    src={`/videos/openai/${video.id}.mp4`}
                                                    controls
                                                    style={{ width: "100%", height: "auto" }}
                                                />
                                                <button
                                                    onClick={() => generateVideoOpenAI(video.id)}
                                                    className="btn-primary"
                                                    disabled={isGenerating || !remixPrompt}>
                                                    Remix Video OpenAI
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => deleteVideo(video.id)} className="btn-primary">
                                            Delete the video
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <button onClick={listVideosOpenAI} className="btn-primary">
                            List Videos OpenAI
                        </button>
                    )}

                    {videoStatus && (
                        <div className="form_el" style={{ marginTop: "20px" }}>
                            <p>
                                <strong>Status:</strong> {videoStatus}
                            </p>
                            {videoProgress > 0 && (
                                <div>
                                    <p>
                                        <strong>Progress:</strong> {videoProgress.toFixed(1)}%
                                    </p>
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "20px",
                                            backgroundColor: "#f0f0f0",
                                            borderRadius: "4px",
                                            overflow: "hidden",
                                        }}>
                                        <div
                                            style={{
                                                width: `${videoProgress}%`,
                                                height: "100%",
                                                backgroundColor: videoStatus === "failed" ? "#ff4444" : "#4CAF50",
                                                transition: "width 0.3s ease",
                                            }}></div>
                                    </div>
                                </div>
                            )}
                            {videoId && (
                                <p>
                                    <strong>Video ID:</strong> {videoId}
                                </p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div id="error-msg" className="form_el" style={{ marginTop: "20px", color: "#ff4444" }}>
                            <p>
                                <strong>Error:</strong> {error}
                            </p>
                        </div>
                    )}

                    {videoData && videoStatus === "completed" && (
                        <div className="form_el" style={{ marginTop: "20px" }}>
                            <p>
                                <strong>Video completed successfully!</strong>
                            </p>
                            <p>Size: {videoData.size}</p>
                            <p>Duration: {videoData.seconds} seconds</p>
                            <p>Model: {videoData.model}</p>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default GenerateVideo;
