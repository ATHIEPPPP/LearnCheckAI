import { Check, FileText, FileUp, Upload, X } from "lucide-react";
import { useState } from "react";
import { API_BASE_URL } from "../config/api";

export default function MaterialUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [notif, setNotif] = useState(null); // {type:'success'|'error', message:string}

  const subjects = [
    "Matematika",
    "IPA",
    "IPS",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Fisika",
    "Kimia",
    "Biologi",
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Hanya file PDF atau PPT yang diperbolehkan!");
        return;
      }

      // Validasi ukuran file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran file maksimal 10MB!");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !subject || !title) {
      setNotif({ type: "error", message: "Lengkapi semua field yang wajib" });
      setTimeout(() => setNotif(null), 3000);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("subject", subject);
      formData.append("title", title);
      formData.append("description", description);

      const res = await fetch(`${API_BASE_URL}/materials/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Upload failed");
      }

      const result = await res.json();

      setNotif({ type: "success", message: "Upload berhasil! Materi tersimpan" });

      setUploadSuccess(true);
      setTimeout(() => {
        setSelectedFile(null);
        setSubject("");
        setTitle("");
        setDescription("");
        setUploadSuccess(false);
        setNotif(null);
      }, 2000);
    } catch (error) {
      setNotif({ type: "error", message: `Upload gagal: ${error.message}` });
      setTimeout(() => setNotif(null), 4000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Upload Materi Pembelajaran
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Upload file PDF atau PowerPoint untuk siswa Anda
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <div className="space-y-6">
            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200"
              >
                <option value="">Pilih mata pelajaran...</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Materi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Persamaan Linear"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="Deskripsi singkat tentang materi..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 resize-none"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Materi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-200"
                >
                  {selectedFile ? (
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-800">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">
                        Klik untuk upload file
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF atau PPT (Max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading || uploadSuccess}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : uploadSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    Upload Berhasil!
                  </>
                ) : (
                  <>
                    <FileUp className="w-5 h-5" />
                    Upload Materi
                  </>
                )}
              </button>

              {selectedFile && !uploading && (
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Batal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tips:</strong> Pastikan file materi sudah terstruktur
            dengan baik dan mudah dipahami siswa. File yang di-upload akan
            diproses oleh AI untuk:
          </p>
          <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc">
            <li>Membaca dan mempelajari materi</li>
            <li>Menambahkan soal-soal baru ke bank soal secara otomatis</li>
            <li>Menyediakan rekomendasi belajar yang lebih baik untuk siswa</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
