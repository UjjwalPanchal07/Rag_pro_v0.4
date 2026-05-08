import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../services/api";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import "../App.css";

const ChangePassword = () => {
  const { updateMustChangePassword, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow]       = useState({ old: false, new: false, confirm: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirm) { setError("New passwords do not match"); return; }
    if (form.newPassword.length < 8)       { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await changePassword(form.oldPassword, form.newPassword);
      updateMustChangePassword(false);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || "Password change failed. Try again.");
    }
    setLoading(false);
  };

  const fields = [
    { label: "Current / Temporary Password", key: "oldPassword", showKey: "old",     placeholder: "Enter your current password" },
    { label: "New Password",                  key: "newPassword", showKey: "new",     placeholder: "Minimum 8 characters" },
    { label: "Confirm New Password",          key: "confirm",     showKey: "confirm", placeholder: "Repeat new password" },
  ];

  return (
    <div className="hero-parent" style={{ minHeight: "100vh" }}>
      <div className="hero-glow" />

      <div className="auth-card" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src="/profinch-logo.png" alt="Profinch" style={{ height: 34, marginBottom: 14 }} />
          <h2 className="search-title" style={{ justifyContent: "center", fontSize: 24, marginBottom: 4 }}>
            Set New Password
          </h2>
          {user && (
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
              Logged in as <strong style={{ color: "#7c3aed" }}>{user.username}</strong>
            </p>
          )}
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 20, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", fontSize: 13, color: "#92400e" }}>
          ⚠ You must change your password before accessing PRISM.
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map(({ label, key, showKey, placeholder }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
              <div style={{ position: "relative" }}>
                <FiLock style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
                <input
                  type={show[showKey] ? "text" : "password"}
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  required
                  placeholder={placeholder}
                  className="question-input"
                  style={{ paddingLeft: 38, paddingRight: 44, marginBottom: 0 }}
                />
                <button type="button" onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", padding: 4, zIndex: 1 }}>
                  {show[showKey] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
          ))}

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#dc2626", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="search-button" style={{ width: "100%", justifyContent: "center", marginTop: 4, background: "linear-gradient(90deg,#059669,#10b981)", boxShadow: "0px 10px 22px rgba(16,185,129,0.35)", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Saving…" : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
