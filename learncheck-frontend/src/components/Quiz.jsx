import { ArrowRight, BookOpen, CheckCircle2, Home, Trophy, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Quiz() {
  const loc = useLocation();
  const navigate = useNavigate();
  const subject = loc.state?.subject || "Umum";

  // If `questions` passed via navigation state use them, otherwise fallback to local placeholder
  const initial = loc.state?.questions || [];

  const [questions, setQuestions] = useState(initial);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  
  // Track wrong answers for remedial
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [remedialContent, setRemedialContent] = useState("");
  const [loadingRemedial, setLoadingRemedial] = useState(false);

  useEffect(() => {
    if (!initial.length) {
      // placeholder questions if no questions passed
      setQuestions([
        {
          question: "Apa syarat utama array untuk binary search?",
          options: ["Terurut", "Genap", "Unik", "Lebih dari 2"],
          answer: 0,
        },
        {
          question: "Kompleksitas binary search?",
          options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
          answer: 1,
        },
      ]);
    }
  }, [initial]);

  const fetchRemedial = async () => {
    setLoadingRemedial(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/remedial/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            mapel: subject,
            wrong_questions: wrongAnswers
        }),
      });
      const data = await res.json();
      setRemedialContent(data.content);
    } catch (err) {
      console.error("Gagal load remedial:", err);
      setRemedialContent("Gagal memuat materi remedial.");
    } finally {
      setLoadingRemedial(false);
    }
  };

  // Fetch remedial when result is shown and there are wrong answers
  useEffect(() => {
    if (showResult && wrongAnswers.length > 0) {
      fetchRemedial();
    }
  }, [showResult]);

  const submitAnswer = () => {
    console.log("Submitting answer...");
    if (selected === null) return;
    const q = questions[index];
    const correct = selected === q.answer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore((s) => s + 1);
    } else {
      // Record wrong answer
      setWrongAnswers(prev => [...prev, q.question]);
    }
  };

  const handleNext = () => {
    console.log("Next question clicked...");
    setSelected(null);
    setIsCorrect(null);
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleFinish = () => {
    navigate("/student");
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pertanyaan...</p>
        </div>
      </div>
    );
  }

  const q = questions[index];
  
  // Safety check untuk memastikan question data valid
  if (!q || !q.question || !q.options || !Array.isArray(q.options)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Soal Tidak Valid</h2>
          <p className="text-gray-600 mb-6">Format soal tidak sesuai atau data rusak.</p>
          <button
            onClick={() => navigate("/student")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const progress = ((index + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Progress */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Kuis: {subject}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Pertanyaan {index + 1} dari {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 px-4 py-2 rounded-xl">
                <span className="text-sm font-semibold text-indigo-700">
                  Skor: {score}/{questions.length}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <div className="mb-8">
            <div className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium mb-4">
              Soal {index + 1}
            </div>
            <p className="text-lg sm:text-xl font-semibold text-gray-800 leading-relaxed">
              {q.question}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {q.options.map((o, i) => {
              const isSelected = selected === i;
              const isAnswer = i === q.answer;
              const showFeedback = isCorrect !== null;
              
              let optionClass = "w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 ";
              
              if (showFeedback) {
                if (isAnswer) {
                  optionClass += "border-green-500 bg-green-50 ";
                } else if (isSelected && !isCorrect) {
                  optionClass += "border-red-500 bg-red-50 ";
                } else {
                  optionClass += "border-gray-200 bg-gray-50 opacity-50 ";
                }
              } else if (isSelected) {
                optionClass += "border-indigo-600 bg-indigo-50 shadow-md ";
              } else {
                optionClass += "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50 ";
              }
              
              return (
                <button
                  key={i}
                  onClick={() => !showFeedback && setSelected(i)}
                  disabled={showFeedback}
                  className={optionClass}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        showFeedback && isAnswer
                          ? "border-green-500 bg-green-500"
                          : showFeedback && isSelected && !isCorrect
                          ? "border-red-500 bg-red-500"
                          : isSelected
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-gray-300"
                      }`}>
                        <span className="text-sm font-bold text-white">
                          {String.fromCharCode(65 + i)}
                        </span>
                      </div>
                      <span className="text-base sm:text-lg font-medium text-gray-800">{o}</span>
                    </div>
                    {showFeedback && isAnswer && (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    )}
                    {showFeedback && isSelected && !isCorrect && (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={isCorrect !== null ? handleNext : submitAnswer}
              disabled={selected === null && isCorrect === null}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
            >
              {isCorrect !== null 
                ? (index + 1 < questions.length ? "Lanjut" : "Lihat Hasil") 
                : "Jawab"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full animate-fadeIn my-8">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Selesai!</h2>
                <p className="text-gray-600 mb-6">Berikut adalah hasil Anda:</p>
                
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
                <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text mb-2">
                    {score}/{questions.length}
                </div>
                <p className="text-gray-600 font-medium">
                    Persentase: {Math.round((score / questions.length) * 100)}%
                </p>
                </div>
            </div>
            
            {/* Remedial Section */}
            {wrongAnswers.length > 0 && (
                <div className="bg-orange-50 rounded-2xl p-6 mb-8 border border-orange-100 text-left">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <BookOpen className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Rekomendasi Materi Remedial (AI)</h3>
                    </div>
                    
                    {loadingRemedial ? (
                        <div className="flex items-center gap-2 text-gray-600">
                            <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Sedang membuat ringkasan materi khusus untukmu...</span>
                        </div>
                    ) : (
                        <div className="prose prose-orange max-w-none text-gray-700 text-sm">
                             {remedialContent ? (
                                <div className="whitespace-pre-wrap">{remedialContent}</div>
                             ) : (
                                <p>Tidak ada materi tambahan.</p>
                             )}
                        </div>
                    )}
                </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={handleFinish}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
