# training/scripts/qg_service.py

from pathlib import Path
import os

from dotenv import load_dotenv
import google.generativeai as genai

# ====== load .env dari root project ======
# qg_service.py ada di: LearnCheck/training/scripts/qg_service.py
# parents[0] = scripts, [1] = training, [2] = LearnCheck (root)
BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

# DEBUG (sementara): lihat path .env
print("DEBUG ENV_PATH:", ENV_PATH, "exists:", ENV_PATH.exists())

load_dotenv(ENV_PATH)

GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")

if not GOOGLE_GEMINI_API_KEY:
    raise RuntimeError("GOOGLE_GEMINI_API_KEY belum di-set di .env (cek lokasi & namanya)")
# ====== konfigurasi Gemini ======
genai.configure(api_key=GOOGLE_GEMINI_API_KEY)
MODEL_NAME = "gemini-2.5-flash"

PROMPT_TEMPLATE = """
Berdasarkan teks berikut, buatlah 1 soal pilihan ganda (PG) BESERTA:
- 4 opsi jawaban (A–D)
- kunci jawaban yang benar
- penjelasan singkat

Format output HARUS JSON dengan struktur:
{{
  "question": "...",
  "options": ["A ...", "B ...", "C ...", "D ..."],
  "answer_index": 0,
  "explanation": "..."
}}

Teks:
{context}
"""

def generate_question_raw(context: str) -> str:
    """Panggil Gemini dan kembalikan teks mentah."""
    prompt = PROMPT_TEMPLATE.format(context=context)
    model = genai.GenerativeModel(MODEL_NAME)
    resp = model.generate_content(prompt)
    return resp.text

# training/scripts/qg_service.py
def generate_question_raw(context: str) -> str:
    """Panggil Gemini dan kembalikan teks mentah."""
    prompt = PROMPT_TEMPLATE.format(context=context)
    model = genai.GenerativeModel(MODEL_NAME)
    resp = model.generate_content(prompt)
    
    # Debugging: Cek output raw dari Gemini
    print("DEBUG Gemini RAW output:")
    print(resp.text)
    
    return resp.text