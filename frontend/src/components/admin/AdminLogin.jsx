// File: AdminLogin.jsx
// Purpose: Admin login form.
// Overview:
// - Submits password
// - Stores admin token
// File: AdminLogin.jsx
// Purpose: React component for Tesla ChatBot UI.

import { useState } from "react";
import { API_BASE_URL } from "../../lib/constants";
import { apiFetch } from "../../lib/api";

const AdminLogin = ({ onSuccess }) => {
  // Admin login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Authenticate using shared admin password
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }, { timeoutMs: 15000, retries: 0 });

      if (response.ok) {
        const payload = await response.json();
        const token = payload.token || "";
        const role = payload.role || "viewer";
        if (token) {
          localStorage.setItem("adminToken", token);
          localStorage.setItem("adminRole", role);
        }
        onSuccess({ username: username || "Admin", token, role });
      } else {
        setError("Invalid password. Use: KGA!@6247#0");
      }
    } catch (err) {
      setError("Cannot connect to backend. Make sure it's running on port 8000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-carbon/90 p-8 shadow-xl">
        <h1 className="font-display text-3xl">Tesla ChatBot Admin</h1>
        <p className="mt-2 text-sm text-fog">Secure access for authorized personnel only.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase text-fog">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-graphite px-4 py-3 text-ion"
              placeholder="Admin"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase text-fog">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-graphite px-4 py-3 text-ion"
              type="password"
              required
            />
          </div>

          {error && <div className="rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-ember px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-xs text-fog">
          <a href="/" className="text-ember hover:underline">
            Return to public chat
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;




