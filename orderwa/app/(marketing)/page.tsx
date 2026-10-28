
"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [lang, setLang] = useState<"en" | "sw">("en");

  const t = (en: string, sw: string) => lang === "en" ? en : sw;

  return (
    <div className="landing">
      <div style={{ textAlign: "right", padding: "12px 20px" }}>
        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "sw" : "en")}
          aria-label="Change language"
        >
          {lang === "en" ? "SW" : "EN"}
        </button>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <p className="badge">
            <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.53 3.63 1.46 5.13L2 22l4.98-1.42A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
            {t("WhatsApp orders, organized", "Oda za WhatsApp, zilizopangwa vizuri")}
          </p>
          <h1 className="hero-title">
            {t("Take WhatsApp orders", "Pokea oda za WhatsApp")}
            <span className="hero-highlight">
              {t(" without the chaos", " bila vurugu")}
            </span>
          </h1>
          <p className="subtitle">
            {t(
              "Customers order from your store link. You see every order in one place — name, items, phone, total.",
              "Wateja wanaagiza kupitia link ya duka lako. Unaona oda zote sehemu moja — jina, bidhaa, simu na jumla ya malipo."
            )}
          </p>
          <div className="hero-buttons">
            <Link href="/signup" className="btn-primary">
              {t("Start for free", "Anza bure")}
            </Link>
          </div>
          <p className="hero-trust">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            {t(
              "Free to start · No credit card needed · Set up in 2 minutes",
              "Kuanza ni bure · Hakuna kadi ya benki inayohitajika · Weka tayari kwa dakika 2"
            )}
          </p>
        </div>

        {/* ORDER PREVIEW MOCKUP (an example, not a real order) */}
        <div className="mockup-wrap">
          <div className="mockup-phone">
            <div className="mockup-header">
              <span className="mockup-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.53 3.63 1.46 5.13L2 22l4.98-1.42A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </span>
              <div className="mockup-title">
                <strong>{t("New order received", "Oda mpya imepokelewa")}</strong>
                <span>OdaLink · {t("example", "mfano")}</span>
              </div>
              <span className="mockup-unread">1</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-order">
                <p className="mockup-order-label">{t("Order #1042", "Oda #1042")}</p>
                <h4>Asha Mbwana</h4>
                <p className="mockup-order-phone">+255 712 345 678</p>
                <ul>
                  <li><span>Black shirt</span><strong>x3</strong>45,000 TZS</li>
                  <li><span>Grey Pant</span><strong>x1</strong>30,000 TZS</li>
                  <li><span>Jordan 4</span><strong>x1</strong>70,000 TZS</li>
                </ul>
                <div className="mockup-total">
                  <span>{t("Total", "Jumla")}</span>
                  <strong>TZS 145,000</strong>
                </div>
                <div className="mockup-actions">
                  <span className="mockup-confirm">{t("Confirm order", "Thibitisha oda")}</span>
                  <span className="mockup-chat">{t("Chat on WhatsApp", "Wasiliana WhatsApp")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR: only things that are true today */}
      <section className="trust-bar">
        <div className="trust-item">
          <strong>{t("Free", "Bure")}</strong>
          <span>{t("To start", "Kuanza")}</span>
        </div>
        <div className="trust-item">
          <strong>{t("1 link", "Link 1")}</strong>
          <span>{t("For your whole shop", "Kwa duka lako lote")}</span>
        </div>
        <div className="trust-item">
          <strong>{t("No app", "Hakuna app")}</strong>
          <span>{t("For your customers", "Kwa wateja wako")}</span>
        </div>
        <div className="trust-item">
          <strong>{t("2 min", "Dakika 2")}</strong>
          <span>{t("Setup time", "Muda wa kujiandaa")}</span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="section-head">
          <p className="eyebrow">{t("How it works", "Jinsi inavyofanya kazi")}</p>
          <h2>{t("Three simple steps to take control of your orders", "Hatua tatu rahisi za kusimamia oda zako")}</h2>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <h3>{t("Share your store link", "Shiriki link ya duka lako")}</h3>
            <p>{t(
              "Send customers your OdaLink link on WhatsApp, status, or bio.",
              "Watumie wateja link ya OdaLink kupitia WhatsApp, status au bio yako."
            )}</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h3>{t("Customer orders", "Mteja anaagiza")}</h3>
            <p>{t(
              "They browse your products, add to cart, and send the order with their name and phone. It also reaches you on WhatsApp.",
              "Wateja wanaangalia bidhaa zako, wanaweka kwenye kikapu na kutuma oda pamoja na majina na namba zao za simu. Oda pia inakufikia WhatsApp."
            )}</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h3>{t("You deliver", "Unakabidhi bidhaa")}</h3>
            <p>{t(
              "See it on your dashboard, contact them on WhatsApp, and deliver.",
              "Unaiona oda kwenye dashboard yako, unawasiliana na mteja WhatsApp na kumkabidhi bidhaa."
            )}</p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits-wrap">
        <div className="section-head">
          <p className="eyebrow">{t("Why OdaLink", "Kwa nini OdaLink")}</p>
          <h2>{t("Everything your business needs", "Kila kitu ambacho biashara yako inahitaji")}</h2>
        </div>
        <div className="benefits">
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <h3>{t("Store link", "Link ya duka")}</h3>
            <p>{t("Share your shop link on WhatsApp with customers.", "Shiriki link ya duka lako na wateja kupitia WhatsApp.")}</p>
          </div>
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
            <h3>{t("Clear orders", "Oda zilizo wazi")}</h3>
            <p>{t("Name, phone, items, and total — not messy DMs.", "Jina, simu, bidhaa na jumla ya malipo — bila kuchanganyikiwa na jumbe nyingi.")}</p>
          </div>
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <h3>{t("Dashboard", "Dashibodi")}</h3>
            <p>{t("Track all your orders from one simple dashboard.", "Fuatilia oda zako zote kupitia dashibodi moja rahisi.")}</p>
          </div>
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>{t("Instant WhatsApp chat", "Wasiliana WhatsApp papo hapo")}</h3>
            <p>{t("Reach customers directly on WhatsApp with one tap.", "Wasiliana na wateja moja kwa moja WhatsApp kwa kugusa mara moja.")}</p>
          </div>
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
                <path d="M3 8l9 5 9-5" />
                <line x1="12" y1="13" x2="12" y2="21" />
              </svg>
            </div>
            <h3>{t("Stock that updates itself", "Stoo inayojisasisha")}</h3>
            <p>{t(
              "Stock goes down when an order comes in, and comes back if you cancel it.",
              "Idadi ya bidhaa hupungua oda inapopokelewa na hurudi oda ikifutwa."
            )}</p>
          </div>
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3>{t("Customer details", "Taarifa za mteja")}</h3>
            <p>{t("Every order includes name and phone, ready to follow up.", "Kila oda ina jina na namba ya simu ya mteja kwa ajili ya mawasiliano ya baadaye.")}</p>
          </div>
        </div>
      </section>

      {/* EARLY SELLERS (replaces the made-up testimonials) */}
      <section className="testimonials-wrap">
        <div className="section-head">
          <p className="eyebrow">{t("Just getting started", "Tunaanza safari")}</p>
          <h2>{t("Be one of our first sellers", "Kuwa mmoja wa wauzaji wetu wa kwanza")}</h2>
        </div>
        <div className="testimonials">
          <div className="testimonial">
            <p>{t(
              "OdaLink is new, and we are looking for our first sellers. Message us on WhatsApp and we will help you set up your shop.",
              "OdaLink ni mpya, na tunatafuta wauzaji wetu wa kwanza. Tutumie ujumbe WhatsApp nasi tutakusaidia kuandaa duka lako."
            )}</p>
            <a
              className="btn-whatsapp"
              href="https://wa.me/255659148967?text=Hi%2C%20I%20want%20to%20set%20up%20my%20shop%20on%20OdaLink"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("Chat with us on WhatsApp", "Wasiliana nasi WhatsApp")}
            </a>
          </div>
        </div>
      </section>

      {/* PRICING: only what exists today */}
      <section className="pricing-wrap">
        <div className="section-head">
          <p className="eyebrow">{t("Pricing", "Bei")}</p>
          <h2>{t("Free while we grow", "Bure tunapoendelea kukua")}</h2>
        </div>
        <div
          className="pricing"
          style={{ display: "block", maxWidth: 420, margin: "0 auto" }}
        >
          <div className="price-card featured">
            <span className="price-tag">{t("Early sellers", "Wauzaji wa mwanzo")}</span>
            <h3>{t("Free", "Bure")}</h3>
            <p className="price">TZS 0<span>{t("/month", "/mwezi")}</span></p>
            <ul>
              <li>{t("Your own store link", "Link yako binafsi ya duka")}</li>
              <li>{t("Product photos, prices and stock", "Picha za bidhaa, bei na stoo")}</li>
              <li>{t("Orders with name, phone, items and total", "Oda zenye jina, simu, bidhaa na jumla ya malipo")}</li>
              <li>{t("Order status: pending, confirmed, delivered, cancelled", "Hali ya oda: inasubiri, imethibitishwa, imefikishwa, imefutwa")}</li>
              <li>{t("Order message sent to your WhatsApp", "Ujumbe wa oda unatumiwa WhatsApp yako")}</li>
              <li>{t("Dashboard with order and stock totals", "Dashibodi yenye jumla ya oda na bidhaa stoo")}</li>
            </ul>
            <Link href="/signup" className="btn-primary price-btn">{t("Start for free", "Anza bure")}</Link>
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: 16 }}>
          {t(
            "Paid plans may come later. If they do, you will hear from us first.",
            "Mipango ya kulipia inaweza kuja baadaye. Ikifika, tutakujulisha kwanza."
          )}
        </p>
      </section>

      {/* FAQ */}
      <section className="faq-wrap">
        <div className="section-head">
          <p className="eyebrow">FAQ</p>
          <h2>{t("Frequently asked questions", "Maswali yanayoulizwa mara kwa mara")}</h2>
        </div>
        <div className="faq">
          <details>
            <summary>{t("How do customers place an order?", "Wateja wanaagizaje?")}</summary>
            <p>{t(
              "You share your OdaLink store link on WhatsApp, status, or bio. Customers browse your products, add them to the cart, enter their name and phone, and send the order — no app to download.",
              "Unashiriki link ya duka lako la OdaLink kupitia WhatsApp, status au bio. Wateja wanaangalia bidhaa, wanaziweka kwenye kikapu, wanaingiza majina na namba zao za simu, kisha wanatuma oda — hakuna app ya kupakua."
            )}</p>
          </details>
          <details>
            <summary>{t("How do I receive orders?", "Ninapokeaje oda?")}</summary>
            <p>{t(
              "Every order shows up in your dashboard with the customer's name, phone number, items, and total. The customer can also send the order to your WhatsApp with one tap, and you can chat with them directly from your dashboard.",
              "Kila oda inaonekana kwenye dashibodi yako ikiwa na jina la mteja, namba ya simu, bidhaa na jumla ya malipo. Mteja anaweza pia kutuma oda WhatsApp yako kwa kugusa mara moja, na unaweza kuwasiliana naye moja kwa moja kupitia dashibodi."
            )}</p>
          </details>
          <details>
            <summary>{t("What happens to my stock?", "Nini hutokea kwa bidhaa zangu stoo?")}</summary>
            <p>{t(
              "Stock goes down automatically when an order comes in. If you cancel an order, the stock comes back. Customers cannot order more than you have.",
              "Idadi ya bidhaa stoo hupungua moja kwa moja oda inapopokelewa. Ukifuta oda, bidhaa hurudi stoo. Wateja hawawezi kuagiza bidhaa nyingi kuliko ulizonazo."
            )}</p>
          </details>
          <details>
            <summary>{t("Is it really free?", "Je, ni bure kweli?")}</summary>
            <p>{t(
              "Yes. OdaLink is free while we are getting started. If we add paid plans later, you will hear from us before anything changes.",
              "Ndiyo. OdaLink ni bure tunapoanza. Tukiongeza mipango ya kulipia baadaye, tutakujulisha kabla ya mabadiliko yoyote."
            )}</p>
          </details>
          <details>
            <summary>{t("Do customers need the WhatsApp app?", "Je, wateja wanahitaji app ya WhatsApp?")}</summary>
            <p>{t(
              "No. Customers just open your store link in any browser and place an order. The WhatsApp connection is on your side so you can follow up easily.",
              "Hapana. Wateja wanafungua tu link ya duka lako kwenye browser yoyote na kuweka oda. Muunganisho wa WhatsApp uko upande wako ili uweze kuwasiliana nao kwa urahisi."
            )}</p>
          </details>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bottom-cta">
        <h2>{t("Ready to organize your orders?", "Uko tayari kupanga oda zako?")}</h2>
        <p>{t("Set up your shop in a couple of minutes. It's free.", "Andaa duka lako kwa dakika chache tu. Ni bure.")}</p>
        <div className="cta-buttons">
          <Link href="/signup" className="btn-primary">
            {t("Start for free", "Anza bure")}
          </Link>
          <a
            className="btn-whatsapp"
            href="https://wa.me/255659148967?text=Hi%2C%20I%20want%20to%20know%20more%20about%20OdaLink"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="icon wa" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.53 3.63 1.46 5.13L2 22l4.98-1.42A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
            {t("Chat with us on WhatsApp", "Wasiliana nasi WhatsApp")}
          </a>
        </div>
      </section>
    </div>
  );
}
