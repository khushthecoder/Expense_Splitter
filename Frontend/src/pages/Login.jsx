import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Login() {
  const { setUser, fetchGroups } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      // backend returns created user
      setUser(data);
      fetchGroups();
      navigate("/");
    } catch (err) {
      setError(err?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      // backend returns token on success
      // fetch users and find the user object for this email
      const usersRes = await fetch(`${API_BASE}/users`);
      const users = await usersRes.json();
      const me = users.find((u) => u.email === form.email) || {
        name: form.email,
        email: form.email,
      };
      setUser(me);
      fetchGroups();
      navigate("/");
    } catch (err) {
      setError(err?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card card">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Expense Splitter</h1>
          <p className="text-sm text-gray-600">
            Share bills and settle up with friends easily
          </p>
        </div>

        <div className="flex gap-2 mb-5">
          <button
            className={`flex-1 py-2 rounded-lg ${
              mode === "login" ? "btn btn-primary" : "btn btn-outline"
            }`}
            onClick={() => setMode("login")}
            aria-pressed={mode === "login"}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-lg ${
              mode === "signup" ? "btn btn-primary" : "btn btn-outline"
            }`}
            onClick={() => setMode("signup")}
            aria-pressed={mode === "signup"}
          >
            Sign up
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 mb-3">
            {typeof error === "string" ? error : JSON.stringify(error)}
          </div>
        )}

        {mode === "signup" ? (
          <form onSubmit={handleSignup} className="space-y-3">
            <input
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 border rounded-lg"
            />
            <input
              required
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 border rounded-lg"
            />
            <input
              required
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full p-3 border rounded-lg"
            />

            <div>
              <input
                required
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 rounded-lg"
            >
              {loading ? "Signing up..." : "Create account"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              required
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 border rounded-lg"
            />

            <div>
              <input
                required
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Password reset not configured");
                }}
                className="text-blue-600"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 rounded-lg"
            >
              {loading ? "Logging in..." : "Sign in"}
            </button>
          </form>
        )}

        <div className="my-4 flex items-center gap-3">
          <hr className="flex-1" />
          <span className="text-sm text-gray-500">or continue with</span>
          <hr className="flex-1" />
        </div>

        <div className="mt-2">
          <button
            onClick={() => {
              alert("Google login not configured in this demo");
            }}
            className="w-full btn btn-outline py-3 rounded-lg"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
