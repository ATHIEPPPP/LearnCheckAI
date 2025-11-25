# training/scripts/test_qg.py
from .qg_service import generate_question_raw

def main():
    context = """
    Algoritma pencarian biner adalah algoritma yang digunakan untuk mencari nilai
    dalam array yang sudah diurutkan dengan cara membagi ruang pencarian menjadi dua secara berulang.
    """
    out = generate_question_raw(context)
    print("=== OUTPUT GEMINI ===")
    print(out)

if __name__ == "__main__":
    main()
