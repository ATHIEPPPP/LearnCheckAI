import { BrowserRouter, Route, Routes } from "react-router-dom";
import MaterialUpload from "./components/MaterialUpload";
import NavBar from "./components/NavBar";
import Quiz from "./components/Quiz";
import StudentDashboard from "./components/StudentDashboard";
import SubjectDetail from "./components/SubjectDetail";
import TeacherCreateQuiz from "./components/TeacherCreateQuiz";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/subject/:name" element={<SubjectDetail />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/teacher/create" element={<TeacherCreateQuiz />} />
        <Route path="/teacher/materials" element={<MaterialUpload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
