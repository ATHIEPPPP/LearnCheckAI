import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import SubjectCard from "./SubjectCard";

const subjectMapping = {
  agama_hindu: { name: "Agama Hindu", count: 15 },
  agama_islam: { name: "Agama Islam", count: 20 },
  agama_kristen: { name: "Agama Kristen", count: 18 },
  biologi: { name: "Biologi", count: 25 },
  ekonomi: { name: "Ekonomi", count: 22 },
  fisika: { name: "Fisika", count: 30 },
  geografi: { name: "Geografi", count: 16 },
  ipa: { name: "IPA", count: 28 },
  ips: { name: "IPS", count: 24 },
  matematika: { name: "Matematika", count: 25 },
  bahasa_indonesia: { name: "Bahasa Indonesia", count: 20 },
  bahasa_inggris: { name: "Bahasa Inggris", count: 22 },
  kimia: { name: "Kimia", count: 24 },
  sejarah: { name: "Sejarah", count: 18 },
  sosiologi: { name: "Sosiologi", count: 16 },
  ppkn: { name: "PPKn", count: 15 },
  kesenian: { name: "Kesenian", count: 12 },
  penjaskes: { name: "Penjaskes", count: 20 },
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [quizSettings, setQuizSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [myClass, setMyClass] = useState(null);
  const [studentName, setStudentName] = useState("Siswa");

  useEffect(() => {
    loadAllQuizSettings();
    loadStudentClass();
  }, []);

  const loadStudentClass = async () => {
    try {
      const classId = localStorage.getItem("student_class_id");
      const name = localStorage.getItem("student_name");

      if (name) {
        setStudentName(name);
      }

      if (!classId) {
        console.log("Student has no class yet");
        return;
      }

      // Parse class_id to get subject
      // Format: "subject_ClassName_randomhex"
      const parts = classId.split("_");
      if (parts.length >= 2) {
        const subject = parts[0];
        setMyClass({ class_id: classId, subject: subject });
      }
    } catch (error) {
      console.error("Failed to load student class:", error);
    }
  };

  const loadAllQuizSettings = async () => {
    console.log("Loading quiz settings...");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`${API_BASE_URL}/quiz-settings`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log("Response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Quiz settings data:", data);
        const settingsMap = {};
        data.forEach((setting) => {
          settingsMap[setting.mapel.toLowerCase()] = setting.enabled;
        });
        setQuizSettings(settingsMap);
      } else {
        console.log("API response not ok, using defaults");
      }
    } catch (error) {
      console.error("Failed to load quiz settings:", error);
      // On error, default all quiz to enabled - just continue
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  const isQuizEnabled = (subjectName) => {
    const mapel = subjectName.toLowerCase().replace(/\s+/g, "_");
    return quizSettings[mapel] !== false; // Default enabled if not found
  };

  // Call backend to generate a question for the subject, then open Quiz page
  const openSubject = (name) => {
    navigate(`/subject/${encodeURIComponent(name)}`);
  };

  // Get subject for this student
  const mySubject = myClass?.subject ? subjectMapping[myClass.subject] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span>Halo, {studentName}</span>
                <span className="text-4xl">✨</span>
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Pilih mata pelajaran untuk mulai latihan atau kuis
              </p>
            </div>
          </div>
        </header>

        {/* Subjects Section */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
            Mata Pelajaran
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 mt-4">Memuat data...</p>
            </div>
          ) : !mySubject ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-7xl mb-6">📚</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Belum Ada Kelas
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Anda belum ditambahkan ke kelas manapun. Hubungi guru untuk
                ditambahkan ke kelas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <SubjectCard
                key={mySubject.name}
                subject={mySubject.name}
                count={mySubject.count}
                onOpen={() => openSubject(mySubject.name)}
                quizEnabled={isQuizEnabled(mySubject.name)}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
