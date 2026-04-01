import { io } from "socket.io-client";

const socket = io("https://video-streaming-processor.onrender.com", {
  autoConnect: false,

  // Send JWT token with every connection
  auth: {
    token: localStorage.getItem("token"),
  },

  transports: ["websocket"], // prevent polling fallback issues on Netlify
});

export default socket;