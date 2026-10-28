
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 0 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
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

function cleanEmail(value) {
  return value.trim().toLowerCase();
}

function friendlyLoginError(message, lang) {
  const t = (en, sw) => lang === "sw" ? sw : en;

  if (/invalid login credentials/i.test(message)) {
    return t("Invalid login credentials.", "Barua pepe au nenosiri si sahihi.");
  }
  if (/email not confirmed/i.test(message)) {
    return t(
      "Please confirm your email first. Check your inbox.",
      "Tafadhali thibitisha barua pepe yako kwanza. Angalia inbox yako."
    );
  }
  if (/rate limit|too many/i.test(message)) {
    return t(
      "Too many attempts. Please wait a few minutes and try again.",
      "Umejaribu mara nyingi. Subiri dakika chache kisha ujaribu tena."
    );
  }
  return t(
    "Could not log in. Please try again.",
    "Imeshindikana kuingia. Tafadhali jaribu tena."
  );
}

function AuthForm({ initialMode = "register", lang = "en" }) {
  const router = useRouter();
  const t = (en, sw) => lang === "sw" ? sw : en;

  const [mode, setMode] = useState(initialMode);
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

  const [resetError, setResetError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const isInvalid =
    name.trim() === "" ||
    phone.trim().length < 10 ||
    email.trim() === "" ||
    password.length < 6;

  const isInvalidLogin =
    loginEmail.trim() === "" || loginPassword.length < 6;

  const missingFields = [];
  if (name.trim() === "") missingFields.push(t("name", "jina"));
  if (phone.trim().length < 10) missingFields.push(t("a valid phone number", "namba sahihi ya simu"));
  if (email.trim() === "") missingFields.push(t("email", "barua pepe"));
  if (password.length < 6) missingFields.push(t("a password (6+ characters)", "nenosiri (herufi/tarakimu 6+)"));

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
      setError(t(
        "Please fill all fields before submitting",
        "Tafadhali jaza sehemu zote kabla ya kuendelea"
      ));
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail(email),
        password,
        options: {
          data: { name: name.trim(), phone: phone.trim() },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Signup failed:", err);
      setError(t(
        "Something went wrong, try again",
        "Kuna hitilafu imetokea, tafadhali jaribu tena"
      ));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    setLoginSuccess(false);

    if (isInvalidLogin) {
      setLoginError(t(
        "Please enter email and password",
        "Tafadhali weka barua pepe na nenosiri"
      ));
      setIsLoggingIn(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail(loginEmail),
        password: loginPassword,
      });

      if (signInError) {
        console.error("Login failed:", signInError.message);
        setLoginError(friendlyLoginError(signInError.message, lang));
        setIsLoggingIn(false);
        return;
      }

      router.push("/dashboard");

      setLoginSuccess(true);
      setLoginEmail("");
      setLoginPassword("");
      setLoginError("");
      setIsLoggingIn(false);
      setTimeout(() => setLoginSuccess(false), 3000);
    } catch (err) {
      console.error("Login failed:", err);
      setLoginError(t(
        "Could not log in. Please try again.",
        "Imeshindikana kuingia. Tafadhali jaribu tena."
      ));
      setIsLoggingIn(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setResetError("");
    setResetSent(false);

    if (loginEmail.trim() === "") {
      setResetError(t(
        "Enter the email you registered with",
        "Weka barua pepe uliyotumia kujisajili"
      ));
      return;
    }

    setIsResetting(true);

    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        cleanEmail(loginEmail),
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      setIsResetting(false);

      if (resetErr) {
        console.error("Reset email failed:", resetErr.message);
        setResetError(
          /rate limit|too many/i.test(resetErr.message)
            ? t(
                "Too many requests. Please wait a few minutes and try again.",
                "Maombi ni mengi sana. Subiri dakika chache kisha ujaribu tena."
              )
            : t(
                "Could not send the email. Please try again.",
                "Imeshindikana kutuma barua pepe. Tafadhali jaribu tena."
              )
        );
        return;
      }

      setResetSent(true);
    } catch (err) {
      console.error("Reset email failed:", err);
      setIsResetting(false);
      setResetError(t(
        "Could not send the email. Please try again.",
        "Imeshindikana kutuma barua pepe. Tafadhali jaribu tena."
      ));
    }
  }

  function switchToLogin() {
    setMode("login");
    setError("");
    setSuccess(false);
    setResetError("");
    setResetSent(false);
  }

  function switchToRegister() {
    setMode("register");
    setLoginError("");
    setLoginSuccess(false);
  }

  function switchToForgot() {
    setMode("forgot");
    setLoginError("");
    setResetError("");
    setResetSent(false);
  }

  return (
    <div className="register-page">
      <div className="auth-card">
        {mode === "register" && (
          <form className="register-form" onSubmit={handleSubmit}>
            <h2 className="register-title">{t("Create Account", "Fungua Akaunti")}</h2>

            <div className="form-group">
              <label>
                <UserIcon /> {t("Name", "Jina")}
              </label>
              <input
                type="text"
                placeholder={t("eg. John Doe", "mf. John Doe")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <PhoneIcon /> {t("Phone", "Namba ya Simu")}
              </label>
              <input
                type="text"
                placeholder="eg. 07XXXXXXXX"
                value={phone}
                maxLength={10}
                inputMode="numeric"
                onChange={(e) => setPhone(e.target.value)}
              />
              {phone.length > 0 && phone.length < 10 && (
                <p className="field-hint">
                  <AlertIcon /> {t(
                    "Phone must be at least 10 digits",
                    "Namba ya simu iwe na tarakimu 10 au zaidi"
                  )}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>
                <MailIcon /> {t("Email", "Barua Pepe")}
              </label>
              <input
                type="email"
                placeholder="eg. johndoe@gmail.com"
                value={email}
                autoCapitalize="none"
                autoCorrect="off"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <LockIcon /> {t("Password", "Nenosiri")}
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
                  aria-label={showPassword ? t("Hide password", "Ficha nenosiri") : t("Show password", "Onyesha nenosiri")}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="field-hint">
                  <AlertIcon /> {t(
                    "Password must be at least 6 characters",
                    "Nenosiri liwe na herufi au tarakimu 6 au zaidi"
                  )}
                </p>
              )}
            </div>

            {success && (
              <div className="success-box">
                <CheckCircleIcon /> {t("Account created successfully!", "Akaunti imefunguliwa kikamilifu!")}
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
                  <SpinnerIcon /> {t("Creating account...", "Akaunti inafunguliwa...")}
                </>
              ) : (
                t("Create Account", "Fungua Akaunti")
              )}
            </button>

            {isInvalid && missingFields.length > 0 && (
              <p className="button-hint">
                {t("Still needed:", "Bado vinahitajika:")} {missingFields.join(", ")}
              </p>
            )}

            <p className="auth-switch">
              {t("Already have an account?", "Tayari una akaunti?")}{" "}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={switchToLogin}
              >
                {t("Login to your account", "Ingia kwenye akaunti yako")}
              </button>
            </p>
          </form>
        )}

        {mode === "login" && (
          <form className="login-form" onSubmit={handleLogin}>
            <h2 className="register-title">
              <LockIcon /> {t("Login", "Ingia")}
            </h2>

            <div className="form-group">
              <label>
                <MailIcon /> {t("Email", "Barua Pepe")}
              </label>
              <input
                type="email"
                placeholder="eg. johndoe@gmail.com"
                value={loginEmail}
                autoCapitalize="none"
                autoCorrect="off"
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <LockIcon /> {t("Password", "Nenosiri")}
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
                  aria-label={showLoginPassword ? t("Hide password", "Ficha nenosiri") : t("Show password", "Onyesha nenosiri")}
                >
                  {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <button
                type="button"
                className="auth-switch-btn"
                onClick={switchToForgot}
              >
                {t("Forgot password?", "Umesahau nenosiri?")}
              </button>
            </div>

            {loginSuccess && (
              <div className="success-box">
                <CheckCircleIcon /> {t("Login successful!", "Umefanikiwa kuingia!")}
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
                  <SpinnerIcon /> {t("Logging in...", "Unaingia...")}
                </>
              ) : (
                t("Login", "Ingia")
              )}
            </button>

            <p className="auth-switch">
              {t("Don't have an account?", "Huna akaunti?")}{" "}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={switchToRegister}
              >
                {t("Create account", "Fungua akaunti")}
              </button>
            </p>
          </form>
        )}

        {mode === "forgot" && (
          <form className="login-form" onSubmit={handleForgot}>
            <h2 className="register-title">
              <MailIcon /> {t("Reset password", "Weka nenosiri jipya")}
            </h2>

            <p>
              {t(
                "Enter your email and we will send you a link to choose a new password.",
                "Weka barua pepe yako tutakutumia kiungo cha kuweka nenosiri jipya."
              )}
            </p>

            <div className="form-group">
              <label>
                <MailIcon /> {t("Email", "Barua Pepe")}
              </label>
              <input
                type="email"
                placeholder="eg. johndoe@gmail.com"
                value={loginEmail}
                autoCapitalize="none"
                autoCorrect="off"
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            {resetSent && (
              <div className="success-box">
                <CheckCircleIcon /> {t(
                  "If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.",
                  "Ikiwa akaunti yenye barua pepe hiyo ipo, kiungo cha kubadilisha nenosiri kimetumwa. Angalia inbox na spam folder."
                )}
              </div>
            )}

            {resetError && (
              <p className="form-error">
                <AlertIcon /> {resetError}
              </p>
            )}

            <button type="submit" disabled={isResetting}>
              {isResetting ? (
                <>
                  <SpinnerIcon /> {t("Sending...", "Inatuma...")}
                </>
              ) : (
                t("Send reset link", "Tuma kiungo cha kubadilisha nenosiri")
              )}
            </button>

            <p className="auth-switch">
              {t("Remembered it?", "Umelikumbuka nenosiri?")}{" "}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={switchToLogin}
              >
                {t("Back to login", "Rudi kuingia")}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthForm;
