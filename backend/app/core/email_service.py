"""
PRISM Email Notification Service
=================================
Sends HTML emails via Microsoft 365 / Outlook SMTP.

Configure in backend/.env:

    MAIL_SERVER=smtp.office365.com
    MAIL_PORT=587
    MAIL_USERNAME=prism@profinch.com
    MAIL_PASSWORD=your_password
    MAIL_FROM=prism@profinch.com
    MAIL_FROM_NAME=PRISM System
    ADMIN_EMAIL=ujjwal.panchal@profinch.com
    APP_URL=http://localhost:5173

If MAIL_SERVER is not set the app works without email — all
functions log to console and return silently.
"""

import smtplib
import os
from email.mime.text      import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv               import load_dotenv

load_dotenv()

# ── Config ─────────────────────────────────────────────────────────────────
MAIL_SERVER    = os.getenv("MAIL_SERVER",    "")
MAIL_PORT      = int(os.getenv("MAIL_PORT",  587))
MAIL_USERNAME  = os.getenv("MAIL_USERNAME",  "")
MAIL_PASSWORD  = os.getenv("MAIL_PASSWORD",  "")
MAIL_FROM      = os.getenv("MAIL_FROM",      MAIL_USERNAME)
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "PRISM System")
ADMIN_EMAIL    = os.getenv("ADMIN_EMAIL",    "")
APP_URL        = os.getenv("APP_URL",        "http://localhost:5173")

_enabled = bool(MAIL_SERVER and MAIL_USERNAME and MAIL_PASSWORD)

if _enabled:
    print(f"[email] ✅  Email enabled — {MAIL_FROM} via {MAIL_SERVER}:{MAIL_PORT}")
else:
    print("[email] ℹ️   Email not configured — notifications disabled.")
    print("[email]     Add MAIL_SERVER, MAIL_USERNAME, MAIL_PASSWORD to .env to enable.")


# ── HTML template ──────────────────────────────────────────────────────────

def _html(title: str, body: str, btn_text: str = "", btn_url: str = "") -> str:
    btn = f"""
    <div style="text-align:center;margin:28px 0;">
      <a href="{btn_url}"
         style="display:inline-block;padding:13px 30px;
                background:linear-gradient(90deg,#5046e4,#7c3aed);
                color:white;text-decoration:none;border-radius:10px;
                font-weight:700;font-size:15px;
                font-family:'Segoe UI',Arial,sans-serif;
                box-shadow:0 6px 18px rgba(80,70,228,0.35);">
        {btn_text}
      </a>
    </div>""" if btn_text and btn_url else ""

    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f0eeff;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:580px;margin:36px auto;background:white;
            border-radius:16px;overflow:hidden;
            box-shadow:0 8px 32px rgba(80,70,228,0.12);">

  <!-- Header -->
  <div style="background:linear-gradient(90deg,#5046e4,#7c3aed);padding:28px 36px;">
    <h1 style="margin:0;color:white;font-size:24px;font-weight:800;letter-spacing:1px;">
      PRISM
    </h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
      Profinch RFP Response Intelligence &amp; Solution Manager
    </p>
  </div>

  <!-- Body -->
  <div style="padding:32px 36px;">
    <h2 style="margin:0 0 18px;font-size:20px;color:#1a1230;font-weight:700;">
      {title}
    </h2>
    {body}
    {btn}
  </div>

  <!-- Footer -->
  <div style="padding:16px 36px;background:#f7f5ff;border-top:1px solid #ede9fe;">
    <p style="margin:0;font-size:12px;color:#9090a8;text-align:center;">
      This is an automated message from PRISM &mdash; Profinch Solutions.<br/>
      Please do not reply to this email.
    </p>
  </div>

</div>
</body></html>"""


def _info_box(content: str, color: str = "#5046e4", bg: str = "#f0eeff") -> str:
    return f"""
    <div style="background:{bg};border-radius:10px;padding:16px 20px;
                margin:16px 0;border-left:4px solid {color};">
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
        {content}
      </p>
    </div>"""

def _p(text: str) -> str:
    return f'<p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 14px;">{text}</p>'


# ── Core send ──────────────────────────────────────────────────────────────

def _send(to: str, subject: str, html: str, plain: str = ""):
    """Send email via SMTP. Never raises — logs errors gracefully."""

    if not _enabled:
        print(f"[email] 📧 (disabled) To:{to} | {subject}")
        return

    if not to or "@" not in to:
        print(f"[email] ⚠️  Invalid address '{to}' — skipping")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"{MAIL_FROM_NAME} <{MAIL_FROM}>"
        msg["To"]      = to
        msg.attach(MIMEText(plain or subject, "plain"))
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT, timeout=12) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, to, msg.as_string())

        print(f"[email] ✅ Sent '{subject}' → {to}")

    except smtplib.SMTPAuthenticationError:
        print("[email] ❌ Authentication failed.")
        print("[email]    Check MAIL_USERNAME and MAIL_PASSWORD in .env")
        print("[email]    Also ask IT to enable 'Authenticated SMTP' for this account in Microsoft 365 Admin Center")
    except smtplib.SMTPConnectError:
        print(f"[email] ❌ Cannot connect to {MAIL_SERVER}:{MAIL_PORT}")
        print("[email]    Check MAIL_SERVER and MAIL_PORT in .env")
    except smtplib.SMTPException as e:
        print(f"[email] ❌ SMTP error: {e}")
    except Exception as e:
        print(f"[email] ❌ Unexpected error sending to {to}: {e}")


# ── Notification functions ─────────────────────────────────────────────────

def notify_admin_new_request(user_email: str):
    """Notify admin when a new user submits Request Access."""
    html = _html(
        title="New Access Request — Action Required",
        body=(
            _p("A new user has submitted an access request to PRISM.")
            + _info_box(
                f"<strong>Email:</strong> {user_email}<br/>"
                f"<strong>Status:</strong> Pending Approval",
                color="#5046e4", bg="#f0eeff"
            )
            + _p("Please open the Admin Panel to review and approve or reject this request.")
        ),
        btn_text="Open Admin Panel",
        btn_url=f"{APP_URL}/admin",
    )
    _send(
        to=ADMIN_EMAIL,
        subject="[PRISM] New Access Request — Action Required",
        html=html,
        plain=f"New access request from {user_email}. Review at {APP_URL}/admin",
    )


def notify_admin_re_request(user_email: str):
    """Notify admin when a rejected user re-applies."""
    html = _html(
        title="Re-Application Received",
        body=(
            _p("A previously rejected user has re-applied for PRISM access.")
            + _info_box(
                f"<strong>Email:</strong> {user_email}<br/>"
                f"<strong>Status:</strong> Re-applied — Pending Review",
                color="#d97706", bg="#fffbeb"
            )
        ),
        btn_text="Review in Admin Panel",
        btn_url=f"{APP_URL}/admin",
    )
    _send(
        to=ADMIN_EMAIL,
        subject="[PRISM] Re-Application Received",
        html=html,
        plain=f"Re-application from {user_email}. Review at {APP_URL}/admin",
    )


def notify_user_approved(user_email: str, role: str):
    """Notify user when their request is approved."""
    html = _html(
        title="Your Access Has Been Approved 🎉",
        body=(
            _p("Great news! Your PRISM access request has been approved.")
            + _info_box(
                f"<strong>Account:</strong> {user_email}<br/>"
                f"<strong>Role Assigned:</strong> {role.capitalize()}",
                color="#10b981", bg="#ecfdf5"
            )
            + _p("You can now sign in using the email and password you registered with.")
        ),
        btn_text="Sign In to PRISM",
        btn_url=f"{APP_URL}/signin",
    )
    _send(
        to=user_email,
        subject="[PRISM] Your Access Has Been Approved",
        html=html,
        plain=f"Your PRISM access has been approved as {role}. Sign in at {APP_URL}/signin",
    )


def notify_user_rejected(user_email: str):
    """Notify user when their request is rejected."""
    html = _html(
        title="Access Request Update",
        body=(
            _p("Thank you for your interest in PRISM.")
            + _info_box(
                "Unfortunately your access request has not been approved at this time.<br/>"
                "Please contact your administrator if you believe this is an error.",
                color="#ef4444", bg="#fef2f2"
            )
            + _p("You may re-apply by submitting a new request.")
        ),
        btn_text="Submit New Request",
        btn_url=f"{APP_URL}/register",
    )
    _send(
        to=user_email,
        subject="[PRISM] Access Request Update",
        html=html,
        plain="Your PRISM access request was not approved. Contact your administrator for details.",
    )


def notify_user_created(user_email: str, temp_password: str, role: str):
    """Notify user when an admin creates their account directly."""
    html = _html(
        title="Your PRISM Account Is Ready",
        body=(
            _p("An administrator has created a PRISM account for you.")
            + _info_box(
                f"<strong>Email:</strong> {user_email}<br/>"
                f"<strong>Temporary Password:</strong> "
                f"<code style='background:#ede9fe;padding:2px 8px;border-radius:4px;"
                f"font-size:15px;font-weight:700;letter-spacing:1px;'>{temp_password}</code><br/>"
                f"<strong>Role:</strong> {role.capitalize()}",
                color="#5046e4", bg="#f0eeff"
            )
            + _p("<span style='color:#ef4444;font-weight:600;'>⚠ You will be required to change "
                 "this password on your first sign in.</span>")
        ),
        btn_text="Sign In to PRISM",
        btn_url=f"{APP_URL}/signin",
    )
    _send(
        to=user_email,
        subject="[PRISM] Your Account Has Been Created",
        html=html,
        plain=f"Your PRISM account is ready. Email: {user_email} | Temp Password: {temp_password} | Sign in at {APP_URL}/signin",
    )


def notify_user_password_reset(user_email: str, temp_password: str):
    """Notify user when admin resets their password."""
    html = _html(
        title="Your Password Has Been Reset",
        body=(
            _p("An administrator has reset your PRISM account password.")
            + _info_box(
                f"<strong>Temporary Password:</strong> "
                f"<code style='background:#fef3c7;padding:2px 8px;border-radius:4px;"
                f"font-size:15px;font-weight:700;letter-spacing:1px;'>{temp_password}</code>",
                color="#d97706", bg="#fffbeb"
            )
            + _p("<span style='color:#ef4444;font-weight:600;'>⚠ You will be required to change "
                 "this password on your next sign in.</span>")
        ),
        btn_text="Sign In to PRISM",
        btn_url=f"{APP_URL}/signin",
    )
    _send(
        to=user_email,
        subject="[PRISM] Your Password Has Been Reset",
        html=html,
        plain=f"Your PRISM password was reset. Temp password: {temp_password}. Sign in at {APP_URL}/signin",
    )
