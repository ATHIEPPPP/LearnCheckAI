import { CheckCircle, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";

export default function TeacherCreateQuiz() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [qtext, setQtext] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [ans, setAns] = useState(0);

  const addQuestion = () => {
    if (!qtext) return alert("Isi pertanyaan");
    setQuestions((qs) => [
      ...qs,
      { question: qtext, options: opts.slice(), answer: ans },
    ]);
    setQtext("");
    setOpts(["", "", "", ""]);
    setAns(0);
  };

  const saveQuiz = () => {
    // placeholder: save to localStorage
    const payload = { title, questions };
    const quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
    quizzes.push(payload);
    localStorage.setItem("quizzes", JSON.stringify(quizzes));
    alert("Quiz disimpan (localStorage)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Buat Quiz Baru</h1>
          <p className="text-gray-600 text-sm sm:text-base">Buat quiz dan tambahkan pertanyaan untuk siswa Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quiz Title Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Quiz</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul Quiz</label>
                <input
                  placeholder="Masukkan judul quiz..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Question Form Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Tambah Pertanyaan</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pertanyaan</label>
                  <textarea
                    value={qtext}
                    onChange={(e) => setQtext(e.target.value)}
                    rows="3"
                    placeholder="Tulis pertanyaan Anda di sini..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Pilihan Jawaban</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {opts.map((o, i) => (
                      <div key={i} className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-indigo-600">{String.fromCharCode(65 + i)}</span>
                        </div>
                        <input
                          placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                          value={o}
                          onChange={(e) => {
                            const c = opts.slice();
                            c[i] = e.target.value;
                            setOpts(c);
                          }}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jawaban Benar</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAns(i)}
                        className={`py-3 rounded-xl font-semibold transition-all duration-200 ${
                          ans === i
                            ? "bg-green-500 text-white shadow-lg"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Pilihan {String.fromCharCode(65 + i)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={addQuestion}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Pertanyaan
                  </button>
                  <button
                    onClick={saveQuiz}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Simpan Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Preview</h3>
                <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  {questions.length} Soal
                </div>
              </div>
              
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">Belum ada pertanyaan</p>
                  <p className="text-gray-400 text-xs mt-1">Mulai tambahkan pertanyaan</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {questions.map((q, i) => (
                    <div key={i} className="group border-2 border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">
                          Soal {i + 1}
                        </span>
                        <button className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-medium text-gray-800 text-sm mb-3 line-clamp-2">{q.question}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">Jawaban: <span className="font-semibold text-green-600">{q.options[q.answer]}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
