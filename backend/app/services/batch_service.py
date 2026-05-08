import os
import pandas as pd
from datetime import datetime

from app.services.retrieval_service import search_answer_by_module


def process_batch(input_path: str, run_dir: str):
    """
    Reads input.xlsx (No | Question | RFP Level Tag | Module | Answer),
    fills the Answer column for each row by searching MongoDB,
    saves output.xlsx in run_dir.

    Returns (output_path, total_questions).
    """
    df = pd.read_excel(input_path)
    df.columns = [c.strip() for c in df.columns]

    # ── Flexible column detection ──────────────────────────────────────────
    col_map = {}
    for col in df.columns:
        low = col.lower()
        if ("question" in low or "query" in low) and "question" not in col_map:
            col_map["question"] = col
        if ("rfp level" in low or "rfp_level" in low or "tag" in low) and "rfp_level_tag" not in col_map:
            col_map["rfp_level_tag"] = col
        if "module" in low and "module" not in col_map:
            col_map["module"] = col
        if ("answer" in low or "response" in low or "reply" in low) and "answer" not in col_map:
            col_map["answer"] = col

    missing = [k for k in ["question", "rfp_level_tag", "module"] if k not in col_map]
    if missing:
        raise ValueError(
            f"Excel missing required columns: {missing}. "
            f"Expected: No, Question, RFP Level Tag, Module, Answer. "
            f"Found: {list(df.columns)}"
        )

    q_col   = col_map["question"]
    tag_col = col_map["rfp_level_tag"]
    mod_col = col_map["module"]

    # Use existing Answer column if present, otherwise create it
    ans_col = col_map.get("answer", "Answer")
    if ans_col not in df.columns:
        df[ans_col] = ""

    # ── Fill answers row by row ────────────────────────────────────────────
    answers = []
    for _, row in df.iterrows():
        question      = str(row[q_col]).strip()
        rfp_level_tag = str(row[tag_col]).strip()
        module        = str(row[mod_col]).strip()

        if not question or question.lower() == "nan":
            answers.append("")
            continue

        answer = search_answer_by_module(rfp_level_tag, module, question)
        answers.append(answer if answer else "No Answer Found")

    df[ans_col] = answers

    output_path = os.path.join(run_dir, "output.xlsx")
    df.to_excel(output_path, index=False)

    print(f"[batch_service] Done. {len(df)} rows processed. Output: {output_path}")
    return output_path, len(df)
