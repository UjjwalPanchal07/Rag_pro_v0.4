import os, shutil
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse

from app.services.batch_service import process_batch
from app.db import batch_runs_collection
from app.core.auth import get_current_user

router    = APIRouter()
BATCH_DIR = "data/batch"
os.makedirs(BATCH_DIR, exist_ok=True)


@router.post("/batch_query")
async def batch_query(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    ts     = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    name   = os.path.splitext(file.filename)[0].strip().replace(" ", "_")
    folder = f"{name}_{ts}"
    run_dir = os.path.join(BATCH_DIR, folder)
    os.makedirs(run_dir, exist_ok=True)

    input_path = os.path.join(run_dir, "input.xlsx")
    with open(input_path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    output_path, total = process_batch(input_path, run_dir)

    try:
        batch_runs_collection.insert_one({
            "run_folder":        folder,
            "original_filename": file.filename,
            "input_path":        input_path,
            "output_path":       output_path,
            "total_questions":   total,
            "run_by":            current_user["username"],
            "processed_at":      datetime.utcnow(),
            "status":            "completed",
        })
    except Exception as e:
        if os.path.exists(run_dir):
            shutil.rmtree(run_dir)
        raise HTTPException(status_code=503, detail=f"MongoDB write failed — rolled back. Error: {e}")

    return FileResponse(
        output_path,
        filename=f"{name}_answers_{ts}.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
