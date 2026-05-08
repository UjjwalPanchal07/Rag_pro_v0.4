import { useState } from "react";
import Navbar from "../components/Navbar";
import { FiSearch } from "react-icons/fi";
import { searchByModule } from "../services/api";
import UploadModal from "../components/UploadModal";
import "../App.css";

const PRISM_MATRIX = {
  "Transaction Banking": [
    "Payments","Trade Finance","Liquidity Management","Virtual Accounts",
    "Corporate Lending","Limits and Collaterals",
    "Trade Finance Process Management","Lending Process Management",
  ],
  "Core Banking": [
    "Current and Saving Account","Retail Lending","Payments",
    "Branch","Term Deposits","FCUBS",
  ],
  "Digital Banking": ["Web Channel","Mobile Banking","API"],
  "Islamic Banking": [
    "Islamic Accounts","Islamic Deposits",
    "Islamic Leasing and Lending","Asset Management",
  ],
};

const RFP_LEVEL_TAGS = Object.keys(PRISM_MATRIX);

function SearchQuestion() {
  const [question, setQuestion]     = useState("");
  const [rfpLevelTag, setRfpLevelTag] = useState("");
  const [module, setModule]         = useState("");
  const [answer, setAnswer]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  const availableModules = rfpLevelTag ? PRISM_MATRIX[rfpLevelTag] : [];

  const handleTagChange = (e) => {
    setRfpLevelTag(e.target.value);
    setModule("");
    setAnswer("");
  };

  const handleSearch = async () => {
    if (!rfpLevelTag) { alert("Please select an RFP Level Tag"); return; }
    if (!module)      { alert("Please select a Module");         return; }
    if (!question.trim()) { alert("Please enter a question");    return; }

    setLoading(true);
    setAnswer("");

    try {
      const res = await searchByModule(rfpLevelTag, module, question);
      if (res?.data?.answer) {
        setAnswer(res.data.answer);
      } else {
        setAnswer("No Answer Found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setAnswer("Error retrieving answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar openUploadModal={() => setOpenUpload(true)} />

      <div className="hero-parent">
        <div className="hero-glow"></div>

        <div className="search-card">
          <h2 className="search-title">Search Question</h2>
          <p className="search-subtitle">
            Select a tag and module, then ask a question — searches all RFPs under that module
          </p>

          <input
            type="text"
            placeholder="Enter your question..."
            className="question-input"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
          />

          <div className="search-row">
            {/* RFP Level Tag */}
            <select
              className="rfp-select"
              value={rfpLevelTag}
              onChange={handleTagChange}
            >
              <option value="">Select RFP Tag</option>
              {RFP_LEVEL_TAGS.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>

            {/* Module — shown only when tag is chosen */}
            {rfpLevelTag && (
              <select
                className="rfp-select"
                value={module}
                onChange={e => { setModule(e.target.value); setAnswer(""); }}
              >
                <option value="">Select Module</option>
                {availableModules.map(mod => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
            )}

            <button className="search-button" onClick={handleSearch}>
              <FiSearch /> Search
            </button>
          </div>

          {/* Info badge */}
          {rfpLevelTag && module && (
            <div style={{
              padding:"8px 14px",
              borderRadius:"8px",
              background:"rgba(99,102,241,0.07)",
              border:"1px solid rgba(99,102,241,0.2)",
              marginBottom:"16px",
              fontSize:"13px",
              color:"#374151",
            }}>
              🔍 Searching all RFPs under&nbsp;
              <strong style={{color:"#6366F1"}}>{rfpLevelTag}</strong>
              &nbsp;›&nbsp;
              <strong style={{color:"#6366F1"}}>{module}</strong>
              &nbsp;· Latest uploads searched first
            </div>
          )}

          <div className="answer-box">
            {loading && <p>🤖 Searching across RFP documents...</p>}

            {!loading && answer && (
              <>
                <div className="question-label">Question</div>
                <div className="question-text">{question}</div>
                <div className="answer-label">Answer</div>
                <div className="answer-text">{answer}</div>
              </>
            )}

            {!loading && !answer && (
              <p className="answer-hint">
                Select a tag and module, then type your question and hit Search.
              </p>
            )}
          </div>
        </div>
      </div>

      <UploadModal open={openUpload} handleClose={() => setOpenUpload(false)} />
    </div>
  );
}

export default SearchQuestion;
