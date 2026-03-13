import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import Loader from "./components/Loader";
import TermsOfService from "./components/TermsOfService";
import PrivacyPolicy from "./components/PrivacyPolicy";
import HRLoginScreen from "./components/HRLoginScreen";
import HRDashboard from "./components/HRDashboard";
import { getApiUrl, saveToken, getToken, getAuthHeaders } from "./api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = newTheme;
  };

  useEffect(() => {
    // ── Step 1: Check if Google OAuth just landed a ?token=<jwt> in the URL ──
    // This happens when the backend redirects back after successful OAuth login.
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      saveToken(urlToken);
      // Remove ?token=... from the URL bar (clean URL, no page reload)
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    // ── Step 2: Check if user is logged in (session OR stored JWT token) ──
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch(getApiUrl("/api/user-info/"), {
      credentials: "include",
      signal: controller.signal,
      headers: getAuthHeaders(),   // Sends Authorization: Bearer <token> if available
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error("Not authenticated");
      })
      .then((userData) => {
        setUser(userData);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.warn("User-info check timed out — backend may be starting up");
        } else {
          console.log("User not logged in");
        }
        setUser(null);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <Loader message="Initializing application..." />
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* HR Routes */}
          <Route path="/hr-login" element={<HRLoginScreen />} />
          <Route path="/hr-admin" element={<HRDashboard />} />

          {/* Student / Main app route */}
          <Route
            path="/"
            element={
              user ? (
                <Dashboard
                  user={user}
                  setUser={setUser}
                  theme={theme}
                  toggleTheme={toggleTheme}
                />
              ) : (
                <LoginScreen
                  setUser={setUser}
                  theme={theme}
                  toggleTheme={toggleTheme}
                />
              )
            }
          />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
