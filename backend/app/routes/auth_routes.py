import re
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Response, Request, Depends
from pydantic import BaseModel, field_validator

from app.db import users_collection
from app.core.security import verify_password, hash_password
from app.core.auth import (
    create_access_token, create_refresh_token,
    decode_token, get_current_user, REFRESH_TOKEN_EXPIRE_DAYS,
)
from app.core.audit import log_event, get_client_ip
from app.core.email_service import notify_admin_new_request, notify_admin_re_request

router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE  = "prism_refresh_token"
MAX_FAILED      = 5
LOCKOUT_MINUTES = 15


# ── Validators ─────────────────────────────────────────────────────────────

def _val_email(email: str) -> str:
    email = email.strip().lower()
    if not email or len(email) > 254:
        raise ValueError("Invalid email")
    if not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", email):
        raise ValueError("Invalid email format")
    return email


def _val_password(pwd: str, check_strength: bool = True) -> str:
    pwd = pwd.strip()
    if not pwd:
        raise ValueError("Password cannot be empty")
    if len(pwd) > 72:
        raise ValueError("Password must be 72 characters or fewer")
    if check_strength:
        if len(pwd) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in pwd):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in pwd):
            raise ValueError("Password must contain at least one number")
    return pwd


def _make_username(email: str) -> str:
    base = re.sub(r"[^a-z0-9_]", "", email.split("@")[0].lower().replace(".", "_").replace("-", "_")) or "user"
    username, counter = base, 1
    while users_collection.find_one({"username": username}):
        username = f"{base}_{counter}"; counter += 1
    return username


# ── Schemas ────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email:    str
    password: str

    @field_validator("email")
    @classmethod
    def ve(cls, v): return _val_email(v)

    @field_validator("password")
    @classmethod
    def vp(cls, v): return _val_password(v, True)


class LoginRequest(BaseModel):
    email:    str
    password: str

    @field_validator("email")
    @classmethod
    def ve(cls, v): return v.strip().lower()

    @field_validator("password")
    @classmethod
    def vp(cls, v): return _val_password(v, False)


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def vp(cls, v): return _val_password(v, True)


# ── Rate limiting ──────────────────────────────────────────────────────────

def _check_lockout(user: dict):
    locked = user.get("account_locked_until")
    if locked and datetime.utcnow() < locked:
        mins = int((locked - datetime.utcnow()).total_seconds() / 60) + 1
        raise HTTPException(status_code=429, detail=f"Account locked. Try again in {mins} minute(s).")


def _record_failed(username: str):
    user     = users_collection.find_one({"username": username})
    if not user: return
    attempts = user.get("failed_attempts", 0) + 1
    update   = {"failed_attempts": attempts}
    if attempts >= MAX_FAILED:
        update["account_locked_until"] = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
        update["failed_attempts"]      = 0
    users_collection.update_one({"username": username}, {"$set": update})


def _reset_failed(username: str):
    users_collection.update_one({"username": username}, {"$set": {"failed_attempts": 0, "account_locked_until": None}})


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/register")
def register(body: RegisterRequest, request: Request):
    ip       = get_client_ip(request)
    existing = users_collection.find_one({"email": body.email})

    if existing:
        s = existing.get("status")
        if s == "pending":
            raise HTTPException(status_code=409, detail="This email already has a pending request. Please wait for admin approval.")
        if s == "approved":
            raise HTTPException(status_code=409, detail="This email is already registered. Please sign in.")
        if s == "rejected":
            users_collection.update_one(
                {"email": body.email},
                {"$set": {
                    "hashed_password":      hash_password(body.password),
                    "status":               "pending",
                    "is_active":            False,
                    "re_applied_at":        datetime.utcnow(),
                    "failed_attempts":      0,
                    "account_locked_until": None,
                }}
            )
            log_event("auth_re_registration", existing["username"], detail=f"Re-applied: {body.email}", ip=ip)
            notify_admin_re_request(body.email)
            return {"message": "Re-application submitted. An administrator will review your request."}

    username = _make_username(body.email)
    users_collection.insert_one({
        "username":             username,
        "email":                body.email,
        "hashed_password":      hash_password(body.password),
        "role":                 "user",
        "status":               "pending",
        "is_active":            False,
        "must_change_password": False,
        "failed_attempts":      0,
        "account_locked_until": None,
        "created_by":           "self",
        "created_at":           datetime.utcnow(),
        "last_login":           None,
    })
    log_event("auth_register", username, detail=f"New request: {body.email}", ip=ip)
    notify_admin_new_request(body.email)
    return {"message": "Access request submitted successfully. An administrator will review and approve your account."}


@router.post("/login")
def login(body: LoginRequest, response: Response, request: Request):
    ip   = get_client_ip(request)
    user = users_collection.find_one({"email": body.email}) or users_collection.find_one({"username": body.email})

    if not user:
        log_event("auth_sign_in_failed", "unknown", detail=f"Not found: {body.email}", ip=ip, status="failure")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    _check_lockout(user)

    if not verify_password(body.password, user["hashed_password"]):
        _record_failed(user["username"])
        left = max(0, MAX_FAILED - (user.get("failed_attempts", 0) + 1))
        log_event("auth_sign_in_failed", user["username"], detail="Wrong password", ip=ip, status="failure")
        msg = "Invalid email or password"
        msg += f". {left} attempt(s) remaining before lockout." if left > 0 else f". Account locked for {LOCKOUT_MINUTES} minutes."
        raise HTTPException(status_code=401, detail=msg)

    s = user.get("status", "approved")
    if s == "pending":
        raise HTTPException(status_code=403, detail="Your account is pending admin approval.")
    if s == "rejected":
        raise HTTPException(status_code=403, detail="Your access request was rejected. Contact your administrator or re-apply.")
    if not user.get("is_active", False):
        raise HTTPException(status_code=403, detail="Your account has been deactivated. Contact your administrator.")

    _reset_failed(user["username"])
    token_data    = {"sub": user["username"], "role": user["role"]}
    access_token  = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    response.set_cookie(
        key=REFRESH_COOKIE, value=refresh_token,
        httponly=True, secure=False, samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/auth/refresh",
    )
    users_collection.update_one({"username": user["username"]}, {"$set": {"last_login": datetime.utcnow()}})
    log_event("auth_sign_in_success", user["username"], ip=ip)

    return {
        "access_token":         access_token,
        "token_type":           "bearer",
        "role":                 user["role"],
        "username":             user["username"],
        "email":                user.get("email", ""),
        "must_change_password": user.get("must_change_password", False),
    }


@router.post("/refresh")
def refresh_token(request: Request, response: Response):
    token = request.cookies.get(REFRESH_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user = users_collection.find_one({"username": payload.get("sub")})
    if not user or not user.get("is_active", False):
        raise HTTPException(status_code=401, detail="User not found or deactivated")
    td = {"sub": user["username"], "role": user["role"]}
    response.set_cookie(
        key=REFRESH_COOKIE, value=create_refresh_token(td),
        httponly=True, secure=False, samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60, path="/auth/refresh",
    )
    return {"access_token": create_access_token(td), "token_type": "bearer"}


@router.post("/logout")
def logout(response: Response, request: Request, current_user: dict = Depends(get_current_user)):
    response.delete_cookie(key=REFRESH_COOKIE, path="/auth/refresh")
    log_event("auth_sign_out", current_user["username"], ip=get_client_ip(request))
    return {"message": f"Goodbye, {current_user['username']}"}


@router.post("/change_password")
def change_password(body: ChangePasswordRequest, request: Request, current_user: dict = Depends(get_current_user)):
    user = users_collection.find_one({"username": current_user["username"]})
    if not verify_password(body.old_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    users_collection.update_one(
        {"username": current_user["username"]},
        {"$set": {"hashed_password": hash_password(body.new_password), "must_change_password": False}}
    )
    log_event("auth_password_changed", current_user["username"], ip=get_client_ip(request))
    return {"message": "Password changed successfully"}
