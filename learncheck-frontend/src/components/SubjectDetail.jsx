import { AlertCircle, BrainCircuit, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import MaterialList from "./MaterialList";

export default function SubjectDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("materials"); // Default to materials
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizEnabled, setQuizEnabled] = useState(true);
  const [loadingQuizSettings, setLoadingQuizSettings] = useState(true);
  const [quizTimeStatus, setQuizTimeStatus] = useState(""); // "not_started", "active", "ended"

  // Load quiz settings on mount
  useEffect(() => {
    loadQuizSettings();
  }, [name]);

  const loadQuizSettings = async () => {
    try {
      const mapel = name.toLowerCase().replace(/\s+/g, "_");
      const response = await fetch(`${API_BASE_URL}/quiz-settings/${mapel}`);
      if (response.ok) {
        const data = await response.json();

        // Check if quiz is enabled
        if (!data.enabled) {
          setQuizEnabled(false);
          setQuizTimeStatus("disabled");
          return;
        }

        // Check time restrictions
        const now = new Date();
        const startDate = data.startDate ? new Date(data.startDate) : null;
        const endDate = data.endDate ? new Date(data.endDate) : null;

        if (startDate && now < startDate) {
          // Quiz hasn't started yet
          setQuizEnabled(false);
          setQuizTimeStatus("not_started");
        } else if (endDate && now > endDate) {
          // Quiz has ended
          setQuizEnabled(false);
          setQuizTimeStatus("ended");
        } else {
          // Quiz is active
          setQuizEnabled(true);
          setQuizTimeStatus("active");
        }
      }
    } catch (error) {
      console.error("Failed to load quiz settings:", error);
      // Default to enabled if error
      setQuizEnabled(true);
      setQuizTimeStatus("active");
    } finally {
      setLoadingQuizSettings(false);
    }
  };

  // Function to start quiz - simplified version
  const startQuiz = async () => {
    // Check if quiz is enabled
    if (!quizEnabled) {
      alert(
        `Quiz untuk mata pelajaran ${name} sedang tidak tersedia.\n\nGuru telah menonaktifkan quiz ini sementara waktu. Silakan akses materi pembelajaran terlebih dahulu.`
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get quiz from backend API (using existing questions from database)
      const mapel = name.toLowerCase().replace(/\s+/g, "_");
      const response = await fetch(
        `${API_BASE_URL}/generate?mapel=${mapel}&n=10`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`Gagal mengambil soal: ${response.status}`);
      }

      const questions = await response.json();

      if (!questions || questions.length === 0) {
        throw new Error("Tidak ada soal tersedia untuk mata pelajaran ini");
      }

      console.log("[SubjectDetail] Raw questions from backend:", questions);

      // Transform questions to quiz format
      const quizQuestions = questions.map((q) => {
        const options = q.opsi
          ? [
              q.opsi.A || "",
              q.opsi.B || "",
              q.opsi.C || "",
              q.opsi.D || "",
              q.opsi.E || "",
            ].filter((opt) => opt !== "")
          : q.options || [];

        // Map jawaban_benar (A/B/C/D/E) to index (0/1/2/3/4)
        let answerIndex = 0;
        if (q.jawaban_benar) {
          const answerKey = q.jawaban_benar.toUpperCase();
          const keys = ["A", "B", "C", "D", "E"];
          answerIndex = keys.indexOf(answerKey);
          if (answerIndex === -1) answerIndex = 0;
        }

        return {
          id: q.id,
          mapel: q.mapel,
          question:
            q.teks || q.pertanyaan || q.question || "Pertanyaan tidak tersedia",
          options: options,
          answer: answerIndex,
          topik: q.topik || "",
          tingkat: q.tingkat || "",
        };
      });

      console.log("[SubjectDetail] Transformed questions:", quizQuestions);

      // Navigate to quiz page
      navigate("/quiz", {
        state: {
          subject: name,
          questions: quizQuestions,
          mapel: mapel,
        },
      });
    } catch (err) {
      console.error("Error starting quiz:", err);
      setError(err.message);
      alert(
        `Error: ${err.message}\n\nPastikan backend sudah berjalan dan ada soal untuk mata pelajaran ini.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2"
          >
            ← Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
          <p className="text-gray-600 mt-2">Pilih aktivitas pembelajaranmu</p>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
              activeTab === "quiz"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Latihan Soal
          </button>
          <button
            onClick={() => setActiveTab("materials")}
            className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
              activeTab === "materials"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Materi Belajar
          </button>
        </div>

        {/* Content */}
        {activeTab === "quiz" && (
          <div className="space-y-4">
            {/* Quiz status warning */}
            {!quizEnabled && (
              <div
                className={`border-2 rounded-xl p-5 flex items-start gap-4 ${
                  quizTimeStatus === "not_started"
                    ? "bg-blue-50 border-blue-200"
                    : quizTimeStatus === "ended"
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    quizTimeStatus === "not_started"
                      ? "bg-blue-100"
                      : quizTimeStatus === "ended"
                      ? "bg-red-100"
                      : "bg-amber-100"
                  }`}
                >
                  <AlertCircle
                    className={`w-6 h-6 ${
                      quizTimeStatus === "not_started"
                        ? "text-blue-600"
                        : quizTimeStatus === "ended"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  />
                </div>
                <div>
                  <h4
                    className={`font-semibold mb-1 ${
                      quizTimeStatus === "not_started"
                        ? "text-blue-900"
                        : quizTimeStatus === "ended"
                        ? "text-red-900"
                        : "text-amber-900"
                    }`}
                  >
                    {quizTimeStatus === "not_started" && "Quiz Belum Dimulai"}
                    {quizTimeStatus === "ended" && "Quiz Sudah Berakhir"}
                    {quizTimeStatus === "disabled" &&
                      "Quiz Sedang Tidak Tersedia"}
                  </h4>
                  <p
                    className={`text-sm ${
                      quizTimeStatus === "not_started"
                        ? "text-blue-700"
                        : quizTimeStatus === "ended"
                        ? "text-red-700"
                        : "text-amber-700"
                    }`}
                  >
                    {quizTimeStatus === "not_started" &&
                      "Quiz belum bisa diakses. Silakan tunggu hingga waktu mulai."}
                    {quizTimeStatus === "ended" &&
                      "Waktu pengerjaan quiz telah berakhir."}
                    {quizTimeStatus === "disabled" &&
                      'Guru telah menonaktifkan quiz untuk mata pelajaran ini sementara waktu. Kamu tetap bisa mengakses materi pembelajaran di tab "Materi Belajar".'}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`p-3 rounded-lg ${
                    quizEnabled ? "bg-indigo-100" : "bg-gray-100"
                  }`}
                >
                  <BrainCircuit
                    className={`w-8 h-8 ${
                      quizEnabled ? "text-indigo-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Mulai Kuis
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {quizEnabled
                      ? `Soal akan diambil dari database untuk materi ${name}`
                      : "Quiz sedang tidak tersedia"}
                  </p>
                </div>
              </div>
              <button
                onClick={startQuiz}
                disabled={loading || !quizEnabled}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  quizEnabled
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading
                  ? "Memuat..."
                  : quizEnabled
                  ? "Mulai Kuis Sekarang"
                  : "Quiz Tidak Tersedia"}
                {!loading && quizEnabled && <PlayCircle className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {activeTab === "materials" && <MaterialList subject={name} />}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center transform animate-slideUp">
            {/* Loading Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
            </div>

            {/* Loading Text */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Memuat Soal Kuis
            </h3>
            <p className="text-gray-600 mb-4">
              Sedang mengambil soal dari database...
            </p>

            {/* Progress Indicator */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full animate-progress"></div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              Memuat Soal...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
