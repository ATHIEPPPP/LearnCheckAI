import { Sparkles, Target, TrendingUp, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SubjectCard from "./SubjectCard";

const subjects = [
  { name: "Agama Hindu", count: 15 },
  { name: "Agama Islam", count: 20 },
  { name: "Agama Kristen", count: 18 },
  { name: "Biologi", count: 25 },
  { name: "Ekonomi", count: 22 },
  { name: "Fisika", count: 30 },
  { name: "Geografi", count: 16 },
  { name: "IPA", count: 28 },
  { name: "IPS", count: 24 },
];

export default function StudentDashboard() {
  const navigate = useNavigate();

  // Call backend to generate a question for the subject, then open Quiz page
  const openSubject = (name) => {
    navigate(`/subject/${encodeURIComponent(name)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span>Halo, Siswa</span>
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Pilih mata pelajaran untuk mulai latihan atau kuis
              </p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Trophy className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Selesai</p>
                  <p className="text-2xl font-bold text-gray-800">12</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nilai Rata-rata</p>
                  <p className="text-2xl font-bold text-gray-800">85%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Streak Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-800">7</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Subjects Section */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Latihan Soal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((s) => (
            <SubjectCard
              key={s.name}
              subject={s.name}
              count={s.count}
              onOpen={() => openSubject(s.name)}
            />
          ))}
          </div>
        </section>
      </div>
    </div>
  );
}
