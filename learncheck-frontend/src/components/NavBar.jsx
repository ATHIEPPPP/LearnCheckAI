import { BookOpen, FileEdit, GraduationCap, LogOut, Menu, Upload, User, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavBar({ role }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Detect role from current path
  const isTeacher = location.pathname.startsWith('/teacher');
  const isStudent = location.pathname.startsWith('/student') || location.pathname.startsWith('/subject');
  const isLogin = location.pathname === '/';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text hover:from-indigo-700 hover:to-purple-700 transition-all">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span className="hidden sm:inline">LearnCheck</span>
            <span className="sm:hidden">LC</span>
          </Link>

          {/* Desktop Navigation */}
          {!isLogin && (
            <div className="hidden md:flex items-center gap-1">
              {/* Student Menu */}
              {isStudent && (
                <>
                  <span className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600">
                    <User className="w-4 h-4" />
                    Siswa
                  </span>
                </>
              )}
              
              {/* Teacher Menu */}
              {isTeacher && (
                <>
                  <span className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600">
                    <GraduationCap className="w-4 h-4" />
                    Guru
                  </span>
                  <Link
                    to="/teacher/create"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    <FileEdit className="w-4 h-4" />
                    Buat Quiz
                  </Link>
                  <Link
                    to="/teacher/materials"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Materi
                  </Link>
                </>
              )}
              
              {/* Logout - Always show when logged in */}
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all ml-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          {!isLogin && (
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && !isLogin && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slideDown">
            <div className="flex flex-col gap-2">
              {/* Student Mobile Menu */}
              {isStudent && (
                <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-indigo-600">
                  <User className="w-5 h-5" />
                  Dashboard Siswa
                </div>
              )}
              
              {/* Teacher Mobile Menu */}
              {isTeacher && (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-indigo-600">
                    <GraduationCap className="w-5 h-5" />
                    Dashboard Guru
                  </div>
                  <Link
                    to="/teacher/create"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    <FileEdit className="w-5 h-5" />
                    Buat Quiz Baru
                  </Link>
                  <Link
                    to="/teacher/materials"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Materi
                  </Link>
                </>
              )}
              
              <div className="border-t border-gray-200 my-2"></div>
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
