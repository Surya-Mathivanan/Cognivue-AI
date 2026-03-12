import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { API_BASE_URL } from "../api";

function HRLoginScreen() {
  const [activeTab, setActiveTab] = useState("login"); // 'login' | 'register'
  const [step, setStep] = useState("form"); // 'form' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Register form
  const [regForm, setRegForm] = useState({ name: "", email: "", company: "", password: "" });
  // Login form
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  // OTP
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpExpired, setOtpExpired] = useState(false);
  const timerRef = useRef(null);

  // Particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
        this.opacity = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  const startOtpTimer = () => {
    setOtpTimer(60);
    setOtpExpired(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setOtpExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hr/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      
      try {
        await emailjs.send(
          "service_uwyuqla", // Replace with your EmailJS service ID
          "template_no2igus", // Replace with your EmailJS template ID
          {
            name: data.name || regForm.name,
            otp: data.otp_code,
            to_email: data.email
          },
          "rr1wezDDwlBE7Hoix" // Replace with your EmailJS public key
        );
        setOtpEmail(regForm.email);
        setStep("otp");
        startOtpTimer();
        setSuccessMsg("OTP sent! Check your email inbox.");
      } catch (err) {
        setError("Failed to send OTP via EmailJS.");
        console.error("EmailJS Error:", err);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpExpired) { setError("OTP has expired. Please resend."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hr/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: otpEmail, otp_code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "OTP verification failed"); return; }
      clearInterval(timerRef.current);
      navigate("/hr-admin");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (emailToUse) => {
    const targetEmail = typeof emailToUse === 'string' ? emailToUse : otpEmail;
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hr/resend-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to resend OTP"); return; }
      
      try {
        await emailjs.send(
          "service_uwyuqla", // Replace with your EmailJS service ID
          "template_no2igus", // Replace with your EmailJS template ID
          {
            name: data.name || "HR Professional",
            otp: data.otp_code,
            to_email: data.email
          },
          "rr1wezDDwlBE7Hoix" // Replace with your EmailJS public key
        );
        setOtpCode("");
        startOtpTimer();
        setSuccessMsg("New OTP sent! Check your email.");
      } catch (err) {
        setError("Failed to resend OTP via EmailJS.");
        console.error("EmailJS Error:", err);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hr/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requires_verification) {
          setOtpEmail(loginForm.email);
          setActiveTab("register");
          setStep("otp");
          // Resend OTP
          await handleResendOtp(loginForm.email);
          return;
        }
        setError(data.error || "Login failed");
        return;
      }
      navigate("/hr-admin");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hr-login-screen">
      <canvas ref={canvasRef} className="particle-canvas" />
      <div className="gradient-orb orb-1" style={{ background: "radial-gradient(circle,rgba(16,185,129,0.15),transparent 70%)" }} />
      <div className="gradient-orb orb-2" style={{ background: "radial-gradient(circle,rgba(6,182,212,0.1),transparent 70%)" }} />

      <div className="login-container-modern">
        <div className="login-panel-modern">
          <div className="login-glass-card">
            {/* Logo */}
            <div className="login-logo-section">
              <div className="login-logo-icon hr-logo-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#hrLogoGrad)" strokeWidth="2">
                  <defs>
                    <linearGradient id="hrLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h1 className="login-brand-title">Cognivue AI</h1>
              <p className="login-brand-tagline" style={{ color: "#10b981" }}>HR Portal</p>
            </div>

            {step === "otp" ? (
              /* OTP Verification Step */
              <div className="hr-otp-section">
                <div className="otp-header">
                  <div className="otp-icon">📧</div>
                  <h2>Check Your Email</h2>
                  <p>We sent a 6-digit code to <strong>{otpEmail}</strong></p>
                </div>

                {/* Timer */}
                <div className={`otp-timer ${otpExpired ? "expired" : otpTimer <= 10 ? "warning" : ""}`}>
                  {otpExpired ? (
                    <span>⏰ Code expired</span>
                  ) : (
                    <span>⏱ Expires in <strong>{otpTimer}s</strong></span>
                  )}
                  <div className="otp-progress-bar">
                    <div
                      className="otp-progress-fill"
                      style={{
                        width: `${(otpTimer / 60) * 100}%`,
                        background: otpExpired ? "#ef4444" : otpTimer <= 10 ? "#f59e0b" : "#10b981",
                      }}
                    />
                  </div>
                </div>

                {error && <div className="hr-error-msg">⚠️ {error}</div>}
                {successMsg && <div className="hr-success-msg">✅ {successMsg}</div>}

                <form onSubmit={handleVerifyOtp}>
                  <div className="hr-form-group">
                    <label>Enter OTP Code</label>
                    <input
                      type="text"
                      className="hr-otp-input"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      disabled={otpExpired}
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="hr-submit-btn"
                    disabled={loading || otpExpired || otpCode.length !== 6}
                  >
                    {loading ? "Verifying..." : "Verify & Access Portal"}
                  </button>
                </form>

                {otpExpired && (
                  <button className="hr-resend-btn" onClick={handleResendOtp} disabled={loading}>
                    {loading ? "Sending..." : "🔄 Resend New OTP"}
                  </button>
                )}

                <button className="hr-back-btn" onClick={() => { setStep("form"); setError(""); setSuccessMsg(""); }}>
                  ← Back
                </button>
              </div>
            ) : (
              /* Login / Register Tabs */
              <>
                <div className="hr-tab-bar">
                  <button
                    className={`hr-tab ${activeTab === "login" ? "active" : ""}`}
                    onClick={() => { setActiveTab("login"); setError(""); setSuccessMsg(""); }}
                  >
                    Login
                  </button>
                  <button
                    className={`hr-tab ${activeTab === "register" ? "active" : ""}`}
                    onClick={() => { setActiveTab("register"); setError(""); setSuccessMsg(""); }}
                  >
                    Register
                  </button>
                </div>

                {error && <div className="hr-error-msg">⚠️ {error}</div>}
                {successMsg && <div className="hr-success-msg">✅ {successMsg}</div>}

                {activeTab === "login" ? (
                  <form onSubmit={handleLogin}>
                    <div className="hr-form-group">
                      <label>Work Email</label>
                      <input
                        type="email"
                        className="hr-input"
                        value={loginForm.email}
                        onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                        placeholder="hr@company.com"
                        required
                      />
                    </div>
                    <div className="hr-form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        className="hr-input"
                        value={loginForm.password}
                        onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <button type="submit" className="hr-submit-btn" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In to HR Portal"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister}>
                    <div className="hr-form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        className="hr-input"
                        value={regForm.name}
                        onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                        placeholder="Jane Smith"
                        required
                      />
                    </div>
                    <div className="hr-form-group">
                      <label>Work Email</label>
                      <input
                        type="email"
                        className="hr-input"
                        value={regForm.email}
                        onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                        placeholder="hr@company.com"
                        required
                      />
                    </div>
                    <div className="hr-form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        className="hr-input"
                        value={regForm.company}
                        onChange={e => setRegForm({ ...regForm, company: e.target.value })}
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div className="hr-form-group">
                      <label>Password (min. 8 characters)</label>
                      <input
                        type="password"
                        className="hr-input"
                        value={regForm.password}
                        onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="••••••••"
                        minLength={8}
                        required
                      />
                    </div>
                    <button type="submit" className="hr-submit-btn" disabled={loading}>
                      {loading ? "Sending OTP..." : "Register & Send OTP"}
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Footer back to student login */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                className="hr-back-btn"
                onClick={() => navigate("/")}
                style={{ opacity: 0.7, fontSize: "13px" }}
              >
                ← Back to Student Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HRLoginScreen;
