import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import LoadingAnimation from "./components/LoadingAnimation";
import TermsOfService from "./components/TermsOfService";
import PrivacyPolicy from "./components/PrivacyPolicy";
import { getApiUrl } from "./api";

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
    // ── FIX: Loading animation bug ──────────────────────────────────────────
    // Add AbortController + 8-second timeout so the spinner doesn't hang
    // if the backend is down, cold-starting, or unreachable.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch(getApiUrl("/api/user-info/"), {
      credentials: "include",
      signal: controller.signal,
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
        <LoadingAnimation message="Initializing application..." size="large" />
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
