import AuthForm from "../../components/AuthForm";

export default function LoginPage() {
  return  ( <div className="oda-page auth-page">
      <SiteHeader compact />
      <main className="auth-main">
        <AuthForm initialMode="login" />
      </main>
      <SiteLinkFooter />
    </div>
)}
