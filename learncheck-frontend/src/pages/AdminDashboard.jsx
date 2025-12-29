import {
  GraduationCap,
  Search,
  Shield,
  Trash2,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notif, setNotif] = useState(null); // { type: 'success'|'error', message: string }
  const [searchActive, setSearchActive] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    role: "student",
    subject: "",
  });

  // Get token from localStorage
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    loadUsers();
  }, [token, navigate]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("admin_token");
        navigate("/");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.username || !formData.password) {
      setNotif({ type: "error", message: "Semua field harus diisi" });
      setTimeout(() => setNotif(null), 3000);
      return;
    }

    if (formData.role === "teacher" && !formData.subject) {
      setNotif({ type: "error", message: "Guru harus memiliki mata pelajaran" });
      setTimeout(() => setNotif(null), 3000);
      return;
    }

    try {
      const payload = { ...formData };
      // Remove subject if not teacher
      if (formData.role !== "teacher") {
        delete payload.subject;
      }

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setNotif({ type: "success", message: "User berhasil ditambahkan" });
        setFormData({
          email: "",
          username: "",
          password: "",
          role: "student",
          subject: "",
        });
        setTimeout(() => setNotif(null), 3000);
        loadUsers();
      } else {
        const error = await response.json();
        setNotif({ type: "error", message: error.detail || "Gagal menambahkan user" });
        setTimeout(() => setNotif(null), 3000);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setNotif({ type: "error", message: "Gagal menambahkan user" });
      setTimeout(() => setNotif(null), 3000);
    }
  };

  const handleDeleteUser = async (email) => {
    if (!confirm(`Hapus user ${email}?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${email}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotif({ type: "success", message: "User berhasil dihapus" });
        setTimeout(() => setNotif(null), 3000);
        loadUsers();
      } else {
        const error = await response.json();
        setNotif({ type: "error", message: error.detail || "Gagal menghapus user" });
        setTimeout(() => setNotif(null), 3000);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setNotif({ type: "error", message: "Gagal menghapus user" });
      setTimeout(() => setNotif(null), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/");
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    teacher: users.filter((u) => u.role === "teacher").length,
    student: users.filter((u) => u.role === "student").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {notif && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border ${
              notif.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {notif.message}
          </div>
        )}
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Kelola pengguna sistem LearnCheck
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.total}
                </p>
              </div>
              <Users className="w-10 h-10 text-indigo-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Admin</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.admin}
                </p>
              </div>
              <Shield className="w-10 h-10 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Guru</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.teacher}
                </p>
              </div>
              <GraduationCap className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Siswa</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.student}
                </p>
              </div>
              <User className="w-10 h-10 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create User Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Tambah User Baru
              </h2>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nama pengguna"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Min. 6 karakter"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="student">Siswa</option>
                  <option value="teacher">Guru</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formData.role === "teacher" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mata Pelajaran
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Mata Pelajaran</option>
                    <option value="ipa">IPA</option>
                    <option value="ips">IPS</option>
                    <option value="matematika">Matematika</option>
                    <option value="bahasa_indonesia">Bahasa Indonesia</option>
                    <option value="bahasa_inggris">Bahasa Inggris</option>
                    <option value="fisika">Fisika</option>
                    <option value="kimia">Kimia</option>
                    <option value="biologi">Biologi</option>
                    <option value="sejarah">Sejarah</option>
                    <option value="geografi">Geografi</option>
                    <option value="ekonomi">Ekonomi</option>
                    <option value="sosiologi">Sosiologi</option>
                    <option value="ppkn">PPKn</option>
                    <option value="agama_islam">Agama Islam</option>
                    <option value="agama_kristen">Agama Kristen</option>
                    <option value="agama_hindu">Agama Hindu</option>
                    <option value="kesenian">Kesenian</option>
                    <option value="penjaskes">Penjaskes</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Tambah User
              </button>
            </form>
          </div>

          {/* Users List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Daftar User</h2>
              </div>
              {!searchActive ? (
                <button
                  onClick={() => setSearchActive(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title="Cari user"
                >
                  <Search className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Cari</span>
                </button>
              ) : (
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ketik nama atau email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onBlur={() => {
                      if (!searchTerm) setSearchActive(false);
                    }}
                    autoFocus
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Mata Pelajaran
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.email}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              user.role === "admin"
                                ? "bg-purple-100"
                                : user.role === "teacher"
                                ? "bg-green-100"
                                : "bg-blue-100"
                            }`}
                          >
                            {user.role === "admin" ? (
                              <Shield className="w-5 h-5 text-purple-600" />
                            ) : user.role === "teacher" ? (
                              <GraduationCap className="w-5 h-5 text-green-600" />
                            ) : (
                              <User className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <span className="font-medium text-gray-800">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{user.email}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : user.role === "teacher"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role === "admin"
                            ? "Admin"
                            : user.role === "teacher"
                            ? "Guru"
                            : "Siswa"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {user.subject ? (
                          <span className="text-gray-700 font-medium capitalize">
                            {user.subject.replace(/_/g, " ")}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(user.email)}
                          disabled={user.role === "admin" && stats.admin === 1}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            user.role === "admin" && stats.admin === 1
                              ? "Cannot delete last admin"
                              : "Delete user"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-4 md:hidden">
              {filteredUsers.map((user) => (
                <div key={user.email} className="border rounded-xl p-4 shadow-sm bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          user.role === "admin"
                            ? "bg-purple-100"
                            : user.role === "teacher"
                            ? "bg-green-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <Shield className="w-5 h-5 text-purple-600" />
                        ) : user.role === "teacher" ? (
                          <GraduationCap className="w-5 h-5 text-green-600" />
                        ) : (
                          <User className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{user.username}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "teacher"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role === "admin"
                        ? "Admin"
                        : user.role === "teacher"
                        ? "Guru"
                        : "Siswa"}
                    </span>
                  </div>
                  <div className="mt-3 text-sm">
                    {user.subject ? (
                      <span className="text-gray-700 font-medium capitalize">
                        {user.subject.replace(/_/g, " ")}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDeleteUser(user.email)}
                      disabled={user.role === "admin" && stats.admin === 1}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" /> Hapus
                    </button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "Tidak ada user yang cocok dengan pencarian"
                    : "Belum ada user"}
                </div>
              )}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {searchTerm
                  ? "Tidak ada user yang cocok dengan pencarian"
                  : "Belum ada user"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
