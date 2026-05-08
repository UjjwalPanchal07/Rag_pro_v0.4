import re, secrets, string
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, field_validator

from app.db import users_collection, audit_collection
from app.core.auth import require_admin
from app.core.security import hash_password
from app.core.audit import log_event, get_client_ip
from app.core.email_service import (
    notify_user_approved, notify_user_rejected,
    notify_user_created, notify_user_password_reset,
)

router = APIRouter(prefix="/admin", tags=["admin"])


class CreateUserRequest(BaseModel):
    email: str
    role:  str = "user"

    @field_validator("email")
    @classmethod
    def ve(cls, v):
        v = v.strip().lower()
        if not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("role")
    @classmethod
    def vr(cls, v):
        if v not in ("admin", "user"): raise ValueError("Role must be admin or user")
        return v


class UsernameRequest(BaseModel):
    username: str

    @field_validator("username")
    @classmethod
    def vu(cls, v):
        v = v.strip()
        if not v: raise ValueError("Username cannot be empty")
        return v


class ApproveRequest(BaseModel):
    username: str
    role:     str = "user"

    @field_validator("role")
    @classmethod
    def vr(cls, v):
        if v not in ("admin", "user"): raise ValueError("Role must be admin or user")
        return v


class ChangeRoleRequest(BaseModel):
    username: str
    new_role: str

    @field_validator("new_role")
    @classmethod
    def vr(cls, v):
        if v not in ("admin", "user"): raise ValueError("Role must be admin or user")
        return v


def _gen_pwd():
    alpha = string.ascii_letters + string.digits + "!@#$"
    while True:
        pwd = "".join(secrets.choice(alpha) for _ in range(12))
        if any(c.isupper() for c in pwd) and any(c.islower() for c in pwd) and any(c.isdigit() for c in pwd):
            return pwd


def _make_username(email: str) -> str:
    base = re.sub(r"[^a-z0-9_]", "", email.split("@")[0].lower().replace(".", "_").replace("-", "_")) or "user"
    u, n = base, 1
    while users_collection.find_one({"username": u}):
        u = f"{base}_{n}"; n += 1
    return u


def _fmt(dt): return dt.strftime("%Y-%m-%d %H:%M UTC") if dt else None


@router.get("/users")
def list_users(admin: dict = Depends(require_admin)):
    users = list(users_collection.find({}, {"_id": 0, "hashed_password": 0}))
    for u in users:
        u["created_at"]           = _fmt(u.get("created_at"))
        u["last_login"]           = _fmt(u.get("last_login")) or "Never"
        u["account_locked_until"] = _fmt(u.get("account_locked_until"))
    return {"users": users, "total": len(users)}


@router.get("/pending")
def list_pending(admin: dict = Depends(require_admin)):
    users = list(users_collection.find({"status": "pending"}, {"_id": 0, "hashed_password": 0}))
    for u in users:
        u["created_at"]    = _fmt(u.get("created_at"))
        u["re_applied_at"] = _fmt(u.get("re_applied_at"))
    return {"users": users, "total": len(users)}


@router.get("/audit_logs")
def get_audit_logs(admin: dict = Depends(require_admin), limit: int = 100):
    logs = list(audit_collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit))
    for l in logs:
        l["timestamp"] = l["timestamp"].strftime("%Y-%m-%d %H:%M:%S UTC") if l.get("timestamp") else ""
    return {"logs": logs, "total": len(logs)}


@router.put("/approve_user")
def approve_user(body: ApproveRequest, request: Request, admin: dict = Depends(require_admin)):
    ip   = get_client_ip(request)
    user = users_collection.find_one({"username": body.username, "status": "pending"})
    if not user:
        raise HTTPException(status_code=404, detail=f"No pending user '{body.username}' found")
    users_collection.update_one(
        {"username": body.username},
        {"$set": {"status": "approved", "is_active": True, "role": body.role, "approved_by": admin["username"], "approved_at": datetime.utcnow()}}
    )
    log_event("admin_user_approved", admin["username"], target=body.username, detail=f"Approved as {body.role}", ip=ip)
    notify_user_approved(user.get("email", ""), body.role)
    return {"message": f"User '{body.username}' approved as '{body.role}'"}


@router.put("/reject_user")
def reject_user(body: UsernameRequest, request: Request, admin: dict = Depends(require_admin)):
    ip   = get_client_ip(request)
    user = users_collection.find_one({"username": body.username, "status": "pending"})
    if not user:
        raise HTTPException(status_code=404, detail=f"No pending user '{body.username}' found")
    users_collection.update_one(
        {"username": body.username},
        {"$set": {"status": "rejected", "is_active": False, "rejected_by": admin["username"], "rejected_at": datetime.utcnow()}}
    )
    log_event("admin_user_rejected", admin["username"], target=body.username, ip=ip)
    notify_user_rejected(user.get("email", ""))
    return {"message": f"User '{body.username}' rejected"}


@router.put("/change_role")
def change_role(body: ChangeRoleRequest, request: Request, admin: dict = Depends(require_admin)):
    ip = get_client_ip(request)
    if body.username == admin["username"]:
        raise HTTPException(status_code=400, detail="You cannot change your own role")
    user = users_collection.find_one({"username": body.username})
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{body.username}' not found")
    if user.get("role") == body.new_role:
        raise HTTPException(status_code=400, detail=f"User is already a {body.new_role}")
    old = user.get("role")
    users_collection.update_one({"username": body.username}, {"$set": {"role": body.new_role}})
    log_event("admin_role_changed", admin["username"], target=body.username, detail=f"{old} → {body.new_role}", ip=ip)
    return {"message": f"'{body.username}' role changed from {old} to {body.new_role}"}


@router.post("/create_user")
def create_user(body: CreateUserRequest, request: Request, admin: dict = Depends(require_admin)):
    ip = get_client_ip(request)
    if users_collection.find_one({"email": body.email}):
        raise HTTPException(status_code=409, detail=f"Email '{body.email}' already registered")
    username = _make_username(body.email)
    temp_pwd = _gen_pwd()
    users_collection.insert_one({
        "username": username, "email": body.email,
        "hashed_password": hash_password(temp_pwd),
        "role": body.role, "status": "approved", "is_active": True,
        "must_change_password": True, "failed_attempts": 0,
        "account_locked_until": None, "created_by": admin["username"],
        "created_at": datetime.utcnow(), "last_login": None,
    })
    log_event("admin_user_created", admin["username"], target=username, detail=f"{body.email} as {body.role}", ip=ip)
    notify_user_created(body.email, temp_pwd, body.role)
    return {"message": f"User created for '{body.email}'", "username": username, "email": body.email, "role": body.role, "temp_password": temp_pwd}


@router.put("/deactivate_user")
def deactivate_user(body: UsernameRequest, request: Request, admin: dict = Depends(require_admin)):
    ip = get_client_ip(request)
    if body.username == admin["username"]:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account")
    result = users_collection.update_one({"username": body.username}, {"$set": {"is_active": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"User '{body.username}' not found")
    log_event("admin_user_deactivated", admin["username"], target=body.username, ip=ip)
    return {"message": f"User '{body.username}' deactivated"}


@router.put("/reactivate_user")
def reactivate_user(body: UsernameRequest, request: Request, admin: dict = Depends(require_admin)):
    ip = get_client_ip(request)
    result = users_collection.update_one({"username": body.username}, {"$set": {"is_active": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"User '{body.username}' not found")
    log_event("admin_user_reactivated", admin["username"], target=body.username, ip=ip)
    return {"message": f"User '{body.username}' reactivated"}


@router.put("/unlock_user")
def unlock_user(body: UsernameRequest, request: Request, admin: dict = Depends(require_admin)):
    ip = get_client_ip(request)
    result = users_collection.update_one({"username": body.username}, {"$set": {"failed_attempts": 0, "account_locked_until": None}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"User '{body.username}' not found")
    log_event("admin_account_unlocked", admin["username"], target=body.username, ip=ip)
    return {"message": f"Account '{body.username}' unlocked"}


@router.put("/reset_password")
def reset_password(body: UsernameRequest, request: Request, admin: dict = Depends(require_admin)):
    ip   = get_client_ip(request)
    user = users_collection.find_one({"username": body.username})
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{body.username}' not found")
    temp_pwd = _gen_pwd()
    users_collection.update_one({"username": body.username}, {"$set": {"hashed_password": hash_password(temp_pwd), "must_change_password": True}})
    log_event("admin_password_reset", admin["username"], target=body.username, ip=ip)
    notify_user_password_reset(user.get("email", ""), temp_pwd)
    return {"message": f"Password reset for '{body.username}'", "temp_password": temp_pwd}
