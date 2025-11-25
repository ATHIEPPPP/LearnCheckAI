// src/services/api.js
import axios from "axios";

// Base URL dari FastAPI backend
const API_URL = "http://127.0.0.1:8000"; // Ganti dengan URL server produksi jika perlu

const api = axios.create({
  baseURL: API_URL,
});

export const generateQuestion = async (data) => {
  try {
    const response = await api.post("/qg/generate", data);
    return response.data;
  } catch (error) {
    console.error("Error generating question", error);
    throw error;
  }
};
