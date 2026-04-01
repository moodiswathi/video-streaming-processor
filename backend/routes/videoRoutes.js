const express = require("express");
const router = express.Router();
const multer = require("multer");

const videoController = require("../controllers/videoController");
const auth = require("../middleware/auth");
const role = require("../middleware/roleMiddleware");


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Only video files allowed"));
    }
    cb(null, true);
  },
});


//  Upload (Editor + Admin)
router.post(
  "/upload",
  auth,
  role("editor", "admin"),
  upload.single("video"),
  (req, res, next) => {
    videoController.uploadVideo(req, res).catch(next);
  }
);

//  Get videos 
router.get(
  "/",
  auth,
  role("viewer", "editor", "admin"),
  (req, res, next) => {
    videoController.getAllVideos(req, res).catch(next);
  }
);

// Stream 
router.get("/stream/:filename", videoController.streamVideo);

module.exports = router;