# test.py — validator dataset

from __future__ import annotations

# Import relatif (normal); fallback absolut kalau lingkungan aneh
try:
    from .common import load_all_banks, load_topic_index, validate_bank
except Exception:
    from training.scripts.common import load_all_banks, load_topic_index, validate_bank

def main():
    topic_index = load_topic_index()
    banks = load_all_banks()

    ok_all = True
    for m, bank in banks.items():
        ok, errs = validate_bank(bank, topic_index)
        if ok:
            print(f"[OK] {m}: {len(bank.get('soal', []))} soal")
        else:
            ok_all = False
            print(f"[ERR] {m}:")
            for e in errs:
                print(f"   - {e}")

    if ok_all:
        print("\nSemua file valid ✅"); raise SystemExit(0)
    else:
        print("\nAda masalah pada dataset ❌"); raise SystemExit(1)

if __name__ == "__main__":
    main()
