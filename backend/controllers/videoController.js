const videoService = require("../services/videoService");

// ================= UPLOAD =================
exports.uploadVideo = async (req, res) => {
  try {
    const result = await videoService.uploadVideo(req);
    res.status(200).json(result);
  } catch (error) {
    console.log("UPLOAD CONTROLLER ERROR:", error.message);
    res.status(500).json({ message: "Upload failed" });
  }
};

// ================= GET ALL =================
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await videoService.getAllVideos(req);
    res.status(200).json(videos);
  } catch (error) {
    console.log("GET VIDEOS ERROR:", error.message);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
};

// ================= STREAM =================
exports.streamVideo = async (req, res) => {
  try {
    await videoService.streamVideo(req, res);
  } catch (error) {
    console.log("STREAM ERROR:", error.message);
    res.status(500).json({ message: "Streaming error" });
  }
};