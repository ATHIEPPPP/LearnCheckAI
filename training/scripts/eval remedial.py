from pathlib import Path
from typing import Dict, List
import csv, json
from .common import TRAINING_DIR

def analyze_student_performance(student_id: str) -> Dict:
    """
    Analisis performa siswa berdasarkan riwayat jawaban.
    Return: {mapel: {topik: {benar, total, persen}}}
    """
    jawaban_file = TRAINING_DIR / "jawaban" / "siswa_jawaban.csv"
    if not jawaban_file.exists():
        return {}
    
    performance = {}
    with jawaban_file.open("r", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            if row.get("student_id") != student_id:
                continue
            
            mapel = row.get("mapel", "").lower()
            topik = row.get("topik", "unknown")
            correct = row.get("correct") == "1"
            
            if mapel not in performance:
                performance[mapel] = {}
            if topik not in performance[mapel]:
                performance[mapel][topik] = {"benar": 0, "total": 0}
            
            performance[mapel][topik]["total"] += 1
            if correct:
                performance[mapel][topik]["benar"] += 1
    
    # Hitung persen dan identifikasi remedial
    remedial = {}
    for mapel, topics in performance.items():
        remedial[mapel] = {}
        for topik, stats in topics.items():
            persen = (stats["benar"] / stats["total"] * 100) if stats["total"] else 0
            remedial[mapel][topik] = {
                "skor": persen,
                "is_remedial": persen < 75
            }
    
    return remedial

def main():
    print("Eval remedial module ready")

if __name__ == "__main__":
    main()