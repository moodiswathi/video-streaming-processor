import { useState } from "react";
import API from "../api";
import socket from "../socket";   // 👈 IMPORT SOCKET HERE

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Email required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/api/auth/login", { email });

      // Save token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ⭐ IMPORTANT: Connect socket with auth
      socket.auth = { token: res.data.token };
      socket.connect();

      if (onLogin) onLogin();
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow w-80 space-y-4">
        <h2 className="text-lg font-semibold text-center">Login</h2>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <input
          className="w-full border p-2 rounded"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}