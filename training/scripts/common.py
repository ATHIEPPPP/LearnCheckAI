import psycopg2
import os
from pathlib import Path
from dotenv import load_dotenv
# from gemini_api import generate_question
from .qg_service import generate_question_raw

# Memuat file .env untuk API key dan database credentials
load_dotenv()

# Path constants
ROOT = Path(__file__).resolve().parents[2]
TRAINING_DIR = ROOT / "training"
SOAL_DIR = TRAINING_DIR / "soal"
SOAL_OUT_DIR = TRAINING_DIR / "soal_out"
MATERI_DIR = TRAINING_DIR / "materi"
MAPPING_DIR = TRAINING_DIR / "mapping"
JAWABAN_DIR = TRAINING_DIR / "jawaban"
MODELS_OUTPUT_DIR = TRAINING_DIR / "models_output"

# Koneksi ke PostgreSQL (gunakan variabel lingkungan yang disimpan di .env)
def get_db_connection():
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    return conn

# Fungsi untuk menyimpan soal ke dalam database
def save_to_database(question, mapel, topic, difficulty):
    """Simpan soal yang dihasilkan ke dalam database PostgreSQL"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query untuk menyimpan soal ke dalam tabel 'questions'
    cursor.execute("""
        INSERT INTO questions (question_text, mapel, difficulty, topic, created_at)
        VALUES (%s, %s, %s, %s, NOW());
    """, (question, mapel, difficulty, topic))

    conn.commit()
    cursor.close()
    conn.close()

# Fungsi untuk memanggil Google Gemini API dan menghasilkan soal
def gemini_generate_soal(context):
    prompt = f"Berdasarkan teks berikut, buatkan soal pilihan ganda (PG) beserta jawabannya: {context}"
    soal = generate_question(prompt)
    return soal

# Helper functions for quiz simulation
def load_bank_soal(filepath):
    """Load question bank from JSON file"""
    import json
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def filter_questions(bank, topic=None, difficulty=None):
    """Filter questions by topic and/or difficulty"""
    questions = bank.get("soal", [])
    if topic:
        questions = [q for q in questions if q.get("topik", "").lower() == topic.lower()]
    if difficulty:
        questions = [q for q in questions if q.get("tingkat", "").lower() == difficulty.lower()]
    return questions

def pick_questions(questions, n=5):
    """Randomly pick n questions from the list"""
    import random
    return random.sample(questions, min(n, len(questions)))

def load_all_banks():
    """Load all question banks from SOAL_DIR"""
    banks = {}
    if SOAL_DIR.exists():
        for filepath in SOAL_DIR.glob("*.json"):
            banks[filepath.stem] = load_bank_soal(filepath)
    return banks

# Contoh penggunaan untuk menghasilkan soal dan menyimpannya ke database
if __name__ == "__main__":
    # Misalnya, teks yang diambil dari materi
    context = "Algoritma pencarian biner adalah metode yang digunakan untuk mencari nilai dalam array yang terurut."
    soal = gemini_generate_soal(context)
    save_to_database(soal, "IPA", "Algoritma", "Sedang")
    print(f"Soal berhasil disimpan: {soal}")
