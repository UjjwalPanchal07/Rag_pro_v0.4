import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff, FiHome } from "react-icons/fi";

const DOTS = `url("data:image/svg+xml,%3Csvg width='22' height='22' viewBox='0 0 22 22' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.3' fill='%23b8a4f0' fill-opacity='0.45'/%3E%3C/svg%3E")`;

/* ── Professional floating illustration ─────────────────────────────────── */
const Illustration = () => (
  <div style={{ position: "relative", width: 300, height: 300 }}>

    {/* Orbiting accent dots */}
    {[
      { size: 10, top:  20, left:  30, color: "#a78bfa", delay: "0s",   dur: "3.2s" },
      { size:  7, top:  60, right:  10, color: "#f472b6", delay: "0.6s", dur: "2.8s" },
      { size:  9, bottom: 40, left:  10, color: "#60a5fa", delay: "1s",   dur: "3.6s" },
      { size:  6, bottom: 70, right:  30, color: "#34d399", delay: "0.3s", dur: "2.5s" },
    ].map((d, i) => (
      <div key={i} style={{
        position: "absolute", width: d.size, height: d.size, borderRadius: "50%",
        background: d.color, top: d.top, left: d.left, right: d.right, bottom: d.bottom,
        animation: `orb ${d.dur} ease-in-out ${d.delay} infinite alternate`,
        boxShadow: `0 0 8px ${d.color}`,
      }} />
    ))}

    {/* Back document (shadow layer) */}
    <div style={{
      position: "absolute", top: 44, left: 44, width: 192, height: 240,
      background: "white", borderRadius: 14,
      boxShadow: "0 12px 40px rgba(80,70,228,0.13)",
      transform: "rotate(-6deg)",
    }}>
      {[80, 106, 132, 158].map(t => (
        <div key={t} style={{ position: "absolute", top: t, left: 22, right: 22, height: 8, background: "#ede9fe", borderRadius: 4 }} />
      ))}
    </div>

    {/* Mid document */}
    <div style={{
      position: "absolute", top: 36, left: 36, width: 192, height: 240,
      background: "white", borderRadius: 14,
      boxShadow: "0 8px 28px rgba(80,70,228,0.10)",
      transform: "rotate(-2deg)",
    }}>
      {[72, 98, 124, 150].map(t => (
        <div key={t} style={{ position: "absolute", top: t, left: 22, right: 22, height: 8, background: "#e0e7ff", borderRadius: 4 }} />
      ))}
    </div>

    {/* Front document — main */}
    <div style={{
      position: "absolute", top: 24, left: 24, width: 192, height: 248,
      background: "white", borderRadius: 16,
      boxShadow: "0 20px 52px rgba(80,70,228,0.18), 0 4px 12px rgba(0,0,0,0.06)",
      animation: "floatDoc 4s ease-in-out infinite",
    }}>
      {/* Header bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 42, background: "linear-gradient(90deg,#5046e4,#7c3aed)", borderRadius: "16px 16px 0 0", display: "flex", alignItems: "center", paddingLeft: 16, gap: 6 }}>
        {["#ff6b6b","#ffd93d","#6bcb77"].map((c,i) => <div key={i} style={{ width:8,height:8,borderRadius:"50%",background:c }} />)}
      </div>
      {/* Content lines */}
      <div style={{ position: "absolute", top: 58, left: 18, right: 18 }}>
        <div style={{ height: 11, background: "linear-gradient(90deg,#5046e4,#a78bfa)", borderRadius: 6, marginBottom: 14, width: "70%" }} />
        {[
          { w: "100%", color: "#e0e7ff" },
          { w: "88%",  color: "#ede9fe" },
          { w: "94%",  color: "#e0e7ff" },
          { w: "76%",  color: "#ede9fe" },
        ].map((l, i) => (
          <div key={i} style={{ height: 8, background: l.color, borderRadius: 4, marginBottom: 10, width: l.w }} />
        ))}
        {/* Mini bar chart */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginTop: 18, height: 44 }}>
          {[60,85,45,100,70,55].map((h,i)=>(
            <div key={i} style={{ flex:1, height:`${h}%`, background:`linear-gradient(180deg,${["#5046e4","#7c3aed","#a78bfa","#5046e4","#6366f1","#8b5cf6"][i]},${["#7c3aed","#a78bfa","#c4b5fd","#7c3aed","#a5b4fc","#c4b5fd"][i]})`, borderRadius:"3px 3px 0 0" }} />
          ))}
        </div>
        {/* Bottom lines */}
        <div style={{ marginTop: 14 }}>
          {["90%","72%"].map((w,i)=>(
            <div key={i} style={{ height:7, background:"#e0e7ff", borderRadius:4, marginBottom:8, width:w }} />
          ))}
        </div>
      </div>
    </div>

    {/* Magnifying glass */}
    <div style={{
      position: "absolute", bottom: 16, right: 10,
      animation: "floatMag 3.5s ease-in-out 0.8s infinite",
    }}>
      {/* Glass circle */}
      <div style={{
        width: 52, height: 52, borderRadius: "50%",
        border: "6px solid #5046e4",
        background: "rgba(224,231,255,0.65)",
        backdropFilter: "blur(4px)",
        boxShadow: "0 8px 24px rgba(80,70,228,0.35)",
      }} />
      {/* Handle */}
      <div style={{
        position: "absolute", bottom: -18, right: -4,
        width: 8, height: 22,
        background: "linear-gradient(180deg,#5046e4,#7c3aed)",
        borderRadius: 4,
        transform: "rotate(40deg)",
      }} />
      {/* Shine */}
      <div style={{ position:"absolute", top:8, left:10, width:14, height:6, background:"rgba(255,255,255,0.6)", borderRadius:6, transform:"rotate(-30deg)" }} />
    </div>

    {/* Floating checkmark badge */}
    <div style={{
      position: "absolute", top: 10, right: 8,
      width: 36, height: 36, borderRadius: "50%",
      background: "linear-gradient(135deg,#10b981,#059669)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 6px 16px rgba(16,185,129,0.4)",
      animation: "orb 2.8s ease-in-out 0.4s infinite alternate",
      fontSize: 16, color: "white", fontWeight: 700,
    }}>✓</div>

  </div>
);

const SignIn = () => {
  const { login, isLoggedIn } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from    || "/home";
  const message   = location.state?.message || "";

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [ready, setReady]     = useState(false);

  useEffect(() => { setTimeout(() => setReady(true), 50); }, []);

  if (isLoggedIn) { navigate(from, { replace: true }); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const d = await login(form.email, form.password);
      navigate(d.must_change_password ? "/change-password" : from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || "Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif", overflow: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        @keyframes floatDoc { 0%,100%{transform:translateY(0) rotate(0deg)}  50%{transform:translateY(-10px) rotate(0.5deg)} }
        @keyframes floatMag { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-8px) rotate(4deg)} }
        @keyframes orb      { 0%{transform:translateY(0) scale(1)} 100%{transform:translateY(-12px) scale(1.1)} }
        @keyframes sLeft    { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes sRight   { from{opacity:0;transform:translateX(28px)}  to{opacity:1;transform:translateX(0)} }

        .pi { width:100%; padding:14px 18px; border-radius:12px; border:none;
              background:#f0eff8; font-size:14.5px; font-family:'DM Sans',sans-serif;
              color:#1a1230; box-sizing:border-box; outline:none;
              transition:background .2s,box-shadow .2s; }
        .pi:focus { background:#e8e3f7; box-shadow:0 0 0 2.5px rgba(80,70,228,.22); }
        .pi::placeholder { color:#b0aac8; }

        .pb { width:100%; padding:14px; border:none; border-radius:12px;
              background:#5046e4; color:white; font-size:15px; font-weight:700;
              font-family:'DM Sans',sans-serif; cursor:pointer; letter-spacing:.2px;
              box-shadow:0 8px 22px rgba(80,70,228,.38);
              transition:background .2s,transform .15s,box-shadow .2s; }
        .pb:hover:not(:disabled) { background:#3d35c4; transform:translateY(-1px); box-shadow:0 12px 28px rgba(80,70,228,.45); }
        .pb:disabled { opacity:.65; cursor:not-allowed; }
      `}</style>

      {/* ══ LEFT PANEL ══════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1, padding: "44px 52px",
        background: "linear-gradient(155deg,#faf8ff 0%,#f3eeff 45%,#fce8f8 100%)",
        backgroundImage: DOTS,
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        animation: ready ? "sLeft .65s cubic-bezier(.22,.68,0,1.2) both" : "none",
      }}>

        {/* Soft blob */}
        <div style={{ position:"absolute", width:600, height:600, background:"radial-gradient(circle,rgba(160,130,255,.22) 0%,rgba(255,160,210,.14) 55%,transparent 72%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", filter:"blur(56px)", pointerEvents:"none" }} />

        {/* Logo row + back to home */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img
            src="/profinch-logo.png"
            alt="Profinch"
            style={{ height: 38, mixBlendMode: "multiply", display: "block" }}
          />
          <Link
            to="/"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 20,
              background: "rgba(80,70,228,0.1)",
              border: "1px solid rgba(80,70,228,0.2)",
              color: "#5046e4", textDecoration: "none",
              fontSize: 13, fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="#5046e4"; e.currentTarget.style.color="white"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(80,70,228,0.1)"; e.currentTarget.style.color="#5046e4"; }}
          >
            <FiHome size={14} /> Home
          </Link>
        </div>

        {/* Centre content */}
        <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", alignItems: "center", gap: 32 }}>

          {/* Text */}
          <div style={{ maxWidth: 320 }}>
            <h1 style={{ fontSize: 40, fontWeight: 800, color: "#1a1230", lineHeight: 1.18, margin: "0 0 16px" }}>
              Sign In to<br />
              <span style={{ background: "linear-gradient(90deg,#5046e4,#9333ea)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                PRISM
              </span>
            </h1>
            <p style={{ fontSize: 15, color: "#6b6b8a", lineHeight: 1.72, margin: "0 0 16px" }}>
              Profinch RFP Response Intelligence &amp; Solution Manager.<br />
              AI-powered search &amp; batch processing.
            </p>
            <p style={{ fontSize: 14.5, color: "#6b6b8a", margin: 0 }}>
              Don't have an account?&nbsp;
              <Link to="/register" style={{ color: "#5046e4", fontWeight: 700, textDecoration: "none" }}>
                Request Access
              </Link>
            </p>
          </div>

          {/* Illustration */}
          <Illustration />
        </div>

        {/* Feature pills */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", gap: 9, flexWrap: "wrap" }}>
          {["AI-Powered Search", "Role-Based Access", "Audit Logs", "Batch Processing"].map(f => (
            <span key={f} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "rgba(80,70,228,.1)", color: "#5046e4", border: "1px solid rgba(80,70,228,.18)" }}>{f}</span>
          ))}
        </div>

      </div>

      {/* ══ RIGHT PANEL — form ═══════════════════════════════════════════════ */}
      <div style={{
        width: 460, background: "white",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 50px",
        animation: ready ? "sRight .65s cubic-bezier(.22,.68,0,1.2) both" : "none",
      }}>

        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 25, fontWeight: 800, color: "#1a1230", margin: "0 0 6px" }}>Welcome back 👋</h2>
          <p style={{ color: "#a0a0b8", fontSize: 14, margin: 0 }}>Sign in to your account to continue</p>
        </div>

        {message && (
          <div style={{ padding: "11px 14px", borderRadius: 10, marginBottom: 20, background: "#f0eeff", border: "1px solid rgba(80,70,228,.2)", color: "#5046e4", fontSize: 13 }}>
            🔒 {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <input
            type="text" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            required placeholder="example@profinch.com" className="pi"
          />

          <div style={{ position: "relative" }}>
            <input
              type={showPwd ? "text" : "password"} value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required placeholder="••••••••••" className="pi"
              style={{ paddingRight: 48 }}
            />
            <button type="button" onClick={() => setShowPwd(p => !p)} style={{ position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#b0aac8",display:"flex",alignItems:"center",padding:4 }}>
              {showPwd ? <FiEyeOff size={17}/> : <FiEye size={17}/>}
            </button>
          </div>

          <div style={{ textAlign: "right", marginTop: -6 }}>
            <Link to="/profile" style={{ fontSize: 13, color: "#5046e4", textDecoration: "none", fontWeight: 500 }}>
              Recovery Password
            </Link>
          </div>

          {error && (
            <div style={{ padding: "11px 14px", borderRadius: 10, background: "#fff0f0", border: "1px solid rgba(220,38,38,.2)", color: "#dc2626", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="pb">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#f0eff8" }} />
          <span style={{ fontSize: 12.5, color: "#c0bcd8" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#f0eff8" }} />
        </div>

        <Link to="/register" style={{ display:"flex",justifyContent:"center",alignItems:"center",padding:"13px",borderRadius:12,textDecoration:"none",border:"2px solid #5046e4",color:"#5046e4",fontSize:14.5,fontWeight:700,fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",transition:"all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background="#5046e4"; e.currentTarget.style.color="white"; }}
          onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#5046e4"; }}
        >
          Request Access
        </Link>

        <p style={{ textAlign: "center", fontSize: 12, color: "#c0bcd8", marginTop: 18, marginBottom: 0 }}>
          New users require admin approval before signing in.
        </p>
      </div>
    </div>
  );
};

export default SignIn;
