import { BookOpen, GraduationCap, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Isi email dan password");
    if (role === "student") navigate("/student");
    else navigate("/teacher");
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

          <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            Masuk Sekarang
          </button>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-5">
          <p className="text-center text-gray-500 text-sm font-medium mb-4">
            🎯 Demo Akun
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setRole("teacher");
                setEmail("guru@example.com");
                setPassword("secret");
                navigate("/teacher");
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-indigo-200 hover:border-indigo-500 rounded-xl text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-all duration-200 hover:shadow-md"
            >
              <GraduationCap className="w-4 h-4" />
              Login Guru
            </button>
            <button
              onClick={() => {
                setRole("student");
                setEmail("siswa@example.com");
                setPassword("secret");
                navigate("/student");
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-purple-200 hover:border-purple-500 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-50 transition-all duration-200 hover:shadow-md"
            >
              <User className="w-4 h-4" />
              Login Siswa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
