"use client";

import { useState } from "react";


const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 5L2 7" />
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 7 11 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const SpinnerIcon = () => (
  <svg className="spinner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

function SignUpPage() {
  const [mode, setMode] = useState("register"); // "register" | "login"

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [error, setError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const isInvalid =
    name.trim() === "" ||
    phone.trim().length < 10 ||
    email.trim() === "" ||
    password.length < 6;

  const isInvalidLogin =
    loginEmail.trim() === "" || loginPassword.length < 6;

  const missingFields = [];
  if (name.trim() === "") missingFields.push("name");
  if (phone.trim().length < 10) missingFields.push("a valid phone number");
  if (email.trim() === "") missingFields.push("email");
  if (password.length < 6) missingFields.push("a password (6+ characters)");

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (
      name.trim() === "" ||
      phone.trim().length < 10 ||
      email.trim() === "" ||
      password.length < 6
    ) {
      setError("Please fill all fields before submitting");
      setSuccess(false);
      setIsSubmitting(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    });

    if (authError) {
      setError(authError.message);
      setSuccess(false);
      setIsSubmitting(false);
      return;
    }

    const { error: dbError } = await supabase.from("users").insert([
      {
        id: data.user.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      },
    ]);

    if (dbError) {
      setError(dbError.message);
      setSuccess(false);
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setError("");
    setIsSubmitting(false);
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    setLoginSuccess(false);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (error) {
      setLoginError("Email or password is incorrect");
      setIsLoggingIn(false);
      return;
    }

    setLoginSuccess(true);
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
    setIsLoggingIn(false);
    setTimeout(() => setLoginSuccess(false), 3000);

    // optional: use data.user later for redirect
    console.log("Logged in:", data.user.email);
  }

  function switchToLogin() {
    setMode("login");
    setError("");
    setSuccess(false);
  }

  function switchToRegister() {
    setMode("register");
    setLoginError("");
    setLoginSuccess(false);
  }

  return (
    <div className="register-page">
      <div className="auth-card">
        {mode === "register" ? (
          <form className="register-form" onSubmit={handleSubmit}>
            <h2 className="register-title">Create Account</h2>

            <div className="form-group">
              <label>
                <UserIcon /> Name
              </label>
              <input
                type="text"
                placeholder="eg. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <PhoneIcon /> Phone
              </label>
              <input
                type="text"
                placeholder="eg. 0712345678"
                value={phone}
                maxLength={10}
                inputMode="numeric"
                onChange={(e) => setPhone(e.target.value)}
              />
              {phone.length > 0 && phone.length < 10 && (
                <p className="field-hint">
                  <AlertIcon /> Phone must be at least 10 digits
                </p>
              )}
            </div>

            <div className="form-group">
              <label>
                <MailIcon /> Email
              </label>
              <input
                type="email"
                placeholder="eg. johndoe@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <LockIcon /> Password
              </label>
              <div className="input-with-action">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="eg. 123456"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="field-hint">
                  <AlertIcon /> Password must be at least 6 characters
                </p>
              )}
            </div>

            {success && (
              <div className="success-box">
                <CheckCircleIcon /> Account created successfully!
              </div>
            )}

            {error && (
              <p className="form-error">
                <AlertIcon /> {error}
              </p>
            )}

            <button type="submit" disabled={isInvalid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <SpinnerIcon /> Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {isInvalid && missingFields.length > 0 && (
              <p className="button-hint">
                Still needed: {missingFields.join(", ")}
              </p>
            )}

            <p className="auth-switch">
              Already have an account?{" "}
              <button type="button" className="auth-switch-btn" onClick={switchToLogin}>
                Login to your account
              </button>
            </p>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleLogin}>
            <h2 className="register-title">
              <LockIcon /> Login
            </h2>

            <div className="form-group">
              <label>
                <MailIcon /> Email
              </label>
              <input
                type="email"
                placeholder="eg. johndoe@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <LockIcon /> Password
              </label>
              <div className="input-with-action">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="eg. 123456"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowLoginPassword((v) => !v)}
                  aria-label={
                    showLoginPassword ? "Hide password" : "Show password"
                  }
                >
                  {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {loginSuccess && (
              <div className="success-box">
                <CheckCircleIcon /> Login successful!
              </div>
            )}

            {loginError && (
              <p className="form-error">
                <AlertIcon /> {loginError}
              </p>
            )}

            <button type="submit" disabled={isInvalidLogin || isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <SpinnerIcon /> Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* <p className="helper-link">Forgot password?</p> */}

            <p className="auth-switch">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={switchToRegister}
              >
                Create account
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default SignUpPage;