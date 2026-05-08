import pandas as pd


def read_rfp_questions(file_path: str) -> list[dict]:
    """
    Parse an RFP Excel file with columns:
        No. | Question | RFP Level Tag | Module | Answer

    Returns a list of dicts:
        [{"no": 1, "question": "...", "rfp_level_tag": "...", "module": "...", "answer": "..."}, ...]

    Raises ValueError if required columns are missing or no valid rows found.
    """
    df = pd.read_excel(file_path)
    df.columns = [c.strip() for c in df.columns]

    # ── Flexible column detection ──────────────────────────────────────────
    col_map = {}
    for col in df.columns:
        low = col.lower()
        if "no" in low and col_map.get("no") is None:
            col_map["no"] = col
        if ("question" in low or "query" in low) and col_map.get("question") is None:
            col_map["question"] = col
        if ("rfp level" in low or "rfp_level" in low or "tag" in low) and col_map.get("rfp_level_tag") is None:
            col_map["rfp_level_tag"] = col
        if "module" in low and col_map.get("module") is None:
            col_map["module"] = col
        if ("answer" in low or "response" in low or "reply" in low) and col_map.get("answer") is None:
            col_map["answer"] = col

    missing = [k for k in ["question", "rfp_level_tag", "module", "answer"] if k not in col_map]
    if missing:
        raise ValueError(
            f"Excel is missing required columns: {missing}. "
            f"Expected: No, Question, RFP Level Tag, Module, Answer. "
            f"Found: {list(df.columns)}"
        )

    q_col   = col_map["question"]
    tag_col = col_map["rfp_level_tag"]
    mod_col = col_map["module"]
    ans_col = col_map["answer"]
    no_col  = col_map.get("no")

    # ── Drop rows where question, tag, or module is empty ─────────────────
    df = df.dropna(subset=[q_col, tag_col, mod_col])
    df = df[df[q_col].astype(str).str.strip() != ""]
    df = df[df[tag_col].astype(str).str.strip() != ""]
    df = df[df[mod_col].astype(str).str.strip() != ""]

    if df.empty:
        raise ValueError("No valid rows found after removing empty question/tag/module rows.")

    rows = []
    for i, (_, row) in enumerate(df.iterrows(), start=1):
        answer = row[ans_col]
        rows.append({
            "no":            int(row[no_col]) if no_col and pd.notna(row[no_col]) else i,
            "question":      str(row[q_col]).strip(),
            "rfp_level_tag": str(row[tag_col]).strip(),
            "module":        str(row[mod_col]).strip(),
            "answer":        str(answer).strip() if pd.notna(answer) and str(answer).strip() not in ("", "nan") else "",
        })

    print(f"[excel_parser] Parsed {len(rows)} rows from '{file_path}'")
    return rows
