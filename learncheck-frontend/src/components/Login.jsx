import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple client-side "auth" placeholder
    if (!email || !password) return alert("Isi email dan password");
    if (role === "student") navigate("/student");
    else navigate("/teacher");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Masuk ke LearnCheck
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Peran</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full p-2 border rounded"
            >
              <option value="student">Siswa</option>
              <option value="teacher">Guru</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border rounded"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 border rounded"
              placeholder="password"
            />
          </div>

          <button className="w-full bg-indigo-600 text-white py-2 rounded font-semibold">
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
