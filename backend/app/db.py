from pymongo import MongoClient, ASCENDING
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv
import os
import sys

load_dotenv()

# ── Read from .env — fail loud if missing ─────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("[db] ❌  MONGO_URI not set. Add it to backend/.env")
    sys.exit(1)

DB_NAME = "prismdb"
client  = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)

try:
    client.admin.command("ping")
    print(f"[db] ✅ MongoDB connected — database: {DB_NAME}")
except ConnectionFailure as e:
    print(f"[db] ❌ MongoDB connection failed: {e}")
    print("[db]    Check your MONGO_URI in backend/.env")
    sys.exit(1)

db = client[DB_NAME]

# ── Collections ────────────────────────────────────────────────────────────
users_collection      = db["users"]
rfps_collection       = db["rfps"]
questions_collection  = db["questions"]
batch_runs_collection = db["batch_runs"]
audit_collection      = db["audit_logs"]

# ── Indexes ────────────────────────────────────────────────────────────────
users_collection.create_index([("username", ASCENDING)], unique=True)
users_collection.create_index([("email",    ASCENDING)], unique=True)
users_collection.create_index([("status",   ASCENDING)])

audit_collection.create_index([("timestamp", ASCENDING)])
audit_collection.create_index([("actor",     ASCENDING)])
audit_collection.create_index([("event",     ASCENDING)])

rfps_collection.create_index([("rfp_folder_name", ASCENDING)], unique=True)
rfps_collection.create_index([("uploaded_at",     ASCENDING)])

questions_collection.create_index([("rfp_level_tag", ASCENDING), ("module", ASCENDING)])
questions_collection.create_index([("rfp_folder_name", ASCENDING)])


def seed_default_admin():
    """Seed one admin on first run if none exists. Reads credentials from .env."""
    if users_collection.find_one({"role": "admin"}):
        return

    from app.core.security import hash_password
    from datetime import datetime

    admin_email    = os.getenv("ADMIN_EMAIL",    "admin@company.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "Admin@1234")

    users_collection.insert_one({
        "username":             "admin",
        "email":                admin_email,
        "hashed_password":      hash_password(admin_password),
        "role":                 "admin",
        "status":               "approved",
        "is_active":            True,
        "must_change_password": True,
        "failed_attempts":      0,
        "account_locked_until": None,
        "created_by":           "system",
        "created_at":           datetime.utcnow(),
        "last_login":           None,
    })
    print(f"[db] 🔐 Default admin seeded — email: {admin_email}")
    print("[db] ⚠️  Change the admin password immediately after first login!")
