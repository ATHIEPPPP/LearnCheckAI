import { ArrowLeft, Calendar, Download, FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function MaterialsView() {
  const { subject } = useParams();
  const navigate = useNavigate();

  // Mock materials data - replace with API call
  const [materials] = useState([
    {
      id: 1,
      name: "Pengenalan Biologi.pdf",
      size: "2.5 MB",
      uploadDate: "2025-11-15",
      type: "application/pdf",
    },
    {
      id: 2,
      name: "Struktur Sel.pptx",
      size: "5.2 MB",
      uploadDate: "2025-11-20",
      type: "application/vnd.ms-powerpoint",
    },
    {
      id: 3,
      name: "Ringkasan Materi BAB 1.docx",
      size: "856 KB",
      uploadDate: "2025-11-25",
      type: "application/msword",
    },
  ]);

  const getFileIcon = (type) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("powerpoint") || type.includes("presentation"))
      return "📊";
    if (type.includes("word") || type.includes("document")) return "📝";
    return "📁";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/student")}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Materi {decodeURIComponent(subject)}
                </h1>
                <p className="text-gray-600 mt-1">
                  {materials.length} materi tersedia untuk dipelajari
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Materials List */}
        <div className="space-y-4">
          {materials.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Belum Ada Materi
              </h3>
              <p className="text-gray-600">
                Materi untuk mata pelajaran ini belum tersedia. Silakan hubungi
                guru.
              </p>
            </div>
          ) : (
            materials.map((material) => (
              <div
                key={material.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{getFileIcon(material.type)}</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {material.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {material.size}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(material.uploadDate).toLocaleDateString(
                            "id-ID",
                            { year: "numeric", month: "long", day: "numeric" }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Tips Belajar</h4>
              <p className="text-blue-800 text-sm">
                Pelajari materi dengan seksama sebelum mengerjakan quiz.
                Pastikan kamu memahami konsep dasar setiap topik untuk hasil
                yang maksimal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
