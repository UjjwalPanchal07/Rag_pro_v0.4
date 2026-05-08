from datetime import datetime
from app.utils.excel_parser import read_rfp_questions
from app.db import questions_collection


def ingest_rfp(file_path: str, rfp_folder_name: str, original_filename: str) -> dict:
    """
    Parse the RFP Excel (No | Question | RFP Level Tag | Module | Answer),
    then store each Q&A pair as an individual MongoDB document under its
    RFP Level Tag → Module category.

    Rows with an empty Answer are skipped during ingestion (they have no
    knowledge to store).

    Returns a summary dict:
        {
            "total":       <int>,   # questions actually stored
            "skipped":     <int>,   # rows skipped (empty answer)
            "by_category": { "Tag > Module": <count>, ... }
        }
    """
    rows = read_rfp_questions(file_path)

    docs    = []
    skipped = 0

    for row in rows:
        if not row["answer"]:
            skipped += 1
            continue

        docs.append({
            "no":                row["no"],
            "question":          row["question"],
            "rfp_level_tag":     row["rfp_level_tag"],
            "module":            row["module"],
            "answer":            row["answer"],
            "rfp_folder_name":   rfp_folder_name,
            "original_filename": original_filename,
            "uploaded_at":       datetime.utcnow(),
        })

    if docs:
        questions_collection.insert_many(docs)

    # ── Summary by category ────────────────────────────────────────────────
    by_category = {}
    for doc in docs:
        key = f"{doc['rfp_level_tag']} > {doc['module']}"
        by_category[key] = by_category.get(key, 0) + 1

    print(f"[ingestion] Stored {len(docs)} Q&A pairs from '{original_filename}' ({skipped} skipped — empty answer)")
    for cat, count in by_category.items():
        print(f"  {cat}: {count} questions")

    return {
        "total":       len(docs),
        "skipped":     skipped,
        "by_category": by_category,
    }
