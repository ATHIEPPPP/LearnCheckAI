// src/services/api.js
import axios from "axios";

// Base URL dari FastAPI backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout - API might be down");
    } else if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("No response from API - check if backend is running");
    }
    return Promise.reject(error);
  }
);

export const generateQuestion = async (data) => {
  try {
    const response = await api.post("/qg/generate", data);
    return response.data;
  } catch (error) {
    console.error("Error generating question", error);
    throw error;
  }
};
