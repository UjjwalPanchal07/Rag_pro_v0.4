import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  adminGetUsers, adminGetPending, adminApproveUser, adminRejectUser,
  adminCreateUser, adminDeactivateUser, adminReactivateUser, adminResetPassword,
} from "../services/api";
import "../App.css";

const Badge = ({ text, color }) => (
  <span style={{
    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
    background: color + "18", color, border: `1px solid ${color}35`,
  }}>{text}</span>
);

const STATUS_COLOR = {
  approved: "#059669",
  pending:  "#d97706",
  rejected: "#dc2626",
};

const AdminPanel = () => {
  const [tab, setTab]               = useState("pending");   // "pending" | "users"
  const [users, setUsers]           = useState([]);
  const [pending, setPending]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating]     = useState(false);
  const [newUser, setNewUser]       = useState({ email: "", role: "user" });
  const [createdResult, setCreatedResult] = useState(null);
  const [approveRole, setApproveRole]     = useState({});   // { username: role }

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, p] = await Promise.all([adminGetUsers(), adminGetPending()]);
      setUsers(u.data.users);
      setPending(p.data.users);
    } catch {
      showToast("Failed to load data", "error");
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleApprove = async (username) => {
    const role = approveRole[username] || "user";
    try {
      await adminApproveUser(username, role);
      showToast(`${username} approved as ${role}`);
      fetchAll();
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed", "error");
    }
  };

  const handleReject = async (username) => {
    if (!window.confirm(`Reject access for ${username}?`)) return;
    try {
      await adminRejectUser(username);
      showToast(`${username} rejected`);
      fetchAll();
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed", "error");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await adminCreateUser(newUser.email, newUser.role);
      setCreatedResult(res.data);
      setNewUser({ email: "", role: "user" });
      fetchAll();
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to create user", "error");
    }
    setCreating(false);
  };

  const handleDeactivate = async (username) => {
    if (!window.confirm(`Deactivate ${username}?`)) return;
    try { await adminDeactivateUser(username); showToast(`${username} deactivated`); fetchAll(); }
    catch (err) { showToast(err?.response?.data?.detail || "Failed", "error"); }
  };

  const handleReactivate = async (username) => {
    try { await adminReactivateUser(username); showToast(`${username} reactivated`); fetchAll(); }
    catch (err) { showToast(err?.response?.data?.detail || "Failed", "error"); }
  };

  const handleReset = async (username) => {
    if (!window.confirm(`Reset password for ${username}?`)) return;
    try {
      const res = await adminResetPassword(username);
      setCreatedResult({ ...res.data, resetFor: username });
      setShowCreate(true);
    } catch (err) { showToast(err?.response?.data?.detail || "Failed", "error"); }
  };

  const tabStyle = (active) => ({
    padding: "9px 20px", borderRadius: "8px 8px 0 0", border: "none",
    fontWeight: 700, fontSize: 14, cursor: "pointer",
    background: active ? "white" : "transparent",
    color: active ? "#7c3aed" : "#6b7280",
    borderBottom: active ? "2px solid #7c3aed" : "2px solid transparent",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 20px", borderRadius: 10,
          background: toast.type === "error" ? "#FEF2F2" : "#ECFDF5",
          border: `1px solid ${toast.type === "error" ? "#FCA5A5" : "#6EE7B7"}`,
          color: toast.type === "error" ? "#dc2626" : "#059669",
          fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}>
          {toast.type === "error" ? "✕  " : "✓  "}{toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
              <span className="gradient-text">Admin Panel</span>
            </h1>
            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
              Manage user accounts, approvals, and access
            </p>
          </div>
          <button
            onClick={() => { setShowCreate(true); setCreatedResult(null); }}
            className="search-button"
            style={{ fontSize: 13 }}
          >
            + Create User
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Users",  value: users.length,                              color: "#7c3aed" },
            { label: "Pending",      value: pending.length,                            color: "#d97706" },
            { label: "Active",       value: users.filter(u => u.is_active).length,     color: "#059669" },
            { label: "Deactivated",  value: users.filter(u => !u.is_active).length,    color: "#dc2626" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              flex: 1, padding: "16px 20px", borderRadius: 12,
              background: "white", border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: 0, display: "flex", gap: 4 }}>
          <button style={tabStyle(tab === "pending")} onClick={() => setTab("pending")}>
            ⏳ Pending Approvals
            {pending.length > 0 && (
              <span style={{
                marginLeft: 7, background: "#d97706", color: "white",
                borderRadius: 10, padding: "1px 7px", fontSize: 11,
              }}>{pending.length}</span>
            )}
          </button>
          <button style={tabStyle(tab === "users")} onClick={() => setTab("users")}>
            👥 All Users
          </button>
        </div>

        {/* Tab content */}
        <div style={{
          background: "white", borderRadius: "0 12px 12px 12px",
          border: "1px solid #e5e7eb", borderTop: "none",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden",
        }}>

          {/* ── PENDING TAB ── */}
          {tab === "pending" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#7c3aed" }}>
                  {["Email", "Requested", "Assign Role", "Action"].map(h => (
                    <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "white" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading…</td></tr>
                ) : pending.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                    No pending requests 🎉
                  </td></tr>
                ) : pending.map((u, i) => (
                  <tr key={u.username} style={{ background: i % 2 === 0 ? "white" : "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "13px 16px", fontSize: 14, color: "#111827", fontWeight: 500 }}>{u.email}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#6b7280" }}>{u.created_at}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <select
                        value={approveRole[u.username] || "user"}
                        onChange={e => setApproveRole(p => ({ ...p, [u.username]: e.target.value }))}
                        className="rfp-select"
                        style={{ minWidth: 120, padding: "6px 10px", fontSize: 13 }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleApprove(u.username)} style={{
                          padding: "6px 14px", borderRadius: 7, border: "1px solid #6ee7b7",
                          background: "#ecfdf5", color: "#059669", fontSize: 13, fontWeight: 700, cursor: "pointer",
                        }}>✓ Approve</button>
                        <button onClick={() => handleReject(u.username)} style={{
                          padding: "6px 14px", borderRadius: 7, border: "1px solid #fca5a5",
                          background: "#fef2f2", color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer",
                        }}>✕ Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── ALL USERS TAB ── */}
          {tab === "users" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#7c3aed" }}>
                  {["Email", "Username", "Role", "Status", "Last Login", "Actions"].map(h => (
                    <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "white" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading…</td></tr>
                ) : users.map((u, i) => (
                  <tr key={u.username} style={{ background: i % 2 === 0 ? "white" : "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151" }}>{u.email}</td>
                    <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {u.username}
                      {u.must_change_password && <span style={{ marginLeft: 6, fontSize: 11, color: "#d97706" }}>⚠ pwd</span>}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <Badge text={u.role} color={u.role === "admin" ? "#7c3aed" : "#6366f1"} />
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <Badge
                        text={u.status || (u.is_active ? "approved" : "inactive")}
                        color={STATUS_COLOR[u.status] || (u.is_active ? "#059669" : "#dc2626")}
                      />
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#6b7280" }}>{u.last_login}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {u.is_active ? (
                          <button onClick={() => handleDeactivate(u.username)} style={{
                            padding: "5px 10px", borderRadius: 6, border: "1px solid #fca5a5",
                            background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer",
                          }}>Deactivate</button>
                        ) : (
                          <button onClick={() => handleReactivate(u.username)} style={{
                            padding: "5px 10px", borderRadius: 6, border: "1px solid #6ee7b7",
                            background: "#ecfdf5", color: "#059669", fontSize: 12, fontWeight: 600, cursor: "pointer",
                          }}>Reactivate</button>
                        )}
                        <button onClick={() => handleReset(u.username)} style={{
                          padding: "5px 10px", borderRadius: 6, border: "1px solid #fcd34d",
                          background: "#fffbeb", color: "#d97706", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}>Reset Pwd</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Create User Modal ── */}
      {showCreate && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{ width: 440, padding: 32, borderRadius: 16, background: "white", boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>
            {createdResult ? (
              <>
                <h2 style={{ margin: "0 0 16px", color: "#059669" }}>
                  {createdResult.resetFor ? "Password Reset" : "✓ User Created"}
                </h2>
                <div style={{ padding: 16, borderRadius: 10, background: "#ecfdf5", border: "1px solid #6ee7b7" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 14 }}>
                    <strong>Username:</strong> {createdResult.resetFor || createdResult.username}
                  </p>
                  <p style={{ margin: "0 0 8px", fontSize: 14 }}>
                    <strong>Email:</strong> {createdResult.email || "—"}
                  </p>
                  <p style={{ margin: 0, fontSize: 14 }}>
                    <strong>Temp Password:</strong>{" "}
                    <code style={{ background: "#d1fae5", padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>
                      {createdResult.temp_password}
                    </code>
                  </p>
                  <p style={{ margin: "10px 0 0", fontSize: 12, color: "#6b7280" }}>
                    Share this password with the user. They must change it on first login.
                  </p>
                </div>
                <button onClick={() => { setShowCreate(false); setCreatedResult(null); }} className="search-button" style={{ width: "100%", marginTop: 20, justifyContent: "center" }}>
                  Done
                </button>
              </>
            ) : (
              <>
                <h2 style={{ margin: "0 0 20px", color: "#111827" }}>Create User Directly</h2>
                <p style={{ margin: "0 0 18px", fontSize: 13, color: "#6b7280" }}>
                  This creates a pre-approved account with a temporary password.
                </p>
                <form onSubmit={handleCreate}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Work Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                      required
                      placeholder="employee@company.com"
                      className="question-input"
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                  <div style={{ marginBottom: 22 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Role</label>
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                      className="rfp-select"
                      style={{ width: "100%" }}
                    >
                      <option value="user">User — search and batch query</option>
                      <option value="admin">Admin — full access including upload</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" onClick={() => setShowCreate(false)} style={{
                      flex: 1, padding: 12, borderRadius: 8, border: "1px solid #e5e7eb",
                      background: "white", color: "#374151", fontWeight: 600, cursor: "pointer",
                    }}>Cancel</button>
                    <button type="submit" disabled={creating} className="search-button" style={{ flex: 1, justifyContent: "center", opacity: creating ? 0.7 : 1 }}>
                      {creating ? "Creating…" : "Create User"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
