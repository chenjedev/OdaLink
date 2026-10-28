
import AuthForm from "../../components/AuthForm";
import { SiteHeader, SiteFooter } from "../../components/SiteLayout";

export default function LoginPage() {
  return (
    <div className="oda-page auth-page">
      <SiteHeader compact />

      <main className="auth-main">
        <AuthForm initialMode="login" />
      </main>

      <SiteFooter />
    </div>
  );
}
