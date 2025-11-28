import { useNavigate } from "react-router-dom";

const subjects = [
  { id: "AGH101", name: "Agama Hindu" },
  { id: "AGI101", name: "Agama Islam" },
  { id: "AGK101", name: "Agama Kristen" },
  { id: "BIO101", name: "Biologi" },
  { id: "EKO101", name: "Ekonomi" },
  { id: "FIS101", name: "Fisika" },
  { id: "GEO101", name: "Geografi" },
  { id: "IPA101", name: "IPA" },
  { id: "IPS101", name: "IPS" },
];

const SubjectCard = ({ subject, onManage }) => (
  <div className="bg-white rounded-lg shadow-sm border px-6 py-5">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-md bg-indigo-100 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6v12m6-6H6"
          />
        </svg>
      </div>
      <div className="flex-1">
        <div className="font-semibold text-lg">{subject.name}</div>
        <div className="text-sm text-gray-400">{subject.id}</div>
      </div>
    </div>

    <div className="mt-4">
      <button
        onClick={() => onManage(subject)}
        className="w-full bg-white border border-gray-200 text-gray-700 rounded-md py-3 hover:bg-gray-50"
      >
        Kelola Kelas
      </button>
    </div>
  </div>
);

const TeacherDashboardNew = () => {
  const navigate = useNavigate();

  function handleManage(subject) {
    // navigate to a class detail route (not implemented) — pass subject as state
    navigate(`/teacher/class/${subject.id}`, { state: { subject } });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Dashboard Guru</h1>
          <p className="text-gray-500 mt-1">
            Pilih kelas untuk mengelola materi dan quiz
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <section className="mb-6">
          <div className="text-sm text-gray-600">Semester Genap (B) 2025</div>
        </section>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((s) => (
              <SubjectCard key={s.id} subject={s} onManage={handleManage} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TeacherDashboardNew;
