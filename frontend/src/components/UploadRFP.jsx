import React, { useCallback, useState } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";

import { useDropzone } from "react-dropzone";
import { uploadRFP } from "../services/api";

const UploadRFP = ({ onFileSelect }) => {
  const [file, setFile]                     = useState(null);
  const [loading, setLoading]               = useState(false);
  const [progress, setProgress]             = useState(0);
  const [uploadSuccess, setUploadSuccess]   = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [summary, setSummary]               = useState(null);
  const [error, setError]                   = useState("");

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) { setError("Only .xlsx files are supported"); return; }
    setError("");
    setSummary(null);
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    maxFiles: 1,
    accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
  });

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setUploadSuccess(false);
    setSummary(null);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadRFP(formData, (e) => {
        if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
      });

      const data = res.data;
      setSummary({ by_category: data.by_category, skipped: data.skipped });
      setSuccessMessage(
        `"${file.name}" uploaded — ${data.total_questions} Q&A pairs stored`
      );
      setUploadSuccess(true);
      if (onFileSelect) onFileSelect(file);
      setFile(null);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || "Upload failed. Please check your Excel format and try again.");
    }

    setLoading(false);
  };

  // Column definitions for the format hint
  const columns = [
    { label: "No.",           highlight: false },
    { label: "Question",      highlight: true  },
    { label: "RFP Level Tag", highlight: false },
    { label: "Module",        highlight: false },
    { label: "Answer",        highlight: true  },
  ];

  return (
    <Box sx={{
      width: 480,
      padding: "28px 32px",
      borderRadius: 3,
      background: "linear-gradient(135deg,rgba(99,102,241,0.08) 0%,rgba(147,112,219,0.08) 100%)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(99,102,241,0.1)",
      maxHeight: "85vh",
      overflow: "auto",
      "&::-webkit-scrollbar": { width: "6px" },
      "&::-webkit-scrollbar-track": { background: "rgba(99,102,241,0.05)" },
      "&::-webkit-scrollbar-thumb": { background: "rgba(99,102,241,0.3)", borderRadius: "4px" },
    }}>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Upload RFP</Typography>
      <Typography variant="body2" sx={{ color: "gray", mb: 2.5 }}>
        Upload an Excel file with Q&amp;A pairs. Each row is stored under its RFP Level Tag → Module.
      </Typography>

      {/* ── Expected format hint ── */}
      <Box sx={{
        p: 1.5, mb: 2.5, borderRadius: 2,
        background: "rgba(99,102,241,0.06)",
        border: "1px solid rgba(99,102,241,0.15)",
      }}>
        <Typography variant="caption" sx={{ color: "#6366F1", fontWeight: 700, display: "block", mb: 0.8 }}>
          Expected Excel columns:
        </Typography>
        <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
          {columns.map(({ label, highlight }) => (
            <Box key={label} sx={{
              px: 1.2, py: 0.4, borderRadius: "6px", fontSize: "12px", fontWeight: 600,
              background: highlight ? "rgba(99,102,241,0.15)" : "#f1f5f9",
              color:      highlight ? "#6366F1"               : "#475569",
              border:     highlight ? "1px solid rgba(99,102,241,0.3)" : "1px solid #e2e8f0",
            }}>
              {label}
            </Box>
          ))}
        </Box>
        <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mt: 0.8 }}>
          Rows with an empty Answer are skipped. Each row can have a different Tag / Module.
        </Typography>
      </Box>

      {/* ── Drop zone ── */}
      <Box {...getRootProps()} sx={{
        border: "2px dashed #cbd5e1",
        borderRadius: 2,
        padding: 3,
        textAlign: "center",
        backgroundColor: "#fafafa",
        cursor: "pointer",
        "&:hover": { borderColor: "#6366F1", backgroundColor: "rgba(99,102,241,0.03)" },
        transition: "all 0.2s ease",
      }}>
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 40, color: "#64748b" }} />
        <Typography sx={{ mt: 1, fontSize: "14px" }}>Choose a file or drag & drop it here</Typography>
        <Typography variant="body2" sx={{ color: "gray", mb: 1.5, fontSize: "12px" }}>
          Only .xlsx supported
        </Typography>
        <Button variant="outlined" onClick={open} size="small" sx={{
          textTransform: "none", borderRadius: "8px",
          borderColor: "#6366F1", color: "#6366F1",
          "&:hover": { backgroundColor: "rgba(99,102,241,0.08)" },
        }}>
          Browse File
        </Button>
      </Box>

      {/* ── Selected file ── */}
      {file && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#374151" }}>
            Selected File
          </Typography>
          <List dense>
            <ListItem
              secondaryAction={
                <IconButton edge="end" onClick={() => setFile(null)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
              sx={{ borderRadius: 2, background: "white", border: "1px solid #e5e7eb" }}
            >
              <ListItemText
                primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{file.name}</Typography>}
                secondary={`${(file.size / 1024).toFixed(2)} KB`}
              />
            </ListItem>
          </List>
        </Box>
      )}

      {/* ── Upload progress ── */}
      {loading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} sx={{
            height: 8, borderRadius: 4,
            backgroundColor: "rgba(99,102,241,0.15)",
            "& .MuiLinearProgress-bar": { backgroundColor: "#6366F1" },
          }} />
          <Typography variant="body2" sx={{ mt: 1, textAlign: "center", color: "#6366F1" }}>
            Uploading... {Math.round(progress)}%
          </Typography>
        </Box>
      )}

      {/* ── Category summary after upload ── */}
      {summary && (
        <Box sx={{
          mt: 2, p: 1.5, borderRadius: 2,
          background: "rgba(16,185,129,0.07)",
          border: "1px solid rgba(16,185,129,0.25)",
        }}>
          <Typography variant="caption" sx={{ color: "#059669", fontWeight: 700, display: "block", mb: 0.8 }}>
            ✔ Q&amp;A pairs stored by category:
          </Typography>
          {Object.entries(summary.by_category).map(([cat, count]) => (
            <Box key={cat} sx={{ display: "flex", justifyContent: "space-between", mb: 0.3 }}>
              <Typography variant="caption" sx={{ color: "#374151" }}>{cat}</Typography>
              <Typography variant="caption" sx={{ color: "#6366F1", fontWeight: 600 }}>
                {count} pairs
              </Typography>
            </Box>
          ))}
          {summary.skipped > 0 && (
            <Typography variant="caption" sx={{ color: "#9ca3af", display: "block", mt: 0.5 }}>
              {summary.skipped} row{summary.skipped > 1 ? "s" : ""} skipped (empty answer)
            </Typography>
          )}
        </Box>
      )}

      {/* ── Error ── */}
      {error && (
        <Typography variant="body2" sx={{ mt: 1.5, color: "#ef4444", fontSize: "13px" }}>
          ⚠ {error}
        </Typography>
      )}

      {/* ── Upload button ── */}
      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          startIcon={loading
            ? <CircularProgress size={18} sx={{ color: "white" }} />
            : <FileUploadIcon />
          }
          onClick={handleUpload}
          disabled={!file || loading}
          fullWidth
          sx={{
            backgroundColor: "#6366F1",
            borderRadius: "8px",
            textTransform: "none",
            py: 1.3,
            fontWeight: 600,
            opacity: (!file || loading) ? 0.6 : 1,
            "&:hover": { backgroundColor: "#4f46e5" },
          }}
        >
          {loading ? "Uploading..." : "Upload RFP"}
        </Button>
      </Box>

      <Snackbar
        open={uploadSuccess}
        autoHideDuration={4000}
        onClose={() => setUploadSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setUploadSuccess(false)} severity="success" sx={{ borderRadius: 2 }}>
          {successMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default UploadRFP;
