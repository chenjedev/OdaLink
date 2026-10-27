import Link from "next/link";

export default function HomePage() {
  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <p className="badge">
            <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.53 3.63 1.46 5.13L2 22l4.98-1.42A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
            WhatsApp orders, organized
          </p>
          <h1 className="hero-title">
            Take WhatsApp orders
            <span className="hero-highlight"> without the chaos</span>
          </h1>
          <p className="subtitle">
            Customers order from your store link. You see every order in one
            place — name, items, phone, total.
          </p>
          <div className="hero-buttons">
            <Link href="/signup" className="btn-primary">
              Start for free
            </Link>
          </div>
          <p className="hero-trust">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Free to start · No credit card needed · Set up in 2 minutes
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
                <strong>New order received</strong>
                <span>OdaLink · example</span>
              </div>
              <span className="mockup-unread">1</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-order">
                <p className="mockup-order-label">Order #1042</p>
                <h4>Asha Mbwana</h4>
                <p className="mockup-order-phone">+255 712 345 678</p>
                <ul>
                  <li><span>Black shirt</span><strong>x3</strong>45,000 TZS</li>
                  <li><span>Grey Pant</span><strong>x1</strong>30,000 TZS</li>
                  <li><span>Jordan 4</span><strong>x1</strong>70,000 TZS</li>
                </ul>
                <div className="mockup-total">
                  <span>Total</span>
                  <strong>TZS 145,000</strong>
                </div>
                <div className="mockup-actions">
                  <span className="mockup-confirm">Confirm order</span>
                  <span className="mockup-chat">Chat on WhatsApp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR: only things that are true today */}
      <section className="trust-bar">
        <div className="trust-item">
          <strong>Free</strong>
          <span>To start</span>
        </div>
        <div className="trust-item">
          <strong>1 link</strong>
          <span>For your whole shop</span>
        </div>
        <div className="trust-item">
          <strong>No app</strong>
          <span>For your customers</span>
        </div>
        <div className="trust-item">
          <strong>2 min</strong>
          <span>Setup time</span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="section-head">
          <p className="eyebrow">How it works</p>
          <h2>Three simple steps to take control of your orders</h2>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <h3>Share your store link</h3>
            <p>
              Send customers your OdaLink link on WhatsApp, status, or bio.
            </p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h3>Customer orders</h3>
            <p>
              They browse your products, add to cart, and send the order with
              their name and phone. It also reaches you on WhatsApp.
            </p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h3>You deliver</h3>
            <p>
              See it on your dashboard, contact them on WhatsApp, and deliver.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits-wrap">
        <div className="section-head">
          <p className="eyebrow">Why OdaLink</p>
          <h2>Everything your business needs</h2>
        </div>
        <div className="benefits">
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <h3>Store link</h3>
            <p>Share your shop link on WhatsApp with customers.</p>
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
            <h3>Clear orders</h3>
            <p>Name, phone, items, and total — not messy DMs.</p>
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
            <h3>Dashboard</h3>
            <p>Track all your orders from one simple dashboard.</p>
          </div>
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Instant WhatsApp chat</h3>
            <p>Reach customers directly on WhatsApp with one tap.</p>
          </div>
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
                <path d="M3 8l9 5 9-5" />
                <line x1="12" y1="13" x2="12" y2="21" />
              </svg>
            </div>
            <h3>Stock that updates itself</h3>
            <p>
              Stock goes down when an order comes in, and comes back if you
              cancel it.
            </p>
          </div>
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3>Customer details</h3>
            <p>Every order includes name and phone, ready to follow up.</p>
          </div>
        </div>
      </section>

      {/* EARLY SELLERS (replaces the made-up testimonials) */}
      <section className="testimonials-wrap">
        <div className="section-head">
          <p className="eyebrow">Just getting started</p>
          <h2>Be one of our first sellers</h2>
        </div>
        <div className="testimonials">
          <div className="testimonial">
            <p>
              OdaLink is new, and we are looking for our first sellers. Message
              us on WhatsApp and we will help you set up your shop.
            </p>
            <a
              className="btn-whatsapp"
              href="https://wa.me/255659148967?text=Hi%2C%20I%20want%20to%20set%20up%20my%20shop%20on%20OdaLink"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* PRICING: only what exists today */}
      <section className="pricing-wrap">
        <div className="section-head">
          <p className="eyebrow">Pricing</p>
          <h2>Free while we grow</h2>
        </div>
        <div
          className="pricing"
          style={{ display: "block", maxWidth: 420, margin: "0 auto" }}
        >
          <div className="price-card featured">
            <span className="price-tag">Early sellers</span>
            <h3>Free</h3>
            <p className="price">TZS 0<span>/month</span></p>
            <ul>
              <li>Your own store link</li>
              <li>Product photos, prices and stock</li>
              <li>Orders with name, phone, items and total</li>
              <li>Order status: pending, confirmed, delivered, cancelled</li>
              <li>Order message sent to your WhatsApp</li>
              <li>Dashboard with order and stock totals</li>
            </ul>
            <Link href="/signup" className="btn-primary price-btn">Start for free</Link>
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: 16 }}>
          Paid plans may come later. If they do, you will hear from us first.
        </p>
      </section>

      {/* FAQ */}
      <section className="faq-wrap">
        <div className="section-head">
          <p className="eyebrow">FAQ</p>
          <h2>Frequently asked questions</h2>
        </div>
        <div className="faq">
          <details>
            <summary>How do customers place an order?</summary>
            <p>
              You share your OdaLink store link on WhatsApp, status, or bio.
              Customers browse your products, add them to the cart, enter
              their name and phone, and send the order — no app to download.
            </p>
          </details>
          <details>
            <summary>How do I receive orders?</summary>
            <p>
              Every order shows up in your dashboard with the customer&apos;s
              name, phone number, items, and total. The customer can also send
              the order to your WhatsApp with one tap, and you can chat with
              them directly from your dashboard.
            </p>
          </details>
          <details>
            <summary>What happens to my stock?</summary>
            <p>
              Stock goes down automatically when an order comes in. If you
              cancel an order, the stock comes back. Customers cannot order
              more than you have.
            </p>
          </details>
          <details>
            <summary>Is it really free?</summary>
            <p>
              Yes. OdaLink is free while we are getting started. If we add paid
              plans later, you will hear from us before anything changes.
            </p>
          </details>
          <details>
            <summary>Do customers need the WhatsApp app?</summary>
            <p>
              No. Customers just open your store link in any browser and place
              an order. The WhatsApp connection is on your side so you can
              follow up easily.
            </p>
          </details>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bottom-cta">
        <h2>Ready to organize your orders?</h2>
        <p>Set up your shop in a couple of minutes. It&apos;s free.</p>
        <div className="cta-buttons">
          <Link href="/signup" className="btn-primary">
            Start for free
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
            Chat with us on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
