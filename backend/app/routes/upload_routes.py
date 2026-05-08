import os, shutil
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from app.services.ingestion_service import ingest_rfp
from app.db import rfps_collection, questions_collection
from app.core.auth import require_admin

router    = APIRouter()
UPLOADS   = "data/rfps/uploads"


@router.post("/upload_rfp")
async def upload_rfp(file: UploadFile = File(...), current_user: dict = Depends(require_admin)):
    if not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=422, detail="Only .xlsx files are supported.")

    os.makedirs(UPLOADS, exist_ok=True)
    ts        = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe      = os.path.splitext(file.filename)[0].strip().replace(" ", "_")
    folder    = f"{safe}__{ts}"
    saved     = os.path.join(UPLOADS, f"{folder}.xlsx")

    file_saved = questions_inserted = False

    try:
        with open(saved, "wb") as buf:
            shutil.copyfileobj(file.file, buf)
        file_saved = True

        try:
            summary = ingest_rfp(saved, folder, file.filename)
        except ValueError as ve:
            raise HTTPException(status_code=422, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ingestion failed: {e}")

        questions_inserted = True

        try:
            rfps_collection.insert_one({
                "rfp_folder_name":   folder,
                "original_filename": file.filename,
                "file_path":         saved,
                "total_questions":   summary["total"],
                "skipped":           summary["skipped"],
                "by_category":       summary["by_category"],
                "uploaded_by":       current_user["username"],
                "uploaded_at":       datetime.utcnow(),
            })
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"MongoDB write failed: {e}")

    except HTTPException:
        if file_saved and os.path.exists(saved):
            os.remove(saved)
        if questions_inserted:
            questions_collection.delete_many({"rfp_folder_name": folder})
        raise

    return {
        "message":         "RFP uploaded successfully",
        "rfp_folder_name": folder,
        "total_questions": summary["total"],
        "skipped":         summary["skipped"],
        "by_category":     summary["by_category"],
        "uploaded_by":     current_user["username"],
    }
