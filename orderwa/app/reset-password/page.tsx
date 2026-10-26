"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false); // true once the email link has signed the user in
  const [checked, setChecked] = useState(false); // true once we have looked for that sign-in
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The email link signs the user in for a moment so they can set a new password.
    // Supabase tells us about it with the PASSWORD_RECOVERY event.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setChecked(true);
      }
    });

    // The link may already have been processed before this page loaded
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      setChecked(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match");
      return;
    }

    setSaving(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateErr) {
      console.error("Update password failed:", updateErr.message);
      setError("Could not change the password. Request a new link and try again.");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  return (
    <div className="register-page">
      <div className="auth-card">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="register-title">Choose a new password</h2>

          {!checked && <p>Checking your link...</p>}

          {checked && !ready && (
            <>
              <p className="form-error">
                This link is not valid or has expired. Go back to the login page
                and request a new one.
              </p>
              <button type="button" onClick={() => router.push("/login")}>
                Back to login
              </button>
            </>
          )}

          {ready && !done && (
            <>
              <div className="form-group">
                <label>New password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Repeat new password</label>
                <input
                  type="password"
                  placeholder="Type it again"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save new password"}
              </button>
            </>
          )}

          {done && (
            <div className="success-box">
              Password changed. Taking you to your dashboard...
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
