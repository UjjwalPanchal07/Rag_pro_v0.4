import axios from "axios";

const API = axios.create({
  baseURL:         "http://localhost:8000",
  withCredentials: true,
});

let _getToken = () => null;
let _setToken = (_) => {};
let _onLogout = () => {};

export const initAxiosInterceptors = (getToken, setToken, onLogout) => {
  _getToken = getToken;
  _setToken = setToken;
  _onLogout = onLogout;
};

API.interceptors.request.use((config) => {
  const token = _getToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue  = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry && !orig.url?.includes("/auth/")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (t) => { orig.headers["Authorization"] = `Bearer ${t}`; resolve(API(orig)); },
            reject,
          });
        });
      }
      orig._retry  = true;
      isRefreshing = true;
      try {
        const res = await API.post("/auth/refresh");
        const tok = res.data.access_token;
        _setToken(tok);
        processQueue(null, tok);
        orig.headers["Authorization"] = `Bearer ${tok}`;
        return API(orig);
      } catch (err) {
        processQueue(err, null);
        _onLogout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────
export const registerUser   = (email, password)             => API.post("/auth/register",        { email, password });
export const changePassword = (old_password, new_password)  => API.post("/auth/change_password", { old_password, new_password });

// ── RFP ───────────────────────────────────────────────────────────────────
export const uploadRFP      = (formData, onUploadProgress)  => API.post("/upload_rfp", formData, { headers: { "Content-Type": "multipart/form-data" }, onUploadProgress });
export const searchByModule = (tag, mod, q)                 => API.get("/ask_by_module", { params: { rfp_level_tag: tag, module: mod, query: q } });
export const searchQuestion = (rfpId, q)                    => API.get("/ask", { params: { rfp_id: rfpId, query: q } });
export const batchQuery     = (formData)                    => API.post("/batch_query", formData, { responseType: "blob" });
export const getRFPs        = ()                            => API.get("/rfps");

// ── Web Search ─────────────────────────────────────────────────────────────
export const webSearch      = (url, question, target_language = "en") =>
  API.post("/web/ask_web", { url, question, target_language });

export const translateAnswer = (text, target_language) =>
  API.post("/web/translate", { text, target_language });

export const getLanguages   = () => API.get("/web/languages");

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminGetUsers       = ()                   => API.get("/admin/users");
export const adminGetPending     = ()                   => API.get("/admin/pending");
export const adminGetAuditLogs   = (limit = 100)        => API.get(`/admin/audit_logs?limit=${limit}`);
export const adminApproveUser    = (username, role)     => API.put("/admin/approve_user",    { username, role });
export const adminRejectUser     = (username)           => API.put("/admin/reject_user",     { username });
export const adminChangeRole     = (username, new_role) => API.put("/admin/change_role",     { username, new_role });
export const adminCreateUser     = (email, role)        => API.post("/admin/create_user",    { email, role });
export const adminDeactivateUser = (username)           => API.put("/admin/deactivate_user", { username });
export const adminReactivateUser = (username)           => API.put("/admin/reactivate_user", { username });
export const adminUnlockUser     = (username)           => API.put("/admin/unlock_user",     { username });
export const adminResetPassword  = (username)           => API.put("/admin/reset_password",  { username });

export default API;
