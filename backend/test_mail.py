"""
Quick SMTP connection test.
Run from backend/ folder with venv active:

    python test_mail.py

Tests connection, TLS, and login separately so you can
pinpoint exactly where it fails.
Delete this file after testing.
"""

import smtplib, os
from dotenv import load_dotenv

load_dotenv()

SERVER   = os.getenv("MAIL_SERVER")
PORT     = int(os.getenv("MAIL_PORT", 587))
USERNAME = os.getenv("MAIL_USERNAME")
PASSWORD = os.getenv("MAIL_PASSWORD")
FROM     = os.getenv("MAIL_FROM", USERNAME)
ADMIN    = os.getenv("ADMIN_EMAIL")

print(f"\n── PRISM SMTP Test ──────────────────────────")
print(f"Server   : {SERVER}:{PORT}")
print(f"Username : {USERNAME}")
print(f"From     : {FROM}")
print(f"Admin    : {ADMIN}")
print(f"─────────────────────────────────────────────\n")

if not all([SERVER, USERNAME, PASSWORD]):
    print("❌  Missing config. Check MAIL_SERVER, MAIL_USERNAME, MAIL_PASSWORD in .env")
    exit(1)

try:
    print("1. Connecting to SMTP server...")
    server = smtplib.SMTP(SERVER, PORT, timeout=12)
    print("   ✅ Connected")

    print("2. Starting TLS...")
    server.ehlo()
    server.starttls()
    server.ehlo()
    print("   ✅ TLS started")

    print("3. Logging in...")
    server.login(USERNAME, PASSWORD)
    print("   ✅ Login successful")

    # Send a real test email to admin
    if ADMIN:
        print(f"4. Sending test email to {ADMIN}...")
        from email.mime.text      import MIMEText
        from email.mime.multipart import MIMEMultipart

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "[PRISM] SMTP Test — Email is working!"
        msg["From"]    = f"PRISM System <{FROM}>"
        msg["To"]      = ADMIN

        html = f"""
        <div style="font-family:Segoe UI,sans-serif;max-width:500px;margin:20px auto;
                    background:white;border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 20px rgba(80,70,228,0.15);">
          <div style="background:linear-gradient(90deg,#5046e4,#7c3aed);padding:24px 32px;">
            <h1 style="margin:0;color:white;font-size:22px;">PRISM</h1>
          </div>
          <div style="padding:28px 32px;">
            <h2 style="color:#1a1230;">✅ Email is working!</h2>
            <p style="color:#4b5563;">SMTP is configured correctly. Email notifications are now active.</p>
            <p style="color:#6b7280;font-size:13px;">Server: {SERVER}:{PORT}<br/>From: {FROM}</p>
          </div>
        </div>"""

        msg.attach(MIMEText("PRISM SMTP test successful.", "plain"))
        msg.attach(MIMEText(html, "html"))
        server.sendmail(FROM, ADMIN, msg.as_string())
        print(f"   ✅ Test email sent to {ADMIN}")
    else:
        print("4. Skipping test email — ADMIN_EMAIL not set in .env")

    server.quit()
    print("\n✅  All tests passed — email notifications are ready!\n")

except smtplib.SMTPAuthenticationError:
    print("\n❌  Authentication failed.")
    print("    → Check MAIL_USERNAME and MAIL_PASSWORD in .env")
    print("    → Ask IT to enable 'Authenticated SMTP' for this account")
    print("    → Microsoft 365 Admin Center → Users → Active Users")
    print("      → Select account → Mail tab → Manage email apps")
    print("      → Enable 'Authenticated SMTP'\n")

except smtplib.SMTPConnectError as e:
    print(f"\n❌  Cannot connect to {SERVER}:{PORT}")
    print(f"    → Error: {e}")
    print("    → Check MAIL_SERVER and MAIL_PORT in .env\n")

except Exception as e:
    print(f"\n❌  Unexpected error: {e}\n")
