import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../services/api";
import { FiUser, FiMail, FiShield, FiLock, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import "../App.css";

const ProfilePage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [show, setShow]         = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (form.newPassword !== form.confirm) { setError("New passwords do not match"); return; }
    if (form.newPassword.length < 8)       { setError("Password must be at least 8 characters"); return; }
    if (!form.newPassword.match(/[A-Z]/))  { setError("Password must contain at least one uppercase letter"); return; }
    if (!form.newPassword.match(/[0-9]/))  { setError("Password must contain at least one number"); return; }
    setLoading(true);
    try {
      await changePassword(form.oldPassword, form.newPassword);
      setSuccess(true);
      setForm({ oldPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setError(err?.response?.data?.detail || "Password change failed. Try again.");
    }
    setLoading(false);
  };

  const toggleShow = (key) => setShow(p => ({ ...p, [key]: !p[key] }));

  const pwdFields = [
    { label: "Current Password",    key: "oldPassword", showKey: "old",     placeholder: "Enter current password" },
    { label: "New Password",         key: "newPassword", showKey: "new",     placeholder: "Minimum 8 characters" },
    { label: "Confirm New Password", key: "confirm",     showKey: "confirm", placeholder: "Repeat new password" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>

        {/* Page title */}
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>
          <span className="gradient-text">My Profile</span>
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 32 }}>
          View your account details and manage your password
        </p>

        {/* ── Profile Info Card ── */}
        <div style={{
          background: "white", borderRadius: 16, border: "1px solid #e5e7eb",
          padding: "28px 32px", marginBottom: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
            <FiUser size={18} color="#7c3aed" /> Account Information
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Avatar + name row */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, color: "white", fontWeight: 700, flexShrink: 0,
              }}>
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{user?.username}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{user?.email}</div>
              </div>
            </div>

            {/* Details grid */}
            {[
              { icon: <FiUser size={15} />,   label: "Username", value: user?.username },
              { icon: <FiMail size={15} />,   label: "Email",    value: user?.email },
              { icon: <FiShield size={15} />, label: "Role",     value: isAdmin ? "Administrator" : "User",
                badge: true, badgeColor: isAdmin ? "#7c3aed" : "#6366f1" },
            ].map(({ icon, label, value, badge, badgeColor }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 14 }}>
                  <span style={{ color: "#9ca3af" }}>{icon}</span> {label}
                </div>
                {badge ? (
                  <span style={{
                    padding: "3px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                    background: badgeColor + "15", color: badgeColor,
                    border: `1px solid ${badgeColor}30`,
                  }}>{value}</span>
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Change Password Card ── */}
        <div style={{
          background: "white", borderRadius: 16, border: "1px solid #e5e7eb",
          padding: "28px 32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
            <FiLock size={18} color="#7c3aed" /> Change Password
          </h2>

          <form onSubmit={handleSubmit}>
            {pwdFields.map(({ label, key, showKey, placeholder }) => (
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
                  <button type="button" onClick={() => toggleShow(showKey)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#9ca3af",
                    display: "flex", alignItems: "center", padding: 4, zIndex: 1,
                  }}>
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

            {success && (
              <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "#059669", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <FiCheck size={14} /> Password changed successfully
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="search-button"
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Saving…" : "Update Password"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
