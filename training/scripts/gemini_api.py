import requests
import os
from dotenv import load_dotenv

# Memuat file .env untuk API key
load_dotenv()

# Menyediakan API Key
API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"  # Sesuaikan dengan endpoint yang diberikan

def generate_question(prompt):
    """Function untuk memanggil Google Gemini API"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "prompt": prompt,
        "max_tokens": 150,  # Sesuaikan dengan panjang soal yang diinginkan
        "temperature": 0.7
    }

    response = requests.post(f"{BASE_URL}/generate", headers=headers, json=data)
    
    if response.status_code == 200:
        print("Soal berhasil dihasilkan:")
        print(response.json().get("text", ""))
    else:
        print(f"Error: {response.status_code} - {response.text}")

# Test koneksi dan API call
generate_question("Buatkan soal pilihan ganda tentang pemrograman Python.")
