'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const cleanEmail = (email) => email.trim().toLowerCase()

// CHANGE 1: inline styles for the Google button and the "or" divider,
// so we do not have to touch your CSS file.
const googleButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #d1d5db',
  borderRadius: 12,
  background: '#fff',
  color: '#111827',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
}

const dividerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  margin: '16px 0',
  color: '#94a3b8',
  fontSize: 13,
}

const dividerLineStyle = {
  flex: 1,
  height: 1,
  background: '#e2e8f0',
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

export default function AuthForm({ initialMode = 'signup', lang = 'en' }) {
  const router = useRouter()

  const [mode, setMode] = useState(
    initialMode === 'register' ? 'signup' : initialMode
  )
  const [language, setLanguage] = useState(lang === 'sw' ? 'sw' : 'en')

  // CHANGE 2: signup only needs email and password now.
  // Shop name and WhatsApp number are filled in later, in Settings.
  const [values, setValues] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState('error')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const t = (en, sw) => (language === 'sw' ? sw : en)

  const emailIsValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())

  const passwordIsValid = values.password.length >= 6

  const missingRequirements = [
    {
      label: t('a valid email', 'barua pepe sahihi'),
      complete: emailIsValid,
    },
    {
      label: t('a password (6+ characters)', 'nenosiri (herufi 6+)'),
      complete: passwordIsValid,
    },
  ]
    .filter((item) => !item.complete)
    .map((item) => item.label)

  const canSubmit =
    mode === 'reset'
      ? emailIsValid
      : mode === 'signup'
        ? missingRequirements.length === 0
        : emailIsValid && passwordIsValid

  function handleChange(event) {
    const { name, value } = event.currentTarget

    setValues((current) => ({
      ...current,
      [name]: value,
    }))

    setFeedback('')
    setResetSent(false)
  }

  function showError(message) {
    setFeedbackType('error')
    setFeedback(message)
  }

  function showSuccess(message) {
    setFeedbackType('success')
    setFeedback(message)
  }

  function friendlyError(message) {
    if (/invalid login credentials/i.test(message)) {
      return t(
        'Email or password is incorrect.',
        'Barua pepe au nenosiri si sahihi.'
      )
    }

    if (/email not confirmed/i.test(message)) {
      return t(
        'Please confirm your email before logging in.',
        'Thibitisha barua pepe yako kabla ya kuingia.'
      )
    }

    if (/already registered|already exists/i.test(message)) {
      return t(
        'An account with this email may already exist. Try logging in.',
        'Huenda akaunti yenye email hii ipo tayari. Jaribu kuingia.'
      )
    }

    if (/rate limit|too many requests|too many attempts/i.test(message)) {
      return t(
        'Too many attempts. Please wait a few minutes and try again.',
        'Umejaribu mara nyingi. Subiri dakika chache kisha ujaribu tena.'
      )
    }

    if (/password should be at least/i.test(message)) {
      return t(
        'Your password must contain at least 6 characters.',
        'Nenosiri lako liwe na herufi au tarakimu zisizopungua 6.'
      )
    }

    return t(
      'Something went wrong. Please try again.',
      'Kuna hitilafu imetokea. Tafadhali jaribu tena.'
    )
  }

  // CHANGE 3: Google sign-in. The browser leaves for Google and comes back
  // through Supabase to /dashboard. This works for both login and signup:
  // a new Google user gets an account (and an empty shop) automatically.
  async function handleGoogle() {
    if (isSubmitting) return

    setFeedback('')
    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        showError(friendlyError(error.message))
        setIsSubmitting(false)
      }
      // On success the page navigates away to Google, so we keep the
      // buttons disabled and do not reset isSubmitting here.
    } catch (error) {
      console.error('Google sign-in error:', error)
      showError(
        t(
          'Unable to start Google sign-in. Check your connection and try again.',
          'Imeshindikana kuanza kuingia na Google. Kagua intaneti kisha ujaribu tena.'
        )
      )
      setIsSubmitting(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting) return

    setFeedback('')
    setResetSent(false)

    if (!canSubmit) {
      showError(
        t(
          'Please check the information you entered.',
          'Tafadhali kagua taarifa ulizoweka.'
        )
      )
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'signup') {
        // CHANGE 4: no name/phone sent any more. The database trigger
        // creates an empty shop, and Settings asks for the details.
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail(values.email),
          password: values.password,
        })

        if (error) {
          showError(friendlyError(error.message))
          return
        }

        if (data.session) {
          router.replace('/dashboard')
          router.refresh()
          return
        }

        showSuccess(
          t(
            'Your account request was received. Check your email to confirm your account before logging in.',
            'Ombi la akaunti limepokelewa. Angalia email yako na uthibitishe akaunti kabla ya kuingia.'
          )
        )

        setValues((current) => ({
          ...current,
          password: '',
        }))

        setMode('login')
        return
      }

      if (mode === 'login') {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail(values.email),
            password: values.password,
          })

        if (error) {
          showError(friendlyError(error.message))
          return
        }

        if (!data.session) {
          showError(
            t(
              'Login could not be completed. Please try again.',
              'Imeshindikana kukamilisha kuingia. Tafadhali jaribu tena.'
            )
          )
          return
        }

        setValues((current) => ({
          ...current,
          password: '',
        }))

        router.replace('/dashboard')
        router.refresh()
        return
      }

      if (mode === 'reset') {
        const { error } =
          await supabase.auth.resetPasswordForEmail(
            cleanEmail(values.email),
            {
              redirectTo: `${window.location.origin}/reset-password`,
            }
          )

        if (error) {
          showError(friendlyError(error.message))
          return
        }

        setResetSent(true)

        showSuccess(
          t(
            'If an account exists for this email, a password reset link has been sent. Check your inbox and spam folder.',
            'Ikiwa akaunti yenye email hii ipo, kiungo cha kubadilisha nenosiri kimetumwa. Angalia inbox na spam folder.'
          )
        )
      }
    } catch (error) {
      console.error('Authentication error:', error)

      showError(
        t(
          'Unable to complete your request. Check your connection and try again.',
          'Imeshindikana kukamilisha ombi lako. Kagua intaneti kisha ujaribu tena.'
        )
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setFeedback('')
    setResetSent(false)
    setShowPassword(false)

    setValues((current) => ({
      ...current,
      password: '',
    }))
  }

  const title =
    mode === 'signup'
      ? t('Create Account', 'Fungua Akaunti')
      : mode === 'reset'
        ? t('Reset password', 'Badilisha Nenosiri')
        : t('Login', 'Ingia')

  const description =
    mode === 'signup'
      ? t(
          'Set up your seller account and start organizing orders.',
          'Fungua akaunti yako ya muuzaji na anza kusimamia oda.'
        )
      : mode === 'reset'
        ? t(
            'Enter your email to receive a password reset link.',
            'Weka email yako ili upokee kiungo cha kubadilisha nenosiri.'
          )
        : t(
            'Manage orders, products, and your store link.',
            'Simamia oda, bidhaa na kiungo cha duka lako.'
          )

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <div className="auth-card-topline">
        <span className="auth-card-icon" aria-hidden="true">
          {mode === 'signup' ? (
            <UserRound />
          ) : mode === 'reset' ? (
            <Mail />
          ) : (
            <LockKeyhole />
          )}
        </span>

        <span className="auth-card-label">
          ODALINK SELLER ACCOUNT
        </span>
      </div>

      <h1 id="auth-title" className="auth-title">
        {title}
      </h1>

      <p className="auth-description">
        {description}
      </p>

      {/* CHANGE 5: Google button + divider, shown on login and signup only */}
      {mode !== 'reset' && (
        <>
          <button
            type="button"
            style={googleButtonStyle}
            onClick={handleGoogle}
            disabled={isSubmitting}
          >
            <GoogleLogo />
            {t('Continue with Google', 'Endelea na Google')}
          </button>

          <div style={dividerStyle} aria-hidden="true">
            <span style={dividerLineStyle} />
            {t('or use email', 'au tumia email')}
            <span style={dividerLineStyle} />
          </div>
        </>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {mode === 'signup' && (
          <div className="auth-field-grid auth-field-grid-single">
            <div className="auth-field auth-field-wide">
              <label className="auth-label" htmlFor="auth-email-signup">
                <Mail aria-hidden="true" />
                {t('Email', 'Barua Pepe')}
              </label>

              <input
                className="auth-input"
                id="auth-email-signup"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="eg. johndoe@gmail.com"
                value={values.email}
                onChange={handleChange}
                required
              />
            </div>

            <PasswordField
              id="auth-password-signup"
              label={t('Password', 'Nenosiri')}
              value={values.password}
              showPassword={showPassword}
              onChange={handleChange}
              onToggle={() => setShowPassword((current) => !current)}
              autoComplete="new-password"
              placeholder={t('At least 6 characters', 'Angalau herufi 6')}
              t={t}
            />
          </div>
        )}

        {mode === 'login' && (
          <div className="auth-field-grid auth-field-grid-single">
            <div className="auth-field auth-field-wide">
              <label className="auth-label" htmlFor="auth-email-login">
                <Mail aria-hidden="true" />
                {t('Email', 'Barua Pepe')}
              </label>

              <input
                className="auth-input"
                id="auth-email-login"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="eg. johndoe@gmail.com"
                value={values.email}
                onChange={handleChange}
                required
              />
            </div>

            <PasswordField
              id="auth-password-login"
              label={t('Password', 'Nenosiri')}
              value={values.password}
              showPassword={showPassword}
              onChange={handleChange}
              onToggle={() => setShowPassword((current) => !current)}
              autoComplete="current-password"
              placeholder={t('Enter your password', 'Weka nenosiri lako')}
              t={t}
            />

            <div className="auth-form-utility">
              <button
                className="auth-text-button"
                type="button"
                onClick={() => changeMode('reset')}
              >
                {t('Forgot password?', 'Umesahau nenosiri?')}
              </button>
            </div>
          </div>
        )}

        {mode === 'reset' && (
          <div className="auth-field-grid auth-field-grid-single">
            <div className="auth-field auth-field-wide">
              <label className="auth-label" htmlFor="auth-email-reset">
                <Mail aria-hidden="true" />
                {t('Email', 'Barua Pepe')}
              </label>

              <input
                className="auth-input"
                id="auth-email-reset"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="eg. johndoe@gmail.com"
                value={values.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )}

        <button
          className="auth-submit"
          type="submit"
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="auth-spinner" aria-hidden="true" />
              {mode === 'signup'
                ? t('Creating account...', 'Akaunti inafunguliwa...')
                : mode === 'reset'
                  ? t('Sending...', 'Inatuma...')
                  : t('Logging in...', 'Unaingia...')}
            </>
          ) : mode === 'signup' ? (
            t('Create Account', 'Fungua Akaunti')
          ) : mode === 'reset' ? (
            t('Send reset link', 'Tuma kiungo')
          ) : (
            t('Login', 'Ingia')
          )}
        </button>

        {mode === 'signup' && (
          <p className="auth-helper" role="status" aria-live="polite">
            {missingRequirements.length > 0
              ? `${t('Still needed:', 'Bado vinahitajika:')} ${missingRequirements.join(', ')}`
              : t(
                  'You are ready to create your account.',
                  'Uko tayari kufungua akaunti yako.'
                )}
          </p>
        )}

        {feedback && (
          <p
            className={
              feedbackType === 'error'
                ? 'auth-feedback'
                : 'auth-feedback auth-feedback-success'
            }
            role="status"
            aria-live="polite"
          >
            {feedbackType === 'error' ? (
              <AlertCircle aria-hidden="true" />
            ) : (
              <CheckCircle2 aria-hidden="true" />
            )}
            {feedback}
          </p>
        )}

        {resetSent && (
          <p className="auth-helper">
            {t(
              'For security, this message does not reveal whether an account exists.',
              'Kwa usalama, ujumbe huu hauonyeshi kama akaunti ipo.'
            )}
          </p>
        )}
      </form>

      {mode === 'reset' ? (
        <button
          className="auth-back-button"
          type="button"
          onClick={() => changeMode('login')}
        >
          <ArrowLeft aria-hidden="true" />
          {t('Back to login', 'Rudi kuingia')}
        </button>
      ) : (
        <p className="auth-switch-copy">
          {mode === 'signup' ? (
            <>
              {t('Already have an account?', 'Tayari una akaunti?')}{' '}
              <Link href="/login">
                {t('Login to your account', 'Ingia kwenye akaunti yako')}
              </Link>
            </>
          ) : (
            <>
              {t("Don't have an account?", 'Huna akaunti?')}{' '}
              <Link href="/signup">
                {t('Create account', 'Fungua akaunti')}
              </Link>
            </>
          )}
        </p>
      )}
    </section>
  )
}

function PasswordField({
  id,
  label,
  value,
  showPassword,
  onChange,
  onToggle,
  autoComplete,
  placeholder,
  t,
}) {
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
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={6}
          value={value}
          onChange={onChange}
          required
        />

        <button
          className="auth-password-toggle"
          type="button"
          onClick={onToggle}
          aria-label={
            showPassword
              ? t('Hide password', 'Ficha nenosiri')
              : t('Show password', 'Onyesha nenosiri')
          }
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <EyeOff aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
}
