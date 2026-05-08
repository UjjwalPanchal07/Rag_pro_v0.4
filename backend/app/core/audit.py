from datetime import datetime
from app.db import audit_collection


def log_event(event: str, actor: str, target: str = "", detail: str = "", ip: str = "", status: str = "success"):
    try:
        audit_collection.insert_one({
            "event":     event,
            "actor":     actor,
            "target":    target or actor,
            "detail":    detail,
            "ip":        ip,
            "status":    status,
            "timestamp": datetime.utcnow(),
        })
    except Exception as e:
        print(f"[audit] ⚠️  Failed to write log: {e}")


def get_client_ip(request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
