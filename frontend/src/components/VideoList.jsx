import { useEffect, useState } from "react";
import socket from "../socket";
import API from "../api";

const VideoList = ({ refreshKey }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/videos");
      setVideos(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [refreshKey]);

  
  useEffect(() => {
    const handleProcessed = (data) => {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === data.videoId
            ? { ...v, status: data.status }
            : v
        )
      );
    };

    const handleProgress = (data) => {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === data.videoId
            ? { ...v, progress: data.progress }
            : v
        )
      );
    };

    socket.on("videoProcessed", handleProcessed);
    socket.on("videoProgress", handleProgress);

    return () => {
      socket.off("videoProcessed", handleProcessed);
      socket.off("videoProgress", handleProgress);
    };
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 
      className="text-2xl font-semibold mb-6 text-center">
        Video Library
      </h2>

      <div
       className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => {
          const filename = video.fileUrl?.split("/").pop();

          return (
            <div key={video._id} className="bg-white rounded-xl shadow p-3">
              {video.status === "safe" ? 
              (
                <video
                  controls
                  className="w-full h-48 object-cover"
                src={`https://video-streaming-processor.onrender.com/api/videos/stream/${filename}?token=${localStorage.getItem("token")}`}
                />
              ) : (
                <div className="h-48 flex items-center justify-center flex-col">
                  <p className="text-gray-500">
                    {video.status === "flagged"
                      ? "Flagged 🚫"
                      : "Processing..."}
                  </p>

                  {video.status === "processing" && (
                    <p className="text-sm text-blue-500">
                      {video.progress || 0}%
                    </p>
                  )}
                </div>
              )}

              <h3 className="mt-2 font-medium">{video.title}</h3>
              <p className="text-sm text-gray-400">{video.status}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoList;