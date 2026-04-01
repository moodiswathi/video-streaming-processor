const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
 const path = require("path");

const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const videoRoutes = require("./routes/videoRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
connectDB();

const app = express();


app.use(
  cors({
    origin: "*", 
  })
);
app.use(express.json());

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*", 
  },
});

//  SOCKET AUTH
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

//  SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("User connected:", socket.user.id);

  // 🔥 IMPORTANT: join user-specific room
  socket.join(socket.user.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.id);
  });
});


app.set("io", io);


app.get("/", (req, res) => {
  res.send("Server is running...");
});

// =
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message);
  res.status(500).json({ message: err.message || "Server error" });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
