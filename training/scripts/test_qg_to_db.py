# training/scripts/test_qg_to_db.py

import json

from .qg_service import generate_question_raw
from .db import insert_question_with_options, list_latest_questions

def main():
    context = """
    Algoritma pencarian biner adalah algoritma yang digunakan untuk mencari nilai
    dalam array yang sudah diurutkan dengan cara membagi ruang pencarian menjadi dua secara berulang.
    """
    raw = generate_question_raw(context)
    print("=== OUTPUT GEMINI RAW ===")
    print(f"Type: {type(raw)}, Length: {len(raw)}")
    print(repr(raw))  # Show actual string with escape chars
    print(raw)

    # try parse JSON
    try:
        q_json = json.loads(raw)
    except json.JSONDecodeError as e:
        print("Gagal parse JSON dari Gemini:", e)
        print(f"Raw content: {repr(raw[:200])}")  # First 200 chars
        return

    print("\n=== PARSED JSON ===")
    print(q_json)

    # simpan ke DB
    qid = insert_question_with_options(
        q_json,
        mapel="ipa",
        topic="algoritma_pencarian",
        difficulty="sedang",
    )
    print(f"\nQuestion inserted with id={qid}")

    print("\n=== LATEST QUESTIONS FROM DB ===")
    for row in list_latest_questions(5):
        print(f"[{row['id']}] ({row['mapel']}/{row['topic']}/{row['difficulty']})")
        print(row["question_text"])
        print("----")

if __name__ == "__main__":
    main()
