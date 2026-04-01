import { useState } from "react";
import API from "../api";

function Upload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a video");
      return;
    }

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title);

    try {
      setLoading(true);
      setError("");

      await API.post("/api/videos/upload", formData);

      setFile(null);
      setTitle("");

      onUploadSuccess && onUploadSuccess();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold text-center">
          Upload Video
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <input
          className="w-full border p-2 rounded"
          placeholder="Video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="file"
          accept="video/*"
          className="w-full border p-2 rounded"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

export default Upload;