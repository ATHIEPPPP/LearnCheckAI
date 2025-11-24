import requests
import os
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# Memuat file .env untuk API key
load_dotenv()

# Menyediakan API Key
API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
BASE_URL = "https://api.google.com/gemini"  # Endpoint API Google Gemini

# LangChain Prompt Template
prompt_template = """
Berdasarkan teks berikut, buatlah soal pilihan ganda (PG) beserta jawabannya:
Teks: {context}

Soal: 
"""

# Function untuk memanggil Google Gemini API
def generate_question(prompt):
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
        return response.json().get("text", "")
    else:
        raise Exception(f"Error: {response.status_code} - {response.text}")

# Fungsi untuk memanggil API Google Gemini via LangChain
def gemini_generate_soal(context):
    prompt = prompt_template.format(context=context)
    soal = generate_question(prompt)
    return soal
