import { useState } from "react";
import Navbar from "../components/Navbar";
import UploadModal from "../components/UploadModal";
import { webSearch, translateAnswer } from "../services/api";
import { FiGlobe, FiSearch, FiLink, FiCopy, FiCheck, FiAlertCircle } from "react-icons/fi";
import "../App.css";

// Languages matching backend SUPPORTED_LANGUAGES
const LANGUAGES = [
  { code: "en", name: "English",            flag: "🇬🇧" },
  { code: "hi", name: "Hindi",              flag: "🇮🇳" },
  { code: "ar", name: "Arabic",             flag: "🇸🇦" },
  { code: "fr", name: "French",             flag: "🇫🇷" },
  { code: "de", name: "German",             flag: "🇩🇪" },
  { code: "es", name: "Spanish",            flag: "🇪🇸" },
  { code: "ja", name: "Japanese",           flag: "🇯🇵" },
  { code: "zh", name: "Chinese (Simplified)", flag: "🇨🇳" },
  { code: "pt", name: "Portuguese",         flag: "🇵🇹" },
  { code: "it", name: "Italian",            flag: "🇮🇹" },
  { code: "ko", name: "Korean",             flag: "🇰🇷" },
  { code: "ru", name: "Russian",            flag: "🇷🇺" },
];

function WebSearch() {
  const [url, setUrl]               = useState("");
  const [question, setQuestion]     = useState("");
  const [answer, setAnswer]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError]           = useState("");
  const [urlError, setUrlError]     = useState("");
  const [activeLang, setActiveLang] = useState("en");
  const [originalAnswer, setOriginalAnswer] = useState("");
  const [copied, setCopied]         = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  // Validate Oracle URL on blur
  const handleUrlBlur = () => {
    if (!url) { setUrlError(""); return; }
    if (!url.includes("docs.oracle.com") && !url.includes("oracle.com")) {
      setUrlError("Only Oracle documentation URLs are allowed (docs.oracle.com)");
    } else {
      setUrlError("");
    }
  };

  const handleSearch = async () => {
    setError(""); setUrlError("");
    if (!url.trim())      { setUrlError("Please enter an Oracle documentation URL"); return; }
    if (!question.trim()) { setError("Please enter a question"); return; }
    if (!url.includes("oracle.com")) { setUrlError("Only Oracle documentation URLs are allowed"); return; }

    setLoading(true); setAnswer(""); setOriginalAnswer(""); setActiveLang("en");

    try {
      const res = await webSearch(url, question, "en");
      const ans = res.data.answer;
      setAnswer(ans);
      setOriginalAnswer(ans);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (detail) {
        if (typeof detail === "string") setError(detail);
        else if (Array.isArray(detail)) setError(detail.map(d => d.msg).join(", "));
        else setError("Search failed. Please try again.");
      } else {
        setError("Search failed. Please check the URL and try again.");
      }
    }
    setLoading(false);
  };

  const handleTranslate = async (langCode) => {
    if (langCode === activeLang) return;
    if (!answer && !originalAnswer) return;

    setTranslating(true);
    setActiveLang(langCode);

    try {
      if (langCode === "en") {
        // Restore original English answer
        setAnswer(originalAnswer);
      } else {
        const res = await translateAnswer(originalAnswer, langCode);
        setAnswer(res.data.translated_text);
      }
    } catch (err) {
      setError("Translation failed. Please try again.");
      setActiveLang("en");
      setAnswer(originalAnswer);
    }
    setTranslating(false);
  };

  const handleCopy = async () => {
    if (!answer) return;
    await navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Navbar openUploadModal={() => setOpenUpload(true)} />

      <div className="hero-parent">
        <div className="hero-glow" style={{ background: "radial-gradient(circle,rgba(14,165,233,0.3) 0%,rgba(99,102,241,0.2) 40%,rgba(255,255,255,0) 70%)" }} />

        <div className="search-card" style={{ maxWidth: 800 }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#0ea5e9,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiGlobe size={18} color="white" />
            </div>
            <h2 className="search-title" style={{ margin: 0 }}>Web Search</h2>
          </div>

          <p className="search-subtitle" style={{ marginBottom: 24 }}>
            Can't find it in the knowledge base? Paste an Oracle documentation URL and ask your question — PRISM will extract and summarise the answer for you.
          </p>

          {/* How it works banner */}
          <div style={{ display: "flex", gap: 0, marginBottom: 22, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(14,165,233,0.2)" }}>
            {[
              { n: "1", label: "Paste Oracle docs URL" },
              { n: "2", label: "Ask your question" },
              { n: "3", label: "Get AI-summarised answer" },
              { n: "4", label: "Translate if needed" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: "10px 14px", background: i % 2 === 0 ? "rgba(14,165,233,0.05)" : "rgba(99,102,241,0.05)", borderRight: i < 3 ? "1px solid rgba(14,165,233,0.15)" : "none", textAlign: "center" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 5px" }}>{s.n}</div>
                <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* URL input */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Oracle Documentation URL
            </label>
            <div style={{ position: "relative" }}>
              <FiLink style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
              <input
                type="text"
                value={url}
                onChange={e => { setUrl(e.target.value); setUrlError(""); }}
                onBlur={handleUrlBlur}
                onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
                placeholder="https://docs.oracle.com/en/industries/financial-services/..."
                className="question-input"
                style={{ paddingLeft: 38, marginBottom: 0, borderColor: urlError ? "#ef4444" : "" }}
              />
            </div>
            {urlError && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 12, color: "#ef4444" }}>
                <FiAlertCircle size={13} /> {urlError}
              </div>
            )}
            <p style={{ margin: "5px 0 0", fontSize: 12, color: "#9ca3af" }}>
              Only Oracle documentation pages are accepted (docs.oracle.com)
            </p>
          </div>

          {/* Question input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Your Question
            </label>
            <input
              type="text"
              value={question}
              onChange={e => { setQuestion(e.target.value); setError(""); }}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
              placeholder="e.g. What payment rails are supported?"
              className="question-input"
              style={{ marginBottom: 0 }}
            />
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13, marginBottom: 14 }}>
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          {/* Search button */}
          <button
            className="search-button"
            onClick={handleSearch}
            disabled={loading}
            style={{ background: "linear-gradient(90deg,#0ea5e9,#6366f1)", boxShadow: "0px 8px 20px rgba(14,165,233,0.35)", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer", gap: 8 }}
          >
            <FiSearch size={15} />
            {loading ? "Searching & Summarising..." : "Search Web"}
          </button>

          {/* Loading state */}
          {loading && (
            <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 10, background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.2)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Fetching Oracle documentation page...", done: true },
                  { label: "Extracting and chunking content...",    done: true },
                  { label: "Finding most relevant sections...",      done: false },
                  { label: "Summarising with Claude Haiku AI...",    done: false },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: s.done ? "#0ea5e9" : "#9ca3af" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.done ? "#0ea5e9" : "#d1d5db", animation: !s.done ? "hPulse 1.5s ease-in-out infinite" : "none" }} />
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer section */}
          {!loading && answer && (
            <div style={{ marginTop: 20 }}>

              {/* Answer card */}
              <div className="answer-box" style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="answer-label" style={{ margin: 0 }}>Answer</div>
                    {activeLang !== "en" && (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,0.2)", fontWeight: 600 }}>
                        {LANGUAGES.find(l => l.code === activeLang)?.flag} {LANGUAGES.find(l => l.code === activeLang)?.name}
                      </span>
                    )}
                    {translating && (
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>Translating...</span>
                    )}
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={handleCopy}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", fontSize: 12, color: copied ? "#059669" : "#6b7280", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    {copied ? <><FiCheck size={13} /> Copied</> : <><FiCopy size={13} /> Copy</>}
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                  <div className="question-label" style={{ marginBottom: 0, flexShrink: 0 }}>Q</div>
                  <div className="question-text" style={{ margin: 0, flex: 1 }}>{question}</div>
                </div>

                <div className="answer-text" style={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>
                  {translating ? (
                    <div style={{ color: "#9ca3af", fontStyle: "italic" }}>Translating answer...</div>
                  ) : answer}
                </div>
              </div>

              {/* Translation section */}
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 10px" }}>
                  🌐 Translate Answer
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleTranslate(lang.code)}
                      disabled={translating}
                      style={{
                        padding: "6px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        cursor: translating ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        border: activeLang === lang.code ? "2px solid #0ea5e9" : "1px solid #e5e7eb",
                        background: activeLang === lang.code ? "rgba(14,165,233,0.1)" : "white",
                        color: activeLang === lang.code ? "#0ea5e9" : "#6b7280",
                        opacity: translating && activeLang !== lang.code ? 0.5 : 1,
                      }}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  ))}
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9ca3af" }}>
                  Click a language to translate the answer. Click English to restore the original.
                </p>
              </div>

            </div>
          )}

          {/* Empty state */}
          {!loading && !answer && !error && (
            <div style={{ marginTop: 16 }}>
              <p className="answer-hint">
                Paste an Oracle docs URL and enter your question to get an AI-summarised answer.
              </p>
            </div>
          )}

        </div>
      </div>

      <UploadModal open={openUpload} handleClose={() => setOpenUpload(false)} />
    </div>
  );
}

export default WebSearch;
