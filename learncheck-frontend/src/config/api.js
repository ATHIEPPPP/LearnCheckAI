// src/config/api.js
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  quizSettings: "/quiz-settings",
  generateQuestion: "/qg/generate",
  remedialRecommend: "/remedial/recommend",
  materialsUpload: "/materials/upload",
  score: "/score",
};
