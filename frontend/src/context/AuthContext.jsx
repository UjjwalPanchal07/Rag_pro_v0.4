import { createContext, useContext, useState, useCallback, useEffect } from "react";
import API from "../services/api";

const AuthContext  = createContext(null);
const SESSION_KEY  = "prism_session";

// ── Restore session from sessionStorage on page load ──────────────────────
const loadSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { user: null, accessToken: null };
    return JSON.parse(raw);
  } catch {
    return { user: null, accessToken: null };
  }
};

const saveSession = (user, accessToken) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, accessToken }));
  } catch {}
};

const clearSession = () => {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
};

export const AuthProvider = ({ children }) => {
  const initial = loadSession();

  const [user, setUser]               = useState(initial.user);
  const [accessToken, setAccessToken] = useState(initial.accessToken);

  // Keep sessionStorage in sync whenever user/token changes
  useEffect(() => {
    if (user && accessToken) {
      saveSession(user, accessToken);
    } else {
      clearSession();
    }
  }, [user, accessToken]);

  // When Axios interceptor refreshes the token, update sessionStorage too
  const setAccessTokenWithPersist = useCallback((token) => {
    setAccessToken(token);
    setUser(prev => {
      if (prev && token) saveSession(prev, token);
      return prev;
    });
  }, []);

  const login = useCallback(async (email, password) => {
    const res  = await API.post("/auth/login", { email, password });
    const data = res.data;
    const newUser = {
      username:           data.username,
      email:              data.email,
      role:               data.role,
      mustChangePassword: data.must_change_password,
    };
    setAccessToken(data.access_token);
    setUser(newUser);
    saveSession(newUser, data.access_token);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await API.post("/auth/logout"); } catch (_) {}
    setAccessToken(null);
    setUser(null);
    clearSession();
  }, []);

  const updateMustChangePassword = useCallback((value) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, mustChangePassword: value };
      saveSession(updated, accessToken);
      return updated;
    });
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      setAccessToken: setAccessTokenWithPersist,
      login,
      logout,
      updateMustChangePassword,
      isAdmin:    user?.role === "admin",
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
