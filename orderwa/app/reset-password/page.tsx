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

// Everything this page needs is here, so it looks right even if the
// login styles are not loaded on this route. It reuses the site colors
// (--oda-green, --oda-ink, ...) from globals.css.
const styles = `
.rp-main {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  min-height: 60svh;
  padding: 32px 16px 56px;
}

.rp-card {
  box-sizing: border-box;
  width: 100%;
  max-width: 440px;
  padding: 26px 22px 24px;
  border: 1px solid var(--oda-line, #e2e8ee);
  border-radius: 22px;
  background: #fff;
  box-shadow: var(--oda-shadow, 0 24px 70px rgb(16 34 45 / 11%));
  color: var(--oda-ink, #192734);
}

.rp-topline { display: flex; align-items: center; gap: 10px; }

.rp-topicon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--oda-green-wash, #eaf7f5);
  color: var(--oda-green, #087f76);
}
.rp-topicon svg { width: 18px; height: 18px; }

.rp-toplabel {
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.12em;
  color: var(--oda-muted, #667085);
}

.rp-title {
  margin: 18px 0 0;
  font-size: 26px;
  font-weight: 720;
  letter-spacing: -0.045em;
  line-height: 1.15;
}

.rp-desc {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--oda-muted, #667085);
}

.rp-form { margin-top: 22px; }

.rp-field { margin-bottom: 16px; }

.rp-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 7px;
  font-size: 13px;
  font-weight: 650;
  color: var(--oda-ink, #192734);
}
.rp-label svg { width: 15px; height: 15px; color: var(--oda-green, #087f76); }

.rp-wrap { position: relative; }

.rp-card .rp-input {
  display: block;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  height: 50px;
  margin: 0;
  padding: 0 52px 0 14px;
  border: 1px solid var(--oda-line, #e2e8ee);
  border-radius: 12px;
  background: #fff;
  font-size: 16px;
  color: var(--oda-ink, #192734);
  outline: none;
}
.rp-card .rp-input::placeholder { color: #98a2b3; }
.rp-card .rp-input:focus {
  border-color: var(--oda-green, #087f76);
  box-shadow: 0 0 0 3px rgb(8 127 118 / 14%);
}

.rp-card .rp-toggle {
  position: absolute;
  top: 50%;
  right: 6px;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  margin: 0;
  padding: 0;
  transform: translateY(-50%);
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--oda-muted, #667085);
  cursor: pointer;
}
.rp-card .rp-toggle:hover,
.rp-card .rp-toggle:active,
.rp-card .rp-toggle:focus { background: transparent; color: var(--oda-green, #087f76); outline: none; }
.rp-card .rp-toggle svg { width: 19px; height: 19px; }

.rp-card .rp-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  height: 50px;
  margin: 6px 0 0;
  padding: 0 16px;
  border: 0;
  border-radius: 12px;
  background: var(--oda-green, #087f76);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}
.rp-card .rp-submit:hover:not(:disabled) { background: var(--oda-green-deep, #066b64); }
.rp-card .rp-submit:disabled { opacity: 0.45; cursor: not-allowed; }
.rp-card .rp-submit svg { width: 18px; height: 18px; }

.rp-spin { animation: rp-spin 0.9s linear infinite; }
@keyframes rp-spin { to { transform: rotate(360deg); } }

.rp-helper {
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--oda-muted, #667085);
}

.rp-msg {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin: 14px 0 0;
  padding: 12px 13px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 13.5px;
  line-height: 1.5;
}
.rp-msg svg { flex: none; width: 18px; height: 18px; margin-top: 1px; }
.rp-msg-ok { border-color: #bbf7d0; background: #f0fdf4; color: #15803d; }

.rp-card .rp-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--oda-green, #087f76);
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
}
.rp-card .rp-back:hover { background: transparent; text-decoration: underline; }
.rp-card .rp-back svg { width: 16px; height: 16px; }
`;

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
    <div className="rp-field">
      <label className="rp-label" htmlFor={id}>
        <LockKeyhole aria-hidden="true" />
        {label}
      </label>

      <div className="rp-wrap">
        <input
          className="rp-input"
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
          className="rp-toggle"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
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
        t("The two passwords do not match.", "Manenosiri mawili hayafanani.")
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
    <div className="oda-page">
      <style>{styles}</style>

      <SiteHeader compact />

      <main className="rp-main">
        <section className="rp-card" aria-labelledby="rp-title">
          <div className="rp-topline">
            <span className="rp-topicon" aria-hidden="true">
              <LockKeyhole />
            </span>
            <span className="rp-toplabel">ODALINK SELLER ACCOUNT</span>
          </div>

          <h1 id="rp-title" className="rp-title">
            {t("Choose a new password", "Chagua nenosiri jipya")}
          </h1>

          <p className="rp-desc">
            {t(
              "Enter a new password for your seller account.",
              "Weka nenosiri jipya kwa akaunti yako ya muuzaji."
            )}
          </p>

          {!checked && (
            <p className="rp-helper" role="status" aria-live="polite">
              {t("Checking your link...", "Inakagua kiungo chako...")}
            </p>
          )}

          {checked && !ready && (
            <>
              <p className="rp-msg" role="status" aria-live="polite">
                <AlertCircle aria-hidden="true" />
                <span>
                  {t(
                    "This link is not valid or has expired. Go back to the login page and request a new one.",
                    "Kiungo hiki si sahihi au muda wake umeisha. Rudi kwenye ukurasa wa kuingia kisha uombe kingine."
                  )}
                </span>
              </p>

              <button
                className="rp-back"
                type="button"
                onClick={() => router.push("/login")}
              >
                <ArrowLeft aria-hidden="true" />
                {t("Back to login", "Rudi kuingia")}
              </button>
            </>
          )}

          {ready && !done && (
            <form className="rp-form" onSubmit={handleSubmit} noValidate>
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

              <button
                className="rp-submit"
                type="submit"
                disabled={!canSubmit || saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle className="rp-spin" aria-hidden="true" />
                    {t("Saving...", "Inahifadhi...")}
                  </>
                ) : (
                  t("Save new password", "Hifadhi nenosiri jipya")
                )}
              </button>

              <p className="rp-helper" role="status" aria-live="polite">
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
                <p className="rp-msg" role="status" aria-live="polite">
                  <AlertCircle aria-hidden="true" />
                  <span>{error}</span>
                </p>
              )}
            </form>
          )}

          {done && (
            <p className="rp-msg rp-msg-ok" role="status" aria-live="polite">
              <CheckCircle2 aria-hidden="true" />
              <span>
                {t(
                  "Password changed. Taking you to your dashboard...",
                  "Nenosiri limebadilishwa. Tunakupeleka kwenye dashboard..."
                )}
              </span>
            </p>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
