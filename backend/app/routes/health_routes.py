from fastapi import APIRouter
from app.db import client, DB_NAME

router = APIRouter()


@router.get("/health")
def health_check():
    try:
        client.admin.command("ping")
        return {"status": "ok", "mongodb": "connected", "database": DB_NAME}
    except Exception as e:
        return {"status": "error", "mongodb": "disconnected", "detail": str(e)}
