import { useState, useEffect } from "react";
import Upload from "./components/Upload";
import VideoList from "./components/VideoList";
import Login from "./components/Login";
import socket from "./socket";

function App() {
  const [refresh, setRefresh] = useState(0);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const handleLogin = () => {
    const t = localStorage.getItem("token");
    setToken(t);
    setUser(JSON.parse(localStorage.getItem("user")));

    // ✅ CONNECT SOCKET AFTER LOGIN
    socket.auth = { token: t };
    socket.connect();
  };

  const handleLogout = () => {
    socket.disconnect(); // ✅ clean disconnect
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  // ✅ reconnect on refresh
  useEffect(() => {
    if (token) {
      socket.auth = { token };
      socket.connect();
    }
  }, [token]);

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-xl font-bold">Video Processing App</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {user?.role}
          </span>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {user?.role !== "viewer" && (
        <Upload onUploadSuccess={() => setRefresh((p) => p + 1)} />
      )}

      <VideoList refreshKey={refresh} />
    </div>
  );
}

export default App;