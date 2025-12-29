import {
  BookOpen,
  Calendar,
  Download,
  FileText,
  PlayCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function MaterialList({ subject }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (subject) {
      loadMaterials();
    }
  }, [subject]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const mapelNormalized = subject.toLowerCase().replace(/\s+/g, "_");
      const response = await fetch(
        `${API_BASE_URL}/materials?mapel=${mapelNormalized}`
      );

      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      } else {
        console.error("Failed to load materials");
        setMaterials([]);
      }
    } catch (error) {
      console.error("Error loading materials:", error);
      // Fallback to localStorage for demo
      const allMaterials = JSON.parse(
        localStorage.getItem("materials") || "[]"
      );
      const filtered = subject
        ? allMaterials.filter((m) => m.subject === subject)
        : allMaterials;
      setMaterials(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (materialSubject) => {
    navigate("/student", { state: { selectedSubject: materialSubject } });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType === "pdf") {
      return "🔴"; // Red PDF icon
    }
    return "📊"; // PPT icon
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600 mt-4">Memuat materi...</p>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">
          Belum ada materi tersedia
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Guru akan mengupload materi pembelajaran segera
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Materi Pembelajaran
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materials.map((material) => (
          <div
            key={material.id}
            className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
          >
            {/* Header with subject badge */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
              <div className="flex items-center justify-between">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-medium text-white">
                  {material.mapel || subject}
                </span>
                <span className="text-4xl">
                  {getFileIcon(material.file_type)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {material.title}
              </h3>

              {material.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {material.description}
                </p>
              )}

              {/* File info */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{material.file_type?.toUpperCase()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                <Calendar className="w-4 h-4" />
                <span>Upload: {formatDate(material.created_at)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    window.open(
                      `${API_BASE_URL}${material.file_url?.startsWith("/") ? material.file_url : `/${material.file_url}`}`,
                      "_blank"
                    )
                  }
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Lihat Materi
                </button>

                <button
                  onClick={() => handleStartQuiz(material.mapel || subject)}
                  className="px-4 py-2.5 rounded-xl border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-all duration-200 flex items-center gap-2"
                  title="Mulai Quiz"
                >
                  <PlayCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
