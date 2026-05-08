import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import UploadModal from "../components/UploadModal";
import { FiSearch, FiFileText, FiGlobe, FiZap, FiLayers, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "../App.css";

/* ═══════════════════════════════════════════════════════════════
   HERO CHILD 2 ILLUSTRATION — Search & Fill RFP
   ═══════════════════════════════════════════════════════════════ */
const SearchIllustration = () => (
  <div style={{ position: "relative", width: 420, height: 380, flexShrink: 0 }}>

    <style>{`
      @keyframes hFloat  { 0%,100%{transform:translateY(0)}       50%{transform:translateY(-12px)} }
      @keyframes hFloat2 { 0%,100%{transform:translateY(0)}       50%{transform:translateY(-8px)} }
      @keyframes hFloat3 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-6px) rotate(2deg)} }
      @keyframes hPulse  { 0%,100%{opacity:1;transform:scale(1)}  50%{opacity:0.6;transform:scale(0.95)} }
      @keyframes hBlink  { 0%,49%{opacity:1} 50%,100%{opacity:0} }
      @keyframes hSlideIn{ from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
      @keyframes hCheck  { from{stroke-dashoffset:30} to{stroke-dashoffset:0} }
      @keyframes hOrbit  { from{transform:rotate(0deg) translateX(110px) rotate(0deg)} to{transform:rotate(360deg) translateX(110px) rotate(-360deg)} }
      @keyframes hOrbit2 { from{transform:rotate(120deg) translateX(140px) rotate(-120deg)} to{transform:rotate(480deg) translateX(140px) rotate(-480deg)} }
      @keyframes hOrbit3 { from{transform:rotate(240deg) translateX(120px) rotate(-240deg)} to{transform:rotate(600deg) translateX(120px) rotate(-600deg)} }
      @keyframes hSpark  { 0%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0)} }
      @keyframes hDrift  { 0%{transform:translate(0,0)} 33%{transform:translate(8px,-12px)} 66%{transform:translate(-6px,-6px)} 100%{transform:translate(0,0)} }
      @keyframes hGlow   { 0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.4)} 50%{box-shadow:0 0 40px rgba(124,58,237,0.8)} }
      @keyframes hType   { from{width:0} to{width:100%} }
      @keyframes hDocFly { 0%{opacity:0;transform:translate(0,0) rotate(0deg)} 30%{opacity:1} 100%{opacity:1;transform:translate(var(--tx),var(--ty)) rotate(var(--tr))} }
    `}</style>

    {/* Background glow blob */}
    <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", filter:"blur(30px)" }} />

    {/* Floating particles */}
    {[
      {x:30, y:40,  s:5,  c:"#a78bfa", d:"0s",   dur:"3.2s"},
      {x:360,y:60,  s:4,  c:"#f472b6", d:"0.8s",  dur:"2.6s"},
      {x:50, y:320, s:6,  c:"#60a5fa", d:"1.2s",  dur:"3.8s"},
      {x:380,y:300, s:4,  c:"#34d399", d:"0.4s",  dur:"2.9s"},
      {x:200,y:20,  s:5,  c:"#fbbf24", d:"1.6s",  dur:"3.4s"},
      {x:10, y:180, s:3,  c:"#a78bfa", d:"0.6s",  dur:"2.7s"},
      {x:400,y:180, s:4,  c:"#f472b6", d:"1.0s",  dur:"3.1s"},
    ].map((p,i) => (
      <div key={i} style={{
        position:"absolute", left:p.x, top:p.y,
        width:p.s, height:p.s, borderRadius:"50%",
        background:p.c, boxShadow:`0 0 ${p.s*2}px ${p.c}`,
        animation:`hDrift ${p.dur} ease-in-out ${p.d} infinite`,
        opacity:0.8,
      }} />
    ))}

    {/* ── MAIN SEARCH BAR ── */}
    <div style={{
      position:"absolute", top:60, left:30, right:30, height:58,
      background:"white", borderRadius:16,
      boxShadow:"0 16px 48px rgba(124,58,237,0.22), 0 4px 12px rgba(0,0,0,0.08)",
      display:"flex", alignItems:"center", padding:"0 18px", gap:12,
      animation:"hGlow 3s ease-in-out infinite",
    }}>
      {/* Search icon */}
      <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      </div>
      {/* Typing text with cursor */}
      <div style={{ flex:1, overflow:"hidden" }}>
        <div style={{ fontSize:13, color:"#374151", fontWeight:500, display:"flex", alignItems:"center", gap:2 }}>
          <span>What are the supported payment rails?</span>
          <span style={{ width:2, height:14, background:"#7c3aed", borderRadius:1, animation:"hBlink 1s step-end infinite", display:"inline-block", marginLeft:2 }} />
        </div>
      </div>
      {/* Enter key */}
      <div style={{ padding:"4px 10px", borderRadius:6, background:"linear-gradient(135deg,#7c3aed,#6366f1)", fontSize:11, color:"white", fontWeight:700, flexShrink:0 }}>↵</div>
    </div>

    {/* ── ORBITING TAG CHIPS ── */}
    <div style={{ position:"absolute", top:"50%", left:"50%", width:0, height:0 }}>
      {[
        { label:"Transaction Banking", color:"#7c3aed", bg:"rgba(124,58,237,0.1)", anim:"hOrbit 8s linear infinite" },
        { label:"Payments",            color:"#0ea5e9", bg:"rgba(14,165,233,0.1)",  anim:"hOrbit2 10s linear infinite" },
        { label:"Core Banking",        color:"#10b981", bg:"rgba(16,185,129,0.1)",  anim:"hOrbit3 12s linear infinite" },
      ].map((t,i) => (
        <div key={i} style={{
          position:"absolute",
          animation:t.anim,
          top:-14, left:-60,
        }}>
          <div style={{ padding:"5px 12px", borderRadius:20, background:t.bg, border:`1px solid ${t.color}40`, fontSize:11, fontWeight:700, color:t.color, whiteSpace:"nowrap", boxShadow:`0 4px 12px ${t.color}25` }}>
            {t.label}
          </div>
        </div>
      ))}
    </div>

    {/* ── FLYING DOCUMENT CARDS ── */}
    {[
      { top:140, left:20,  delay:"0.2s", tx:"-20px", ty:"60px",  tr:"-8deg",  lines:["#e0e7ff","#ede9fe","#e0e7ff"], check:true  },
      { top:150, left:160, delay:"0.6s", tx:"10px",  ty:"80px",  tr:"3deg",   lines:["#ede9fe","#e0e7ff","#ede9fe"], check:true  },
      { top:145, left:300, delay:"1.0s", tx:"30px",  ty:"55px",  tr:"10deg",  lines:["#e0e7ff","#ede9fe","#e0e7ff"], check:false },
    ].map((d,i) => (
      <div key={i} style={{
        position:"absolute", top:d.top, left:d.left,
        width:96, height:112,
        background:"white", borderRadius:12,
        boxShadow:"0 12px 32px rgba(80,70,228,0.15), 0 3px 8px rgba(0,0,0,0.06)",
        "--tx":d.tx, "--ty":d.ty, "--tr":d.tr,
        animation:`hDocFly 1.2s cubic-bezier(.22,.68,0,1.2) ${d.delay} both, hFloat${i===1?"2":""}  ${3+i*0.5}s ease-in-out ${parseFloat(d.delay)+1.2}s infinite`,
        overflow:"hidden",
      }}>
        {/* Doc header */}
        <div style={{ height:24, background:`linear-gradient(90deg,#7c3aed,#6366f1)`, borderRadius:"12px 12px 0 0", display:"flex", alignItems:"center", paddingLeft:8, gap:4 }}>
          {["#ff6b6b","#ffd93d","#6bcb77"].map((c,j)=><div key={j} style={{width:5,height:5,borderRadius:"50%",background:c}}/>)}
        </div>
        {/* Lines */}
        <div style={{ padding:"8px 8px" }}>
          {d.lines.map((c,j) => <div key={j} style={{ height:6, background:c, borderRadius:3, marginBottom:5, width:j===1?"70%":"90%" }} />)}
        </div>
        {/* Checkmark badge */}
        {d.check && (
          <div style={{
            position:"absolute", top:6, right:6,
            width:20, height:20, borderRadius:"50%",
            background:"linear-gradient(135deg,#10b981,#059669)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 3px 8px rgba(16,185,129,0.4)",
            animation:`hPulse 2s ease-in-out ${i*0.4}s infinite`,
          }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 6l3 3 5-5" strokeDasharray="30" strokeDashoffset="0" style={{ animation:`hCheck 0.4s ease ${parseFloat(d.delay)+1.4}s both` }} />
            </svg>
          </div>
        )}
      </div>
    ))}

    {/* ── MAGNIFYING GLASS ── */}
    <div style={{
      position:"absolute", bottom:40, right:40,
      animation:"hFloat 4s ease-in-out infinite",
    }}>
      <div style={{ position:"relative", width:72, height:72 }}>
        {/* Outer ring glow */}
        <div style={{ position:"absolute", inset:-6, borderRadius:"50%", background:"conic-gradient(from 0deg,#7c3aed,#6366f1,#ec4899,#a78bfa,#7c3aed)", animation:"hPulse 2.5s ease-in-out infinite", filter:"blur(4px)", opacity:0.6 }} />
        {/* Glass */}
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"5px solid #7c3aed", background:"rgba(224,231,255,0.7)", backdropFilter:"blur(4px)", boxShadow:"0 8px 24px rgba(124,58,237,0.3)" }}>
          <div style={{ position:"absolute", top:10, left:12, width:16, height:7, background:"rgba(255,255,255,0.7)", borderRadius:6, transform:"rotate(-30deg)" }} />
        </div>
        {/* Handle */}
        <div style={{ position:"absolute", bottom:-16, right:-4, width:7, height:20, background:"linear-gradient(180deg,#7c3aed,#6366f1)", borderRadius:4, transform:"rotate(40deg)" }} />
      </div>
    </div>

    {/* Sparkle dots */}
    {[
      {x:80,  y:130, s:8,  d:"0s"},
      {x:310, y:140, s:6,  d:"0.7s"},
      {x:200, y:250, s:10, d:"1.4s"},
      {x:140, y:310, s:7,  d:"0.4s"},
      {x:330, y:280, s:5,  d:"1.1s"},
    ].map((s,i) => (
      <div key={i} style={{
        position:"absolute", left:s.x, top:s.y,
        width:s.s, height:s.s,
        background:"radial-gradient(circle,#fbbf24,#f472b6)",
        borderRadius:"50%", boxShadow:`0 0 ${s.s}px #fbbf24`,
        animation:`hSpark ${1.8+i*0.3}s ease-in-out ${s.d} infinite`,
      }} />
    ))}

  </div>
);


/* ═══════════════════════════════════════════════════════════════
   HERO CHILD 3 ILLUSTRATION — Web Search Globe
   ═══════════════════════════════════════════════════════════════ */
const GlobeIllustration = () => (
  <div style={{ position:"relative", width:400, height:380, flexShrink:0 }}>

    <style>{`
      @keyframes gRotate  { from{transform:rotateY(0deg)}   to{transform:rotateY(360deg)} }
      @keyframes gRing1   { from{transform:rotateX(75deg) rotateZ(0deg)}   to{transform:rotateX(75deg) rotateZ(360deg)} }
      @keyframes gRing2   { from{transform:rotateX(60deg) rotateZ(120deg)} to{transform:rotateX(60deg) rotateZ(480deg)} }
      @keyframes gRing3   { from{transform:rotateX(80deg) rotateZ(240deg)} to{transform:rotateX(80deg) rotateZ(600deg)} }
      @keyframes gPulse   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.7} }
      @keyframes gBeam    { 0%{opacity:0;transform:scaleX(0);transform-origin:left} 50%{opacity:1;transform:scaleX(1)} 100%{opacity:0;transform:scaleX(1)} }
      @keyframes gCard    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      @keyframes gNodePulse{ 0%,100%{box-shadow:0 0 6px currentColor} 50%{box-shadow:0 0 18px currentColor,0 0 30px currentColor} }
      @keyframes gDrift   { 0%{transform:translate(0,0)} 33%{transform:translate(6px,-10px)} 66%{transform:translate(-5px,-5px)} 100%{transform:translate(0,0)} }
      @keyframes gSweep   { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(360deg)} }
      @keyframes gLine    { from{stroke-dashoffset:200} to{stroke-dashoffset:0} }
    `}</style>

    {/* Background ambient glow */}
    <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(14,165,233,0.12) 0%,rgba(99,102,241,0.08) 50%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", filter:"blur(40px)" }} />

    {/* Floating particles */}
    {[
      {x:20,  y:50,  s:5, c:"#38bdf8", d:"0s",   dur:"3.4s"},
      {x:360, y:40,  s:4, c:"#a78bfa", d:"1s",   dur:"2.8s"},
      {x:15,  y:300, s:6, c:"#34d399", d:"0.5s", dur:"3.6s"},
      {x:370, y:310, s:4, c:"#f472b6", d:"1.5s", dur:"2.6s"},
      {x:190, y:10,  s:5, c:"#fbbf24", d:"0.8s", dur:"3.2s"},
    ].map((p,i) => (
      <div key={i} style={{ position:"absolute", left:p.x, top:p.y, width:p.s, height:p.s, borderRadius:"50%", background:p.c, boxShadow:`0 0 ${p.s*2}px ${p.c}`, animation:`gDrift ${p.dur} ease-in-out ${p.d} infinite`, opacity:0.8 }} />
    ))}

    {/* ── GLOBE ── */}
    <div style={{ position:"absolute", top:"50%", left:"45%", transform:"translate(-50%,-50%)", width:140, height:140, perspective:600 }}>

      {/* Globe sphere */}
      <div style={{ width:140, height:140, borderRadius:"50%", background:"linear-gradient(135deg,#0ea5e9 0%,#6366f1 50%,#7c3aed 100%)", boxShadow:"0 0 40px rgba(14,165,233,0.5), inset -20px -20px 40px rgba(0,0,0,0.2)", position:"relative", overflow:"hidden", animation:"hFloat 4s ease-in-out infinite" }}>
        {/* Latitude lines */}
        {[30,50,70,90,110].map((top,i) => (
          <div key={i} style={{ position:"absolute", left:0, right:0, top:top, height:1, background:"rgba(255,255,255,0.2)", borderRadius:1 }} />
        ))}
        {/* Longitude curves (fake with divs) */}
        {[20,50,80,110].map((left,i) => (
          <div key={i} style={{ position:"absolute", top:0, bottom:0, left:left, width:1, background:"rgba(255,255,255,0.15)", borderRadius:1 }} />
        ))}
        {/* Shine */}
        <div style={{ position:"absolute", top:12, left:16, width:40, height:20, background:"rgba(255,255,255,0.35)", borderRadius:20, transform:"rotate(-30deg)" }} />
        <div style={{ position:"absolute", top:20, left:22, width:18, height:8, background:"rgba(255,255,255,0.2)", borderRadius:10, transform:"rotate(-30deg)" }} />
      </div>

      {/* Orbit ring 1 */}
      <div style={{ position:"absolute", top:-20, left:-20, width:180, height:180, borderRadius:"50%", border:"2px solid rgba(14,165,233,0.4)", animation:"gRing1 6s linear infinite", boxShadow:"0 0 12px rgba(14,165,233,0.2)" }}>
        <div style={{ position:"absolute", top:-5, left:"50%", width:10, height:10, borderRadius:"50%", background:"#38bdf8", boxShadow:"0 0 10px #38bdf8", animation:"gNodePulse 1.5s ease-in-out infinite", color:"#38bdf8" }} />
      </div>

      {/* Orbit ring 2 */}
      <div style={{ position:"absolute", top:-30, left:-30, width:200, height:200, borderRadius:"50%", border:"2px solid rgba(168,85,247,0.35)", animation:"gRing2 9s linear infinite", boxShadow:"0 0 12px rgba(168,85,247,0.15)" }}>
        <div style={{ position:"absolute", bottom:-5, right:"30%", width:8, height:8, borderRadius:"50%", background:"#a78bfa", boxShadow:"0 0 10px #a78bfa", animation:"gNodePulse 2s ease-in-out 0.5s infinite", color:"#a78bfa" }} />
      </div>

      {/* Orbit ring 3 */}
      <div style={{ position:"absolute", top:-16, left:-16, width:172, height:172, borderRadius:"50%", border:"1.5px dashed rgba(52,211,153,0.4)", animation:"gRing3 12s linear infinite" }}>
        <div style={{ position:"absolute", top:"20%", right:-5, width:9, height:9, borderRadius:"50%", background:"#34d399", boxShadow:"0 0 10px #34d399", animation:"gNodePulse 1.8s ease-in-out 1s infinite", color:"#34d399" }} />
      </div>
    </div>

    {/* ── SEARCH BEAM shooting out ── */}
    <div style={{ position:"absolute", top:"50%", left:"45%", height:3, width:90, background:"linear-gradient(90deg,rgba(14,165,233,0.8),rgba(99,102,241,0))", borderRadius:2, transformOrigin:"left center", animation:"gBeam 3s ease-in-out 0.5s infinite", marginTop:-1 }} />

    {/* ── RESULT CARDS ── */}
    {[
      { top:80,  right:20, w:130, delay:"0.4s", lines:["#bae6fd","#e0e7ff","#bae6fd"], icon:"🌐", label:"Web Result" },
      { top:190, right:10, w:140, delay:"1.0s", lines:["#e0e7ff","#bae6fd","#e0e7ff"], icon:"📄", label:"Source Found" },
      { top:295, right:25, w:120, delay:"1.6s", lines:["#bae6fd","#e0e7ff"],            icon:"✓",  label:"Verified" },
    ].map((c,i) => (
      <div key={i} style={{
        position:"absolute", top:c.top, right:c.right, width:c.w,
        background:"white", borderRadius:12,
        boxShadow:"0 10px 28px rgba(14,165,233,0.15), 0 3px 8px rgba(0,0,0,0.06)",
        padding:"10px 12px",
        animation:`gCard 0.6s cubic-bezier(.22,.68,0,1.2) ${c.delay} both, hFloat2 ${3.5+i*0.6}s ease-in-out ${parseFloat(c.delay)+0.6}s infinite`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
          <span style={{ fontSize:13 }}>{c.icon}</span>
          <span style={{ fontSize:10, fontWeight:700, color:"#0ea5e9" }}>{c.label}</span>
          <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"gNodePulse 1.5s ease-in-out infinite", color:"#10b981" }} />
        </div>
        {c.lines.map((cl,j) => (
          <div key={j} style={{ height:5, background:cl, borderRadius:3, marginBottom:4, width:j%2===0?"90%":"65%" }} />
        ))}
      </div>
    ))}

    {/* Connection lines SVG */}
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
      <line x1="195" y1="190" x2="270" y2="110" stroke="rgba(14,165,233,0.25)" strokeWidth="1.5" strokeDasharray="6 4"/>
      <line x1="195" y1="190" x2="280" y2="215" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" strokeDasharray="6 4"/>
      <line x1="195" y1="190" x2="265" y2="315" stroke="rgba(52,211,153,0.25)" strokeWidth="1.5" strokeDasharray="6 4"/>
    </svg>

    {/* Sparkles */}
    {[
      {x:240,y:70,  s:8, d:"0s"},
      {x:90, y:250, s:6, d:"0.9s"},
      {x:300,y:270, s:7, d:"1.6s"},
    ].map((s,i) => (
      <div key={i} style={{ position:"absolute", left:s.x, top:s.y, width:s.s, height:s.s, background:"radial-gradient(circle,#38bdf8,#6366f1)", borderRadius:"50%", boxShadow:`0 0 ${s.s}px #38bdf8`, animation:`hSpark ${2+i*0.4}s ease-in-out ${s.d} infinite` }} />
    ))}

  </div>
);


/* ═══════════════════════════════════════════════════════════════
   HOME
   ═══════════════════════════════════════════════════════════════ */
function Home() {
  const [openModal, setOpenModal] = useState(false);
  const navigate   = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleProtectedNav = (path) => {
    if (!isLoggedIn) {
      navigate("/signin", { state: { from: path, message: "Please sign in to continue." } });
    } else {
      navigate(path);
    }
  };

  const sectionStyle = {
    position:"relative", minHeight:"calc(100vh - 80px)",
    display:"flex", justifyContent:"center", alignItems:"center",
    padding:"20px 0", overflow:"hidden",
  };

  const cardStyle = {
    position:"relative", display:"flex", alignItems:"center",
    width:1050, minHeight:480,
    borderRadius:28,
    boxShadow:"0px 25px 80px rgba(0,0,0,0.12)",
    overflow:"hidden",
  };

  return (
    <div>
      <Navbar openUploadModal={() => setOpenModal(true)} />

      {/* ═══════════════════════════════════════════════
          HERO CHILD 1 — PRISM intro
          ═══════════════════════════════════════════════ */}
      <div className="hero-parent">
        <div className="hero-glow" />
        <div className="hero-child" style={{ minHeight:480 }}>
          <div className="hero-left" style={{ padding:"55px 50px" }}>

            <h1 className="prism-title">
              <span className="gradient-text prism-container">
                PRISM
                <img src="/logo1.png" alt="logo" className="prism-rotate" />
              </span>
            </h1>

            <h2 className="hero-heading">
              <span className="word w2">Boost</span>
              <span className="word w3">Your</span>
              <span className="word gradient-text w4">RFP Response</span>
              <br />
              <span className="word w5">Simplify</span>
              <span className="word w6">Your</span>
              <span className="word w7">Work</span>
              <span className="word w8">With</span>
              <br />
              <span className="word w9">PRISM</span>
            </h2>

            <p className="hero-description">
              Profinch RFP Response Intelligence &amp; Solution Manager.
            </p>

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          HERO CHILD 2 — Search & Fill RFP
          ═══════════════════════════════════════════════ */}
      <div style={{ ...sectionStyle, background:"#f5f0ff" }}>
        <div style={{ position:"absolute", width:850, height:850, background:"radial-gradient(circle,rgba(124,58,237,0.2) 0%,rgba(99,102,241,0.12) 40%,transparent 70%)", filter:"blur(80px)", pointerEvents:"none" }} />

        <div style={{ ...cardStyle, background:"rgba(255,255,255,0.85)", backdropFilter:"blur(16px)" }}>

          {/* Left — text content */}
          <div style={{ flex:1, padding:"50px 48px", display:"flex", flexDirection:"column", justifyContent:"center" }}>

            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 13px", borderRadius:20, background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.2)", width:"fit-content", marginBottom:18 }}>
              <FiZap size={13} color="#7c3aed" />
              <span style={{ fontSize:12, fontWeight:700, color:"#7c3aed" }}>AI-Powered Knowledge Base</span>
            </div>

            <h2 style={{ fontSize:30, fontWeight:800, color:"#111827", margin:"0 0 14px", lineHeight:1.2 }}>
              Search &amp; Fill RFPs<br />
              <span style={{ background:"linear-gradient(90deg,#7c3aed,#6366f1,#ec4899)", WebkitBackgroundClip:"text", backgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Instantly
              </span>
            </h2>

            <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.75, margin:"0 0 22px", maxWidth:360 }}>
              Leverage your organisation's RFP knowledge base to find precise answers
              instantly, or let PRISM auto-fill an entire RFP in one go.
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:28 }}>
              {[
                { icon:<FiSearch size={13}/>, text:"Ask any RFP question — get the best matching answer from your knowledge base" },
                { icon:<FiFileText size={13}/>, text:"Upload a batch Excel and auto-fill all answers in seconds" },
                { icon:<FiLayers size={13}/>, text:"Filter by RFP Level Tag and Module for precise, contextual results" },
              ].map(({ icon, text }, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:"rgba(124,58,237,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#7c3aed", marginTop:1 }}>
                    {icon}
                  </div>
                  <p style={{ fontSize:13, color:"#4b5563", margin:0, lineHeight:1.65 }}>{text}</p>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:12 }}>
              <button className="btn-primary" onClick={() => handleProtectedNav("/search")} style={{ gap:8, display:"flex", alignItems:"center" }}>
                <FiSearch size={14}/> Search Question
              </button>
              <button className="btn-outline" onClick={() => handleProtectedNav("/batch")} style={{ gap:8, display:"flex", alignItems:"center" }}>
                <FiFileText size={14}/> Fill RFP
              </button>
            </div>

          </div>

          {/* Right — CSS Illustration */}
          <div style={{ width:460, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 10px 20px 0" }}>
            <SearchIllustration />
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          HERO CHILD 3 — Web Search
          ═══════════════════════════════════════════════ */}
      <div style={{ ...sectionStyle, background:"#eef6ff" }}>
        <div style={{ position:"absolute", width:850, height:850, background:"radial-gradient(circle,rgba(14,165,233,0.2) 0%,rgba(99,102,241,0.12) 40%,transparent 70%)", filter:"blur(80px)", pointerEvents:"none" }} />

        <div style={{ ...cardStyle, background:"rgba(255,255,255,0.85)", backdropFilter:"blur(16px)" }}>

          {/* Left — CSS Illustration */}
          <div style={{ width:460, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 0 20px 10px" }}>
            <GlobeIllustration />
          </div>

          {/* Right — text content */}
          <div style={{ flex:1, padding:"50px 48px", display:"flex", flexDirection:"column", justifyContent:"center" }}>

            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 13px", borderRadius:20, background:"rgba(14,165,233,0.1)", border:"1px solid rgba(14,165,233,0.25)", width:"fit-content", marginBottom:18 }}>
              <FiGlobe size={13} color="#0ea5e9" />
              <span style={{ fontSize:12, fontWeight:700, color:"#0ea5e9" }}>Live Web Intelligence</span>
            </div>

            <h2 style={{ fontSize:30, fontWeight:800, color:"#111827", margin:"0 0 14px", lineHeight:1.2 }}>
              Can't Find It in the<br />
              <span style={{ background:"linear-gradient(90deg,#0ea5e9,#6366f1)", WebkitBackgroundClip:"text", backgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Knowledge Base?
              </span>
            </h2>

            <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.75, margin:"0 0 22px", maxWidth:380 }}>
              When your internal knowledge base doesn't have the answer,
              PRISM Web Search reaches out to the live internet to find
              the most relevant and up-to-date information for your RFP query.
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:28 }}>
              {[
                "Search the web for answers not found in your knowledge base",
                "Get real-time responses from trusted web sources",
                "Ideal for new products, market data, or emerging technologies",
              ].map((text, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <FiCheckCircle size={16} color="#0ea5e9" style={{ flexShrink:0, marginTop:3 }} />
                  <p style={{ fontSize:13, color:"#4b5563", margin:0, lineHeight:1.65 }}>{text}</p>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <button
                className="btn-primary"
                style={{ background:"linear-gradient(90deg,#0ea5e9,#6366f1)", boxShadow:"0px 8px 20px rgba(14,165,233,0.35)", gap:8, display:"flex", alignItems:"center" }}
                onClick={() => handleProtectedNav("/websearch")}
              >
                <FiGlobe size={14}/> Try Web Search
              </button>
              <span style={{ fontSize:12, color:"#9ca3af", fontStyle:"italic" }}>
                Available in Search Question module
              </span>
            </div>

          </div>
        </div>
      </div>

      <UploadModal open={openModal} handleClose={() => setOpenModal(false)} />
    </div>
  );
}

export default Home;
