import faiss
import pickle
import os

DATA_PATH = "data/rfps"


def save_index(rfp_id, index, metadata):
    # rfp_id uses forward slashes — normalise for the OS
    folder = os.path.normpath(os.path.join(DATA_PATH, rfp_id))
    os.makedirs(folder, exist_ok=True)

    faiss.write_index(index, os.path.join(folder, "index.faiss"))

    with open(os.path.join(folder, "metadata.pkl"), "wb") as f:
        pickle.dump(metadata, f)

    print(f"[faiss_store] Saved index to: {folder}")


def load_index(rfp_id):
    folder = os.path.normpath(os.path.join(DATA_PATH, rfp_id))

    if not os.path.exists(os.path.join(folder, "index.faiss")):
        raise FileNotFoundError(f"No index found at: {folder}")

    index = faiss.read_index(os.path.join(folder, "index.faiss"))

    with open(os.path.join(folder, "metadata.pkl"), "rb") as f:
        metadata = pickle.load(f)

    return index, metadata
