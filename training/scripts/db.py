# training/scripts/db.py

import os
from pathlib import Path

from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# load .env di root
BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"
load_dotenv(ENV_PATH)

def get_conn():
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME", "learncheck_db"),
        user=os.getenv("DB_USER", "learncheck_user"),
        password=os.getenv("DB_PASSWORD", "learncheck_pwd"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )
    return conn

def insert_question_with_options(q_json: dict, mapel="ipa", topic="algoritma", difficulty="sedang") -> int:
    """
    q_json contoh:
    {
      "question": "...",
      "options": ["A ...", "B ...", "C ...", "D ..."],
      "answer_index": 0,
      "explanation": "..."
    }
    """
    conn = get_conn()
    cur = conn.cursor()

    # insert ke tabel questions
    cur.execute(
        """
        INSERT INTO questions (question_text, mapel, topic, difficulty, explanation)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id;
        """,
        (
            q_json["question"],
            mapel,
            topic,
            difficulty,
            q_json.get("explanation", ""),
        ),
    )
    qid = cur.fetchone()[0]

    # insert pilihan jawaban ke tabel question_choices
    options = q_json.get("options", [])
    answer_index = q_json.get("answer_index", 0)

    for idx, opt_text in enumerate(options):
        label = chr(ord("A") + idx)  # 0->A,1->B,...
        is_correct = idx == answer_index
        cur.execute(
            """
            INSERT INTO question_choices (question_id, label, text, is_correct)
            VALUES (%s, %s, %s, %s);
            """,
            (qid, label, opt_text, is_correct),
        )

    conn.commit()
    cur.close()
    conn.close()
    return qid

def list_latest_questions(limit: int = 5):
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        """
        SELECT q.id, q.question_text, q.mapel, q.topic, q.difficulty, q.created_at
        FROM questions q
        ORDER BY q.id DESC
        LIMIT %s;
        """,
        (limit,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows
