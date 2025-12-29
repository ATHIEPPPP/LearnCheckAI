// LearnCheck Class Management - Fixed Version (Refreshed)
import { useEffect, useState, useCallback, useMemo } from "react";
import { PlayCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function ClassManagement() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- State Management ---
  const [activeTab, setActiveTab] = useState("students");
  // Data States
  const [materials, setMaterials] = useState([]);
  const [myClass, setMyClass] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  
  // Loading States

  const [uploading, setUploading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  // UI States
  
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [notif, setNotif] = useState({ show: false, message: "", type: "info" });

  const [quizSettings, setQuizSettings] = useState({
    enabled: false,
    timer: 60,
    startDate: "",
    endDate: "",
    showCorrectAnswers: true,
    randomizeQuestions: false,
    attempts: 1,
  });

  // --- Helpers ---
  const showNotif = (message, type = "info", timeout = 2500) => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "info" }), timeout);
  };

  const subject = useMemo(() => {
    if (location.state?.subject?.name) {
      return location.state.subject;
    }
    const teacherSubject = localStorage.getItem("teacher_subject");
    if (teacherSubject) {
      return { id: teacherSubject, name: teacherSubject };
    }
    return { id: "N/A", name: "Kelas" };
  }, [location.state]);

  // --- API Calls ---

  const createClass = useCallback(async () => {
    try {
      const token = localStorage.getItem("teacher_token");
      const reqSubject = (subject.name || "").toLowerCase();

      const response = await fetch(`${API_BASE_URL}/teacher/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `Kelas ${subject.name}`,
          subject: reqSubject,
        }),
      });

      if (response.ok) {
        const newClass = await response.json();
        setMyClass(newClass);
      }
    } catch (error) {
      console.error("Failed to create class:", error);
    }
  }, [subject.name]);

  const loadMyClass = useCallback(async () => {
    try {
      const token = localStorage.getItem("teacher_token");
      const response = await fetch(`${API_BASE_URL}/teacher/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const classes = await response.json();
        const ts = (subject.name || "").toLowerCase();
        const currentClass = classes.find((c) => (c.subject || "").toLowerCase() === ts);

        if (currentClass) {
          setMyClass(currentClass);
        } else {
          await createClass();
        }
      }
    } catch (error) {
      console.error("Failed to load class:", error);
    }
  }, [subject.name, createClass]);

  const loadAvailableStudents = useCallback(async () => {
    try {
      const token = localStorage.getItem("teacher_token");
      const response = await fetch(`${API_BASE_URL}/teacher/available-students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const students = await response.json();
        setAvailableStudents(students);
      }
    } catch (error) {
      console.error("Failed to load available students:", error);
    }
  }, []);

  const loadMaterials = useCallback(async () => {
    try {
      const mapelNormalized = subject.name.toLowerCase().replace(/\s+/g, "_");
      const response = await fetch(`${API_BASE_URL}/materials?mapel=${mapelNormalized}`);
      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      }
    } catch (error) {
      console.error("Error loading materials:", error);
    }
  }, [subject.name]);

  const loadQuizSettings = useCallback(async () => {
    try {
      const mapelNormalized = subject.name.toLowerCase().replace(/\s+/g, "_");
      const response = await fetch(`${API_BASE_URL}/quiz-settings/${mapelNormalized}`);
      if (response.ok) {
        const data = await response.json();
        setQuizSettings({
          enabled: data.enabled,
          timer: data.timer,
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          showCorrectAnswers: data.showCorrectAnswers,
          randomizeQuestions: data.randomizeQuestions,
          attempts: data.attempts,
        });
      }
    } catch (error) {
      console.error("Failed to load quiz settings:", error);
    }
  }, [subject.name]);

  // Initial Load
  useEffect(() => {
    loadMyClass();
    loadAvailableStudents();
    loadMaterials();
    loadQuizSettings();
  }, [loadMyClass, loadAvailableStudents, loadMaterials, loadQuizSettings]);

  // --- Handlers: Students ---

  const handleAddStudent = async (studentEmail) => {
    if (!myClass) return;
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem("teacher_token");
      const response = await fetch(
        `${API_BASE_URL}/teacher/classes/${myClass.class_id}/students`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            student_email: studentEmail,
            class_id: myClass.class_id,
          }),
        }
      );

      if (response.ok) {
        showNotif("✅ Siswa berhasil ditambahkan!", "success");
        await loadMyClass();
        await loadAvailableStudents();
        setShowAddStudent(false);
      } else {
        const err = await response.json();
        showNotif(`❌ Gagal: ${err.detail}`, "error");
      }
    } catch (err) {
      console.error("Failed to add student:", err);
      showNotif("❌ Terjadi kesalahan", "error");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleRemoveStudent = async (studentEmail) => {
    if (!window.confirm("Hapus siswa dari kelas?")) return;
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem("teacher_token");
      const response = await fetch(
        `${API_BASE_URL}/teacher/classes/${myClass.class_id}/students/${studentEmail}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        showNotif("✅ Siswa berhasil dihapus", "success");
        await loadMyClass();
        await loadAvailableStudents();
      } else {
        showNotif("❌ Gagal menghapus siswa", "error");
      }
    } catch (err) {
      console.error("Remove student error:", err);
      showNotif("❌ Terjadi kesalahan", "error");
    } finally {
      setLoadingStudents(false);
    }
  };

  // --- Handlers: Materials ---

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mapel", subject.name);
        formData.append("title", file.name);
        formData.append("description", `Materi ${subject.name}`);

        const token = localStorage.getItem("teacher_token");
        const response = await fetch(`${API_BASE_URL}/materials/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (response.ok) {
          showNotif(`✅ ${file.name} berhasil diupload!`, "success");
        } else {
          showNotif(`❌ Gagal upload ${file.name}`, "error");
        }
      }
      await loadMaterials();
      e.target.value = null;
    } catch (err) {
      console.error("Upload error:", err);
      showNotif("❌ Terjadi kesalahan upload", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem("teacher_token");
      const response = await fetch(`${API_BASE_URL}/materials/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showNotif("✅ Materi berhasil dihapus", "success");
        await loadMaterials();
      } else {
        showNotif("❌ Gagal menghapus materi", "error");
      }
    } catch (err) {
      console.error("Delete material error:", err);
      showNotif("❌ Terjadi kesalahan", "error");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // --- Handlers: Quiz ---

  const saveQuizSettings = async (newSettings) => {
    setSaving(true);
    try {
      const mapelNormalized = subject.name.toLowerCase().replace(/\s+/g, "_");
      const token = localStorage.getItem("teacher_token");
      const response = await fetch(`${API_BASE_URL}/quiz-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mapel: mapelNormalized,
          ...newSettings,
        }),
      });

      if (response.ok) {
        showNotif("✅ Pengaturan berhasil disimpan", "success");
      } else {
        showNotif("❌ Gagal menyimpan pengaturan", "error");
      }
    } catch (err) {
      console.error("Save quiz error:", err);
      showNotif("❌ Terjadi kesalahan", "error");
    } finally {
      setSaving(false);
    }
  };

  // --- Render Functions ---

  const renderStudentsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Daftar Siswa</h2>
        <button
          onClick={() => setShowAddStudent(!showAddStudent)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-semibold transition-all"
        >
          {showAddStudent ? "Batal" : "+ Tambah Siswa"}
        </button>
      </div>

      {showAddStudent && (
        <div className="mb-6 p-6 bg-indigo-50 rounded-xl border border-indigo-200">
          <h3 className="font-semibold mb-4">Pilih Siswa untuk Ditambahkan:</h3>
          {availableStudents.length === 0 ? (
            <p className="text-gray-500">Tidak ada siswa tersedia.</p>
          ) : (
            <div className="space-y-2">
              {availableStudents.map((s) => (
                <div key={s.email} className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <span>{s.username} ({s.email})</span>
                  <button
                    onClick={() => handleAddStudent(s.email)}
                    disabled={loadingStudents}
                    className="bg-green-600 text-white px-4 py-1 rounded-lg text-sm"
                  >
                    Tambah
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {myClass?.students?.length > 0 ? (
          myClass.students.map((s, idx) => (
            <div key={s.email} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold">{s.username}</p>
                  <p className="text-sm text-gray-500">{s.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveStudent(s.email)}
                className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-sm"
              >
                Hapus
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">Belum ada siswa di kelas ini.</div>
        )}
      </div>
    </div>
  );

  const renderMaterialsTab = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Materi</h2>
        <label className="block">
          <input
            type="file"
            multiple
            accept=".pdf,.ppt,.pptx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="cursor-pointer inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            {uploading ? "⏳ Mengupload..." : "📤 Upload File (PDF/PPT)"}
          </div>
        </label>
      </div>

      <h3 className="text-lg font-bold mb-4">Materi Tersimpan ({materials.length})</h3>
      <div className="space-y-3">
        {materials.map((m) => (
          <div key={m.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{m.type === "pdf" ? "📕" : "📊"}</span>
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-gray-500">{m.uploadDate}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {m.file_url && (
                <button
                  onClick={() => window.open(m.file_url, "_blank")}
                  className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg"
                >
                  Lihat
                </button>
              )}
              <button
                onClick={() => {
                  setDeleteId(m.id);
                  setShowDeleteModal(true);
                }}
                className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  
    const renderQuizTab = () => (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pengaturan Quiz</h2>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const newEnabled = !quizSettings.enabled;
                setQuizSettings({ ...quizSettings, enabled: newEnabled });
                saveQuizSettings({ ...quizSettings, enabled: newEnabled });
              }}
              className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${
                quizSettings.enabled ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-500"
              }`}
            >
              {quizSettings.enabled ? "Quiz Aktif" : "Quiz Nonaktif"}
            </button>
            <button
              onClick={() => navigate("/student", { state: { selectedSubject: subject.name } })}
              className="flex items-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
            >
              <PlayCircle size={20} /> Preview
            </button>
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border shadow-sm">
          <div>
            <label className="block text-sm font-semibold mb-1">Durasi (menit)</label>
            <input
              type="number"
              value={quizSettings.timer}
              onChange={(e) => setQuizSettings({ ...quizSettings, timer: parseInt(e.target.value) || 0 })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Max Percobaan</label>
            <input
              type="number"
              value={quizSettings.attempts}
              onChange={(e) => setQuizSettings({ ...quizSettings, attempts: parseInt(e.target.value) || 1 })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Mulai</label>
            <input
              type="datetime-local"
              value={quizSettings.startDate}
              onChange={(e) => setQuizSettings({ ...quizSettings, startDate: e.target.value })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Selesai</label>
            <input
              type="datetime-local"
              value={quizSettings.endDate}
              onChange={(e) => setQuizSettings({ ...quizSettings, endDate: e.target.value })}
              className="w-full border rounded-lg p-2"
            />
          </div>
        </div>
  
        <div className="mt-6">
          <button
            onClick={() => saveQuizSettings(quizSettings)}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </div>
    );
  
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="font-bold text-2xl text-indigo-600">📚 LearnCheck</div>
          <div className="flex gap-6">
            <a href="/" className="text-gray-600 hover:text-indigo-600 font-medium">Dashboard</a>
            <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="text-red-600 font-medium">Logout</button>
          </div>
        </nav>
  
        <main className="max-w-7xl mx-auto px-4 mt-8">
          {/* Header */}
          <div className="mb-8">
            <button onClick={() => navigate("/")} className="text-indigo-600 text-sm font-medium mb-2">← Kembali</button>
            <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
            <p className="text-gray-500">{myClass ? `${myClass.students?.length || 0} Siswa Terdaftar` : "Memuat data kelas..."}</p>
          </div>
  
          {/* Tabs */}
          <div className="flex border-b mb-6">
            {["students", "materials", "quiz"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize ${
                  activeTab === tab ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "students" ? "Siswa" : tab === "materials" ? "Materi" : "Quiz"}
              </button>
            ))}
          </div>
  
          {/* Content */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            {activeTab === "students" && renderStudentsTab()}
            {activeTab === "materials" && renderMaterialsTab()}
            {activeTab === "quiz" && renderQuizTab()}
          </div>
        </main>
  
        {/* Notifications */}
        {notif.show && (
          <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg text-white font-medium ${
            notif.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}>
            {notif.message}
          </div>
        )}
  
        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
              <h3 className="text-lg font-bold mb-2">Hapus Materi?</h3>
              <p className="text-gray-600 mb-6">Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Batal</button>
                <button onClick={handleDeleteMaterial} className="px-4 py-2 bg-red-600 text-white rounded-lg">Hapus</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
