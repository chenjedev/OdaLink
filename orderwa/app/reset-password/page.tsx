"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { SiteHeader, SiteFooter } from "../components/SiteLayout";

type Lang = "en" | "sw";

const MIN_LENGTH = 6; // same rule as the sign up form

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  showLabel,
  hideLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  showLabel: string;
  hideLabel: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field auth-field-wide">
      <label className="auth-label" htmlFor={id}>
        <LockKeyhole aria-hidden="true" />
        {label}
      </label>

      <div className="auth-password-wrap">
        <input
          className="auth-input"
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          placeholder={placeholder}
          minLength={MIN_LENGTH}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />

        <button
          className="auth-password-toggle"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false); // true once the email link has signed the user in
  const [checked, setChecked] = useState(false); // true once we have looked for that sign-in
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  const t = (en: string, sw: string) => (lang === "sw" ? sw : en);

  // Use the language the seller picked, if there is one
  useEffect(() => {
    const saved = localStorage.getItem("odLinkLanguage");
    if (saved === "en" || saved === "sw") setLang(saved);
  }, []);

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

  const longEnough = password.length >= MIN_LENGTH;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = longEnough && confirm.length > 0 && !mismatch;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;

    setError("");

    if (!longEnough) {
      setError(
        t(
          `Your password must contain at least ${MIN_LENGTH} characters.`,
          `Nenosiri lako liwe na herufi au tarakimu zisizopungua ${MIN_LENGTH}.`
        )
      );
      return;
    }

    if (password !== confirm) {
      setError(
        t(
          "The two passwords do not match.",
          "Manenosiri mawili hayafanani."
        )
      );
      return;
    }

    setSaving(true);

    const { error: updateErr } = await supabase.auth.updateUser({ password });

    setSaving(false);

    if (updateErr) {
      console.error("Update password failed:", updateErr.message);
      setError(
        t(
          "Could not change the password. Request a new link and try again.",
          "Imeshindwa kubadilisha nenosiri. Omba kiungo kipya kisha ujaribu tena."
        )
      );
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  return (
    <div className="oda-page auth-page">
      <SiteHeader compact />

      <main className="auth-main">
        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-card-topline">
            <span className="auth-card-icon" aria-hidden="true">
              <LockKeyhole />
            </span>
            <span className="auth-card-label">ODALINK SELLER ACCOUNT</span>
          </div>

          <h1 id="auth-title" className="auth-title">
            {t("Choose a new password", "Chagua nenosiri jipya")}
          </h1>

          <p className="auth-description">
            {t(
              "Enter a new password for your seller account.",
              "Weka nenosiri jipya kwa akaunti yako ya muuzaji."
            )}
          </p>

          {!checked && (
            <p className="auth-helper" role="status" aria-live="polite">
              {t("Checking your link...", "Inakagua kiungo chako...")}
            </p>
          )}

          {checked && !ready && (
            <>
              <p className="auth-feedback" role="status" aria-live="polite">
                <AlertCircle aria-hidden="true" />
                {t(
                  "This link is not valid or has expired. Go back to the login page and request a new one.",
                  "Kiungo hiki si sahihi au muda wake umeisha. Rudi kwenye ukurasa wa kuingia kisha uombe kingine."
                )}
              </p>

              <button
                className="auth-back-button"
                type="button"
                onClick={() => router.push("/login")}
              >
                <ArrowLeft aria-hidden="true" />
                {t("Back to login", "Rudi kuingia")}
              </button>
            </>
          )}

          {ready && !done && (
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field-grid auth-field-grid-single">
                <PasswordField
                  id="new-password"
                  label={t("New password", "Nenosiri jipya")}
                  value={password}
                  onChange={(value) => {
                    setPassword(value);
                    setError("");
                  }}
                  placeholder={t(
                    `At least ${MIN_LENGTH} characters`,
                    `Angalau herufi ${MIN_LENGTH}`
                  )}
                  showLabel={t("Show password", "Onyesha nenosiri")}
                  hideLabel={t("Hide password", "Ficha nenosiri")}
                />

                <PasswordField
                  id="confirm-password"
                  label={t("Repeat new password", "Rudia nenosiri jipya")}
                  value={confirm}
                  onChange={(value) => {
                    setConfirm(value);
                    setError("");
                  }}
                  placeholder={t("Type it again", "Liandike tena")}
                  showLabel={t("Show password", "Onyesha nenosiri")}
                  hideLabel={t("Hide password", "Ficha nenosiri")}
                />
              </div>

              <button
                className="auth-submit"
                type="submit"
                disabled={!canSubmit || saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle className="auth-spinner" aria-hidden="true" />
                    {t("Saving...", "Inahifadhi...")}
                  </>
                ) : (
                  t("Save new password", "Hifadhi nenosiri jipya")
                )}
              </button>

              <p className="auth-helper" role="status" aria-live="polite">
                {mismatch
                  ? t(
                      "The two passwords do not match yet.",
                      "Manenosiri mawili bado hayafanani."
                    )
                  : !longEnough && password.length > 0
                    ? t(
                        `Still needed: ${MIN_LENGTH - password.length} more character(s).`,
                        `Bado yanahitajika: herufi ${MIN_LENGTH - password.length} zaidi.`
                      )
                    : t(
                        `Use at least ${MIN_LENGTH} characters.`,
                        `Tumia angalau herufi ${MIN_LENGTH}.`
                      )}
              </p>

              {error && (
                <p className="auth-feedback" role="status" aria-live="polite">
                  <AlertCircle aria-hidden="true" />
                  {error}
                </p>
              )}
            </form>
          )}

          {done && (
            <p
              className="auth-feedback auth-feedback-success"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 aria-hidden="true" />
              {t(
                "Password changed. Taking you to your dashboard...",
                "Nenosiri limebadilishwa. Tunakupeleka kwenye dashboard..."
              )}
            </p>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
