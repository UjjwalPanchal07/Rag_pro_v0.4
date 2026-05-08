import { Link, useNavigate } from "react-router-dom";
import { FiHome, FiUpload, FiUsers, FiLogOut, FiLogIn, FiUserPlus, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function Navbar({ openUploadModal }) {
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/profinch-logo.png" alt="Profinch Logo" className="logo-image" />
      </div>

      <div className="navbar-right">
        <Link to="/"><FiHome /> Home</Link>

        {isLoggedIn ? (
          <>
            {/* Upload RFP — admin only */}
            {isAdmin && (
              <button className="nav-link-btn" onClick={openUploadModal}>
                <FiUpload /> Upload RFP
              </button>
            )}

            {/* Admin Panel — admin only */}
            {isAdmin && (
              <Link to="/admin"><FiUsers /> Admin Panel</Link>
            )}

            {/* Profile — all users */}
            <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: isAdmin
                  ? "linear-gradient(135deg,#7c3aed,#6366f1)"
                  : "linear-gradient(135deg,#6366f1,#818cf8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                {user?.username}
                <span style={{
                  marginLeft: 5, fontSize: 11, padding: "1px 7px", borderRadius: 10,
                  fontWeight: 700,
                  background: isAdmin ? "rgba(124,58,237,0.1)" : "rgba(99,102,241,0.1)",
                  color: isAdmin ? "#7c3aed" : "#6366f1",
                }}>
                  {isAdmin ? "Admin" : "User"}
                </span>
              </span>
            </Link>

            <button className="nav-link-btn" onClick={handleSignOut} style={{ color: "#ef4444" }}>
              <FiLogOut /> Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/signin"><FiLogIn /> Sign In</Link>
            <Link to="/register" className="signup-btn">
              <FiUserPlus /> Request Access
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
