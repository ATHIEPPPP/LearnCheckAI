# training/scripts/qg_service.py

from pathlib import Path
from dotenv import load_dotenv
import os
import google.generativeai as genai

# ====== load .env dari training folder ======
BASE_DIR = Path(__file__).resolve().parents[1]  # training folder
ENV_PATH = BASE_DIR / ".env"

# DEBUG
print("DEBUG ENV_PATH:", ENV_PATH, "exists:", ENV_PATH.exists())

load_dotenv(ENV_PATH, override=True)

GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")

# ====== konfigurasi Gemini ======
genai.configure(api_key=GOOGLE_GEMINI_API_KEY)
MODEL_NAME = "gemini-2.5-flash"

PROMPT_TEMPLATE = """
Peran: Anda adalah guru ahli pembuat soal ujian.

Tugas: Buatlah 5-10 soal pilihan ganda (PG) yang berkualitas berdasarkan Input di bawah.

Input:
{context}

Instruksi:
1. Jika Input adalah materi/teks bacaan, buat soal pemahaman berdasarkan isi teks tersebut.
2. Jika Input hanya berupa Topik atau Instruksi, gunakan pengetahuan umum Anda untuk membuat soal yang relevan.

Output HARUS format JSON ARRAY murni (List of Objects):
[
  {{
    "question": "Pertanyaan soal 1...",
    "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
    "answer_index": 0, 
    "explanation": "Penjelasan singkat..."
  }},
  {{
    "question": "Pertanyaan soal 2...",
    "options": ["..."],
    "answer_index": 1, 
    "explanation": "..."
  }}
]
"""

def generate_question_raw(context: str) -> str:
    """Panggil Gemini dan kembalikan teks mentah."""
    prompt = PROMPT_TEMPLATE.format(context=context)
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        resp = model.generate_content(prompt)
        
        # Debugging: Cek output raw dari Gemini
        print("DEBUG Gemini RAW output:")
        print(resp.text)
        return resp.text
    except Exception as e:
        print(f"ERROR Gemini API: {e}")
        print("FALLBACK: Using dummy question data.")
        # Return dummy JSON so the app doesn't crash
        import json
        dummy = {
            "question": f"Soal Dummy (API Error/Limit): {context[:50]}...",
            "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
            "answer_index": 0,
            "explanation": "Ini adalah soal dummy karena API Gemini sedang limit/error."
        }
        return json.dumps(dummy)

def generate_remedial(mapel: str, wrong_questions: list) -> str:
    questions_text = "\n".join([f"- {q}" for q in wrong_questions])
    prompt = f"""
    Peran: Guru Privat {mapel}.
    Siswa salah menjawab soal-soal berikut:
    {questions_text}
    
    Tugas: Berikan ringkasan materi singkat (maksimal 3 paragraf) yang menjelaskan konsep yang benar untuk menjawab soal-soal di atas. 
    Jelaskan dengan bahasa yang mudah dimengerti siswa sekolah.
    """
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        resp = model.generate_content(prompt)
        return resp.text
    except Exception as e:
        return f"Gagal memuat materi remedial: {str(e)}"