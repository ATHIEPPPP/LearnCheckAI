import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import MaterialUpload from "./components/MaterialUpload";
import NavBar from "./components/NavBar";
import Quiz from "./components/Quiz";
import StudentDashboard from "./components/StudentDashboard";
import SubjectDetail from "./components/SubjectDetail";
import TeacherCreateQuiz from "./components/TeacherCreateQuiz";
import AdminDashboard from "./pages/AdminDashboard";
import ClassManagement from "./pages/ClassManagement";
import Login from "./pages/Login";
import MaterialsView from "./pages/MaterialsView";
import TeacherDashboard from "./pages/TeacherDashboard";

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";
  const isAdminPage = location.pathname === "/admin";

  return (
    <>
      {!isLoginPage && !isAdminPage && <NavBar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/subject/:name" element={<SubjectDetail />} />
        <Route path="/materials/:subject" element={<MaterialsView />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/class/:id" element={<ClassManagement />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/teacher/create" element={<TeacherCreateQuiz />} />
        <Route path="/teacher/materials" element={<MaterialUpload />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
