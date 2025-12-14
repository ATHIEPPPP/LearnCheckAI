import { BookOpen, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous error

    if (!email || !password) {
      setError("Isi email dan password");
      return;
    }

    setLoading(true);
    console.log("🔐 Login attempt:", { email, API_BASE_URL });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Login success:", data);

        // Store token and user info
        if (data.role === "admin") {
          localStorage.setItem("admin_token", data.token);
          console.log("🔑 Token stored, navigating to /admin");
          navigate("/admin");
        } else if (data.role === "teacher") {
          localStorage.setItem("teacher_token", data.token);
          localStorage.setItem("teacher_subject", data.subject);
          localStorage.setItem("teacher_name", data.username);
          console.log("🔑 Token stored, navigating to /teacher");
          navigate("/teacher");
        } else if (data.role === "student") {
          localStorage.setItem("student_token", data.token);
          localStorage.setItem("student_name", data.username);
          localStorage.setItem("student_class_id", data.class_id || "");
          console.log("🔑 Token stored, navigating to /student");
          navigate("/student");
        }
      } else {
        const errorData = await response.json();
        console.error("❌ Login failed:", errorData);
        setError(errorData.detail || "Email atau password salah");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError("Gagal terhubung ke server. Pastikan backend sudah berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-10 relative z-10 transform transition-all hover:shadow-3xl">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg transform transition-transform hover:scale-110">
            <BookOpen className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            LearnCheck
          </h1>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mt-2">
            Selamat Datang!
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2 mb-6 text-center">
            Masuk ke akun Anda untuk melanjutkan pembelajaran
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              !
            </div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Masuk Sekarang"}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-5 text-center">
          <p className="text-gray-500 text-sm">
            Belum punya akun? Hubungi admin untuk membuat akun
          </p>
        </div>
      </div>
    </div>
  );
}
