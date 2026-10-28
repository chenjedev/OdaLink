import AuthForm from "../../components/AuthForm";

export default function SignUpPage() {
  return (
    <div className="oda-page auth-page">
      <SiteHeader compact />

      <main className="auth-main">
        <AuthForm initialMode="register" />
      </main>

      <SiteFooter />
    </div>
  );
}
