"""
One-time admin reset script.
Run from backend/ folder with venv active:

    python reset_admin.py

This will:
  1. Delete any existing admin accounts
  2. Create a fresh admin using ADMIN_EMAIL and ADMIN_PASSWORD from .env
  3. Set must_change_password = False (so you can sign in immediately)

Run this ONCE, then delete this file.
"""

import sys
import os
from dotenv import load_dotenv

load_dotenv()

# ── Validate .env values ───────────────────────────────────────────────────
ADMIN_EMAIL    = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

if not ADMIN_EMAIL or not ADMIN_PASSWORD:
    print("❌  ADMIN_EMAIL or ADMIN_PASSWORD not set in .env")
    print("    Add them and run again.")
    sys.exit(1)

# ── Connect to MongoDB ─────────────────────────────────────────────────────
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("❌  MONGO_URI not set in .env")
    sys.exit(1)

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
try:
    client.admin.command("ping")
    print("✅  MongoDB connected")
except ConnectionFailure as e:
    print(f"❌  MongoDB connection failed: {e}")
    sys.exit(1)

db               = client["prismdb"]
users_collection = db["users"]

# ── Delete existing admin(s) ───────────────────────────────────────────────
deleted = users_collection.delete_many({"role": "admin"})
print(f"🗑️   Removed {deleted.deleted_count} existing admin account(s)")

# ── Hash password ──────────────────────────────────────────────────────────
import logging
logging.getLogger("passlib").setLevel(logging.ERROR)
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed      = pwd_context.hash(ADMIN_PASSWORD)

# ── Insert fresh admin ─────────────────────────────────────────────────────
users_collection.insert_one({
    "username":             "admin",
    "email":                ADMIN_EMAIL,
    "hashed_password":      hashed,
    "role":                 "admin",
    "status":               "approved",
    "is_active":            True,
    "must_change_password": False,   # ← False so you can sign in immediately
    "failed_attempts":      0,
    "account_locked_until": None,
    "created_by":           "system",
    "created_at":           datetime.utcnow(),
    "last_login":           None,
})

print(f"\n✅  Admin account created successfully!")
print(f"    Email:    {ADMIN_EMAIL}")
print(f"    Password: {ADMIN_PASSWORD}")
print(f"\n    You can now sign in at http://localhost:5173/signin")
print(f"\n⚠️   Delete this file after use: reset_admin.py")
