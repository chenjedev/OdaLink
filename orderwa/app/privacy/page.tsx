export const metadata = {
  title: "Privacy Policy | OdaLink",
};

export default function PrivacyPage() {
  return (
    <main
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "32px 20px 64px",
        lineHeight: 1.6,
        color: "#0f172a",
      }}
    >
      <h1>Privacy Policy</h1>
      <p>Last updated: November 2026</p>

      <p>
        OdaLink (odalink.vercel.app) helps small businesses in Tanzania
        receive customer orders on WhatsApp. This page explains what
        information we collect and how we use it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          Account details: your email address, and your name and profile
          picture if you sign in with Google.
        </li>
        <li>
          Shop details you enter: shop name, WhatsApp number, payment
          methods, products and orders.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        We use this information only to run your OdaLink account: to log you
        in, show your shop to customers, and manage your orders. We do not
        sell your information.
      </p>

      <h2>Where it is stored</h2>
      <p>
        Your data is stored with our service providers (Supabase for the
        database and login, Vercel for hosting). They process it only to
        provide these services.
      </p>

      <h2>Your choices</h2>
      <p>
        You can edit your shop details in Settings at any time. To delete
        your account and data, contact us at the email below.
      </p>

      <h2>Contact</h2>
      <p>odalinksupport@gmail.com</p>
    </main>
  );
}
