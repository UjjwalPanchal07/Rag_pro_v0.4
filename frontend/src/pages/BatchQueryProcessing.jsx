import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import UploadModal from "../components/UploadModal";
import { batchQuery } from "../services/api";
import "../App.css";

function BatchQueryProcessing() {

  const [file, setFile]                   = useState(null);
  const [openUpload, setOpenUpload]       = useState(false);
  const [resultsReady, setResultsReady]   = useState(false);
  const [resultsBlob, setResultsBlob]     = useState(null);
  const [loading, setLoading]             = useState(false);
  const fileInputRef                      = useRef(null);

  const handleFilePick = (e) => {
    const picked = e.target.files[0];
    if (!picked) return;
    if (!picked.name.endsWith(".xlsx")) {
      alert("Only .xlsx files are supported");
      return;
    }
    setFile(picked);
    setResultsReady(false);
    setResultsBlob(null);
  };

  const handleProcess = async () => {
    if (!file) { alert("Please select an Excel file first"); return; }

    setLoading(true);
    setResultsReady(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await batchQuery(formData);

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      setResultsBlob(blob);
      setResultsReady(true);
    } catch (error) {
      console.error(error);
      alert("Batch processing failed. Please check your Excel format.");
    }

    setLoading(false);
  };

  const handleDownload = () => {
    if (!resultsBlob) return;
    const url = window.URL.createObjectURL(resultsBlob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = "rfp_answers.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // Column definitions
  const columns = [
    { label: "No.",           note: ""             },
    { label: "Question",      note: ""             },
    { label: "RFP Level Tag", note: ""             },
    { label: "Module",        note: ""             },
    { label: "Answer",        note: "← auto-filled" },
  ];

  return (
    <div>
      <Navbar openUploadModal={() => setOpenUpload(true)} />

      <div className="hero-parent">
        <div className="hero-glow"></div>

        <div className="hero-child batch-card">

          <h2 className="search-title">Fill RFP (Batch Processing)</h2>
          <p className="search-subtitle">
            Upload your RFP Excel — the Answer column will be filled automatically for each row.
          </p>

          {/* ── Excel format hint ── */}
          <div style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(99,102,241,0.07)",
            border: "1px solid rgba(99,102,241,0.2)",
            marginBottom: "16px",
          }}>
            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#374151", fontWeight: 600 }}>
              Expected Excel columns:
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {columns.map(({ label, note }) => (
                <span key={label} style={{
                  padding: "3px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: note ? "rgba(99,102,241,0.15)" : "#f1f5f9",
                  color:      note ? "#6366F1"               : "#475569",
                  border:     note ? "1px solid rgba(99,102,241,0.3)" : "1px solid #e2e8f0",
                }}>
                  {label} {note}
                </span>
              ))}
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#6b7280" }}>
              Leave the Answer column empty — it will be filled by searching the RFP knowledge base.
              Each row can have a different RFP Level Tag / Module combination.
            </p>
          </div>

          {/* ── File picker ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              style={{ display: "none" }}
              onChange={handleFilePick}
            />
            <button
              className="search-button"
              onClick={() => fileInputRef.current.click()}
              style={{ whiteSpace: "nowrap" }}
            >
              📂 Select Excel File
            </button>

            {file && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "rgba(99,102,241,0.07)",
                border: "1px solid rgba(99,102,241,0.2)",
                flex: 1,
                minWidth: 0,
              }}>
                <span style={{ fontSize: "18px" }}>📄</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: "13px", fontWeight: 600, color: "#374151",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {file.name}
                  </p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => { setFile(null); setResultsReady(false); }}
                  style={{
                    marginLeft: "auto", background: "none", border: "none",
                    cursor: "pointer", color: "#9ca3af", fontSize: "16px", padding: "2px 6px",
                  }}
                >✕</button>
              </div>
            )}
          </div>

          {/* ── Process button ── */}
          <button
            className="search-button"
            onClick={handleProcess}
            disabled={loading || !file}
            style={{ opacity: (!file || loading) ? 0.6 : 1, cursor: (!file || loading) ? "not-allowed" : "pointer" }}
          >
            {loading ? "Processing ⏳" : "▶ Process Questions"}
          </button>

          {/* ── Loading indicator ── */}
          {loading && (
            <div style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(99,102,241,0.07)",
              border: "1px solid rgba(99,102,241,0.2)",
              fontSize: "13px",
              color: "#6366F1",
              fontWeight: 500,
            }}>
              🤖 Searching the RFP knowledge base for each question... this may take a moment.
            </div>
          )}

          {/* ── Success + download ── */}
          {resultsReady && (
            <div style={{
              padding: "16px",
              borderRadius: "10px",
              background: "rgba(16,185,129,0.07)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}>
              <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#059669", fontWeight: 600 }}>
                ✔ Answers generated successfully
              </p>
              <button className="download-button" onClick={handleDownload}>
                ⬇ Download Results
              </button>
            </div>
          )}

        </div>
      </div>

      <UploadModal
        open={openUpload}
        handleClose={() => setOpenUpload(false)}
      />
    </div>
  );
}

export default BatchQueryProcessing;
