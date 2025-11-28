import { BookOpen, BrainCircuit, PlayCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function SubjectDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("quiz"); // 'quiz' | 'materials'
  const [loading, setLoading] = useState(false);

  // Function to start quiz (moved from StudentDashboard)
  const startQuiz = async () => {
    setLoading(true);
    try {
      const body = {
        question_text: `Buat 10 soal pilihan ganda untuk topik ${name} dengan tingkat kesulitan bervariasi`,
        mapel: name,
        topic: name.toLowerCase().replace(/\s+/g, "_"),
        difficulty: "sedang",
        explanation: "",
        choices: [],
      };

      const res = await fetch("http://127.0.0.1:8000/qg/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${text}`);
      }

      const data = await res.json();
      const rawQuestions = Array.isArray(data) ? data : [data];
      
      const qArr = rawQuestions.map(q => {
        const options = (q.choices || []).map(c => c.text);
        const answerIndex = (q.choices || []).findIndex(c => c.is_correct);
        
        return {
          question: q.question_text || q.question || "",
          options: options,
          answer: answerIndex >= 0 ? answerIndex : 0,
          // Pass explanation too for remedial
          explanation: q.explanation || ""
        };
      });

      navigate("/quiz", { state: { subject: name, questions: qArr } });
    } catch (err) {
      alert("Gagal generate soal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mock materials (later fetch from backend)
  const materials = [
    { title: `Pengantar ${name}`, type: "PDF", date: "2025-01-10" },
    { title: `Ringkasan Bab 1`, type: "Video", date: "2025-01-15" },
  ];

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
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <BrainCircuit className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mulai Kuis AI</h3>
                <p className="text-gray-600 text-sm">
                  Soal akan dibuat otomatis oleh AI sesuai materi {name}
                </p>
              </div>
            </div>
            <button
              onClick={startQuiz}
              disabled={loading}
              className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Memuat..." : "Mulai Kuis Sekarang"}
              {!loading && <PlayCircle className="w-5 h-5" />}
            </button>
          </div>
        )}

        {activeTab === "materials" && (
          <div className="grid gap-4">
            {materials.map((m, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{m.title}</h4>
                    <span className="text-xs text-gray-500">{m.type} • {m.date}</span>
                  </div>
                </div>
                <button className="text-indigo-600 text-sm font-medium hover:underline">
                  Buka
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800 mb-2">Memuat Soal...</p>
          </div>
        </div>
      )}
    </div>
  );
}
