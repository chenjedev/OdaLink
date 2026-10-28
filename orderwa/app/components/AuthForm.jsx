
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
  Phone,
  ShieldCheck,
  UserRound,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const cleanEmail = (email) => email.trim().toLowerCase()

export default function AuthForm({ initialMode = 'signup', lang = 'en' }) {
  const router = useRouter()

  const [mode, setMode] = useState(
    initialMode === 'register' ? 'signup' : initialMode
  )
  const [language, setLanguage] = useState(lang === 'sw' ? 'sw' : 'en')

  const [values, setValues] = useState({
    name: '',
    phone: '',
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

  const phoneDigits = values.phone.replace(/\D/g, '').length
  const phoneIsValid = phoneDigits >= 10 && phoneDigits <= 15
  const passwordIsValid = values.password.length >= 6

  const missingRequirements = [
    {
      label: t('name', 'jina'),
      complete: values.name.trim().length > 0,
    },
    {
      label: t('a valid phone number', 'namba sahihi ya simu'),
      complete: phoneIsValid,
    },
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
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail(values.email),
          password: values.password,
          options: {
            data: {
              name: values.name.trim(),
              phone: values.phone.trim(),
            },
          },
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

        <button
          type="button"
          className="auth-text-button"
          onClick={() =>
            setLanguage((current) => current === 'en' ? 'sw' : 'en')
          }
          aria-label="Change language"
        >
          {language === 'en' ? 'SW' : 'EN'}
        </button>
      </div>

      <h1 id="auth-title" className="auth-title">
        {title}
      </h1>

      <p className="auth-description">
        {description}
      </p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {mode === 'signup' && (
          <div className="auth-field-grid">
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-name">
                <UserRound aria-hidden="true" />
                {t('Name', 'Jina')}
              </label>

              <input
                className="auth-input"
                id="auth-name"
                name="name"
                autoComplete="name"
                placeholder={t('eg. John Doe', 'mf. John Doe')}
                value={values.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-phone">
                <Phone aria-hidden="true" />
                {t('Phone', 'Namba ya Simu')}
              </label>

              <input
                className="auth-input"
                id="auth-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="eg. 0712345678"
                value={values.phone}
                onChange={handleChange}
                required
              />
            </div>

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

      <p className="auth-preview-note" role="note">
        <ShieldCheck aria-hidden="true" />
        {t(
          'Your account is protected by Supabase authentication.',
          'Akaunti yako inalindwa na mfumo wa Supabase.'
        )}
      </p>

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
