import { AlertCircle, CheckCircle, Loader, Sparkles } from "lucide-react";
import { useState } from "react";

export default function QuestionGenerator() {
  const [context, setContext] = useState("");
  const [mapel, setMapel] = useState("IPA");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("sedang");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/qg/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: context,
          mapel,
          topic,
          difficulty,
          explanation: "",
          choices: [],
        }),
      });

      if (!response.ok) throw new Error("Gagal generate soal");
      const data = await response.json();
      setResult(data);
      setContext("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white">LearnCheck</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Generate soal pilihan ganda dengan AI
          </p>
        </div>

        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-2xl p-8 space-y-5"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Buat Soal Baru
              </h2>

              {/* Context Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Konteks/Teks
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Paste teks atau paragraf yang ingin dijadikan soal..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none transition"
                  rows="5"
                  required
                />
              </div>

              {/* Mapel Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📚 Mata Pelajaran
                </label>
                <select
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                >
                  <option>IPA</option>
                  <option>IPS</option>
                  <option>Matematika</option>
                  <option>Bahasa Indonesia</option>
                  <option>Bahasa Inggris</option>
                  <option>Sejarah</option>
                </select>
              </div>

              {/* Topic Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏷️ Topik
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="misal: algoritma, fotosintesis"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>

              {/* Difficulty Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ⭐ Tingkat Kesulitan
                </label>
                <div className="flex gap-2">
                  {["mudah", "sedang", "sulit"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 py-2 rounded-lg font-medium transition ${
                        difficulty === level
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !context.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Soal
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-red-800">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Soal Berhasil Dibuat!
                  </h2>
                </div>

                {/* Question */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border-l-4 border-indigo-600">
                  <p className="text-lg font-semibold text-gray-800">
                    {result.question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  <h3 className="font-bold text-gray-700">Pilihan Jawaban:</h3>
                  {result.options?.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 transition ${
                        idx === result.answer_index
                          ? "bg-green-50 border-green-500 border-2"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <p className="font-medium text-gray-800">{opt}</p>
                      {idx === result.answer_index && (
                        <span className="text-sm text-green-600 font-semibold mt-2">
                          ✓ Jawaban Benar
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-800 mb-2">
                    💡 Penjelasan:
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              </div>
            )}

            {!result && !error && (
              <div className="bg-white/10 backdrop-blur border-2 border-white/20 rounded-2xl p-12 text-center">
                <Sparkles className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <p className="text-white/70 text-lg">
                  Isi form di sebelah dan klik "Generate Soal"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
