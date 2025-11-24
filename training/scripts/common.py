import psycopg2
import os
from dotenv import load_dotenv
from gemini_api import generate_question

# Memuat file .env untuk API key dan database credentials
load_dotenv()

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

# Contoh penggunaan untuk menghasilkan soal dan menyimpannya ke database
if __name__ == "__main__":
    # Misalnya, teks yang diambil dari materi
    context = "Algoritma pencarian biner adalah metode yang digunakan untuk mencari nilai dalam array yang terurut."
    soal = gemini_generate_soal(context)
    save_to_database(soal, "IPA", "Algoritma", "Sedang")
    print(f"Soal berhasil disimpan: {soal}")
