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
            <Link href="/login" className="btn-primary">
              Get started — it&apos;s free
            </Link>
            <Link href="/store/demo" className="btn-secondary">
              View demo store
            </Link>
          </div>
          <p className="hero-trust">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Free to start · No credit card needed · Set up in 2 minutes
          </p>
        </div>

        {/* ORDER PREVIEW MOCKUP */}
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
                <span>OrderWa · just now</span>
              </div>
              <span className="mockup-unread">1</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-order">
                <p className="mockup-order-label">Order #1042</p>
                <h4>Asha Mbwana</h4>
                <p className="mockup-order-phone">+255 712 345 678</p>
                <ul>
                  <li><span>Receipts</span><strong>x3</strong></li>
                  <li><span>Phone Case</span><strong>x1</strong></li>
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

      {/* TRUST BAR */}
      <section className="trust-bar">
        <div className="trust-item">
          <strong>+500</strong>
          <span>Businesses</span>
        </div>
        <div className="trust-item">
          <strong>+12k</strong>
          <span>Orders placed</span>
        </div>
        <div className="trust-item">
          <strong>98%</strong>
          <span>Satisfaction</span>
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
              Send customers your OrderWa link on WhatsApp, status, or bio.
            </p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h3>Customer orders</h3>
            <p>
              They browse products, checkout with name and phone, and place
              the order.
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
          <p className="eyebrow">Why OrderWa</p>
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
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3>Payments in mind</h3>
            <p>Works with TZS and mobile money friendly workflows.</p>
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

      {/* TESTIMONIALS */}
      <section className="testimonials-wrap">
        <div className="section-head">
          <p className="eyebrow">Trusted by businesses</p>
          <h2>Sellers who stopped losing orders</h2>
        </div>
        <div className="testimonials">
          <div className="testimonial">
            <div className="stars" aria-hidden="true">★★★★★</div>
            <p>
              &ldquo;Before OrderWa I was losing orders in my WhatsApp DMs every day.
              Now everything comes in one clean list.&rdquo;
            </p>
            <div className="testimonial-author">
              <span className="avatar">JU</span>
              <div>
                <strong>James Upendo</strong>
                <span>Phone dealer, Dar es Salaam</span>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <div className="stars" aria-hidden="true">★★★★★</div>
            <p>
              &ldquo;My customers love the store link. They order in seconds and I get
              all their details automatically.&rdquo;
            </p>
            <div className="testimonial-author">
              <span className="avatar">MN</span>
              <div>
                <strong>Maria Nkwera</strong>
                <span>Fashion boutique, Arusha</span>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <div className="stars" aria-hidden="true">★★★★★</div>
            <p>
              &ldquo;The dashboard is so simple. I can see every order with the phone
              number and just tap to chat on WhatsApp.&rdquo;
            </p>
            <div className="testimonial-author">
              <span className="avatar">HD</span>
              <div>
                <strong>Hamisi Daudi</strong>
                <span>Electronics shop, Mwanza</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-wrap">
        <div className="section-head">
          <p className="eyebrow">Pricing</p>
          <h2>Start free, upgrade when you grow</h2>
        </div>
        <div className="pricing">
          <div className="price-card">
            <h3>Free</h3>
            <p className="price">TZS 0<span>/month</span></p>
            <ul>
              <li>1 store link</li>
              <li>Up to 50 orders / month</li>
              <li>Basic dashboard</li>
              <li>WhatsApp contact</li>
            </ul>
            <Link href="/login" className="btn-secondary price-btn">Start free trial</Link>
          </div>
          <div className="price-card featured">
            <span className="price-tag">Most popular</span>
            <h3>Pro</h3>
            <p className="price">TZS 15,000<span>/month</span></p>
            <ul>
              <li>Unlimited orders</li>
              <li>Custom store link</li>
              <li>Order status tracking</li>
              <li>Payments integration</li>
              <li>Priority support</li>
            </ul>
            <Link href="/login" className="btn-primary price-btn">Get started</Link>
          </div>
          <div className="price-card">
            <h3>Business</h3>
            <p className="price">TZS 40,000<span>/month</span></p>
            <ul>
              <li>Everything in Pro</li>
              <li>Multiple stores</li>
              <li>Team members</li>
              <li>Advanced reports</li>
              <li>Dedicated support</li>
            </ul>
            <Link href="/login" className="btn-secondary price-btn">Contact us</Link>
          </div>
        </div>
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
              You share your OrderWa store link on WhatsApp, status, or bio.
              Customers browse your products, enter their name and phone,
              and place an order — no app to download.
            </p>
          </details>
          <details>
            <summary>How do I receive orders?</summary>
            <p>
              Every order shows up in your dashboard with the customer&apos;s
              name, phone number, items, and total. You can chat with them
              directly on WhatsApp with one tap.
            </p>
          </details>
          <details>
            <summary>Is there a limit on the free plan?</summary>
            <p>
              The free plan includes one store link and up to 50 orders per
              month. Upgrade to Pro for unlimited orders and more features.
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
        <p>Join hundreds of businesses taking WhatsApp orders the easy way.</p>
        <div className="cta-buttons">
          <Link href="/login" className="btn-primary">
            Get started — it&apos;s free
          </Link>
          <a
            className="btn-whatsapp"
            href="https://wa.me/1234567890?text=Hi%2C%20I%20want%20to%20know%20more%20about%20OrderWa"
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

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-mark">O</span>
            <span className="brand-name">OrderWa</span>
          </div>
          <p className="footer-tag">WhatsApp orders, organized.</p>
          <div className="footer-links">
            <Link href="/login">Login</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/store/demo">Demo store</Link>
          </div>
          <p className="footer-copy">© 2026 OrderWa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
