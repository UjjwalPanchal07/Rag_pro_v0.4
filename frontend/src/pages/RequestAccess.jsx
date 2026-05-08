import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { FiEye, FiEyeOff, FiCheck, FiX, FiArrowLeft, FiHome } from "react-icons/fi";

const DOTS = `url("data:image/svg+xml,%3Csvg width='22' height='22' viewBox='0 0 22 22' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.3' fill='%23b8a4f0' fill-opacity='0.45'/%3E%3C/svg%3E")`;

const getStrength = (pwd) => {
  const c = { length: pwd.length>=8, uppercase:/[A-Z]/.test(pwd), number:/[0-9]/.test(pwd), special:/[!@#$%^&*]/.test(pwd) };
  const s = Object.values(c).filter(Boolean).length;
  return { checks:c, score:s, label:["","Weak","Fair","Good","Strong"][s]||"", color:["","#ef4444","#f59e0b","#3b82f6","#10b981"][s]||"" };
};

const CI = ({ ok, label }) => (
  <span style={{ display:"inline-flex",alignItems:"center",gap:4,fontSize:12,color:ok?"#10b981":"#b0aac8",marginRight:12 }}>
    {ok?<FiCheck size={12}/>:<FiX size={12}/>} {label}
  </span>
);

/* ── Illustration — lock/access theme ─────────────────────────────────── */
const Illustration = () => (
  <div style={{ position:"relative", width:260, height:280 }}>

    {[
      { size:9,  top:10,  left:20,  color:"#a78bfa", delay:"0s",   dur:"3s" },
      { size:7,  top:50,  right:10, color:"#f472b6", delay:"0.5s", dur:"2.7s" },
      { size:8,  bottom:30, left:5, color:"#60a5fa", delay:"0.9s", dur:"3.4s" },
      { size:6,  bottom:60, right:20, color:"#34d399", delay:"0.3s", dur:"2.4s" },
    ].map((d,i) => (
      <div key={i} style={{ position:"absolute",width:d.size,height:d.size,borderRadius:"50%",background:d.color,top:d.top,left:d.left,right:d.right,bottom:d.bottom,animation:`orb ${d.dur} ease-in-out ${d.delay} infinite alternate`,boxShadow:`0 0 7px ${d.color}` }} />
    ))}

    {/* Shield base */}
    <div style={{ position:"absolute", top:30, left:"50%", transform:"translateX(-50%)", width:140, height:160, background:"linear-gradient(160deg,#5046e4,#7c3aed)", borderRadius:"70px 70px 50% 50%", boxShadow:"0 20px 50px rgba(80,70,228,.38)", animation:"floatDoc 4s ease-in-out infinite" }}>
      {/* Shield shine */}
      <div style={{ position:"absolute", top:14, left:18, width:40, height:20, background:"rgba(255,255,255,.2)", borderRadius:20, transform:"rotate(-20deg)" }} />
      {/* Lock icon inside shield */}
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-55%)" }}>
        {/* Lock body */}
        <div style={{ width:40, height:34, background:"rgba(255,255,255,.92)", borderRadius:8, boxShadow:"0 4px 12px rgba(0,0,0,.15)" }}>
          <div style={{ position:"absolute", top:10, left:"50%", transform:"translateX(-50%)", width:14, height:14, borderRadius:"50%", background:"#5046e4" }} />
        </div>
        {/* Lock shackle */}
        <div style={{ position:"absolute", top:-18, left:"50%", transform:"translateX(-50%)", width:22, height:22, borderRadius:"11px 11px 0 0", border:"5px solid rgba(255,255,255,.85)", borderBottom:"none" }} />
      </div>
    </div>

    {/* Checkmark badge */}
    <div style={{ position:"absolute", top:20, right:18, width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#10b981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 16px rgba(16,185,129,.4)", fontSize:17, color:"white", fontWeight:700, animation:"orb 2.6s ease-in-out .4s infinite alternate" }}>✓</div>

    {/* User card floating */}
    <div style={{ position:"absolute", bottom:10, left:0, width:130, height:64, background:"white", borderRadius:12, boxShadow:"0 8px 28px rgba(80,70,228,.14)", padding:"10px 14px", animation:"floatMag 3.5s ease-in-out 1s infinite" }}>
      <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#5046e4,#a78bfa)", marginBottom:8 }} />
      <div style={{ height:7, background:"#e0e7ff", borderRadius:4, marginBottom:5, width:"80%" }} />
      <div style={{ height:6, background:"#ede9fe", borderRadius:4, width:"55%" }} />
    </div>

    {/* Approval badge floating */}
    <div style={{ position:"absolute", bottom:20, right:0, padding:"7px 13px", background:"white", borderRadius:20, boxShadow:"0 6px 18px rgba(16,185,129,.18)", border:"1.5px solid #6ee7b7", fontSize:12, fontWeight:700, color:"#059669", animation:"orb 3s ease-in-out .7s infinite alternate" }}>
      ✓ Approved
    </div>

  </div>
);

const RequestAccess = () => {
  const [form, setForm]       = useState({ email:"", password:"", confirm:"" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [show, setShow]       = useState({ pwd:false, confirm:false });
  const [ready, setReady]     = useState(false);
  const strength = getStrength(form.password);

  useEffect(() => { setTimeout(() => setReady(true), 50); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (form.password !== form.confirm)  { setError("Passwords do not match"); return; }
    if (!strength.checks.length)         { setError("Password must be at least 8 characters"); return; }
    if (!strength.checks.uppercase)      { setError("Must contain at least one uppercase letter"); return; }
    if (!strength.checks.number)         { setError("Must contain at least one number"); return; }
    setLoading(true);
    try { await registerUser(form.email, form.password); setSuccess(true); }
    catch (err) { setError(err?.response?.data?.detail || "Registration failed. Please try again."); }
    setLoading(false);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
    @keyframes floatDoc { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-10px)} }
    @keyframes floatMag { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
    @keyframes orb      { 0%{transform:translateY(0) scale(1)} 100%{transform:translateY(-10px) scale(1.08)} }
    @keyframes sLeft    { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }
    @keyframes sRight   { from{opacity:0;transform:translateX(28px)}  to{opacity:1;transform:translateX(0)} }
    .pi2 { width:100%; padding:13px 18px; border-radius:12px; border:none;
           background:#f0eff8; font-size:14px; font-family:'DM Sans',sans-serif;
           color:#1a1230; box-sizing:border-box; outline:none;
           transition:background .2s,box-shadow .2s; }
    .pi2:focus { background:#e8e3f7; box-shadow:0 0 0 2.5px rgba(80,70,228,.22); }
    .pi2::placeholder { color:#b0aac8; }
    .pb2 { width:100%; padding:13px; border:none; border-radius:12px;
           background:#5046e4; color:white; font-size:15px; font-weight:700;
           font-family:'DM Sans',sans-serif; cursor:pointer;
           box-shadow:0 8px 22px rgba(80,70,228,.38);
           transition:background .2s,transform .15s,box-shadow .2s; }
    .pb2:hover:not(:disabled) { background:#3d35c4; transform:translateY(-1px); box-shadow:0 12px 28px rgba(80,70,228,.45); }
    .pb2:disabled { opacity:.65; cursor:not-allowed; }
  `;

  const LeftContent = () => (
    <>
      {/* Soft blob */}
      <div style={{ position:"absolute",width:600,height:600,background:"radial-gradient(circle,rgba(160,130,255,.22) 0%,rgba(255,160,210,.14) 55%,transparent 72%)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",filter:"blur(56px)",pointerEvents:"none" }} />

      {/* Logo + Home button */}
      <div style={{ position:"relative",zIndex:2,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <img src="/profinch-logo.png" alt="Profinch" style={{ height:38, mixBlendMode:"multiply", display:"block" }} />
        <Link
          to="/"
          style={{
            display:"flex",alignItems:"center",gap:6,
            padding:"7px 14px",borderRadius:20,
            background:"rgba(80,70,228,0.1)",
            border:"1px solid rgba(80,70,228,0.2)",
            color:"#5046e4",textDecoration:"none",
            fontSize:13,fontWeight:600,transition:"all 0.2s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background="#5046e4";e.currentTarget.style.color="white";}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(80,70,228,0.1)";e.currentTarget.style.color="#5046e4";}}
        >
          <FiHome size={14} /> Home
        </Link>
      </div>

      {/* Centre */}
      <div style={{ position:"relative",zIndex:2,flex:1,display:"flex",alignItems:"center",gap:28 }}>
        <div style={{ maxWidth:280 }}>
          <h1 style={{ fontSize:38,fontWeight:800,color:"#1a1230",lineHeight:1.18,margin:"0 0 16px" }}>
            Join<br/>
            <span style={{ background:"linear-gradient(90deg,#5046e4,#9333ea)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>PRISM</span>
          </h1>
          <p style={{ fontSize:14.5,color:"#6b6b8a",lineHeight:1.72,margin:"0 0 14px" }}>
            Submit your request to access the Profinch RFP Intelligence Platform.
          </p>
          <p style={{ fontSize:14,color:"#6b6b8a",margin:0 }}>
            Already have an account?&nbsp;
            <Link to="/signin" style={{ color:"#5046e4",fontWeight:700,textDecoration:"none" }}>Sign In</Link>
          </p>
        </div>
        <Illustration />
      </div>

      {/* Pills */}
      <div style={{ position:"relative",zIndex:2,display:"flex",gap:9,flexWrap:"wrap" }}>
        {["Admin-Controlled","Profinch Only","Secure Access","Role-Based"].map(f=>(
          <span key={f} style={{ padding:"5px 13px",borderRadius:20,fontSize:12,fontWeight:600,background:"rgba(80,70,228,.1)",color:"#5046e4",border:"1px solid rgba(80,70,228,.18)" }}>{f}</span>
        ))}
      </div>
    </>
  );

  // ── Success ──
  if (success) {
    return (
      <div style={{ display:"flex",minHeight:"100vh",fontFamily:"'DM Sans','Segoe UI',sans-serif",overflow:"hidden" }}>
        <style>{css}</style>
        <div style={{ flex:1,padding:"44px 52px",background:"linear-gradient(155deg,#faf8ff 0%,#f3eeff 45%,#fce8f8 100%)",backgroundImage:DOTS,position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"space-between",animation:ready?"sLeft .65s cubic-bezier(.22,.68,0,1.2) both":"none" }}>
          <LeftContent />
        </div>
        <div style={{ width:460,background:"white",display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px 50px",animation:ready?"sRight .65s cubic-bezier(.22,.68,0,1.2) both":"none" }}>
          <div style={{ width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,color:"white",marginBottom:24 }}>✅</div>
          <h2 style={{ fontSize:24,fontWeight:800,color:"#1a1230",margin:"0 0 12px" }}>Request Submitted!</h2>
          <p style={{ color:"#6b6b8a",fontSize:14.5,lineHeight:1.75,margin:"0 0 28px" }}>
            Your access request has been submitted.<br/>
            An administrator will review and approve your account.<br/>
            <strong style={{ color:"#1a1230" }}>You can sign in once approved.</strong>
          </p>
          {[
            { n:"1", t:"Admin reviews your request in the Admin Panel" },
            { n:"2", t:"Your account gets approved and a role is assigned" },
            { n:"3", t:"Sign in with your registered email and password" },
          ].map(({ n, t }) => (
            <div key={n} style={{ display:"flex",alignItems:"flex-start",gap:12,marginBottom:16 }}>
              <div style={{ width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#5046e4,#7c3aed)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,flexShrink:0 }}>{n}</div>
              <p style={{ fontSize:14,color:"#374151",margin:"5px 0 0",lineHeight:1.5 }}>{t}</p>
            </div>
          ))}
          <Link to="/signin" className="pb2" style={{ marginTop:16,textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            <FiArrowLeft size={15}/> Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ── Main form ──
  return (
    <div style={{ display:"flex",minHeight:"100vh",fontFamily:"'DM Sans','Segoe UI',sans-serif",overflow:"hidden" }}>
      <style>{css}</style>

      {/* LEFT */}
      <div style={{ flex:1,padding:"44px 52px",background:"linear-gradient(155deg,#faf8ff 0%,#f3eeff 45%,#fce8f8 100%)",backgroundImage:DOTS,position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"space-between",animation:ready?"sLeft .65s cubic-bezier(.22,.68,0,1.2) both":"none" }}>
        <LeftContent />
      </div>

      {/* RIGHT — form */}
      <div style={{ width:480,background:"white",display:"flex",flexDirection:"column",justifyContent:"center",padding:"50px 50px",overflowY:"auto",animation:ready?"sRight .65s cubic-bezier(.22,.68,0,1.2) both":"none" }}>

        <div style={{ marginBottom:26 }}>
          <h2 style={{ fontSize:24,fontWeight:800,color:"#1a1230",margin:"0 0 6px" }}>Request Access</h2>
          <p style={{ color:"#a0a0b8",fontSize:14,margin:0 }}>Submit your details — an admin will approve your account</p>
        </div>

        <div style={{ padding:"11px 14px",borderRadius:10,marginBottom:20,background:"#f7f0ff",border:"1px solid rgba(80,70,228,.18)",fontSize:13,color:"#5046e4",lineHeight:1.55 }}>
          🔒 <strong>Admin-controlled access.</strong> Your account will only be active after an administrator approves your request.
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:12 }}>

          {/* Email */}
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:700,color:"#9090a8",marginBottom:5,textTransform:"uppercase",letterSpacing:.6 }}>Work Email</label>
            <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required placeholder="example@profinch.com" className="pi2" />
          </div>

          {/* Password */}
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:700,color:"#9090a8",marginBottom:5,textTransform:"uppercase",letterSpacing:.6 }}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={show.pwd?"text":"password"} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required placeholder="Minimum 8 characters" className="pi2" style={{ paddingRight:46 }} />
              <button type="button" onClick={()=>setShow(p=>({...p,pwd:!p.pwd}))} style={{ position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#b0aac8",display:"flex",alignItems:"center",padding:4 }}>
                {show.pwd?<FiEyeOff size={16}/>:<FiEye size={16}/>}
              </button>
            </div>
            {/* Strength */}
            {form.password && (
              <div style={{ marginTop:8 }}>
                <div style={{ display:"flex",gap:3,marginBottom:5,alignItems:"center" }}>
                  {[1,2,3,4].map(i=>(
                    <div key={i} style={{ flex:1,height:3,borderRadius:3,background:i<=strength.score?strength.color:"#e8e4f4",transition:"background .3s" }} />
                  ))}
                  <span style={{ fontSize:10.5,fontWeight:700,color:strength.color,minWidth:36,textAlign:"right" }}>{strength.label}</span>
                </div>
                <div>
                  <CI ok={strength.checks.length}    label="8 chars" />
                  <CI ok={strength.checks.uppercase} label="Uppercase" />
                  <CI ok={strength.checks.number}    label="Number" />
                  <CI ok={strength.checks.special}   label="Special" />
                </div>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:700,color:"#9090a8",marginBottom:5,textTransform:"uppercase",letterSpacing:.6 }}>Confirm Password</label>
            <div style={{ position:"relative" }}>
              <input type={show.confirm?"text":"password"} value={form.confirm} onChange={e=>setForm(p=>({...p,confirm:e.target.value}))} required placeholder="Repeat your password" className="pi2" style={{ paddingRight:46 }} />
              <button type="button" onClick={()=>setShow(p=>({...p,confirm:!p.confirm}))} style={{ position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#b0aac8",display:"flex",alignItems:"center",padding:4 }}>
                {show.confirm?<FiEyeOff size={16}/>:<FiEye size={16}/>}
              </button>
            </div>
            {form.confirm&&form.confirm!==form.password&&(
              <p style={{ margin:"4px 0 0",fontSize:12,color:"#ef4444" }}>Passwords do not match</p>
            )}
          </div>

          {error && (
            <div style={{ padding:"11px 14px",borderRadius:10,background:"#fff0f0",border:"1px solid rgba(220,38,38,.2)",color:"#dc2626",fontSize:13 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="pb2" style={{ marginTop:4 }}>
            {loading ? "Submitting…" : "Submit Request"}
          </button>
        </form>


      </div>
    </div>
  );
};

export default RequestAccess;
