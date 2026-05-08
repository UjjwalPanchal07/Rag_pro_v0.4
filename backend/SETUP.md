# Backend Setup Guide

## Step 1 — Create and activate venv

```bash
cd backend

# Create venv
python -m venv venv

# Activate — Windows
venv\Scripts\activate

# Activate — Mac/Linux
source venv/bin/activate
```

## Step 2 — Install PyTorch (CPU only, much lighter)

```bash
pip install torch==2.2.2 --index-url https://download.pytorch.org/whl/cpu
```

> Skip this if you have a GPU and want CUDA support.
> Without this step, pip might pull a large CUDA version of torch automatically.

## Step 3 — Install remaining dependencies

```bash
pip install -r requirements.txt
```

## Step 4 — Run the server

```bash
python run.py
```

Server starts at: http://localhost:8000

---

## Notes

- **First run will be slow** — sentence-transformers downloads two models on first use:
  - Embedding model: `BAAI/bge-base-en` (~440 MB)
  - Reranker model: `cross-encoder/ms-marco-MiniLM-L-6-v2` (~85 MB)
  - Both are cached in `~/.cache/huggingface/` after first download

- **numpy must stay on 1.x** — numpy 2.0 breaks faiss and some torch operations

- **data/ folder** — gets created automatically on first RFP upload. Structure:
  ```
  data/rfps/{RFP Level Tag}/{Module}/{rfp_name}__{timestamp}/
      index.faiss
      metadata.pkl
      rfp_info.json
  ```

- **To deactivate venv** when done:
  ```bash
  deactivate
  ```
