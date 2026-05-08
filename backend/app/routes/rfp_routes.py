from fastapi import APIRouter, Depends
from app.db import rfps_collection
from app.core.auth import get_current_user

router = APIRouter()


@router.get("/rfps")
def get_rfps(_: dict = Depends(get_current_user)):
    rfps = list(rfps_collection.find({}, {"_id": 0}))
    for r in rfps:
        if r.get("uploaded_at"):
            r["uploaded_at"] = r["uploaded_at"].strftime("%Y-%m-%d %H:%M UTC")
    return {"rfps": rfps}


@router.get("/rfp_tree")
def get_rfp_tree(_: dict = Depends(get_current_user)):
    """
    Returns tag → module → [rfp list] hierarchy built from by_category field.
    """
    docs = list(rfps_collection.find({}, {"_id": 0}))
    tree = {}

    for doc in docs:
        for cat_key in doc.get("by_category", {}).keys():
            if " > " not in cat_key:
                continue
            tag, module = cat_key.split(" > ", 1)
            tree.setdefault(tag, {}).setdefault(module, [])
            tree[tag][module].append({
                "rfp_folder_name":   doc.get("rfp_folder_name", ""),
                "original_filename": doc.get("original_filename", ""),
                "uploaded_at":       str(doc.get("uploaded_at", "")),
                "total_questions":   doc.get("total_questions", 0),
            })

    for tag in tree:
        for module in tree[tag]:
            tree[tag][module].sort(key=lambda x: x["uploaded_at"], reverse=True)

    return tree
