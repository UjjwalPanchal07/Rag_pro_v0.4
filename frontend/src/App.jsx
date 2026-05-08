import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import { AuthProvider, useAuth }  from "./context/AuthContext";
import { initAxiosInterceptors }  from "./services/api";
import ProtectedRoute             from "./components/ProtectedRoute";
import AdminRoute                 from "./components/AdminRoute";

import Home                 from "./pages/Home";
import SignIn               from "./pages/SignIn";
import RequestAccess        from "./pages/RequestAccess";
import ChangePassword       from "./pages/ChangePassword";
import SearchQuestion       from "./pages/SearchQuestion";
import BatchQueryProcessing from "./pages/BatchQueryProcessing";
import AdminPanel           from "./pages/AdminPanel";
import Profile              from "./pages/Profile";
import WebSearch            from "./pages/WebSearch";

const AxiosSetup = () => {
  const { accessToken, setAccessToken, logout } = useAuth();
  useEffect(() => {
    initAxiosInterceptors(() => accessToken, (t) => setAccessToken(t), () => logout());
  }, [accessToken, setAccessToken, logout]);
  return null;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AxiosSetup />
      <Routes>

        {/* ── Public ── */}
        <Route path="/"         element={<Home />} />
        <Route path="/home"     element={<Home />} />
        <Route path="/signin"   element={<SignIn />} />
        <Route path="/register" element={<RequestAccess />} />

        {/* ── Authenticated — force password change ── */}
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

        {/* ── Authenticated — any logged-in user ── */}
        <Route path="/search"    element={<ProtectedRoute><SearchQuestion /></ProtectedRoute>} />
        <Route path="/batch"     element={<ProtectedRoute><BatchQueryProcessing /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/websearch" element={<ProtectedRoute><WebSearch /></ProtectedRoute>} />

        {/* ── Admin only ── */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
