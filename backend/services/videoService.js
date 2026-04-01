const Video = require("../models/Video");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

// ================= UPLOAD =================
const uploadVideo = async (req) => {
  if (!req.file) {
    throw new Error("No file uploaded");
  }

  if (!req.body.title) {
    throw new Error("Title is required");
  }

  const video = new Video({
    title: req.body.title,
    fileUrl: req.file.filename,
    status: "processing",
    progress: 0,
    size: req.file.size,
    userId: req.user.id,
  });

  await video.save();

  // start processing
  const io = req.app.get("io");
  if (io) {
    simulateProcessing(video, io);
  }

  return {
    message: "Video uploaded successfully",
    video,
  };
};

// ================= GET ALL (WITH FILTER) =================
const getAllVideos = async (req) => {
  const filter = {
    userId: req.user.id,
  };

  // status filtering
  if (req.query.status) {
    filter.status = req.query.status;
  }

  return await Video.find(filter).sort({
    createdAt: -1,
  });
};

// ================= STREAM VIDEO =================
const streamVideo = async (req, res) => {
  try {
    const token =
      req.query.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const filename = req.params.filename;

    // 🔒 ownership check
    const video = await Video.findOne({
      fileUrl: filename,
      userId: req.user.id,
    });

    if (!video) {
      return res.status(403).json({ message: "Access denied" });
    }

    const filePath = path.join(__dirname, "..", "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    
    const ext = filename.split(".").pop().toLowerCase();

    let contentType = "video/mp4";
    if (ext === "webm") contentType = "video/webm";
    else if (ext === "ogg") contentType = "video/ogg";
    else if (ext === "mov") contentType = "video/quicktime";
    else if (ext === "mkv") contentType = "video/x-matroska";

    if (range) {
      const parts = range.replace("bytes=", "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1]
        ? parseInt(parts[1], 10)
        : fileSize - 1;

      const chunkSize = end - start + 1;

      const stream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
      });

      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.log("STREAM ERROR:", error.message);
    res.status(500).json({ message: "Streaming failed" });
  }
};

// ================= PROCESSING =================
const simulateProcessing = (video, io) => {
  let progress = 0;

  const interval = setInterval(async () => {
    progress += 20;

    if (progress >= 100) {
    
      let status = "safe";
      const title = video.title.toLowerCase();

      if (
        title.includes("violence") ||
        title.includes("adult") ||
        title.includes("blood")
      ) {
        status = "flagged";
      }

      video.status = status;
      video.progress = 100;

      await video.save();

      // ✅ SEND ONLY TO OWNER
      io.to(video.userId.toString()).emit("videoProcessed", {
        videoId: video._id,
        status,
      });

      clearInterval(interval);
      return;
    }

    video.progress = progress;
    await video.save();

   
    io.to(video.userId.toString()).emit("videoProgress", {
      videoId: video._id,
      progress,
    });
  }, 1000);
};

// ================= EXPORT =================
module.exports = {
  uploadVideo,
  getAllVideos,
  streamVideo,
};