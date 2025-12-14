import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const subjectMapping = {
  agama_hindu: { id: "AGH101", name: "Agama Hindu", icon: "🕉️" },
  agama_islam: { id: "AGI101", name: "Agama Islam", icon: "☪️" },
  agama_kristen: { id: "AGK101", name: "Agama Kristen", icon: "✝️" },
  biologi: { id: "BIO101", name: "Biologi", icon: "🧬" },
  ekonomi: { id: "EKO101", name: "Ekonomi", icon: "📈" },
  fisika: { id: "FIS101", name: "Fisika", icon: "⚛️" },
  geografi: { id: "GEO101", name: "Geografi", icon: "🌍" },
  ipa: { id: "IPA101", name: "IPA", icon: "🔬" },
  ips: { id: "IPS101", name: "IPS", icon: "🏛️" },
  matematika: { id: "MAT101", name: "Matematika", icon: "📐" },
  bahasa_indonesia: { id: "BIN101", name: "Bahasa Indonesia", icon: "📖" },
  bahasa_inggris: { id: "BIG101", name: "Bahasa Inggris", icon: "🗣️" },
  kimia: { id: "KIM101", name: "Kimia", icon: "⚗️" },
  sejarah: { id: "SEJ101", name: "Sejarah", icon: "📜" },
  sosiologi: { id: "SOS101", name: "Sosiologi", icon: "👥" },
  ppkn: { id: "PKN101", name: "PPKn", icon: "🇮🇩" },
  kesenian: { id: "SEN101", name: "Kesenian", icon: "🎨" },
  penjaskes: { id: "PJK101", name: "Penjaskes", icon: "⚽" },
};

const SubjectCard = ({ subject, onManage }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-6 -mb-6"></div>
        <div className="text-5xl relative z-10 mb-3">{subject.icon}</div>
        <div className="relative z-10">
          <h3 className="font-bold text-xl text-white mb-1">{subject.name}</h3>
          <p className="text-sm text-white/80">{subject.id}</p>
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={() => onManage(subject)}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span className="text-sm">⚙️</span>
          Kelola Kelas
        </button>
      </div>
    </div>
  );
};

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const [teacherSubject, setTeacherSubject] = useState(null);
  const [teacherName, setTeacherName] = useState("");

  useEffect(() => {
    // Get teacher info from localStorage
    const userSubject = localStorage.getItem("teacher_subject");
    const userName = localStorage.getItem("teacher_name");

    if (!userSubject) {
      // If no subject, redirect to login
      navigate("/");
      return;
    }

    setTeacherSubject(userSubject);
    setTeacherName(userName || "Guru");
  }, [navigate]);

  function handleManage(subject) {
    navigate(`/teacher/class/${subject.id}`, { state: { subject } });
  }

  // Get subject info for this teacher
  const mySubject = teacherSubject ? subjectMapping[teacherSubject] : null;

  if (!mySubject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                  Dashboard Guru
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Kelola kelas {mySubject.name} Anda
                </p>
                <p className="text-indigo-600 font-medium mt-1">
                  👋 Selamat datang, {teacherName}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-3 rounded-xl">
                <span className="text-lg">📅</span>
                <span className="text-sm font-medium text-indigo-700">
                  Semester Genap (B) 2025
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Classes Section */}
        <main>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
            Mata Pelajaran Anda
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <SubjectCard subject={mySubject} onManage={handleManage} />
          </div>
        </main>
      </div>
    </div>
  );
}
