import { io } from "socket.io-client";

const socket = io("https://video-streaming-processor.onrender.com", {
  autoConnect: false,
  transports: ["websocket"], 
});

// Try reconnect if token already exists (after page refresh)
const savedToken = localStorage.getItem("token");
if (savedToken) {
  socket.auth = { token: savedToken };
  socket.connect();
}

export default socket;