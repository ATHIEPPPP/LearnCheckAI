import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function ClassManagement() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get subject from location state or localStorage
  const getSubject = () => {
    if (location.state?.subject?.name) {
      return location.state.subject;
    }
    // Fallback to localStorage
    const teacherSubject = localStorage.getItem("teacher_subject");
    if (teacherSubject) {
      return { id: teacherSubject, name: teacherSubject };
    }
    return { id: "N/A", name: "Kelas" };
  };

  const subject = getSubject();

  const [activeTab, setActiveTab] = useState("students");
  const [materials, setMaterials] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Students management state
  const [myClass, setMyClass] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  // Quiz settings state
  const [quizSettings, setQuizSettings] = useState({
    enabled: false,
    timer: 60,
    startDate: "",
    endDate: "",
    showCorrectAnswers: true,
    randomizeQuestions: false,
    attempts: 1,
  });

  // Load quiz settings on mount
  useEffect(() => {
    loadQuizSettings();
    loadMyClass();
    loadAvailableStudents();
    loadMaterials();
  }, [subject.name]);

  const loadMyClass = async () => {
    try {
      const token = localStorage.getItem("teacher_token");
      const response = await fetch(`${API_BASE_URL}/teacher/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const classes = await response.json();
        // Find class that matches current subject
        const teacherSubject = localStorage.getItem("teacher_subject");
        const currentClass = classes.find((c) => c.subject === teacherSubject);

        if (currentClass) {
          setMyClass(currentClass);
        } else {
          // Create class if not exists
          await createClass();
        }
      }
    } catch (error) {
      console.error("Failed to load class:", error);
    }
  };

  const createClass = async () => {
    try {
      const token = localStorage.getItem("teacher_token");
      const teacherSubject = localStorage.getItem("teacher_subject");

      const response = await fetch(`${API_BASE_URL}/teacher/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `Kelas ${subject.name}`,
          subject: teacherSubject,
        }),
      });

      if (response.ok) {
        const newClass = await response.json();
        setMyClass(newClass);
      }
    } catch (error) {
      console.error("Failed to create class:", error);
    }
  };

  const loadAvailableStudents = async () => {
    try {
      const token = localStorage.getItem("teacher_token");
      const response = await fetch(
        `${API_BASE_URL}/teacher/available-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const students = await response.json();
        setAvailableStudents(students);
      }
    } catch (error) {
      console.error("Failed to load students:", error);
    }
  };

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
        alert("✅ Siswa berhasil ditambahkan!");
        await loadMyClass();
        await loadAvailableStudents();
        setShowAddStudent(false);
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.detail}`);
      }
    } catch (error) {
      console.error("Failed to add student:", error);
      alert("❌ Gagal menambahkan siswa");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleRemoveStudent = async (studentEmail) => {
    if (!myClass) return;
    if (!confirm("Hapus siswa dari kelas?")) return;

    setLoadingStudents(true);
    try {
      const token = localStorage.getItem("teacher_token");
      const response = await fetch(
        `${API_BASE_URL}/teacher/classes/${myClass.class_id}/students/${studentEmail}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("✅ Siswa berhasil dihapus dari kelas");
        await loadMyClass();
        await loadAvailableStudents();
      } else {
        alert("❌ Gagal menghapus siswa");
      }
    } catch (error) {
      console.error("Failed to remove student:", error);
      alert("❌ Gagal menghapus siswa");
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadQuizSettings = async () => {
    try {
      const mapel = subject.name.toLowerCase().replace(/\s+/g, "_");
      const response = await fetch(`${API_BASE_URL}/quiz-settings/${mapel}`);
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
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);

    try {
      for (const file of files) {
        // Validate file type
        const allowedTypes = [
          "application/pdf",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ];

        if (!allowedTypes.includes(file.type)) {
          alert(
            `File ${file.name} tidak didukung. Hanya PDF atau PPT yang diperbolehkan.`
          );
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} terlalu besar. Maksimal 10MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        // Use subject.name, fallback to localStorage if needed
        const subjectName =
          subject.name || localStorage.getItem("teacher_subject") || "unknown";
        console.log("[UPLOAD] Subject:", subjectName); // Debug log

        formData.append("subject", subjectName);
        formData.append("title", file.name.replace(/\.[^/.]+$/, "")); // Remove extension
        formData.append("description", `Materi ${subjectName}`);

        const response = await fetch(`${API_BASE_URL}/materials/upload`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          alert(
            `✅ ${file.name} berhasil diupload!\n\n` +
              `AI telah memproses materi dan menambahkan ${result.questions_generated} soal ke bank soal.`
          );
        } else {
          const error = await response.json().catch(() => ({}));
          alert(
            `❌ Gagal upload ${file.name}: ${error.detail || "Unknown error"}`
          );
        }
      }

      // Reload materials list
      await loadMaterials();
      e.target.value = null;
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Terjadi kesalahan saat upload");
    } finally {
      setUploading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      const mapel = subject.name.toLowerCase().replace(/\s+/g, "_");
      const response = await fetch(`${API_BASE_URL}/materials?mapel=${mapel}`);

      if (response.ok) {
        const data = await response.json();
        const formattedMaterials = data.map((m) => ({
          id: m.id,
          name: m.title,
          size: "N/A",
          type: m.file_type,
          uploadDate: new Date(m.created_at).toLocaleDateString("id-ID"),
          file_url: m.file_url,
        }));
        setMaterials(formattedMaterials);
      }
    } catch (error) {
      console.error("Failed to load materials:", error);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!confirm("Hapus materi ini?")) return;

    // For now, just remove from state (can implement DELETE endpoint later)
    setMaterials(materials.filter((m) => m.id !== id));
    alert(
      "✅ Materi dihapus dari tampilan (untuk delete permanent, perlu implement DELETE endpoint)"
    );
  };

  const handleQuizToggle = () => {
    const newEnabled = !quizSettings.enabled;
    setQuizSettings({ ...quizSettings, enabled: newEnabled });
  };

  const saveQuizSettings = async (
    settings = quizSettings,
    showNotification = true
  ) => {
    setSaving(true);
    try {
      const mapel = subject.name.toLowerCase().replace(/\s+/g, "_");
      const response = await fetch(`${API_BASE_URL}/quiz-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mapel: mapel,
          enabled: settings.enabled,
          timer: settings.timer,
          startDate: settings.startDate || null,
          endDate: settings.endDate || null,
          showCorrectAnswers: settings.showCorrectAnswers,
          randomizeQuestions: settings.randomizeQuestions,
          attempts: settings.attempts,
        }),
      });

      if (response.ok) {
        if (showNotification) {
          alert("✅ Pengaturan quiz berhasil tersimpan!");
        }
        return true;
      } else {
        if (showNotification) {
          alert("❌ Gagal menyimpan pengaturan");
        }
        return false;
      }
    } catch (error) {
      console.error("Failed to save quiz settings:", error);
      if (showNotification) {
        alert("❌ Error: " + error.message);
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = () => {
    saveQuizSettings(quizSettings, true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 pb-12">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/teacher")}
            className="text-indigo-600 hover:text-indigo-800 mb-3 flex items-center gap-2 text-sm font-medium"
          >
            ← Kembali ke Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {subject.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {subject.id} • Semester Genap (B) 2025
              </p>
            </div>
            <div className="bg-indigo-50 px-4 py-2 rounded-xl">
              <span className="text-sm font-medium text-indigo-700">
                {myClass?.students?.length || 0} Siswa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("students")}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === "students"
                  ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              👥 Siswa Kelas
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === "materials"
                  ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              📚 Materi Pembelajaran
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === "quiz"
                  ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              ⚙️ Pengaturan Quiz
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "students" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      Daftar Siswa
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Total: {myClass?.students?.length || 0} siswa
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddStudent(!showAddStudent)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <span>+</span>
                    Tambah Siswa
                  </button>
                </div>

                {/* Add Student Form */}
                {showAddStudent && (
                  <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Tambah Siswa ke Kelas
                    </h3>
                    {availableStudents.length === 0 ? (
                      <p className="text-gray-600 text-sm">
                        Tidak ada siswa yang tersedia. Semua siswa sudah masuk
                        kelas atau belum ada siswa terdaftar.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {availableStudents.map((student) => (
                          <div
                            key={student.email}
                            className="bg-white p-3 rounded-lg flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium text-gray-800">
                                {student.username}
                              </p>
                              <p className="text-sm text-gray-500">
                                {student.email}
                              </p>
                            </div>
                            <button
                              onClick={() => handleAddStudent(student.email)}
                              disabled={loadingStudents}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                              Tambahkan
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Students List */}
                {myClass && myClass.students && myClass.students.length > 0 ? (
                  <div className="grid gap-3">
                    {myClass.students.map((student, index) => (
                      <div
                        key={student.email}
                        className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {student.username}
                            </p>
                            <p className="text-sm text-gray-500">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(student.email)}
                          disabled={loadingStudents}
                          className="text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Belum Ada Siswa
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Klik tombol "Tambah Siswa" untuk menambahkan siswa ke
                      kelas ini
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "materials" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Upload Materi
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Upload file materi pembelajaran (PDF atau PPT). AI akan
                    membaca materi dan menambahkan soal ke bank soal.
                  </p>

                  <label className="block">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.ppt,.pptx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {uploading
                        ? "⏳ Mengupload..."
                        : "📤 Pilih File (PDF/PPT)"}
                    </label>
                  </label>

                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Tips:</strong> AI akan otomatis membaca materi
                      dan generate 10-15 soal baru untuk ditambahkan ke bank
                      soal.
                    </p>
                  </div>
                </div>

                {/* Materials List */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Materi Tersimpan ({materials.length})
                  </h3>

                  {materials.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="text-6xl mb-4">📂</div>
                      <p className="text-gray-600">
                        Belum ada materi yang diupload
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {materials.map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">
                              {material.type === "pdf" ? "📕" : "📊"}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">
                                {material.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {material.type?.toUpperCase()} • Diupload{" "}
                                {material.uploadDate}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {material.file_url && (
                              <button
                                onClick={() =>
                                  window.open(material.file_url, "_blank")
                                }
                                className="text-indigo-600 hover:text-indigo-800 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all"
                              >
                                👁️ Lihat
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="text-red-600 hover:text-red-800 px-4 py-2 rounded-lg hover:bg-red-50 transition-all"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "quiz" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Pengaturan Quiz
                </h2>

                {/* Quiz Enable/Disable */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-6 border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">
                        Status Quiz
                      </h3>
                      <p className="text-sm text-gray-600">
                        {quizSettings.enabled
                          ? "Quiz aktif dan dapat diakses siswa"
                          : "Quiz nonaktif, siswa tidak dapat mengakses"}
                      </p>
                    </div>
                    <button
                      onClick={handleQuizToggle}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all ${
                        quizSettings.enabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          quizSettings.enabled
                            ? "translate-x-9"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Quiz Settings Form */}
                <div className="space-y-6">
                  {/* Timer */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ⏱️ Durasi Quiz (menit)
                    </label>
                    <input
                      type="number"
                      value={quizSettings.timer}
                      onChange={(e) =>
                        setQuizSettings({
                          ...quizSettings,
                          timer: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="1"
                      max="180"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Siswa memiliki {quizSettings.timer} menit untuk
                      menyelesaikan quiz
                    </p>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📅 Tanggal Mulai
                    </label>
                    <input
                      type="datetime-local"
                      value={quizSettings.startDate}
                      onChange={(e) =>
                        setQuizSettings({
                          ...quizSettings,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📅 Tanggal Berakhir
                    </label>
                    <input
                      type="datetime-local"
                      value={quizSettings.endDate}
                      onChange={(e) =>
                        setQuizSettings({
                          ...quizSettings,
                          endDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Attempts */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔄 Jumlah Percobaan
                    </label>
                    <input
                      type="number"
                      value={quizSettings.attempts}
                      onChange={(e) =>
                        setQuizSettings({
                          ...quizSettings,
                          attempts: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="1"
                      max="10"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Siswa dapat mengerjakan quiz maksimal{" "}
                      {quizSettings.attempts}x
                    </p>
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quizSettings.showCorrectAnswers}
                        onChange={(e) =>
                          setQuizSettings({
                            ...quizSettings,
                            showCorrectAnswers: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-gray-700">
                        Tampilkan jawaban benar setelah selesai
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quizSettings.randomizeQuestions}
                        onChange={(e) =>
                          setQuizSettings({
                            ...quizSettings,
                            randomizeQuestions: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-gray-700">
                        Acak urutan pertanyaan
                      </span>
                    </label>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "⏳ Menyimpan..." : "💾 Simpan Pengaturan"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
