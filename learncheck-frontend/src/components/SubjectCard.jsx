import { ArrowRight, BookOpen, FileText } from "lucide-react";

const subjectColors = {
  "Agama Hindu": "from-orange-500 to-amber-500",
  "Agama Islam": "from-green-500 to-emerald-500",
  "Agama Kristen": "from-blue-500 to-sky-500",
  "Biologi": "from-lime-500 to-green-600",
  "Ekonomi": "from-yellow-500 to-orange-500",
  "Fisika": "from-purple-500 to-violet-600",
  "Geografi": "from-teal-500 to-cyan-500",
  "IPA": "from-emerald-500 to-teal-500",
  "IPS": "from-red-500 to-rose-500",
  "Matematika": "from-blue-500 to-cyan-500",
  "Bahasa Indonesia": "from-purple-500 to-pink-500",
  "default": "from-indigo-500 to-purple-500"
};

export default function SubjectCard({ subject, count = 0, onOpen }) {
  const gradientColor = subjectColors[subject] || subjectColors.default;
  
  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-2">
      {/* Gradient Header */}
      <div className={`h-32 bg-gradient-to-br ${gradientColor} p-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-6 -mb-6"></div>
        <BookOpen className="w-12 h-12 text-white/90 relative z-10" />
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors">
          {subject}
        </h3>
        <div className="flex items-center gap-2 text-gray-600 mb-5">
          <FileText className="w-4 h-4" />
          <p className="text-sm">
            <span className="font-semibold text-gray-800">{count}</span> Soal Tersedia
          </p>
        </div>
        <button
          onClick={onOpen}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:gap-3"
        >
          Mulai Belajar
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
