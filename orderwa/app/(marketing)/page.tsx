"use client";

import { SiteHeader, SiteFooter } from "../components/SiteLayout";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Check,
  Clock3,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  Store,
  UsersRound,
} from "lucide-react";

// Lucide has no WhatsApp logo, so we draw it here.
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const features = [
  {
    icon: Store,
    label: "STORE LINK",
    title: "Your own store link",
    description:
      "Share your shop on WhatsApp, your status, or your bio so customers can browse before they order.",
  },
  {
    icon: ShoppingBag,
    label: "CLEAR ORDERS",
    title: "Every detail in one place",
    description:
      "See each customer, phone number, item, and total without searching through chat history.",
  },
  {
    icon: Boxes,
    label: "LIVE DASHBOARD",
    title: "A simple order dashboard",
    description:
      "Track orders and stock totals, then update each order from pending through delivery.",
  },
  {
    icon: MessageCircle,
    label: "WHATSAPP FOLLOW-UP",
    title: "Chat with one tap",
    description:
      "Reach customers directly on WhatsApp to confirm details and coordinate delivery.",
  },
  {
    icon: PackageCheck,
    label: "STOCK THAT STAYS IN SYNC",
    title: "Keep stock up to date",
    description:
      "Stock adjusts when an order comes in and is restored if you cancel that order.",
  },
  {
    icon: UsersRound,
    label: "CUSTOMER DETAILS",
    title: "Follow up with confidence",
    description:
      "Customer names and phone numbers stay attached to each order for easy follow-up.",
  },
];

const steps = [
  {
    number: "01",
    icon: ArrowUpRight,
    title: "Share your store link",
    description:
      "Send your OdaLink link on WhatsApp, your status, or your social bio.",
  },
  {
    number: "02",
    icon: ShoppingBag,
    title: "Customers place an order",
    description:
      "They browse, add products to cart, and send their name, phone, items, and total. The order also reaches you on WhatsApp.",
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Follow up and deliver",
    description:
      "Manage each order from your dashboard, contact the customer on WhatsApp, and deliver.",
  },
];

function StorePreview() {
  return (
    <div
      className="hero-visual"
      role="group"
      aria-label="Sample WhatsApp order notification"
    >
      <div className="visual-glow" aria-hidden="true" />

      <article className="order-notification">
        <header className="order-notification-header">
          <span className="notification-icon" aria-hidden="true">
            <MessageCircle size={25} strokeWidth={2.2} />
          </span>

          <span className="notification-copy">
            <strong>New order received</strong>
            <span>OdaLink · example</span>
          </span>

          <span
            className="notification-count"
            role="img"
            aria-label="One new order"
          >
            1
          </span>
        </header>

        <div className="order-receipt">
          <div className="receipt-meta">
            <span>ORDER #1042</span>
            <span className="receipt-status">NEW</span>
          </div>

          <div className="receipt-customer">
            <div>
              <h2>Asha M.</h2>
              <p>Customer phone included</p>
            </div>

            <span className="receipt-avatar" aria-hidden="true">
              AM
            </span>
          </div>

          <ul className="receipt-items" aria-label="Order items">
            <li>
              <span>Black shirt</span>
              <strong>x3</strong>
              <span>45,000 TZS</span>
            </li>

            <li>
              <span>Grey Pant</span>
              <strong>x1</strong>
              <span>30,000 TZS</span>
            </li>

            <li>
              <span>Jordan 4</span>
              <strong>x1</strong>
              <span>70,000 TZS</span>
            </li>
          </ul>

          <div className="receipt-total">
            <span>Total</span>
            <strong>TZS 145,000</strong>
          </div>

          <div
            className="receipt-actions"
            role="group"
            aria-label="Order actions preview"
          >
            <span className="receipt-confirm">
              <Check aria-hidden="true" size={15} /> Confirm order
            </span>

            <span className="receipt-whatsapp">
              <WhatsAppIcon size={15} /> Chat on WhatsApp
            </span>
          </div>
        </div>

        <p className="preview-caption">
          A sample order with the details you need to follow up.
        </p>
      </article>
    </div>
  );
}

function ArrowDownIcon() {
  return (
    <ArrowRight className="downward-arrow" aria-hidden="true" size={16} />
  );
}

function HeroSection() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker">
            <span className="hero-kicker-dot" aria-hidden="true" />
            WhatsApp orders, organized
          </p>

          <h1 id="hero-title" className="hero-title">
            Take WhatsApp
            <span>orders without the chaos.</span>
          </h1>

          <p className="hero-description">
            Customers order from your store link. You see every order in one
            place — name, items, phone, and total.
          </p>

          <div className="hero-actions">
            <a className="button-primary" href="/signup">
              Start for free <ArrowRight aria-hidden="true" size={17} />
            </a>

            <a className="button-secondary" href="#how-it-works">
              See how it works <ArrowDownIcon />
            </a>
          </div>

          <div className="hero-benefits" aria-label="Getting started details">
            <span>
              <Check aria-hidden="true" size={14} /> Free to start
            </span>
            <span>
              <Check aria-hidden="true" size={14} /> No credit card needed
            </span>
            <span>
              <Check aria-hidden="true" size={14} /> Set up in 2 minutes
            </span>
          </div>
        </div>

        <StorePreview />
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      className="content-section features-section"
      id="features"
      aria-labelledby="features-title"
    >
      <div className="section-intro">
        <p className="section-kicker">A BETTER EVERYDAY WORKFLOW</p>

        <h2 id="features-title">
          Everything you need to sell, <span>all in one link.</span>
        </h2>

        <p className="section-description">
          Less back-and-forth to find the details. More time to give your
          customers a great experience.
        </p>
      </div>

      <div className="feature-grid">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article className="feature-card" key={feature.title}>
              <span className="feature-icon">
                <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
              </span>

              <p className="feature-label">{feature.label}</p>
              <h3>{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>

              <span className="feature-link" aria-hidden="true">
                <ArrowUpRight size={17} />
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section
      className="how-section"
      id="how-it-works"
      aria-labelledby="how-title"
    >
      <div className="how-inner">
        <div className="how-heading">
          <div>
            <p className="section-kicker">THREE SIMPLE STEPS</p>

            <h2 id="how-title">
              From product list to <span>new order.</span>
            </h2>
          </div>

          <p className="how-description">
            Set up the basics once, then give customers an easier way to browse
            and reach you.
          </p>
        </div>

        <ol className="steps-grid">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <li className="step-card" key={step.number}>
                <div className="step-topline">
                  <span className="step-number">{step.number}</span>

                  <span className="step-icon">
                    <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                  </span>
                </div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section
      className="about-section"
      id="about"
      aria-labelledby="about-title"
    >
      <div className="about-copy">
        <span className="about-icon">
          <UsersRound aria-hidden="true" size={21} />
        </span>

        <p className="section-kicker">MADE FOR YOUR WAY OF WORKING</p>

        <h2 id="about-title">
          A smoother day for you. A clearer experience for your customers.
        </h2>

        <p>
          Your business already runs on conversations. OdaLink gives those
          conversations a little more structure — without taking the personal
          touch away.
        </p>
      </div>

      <div className="about-note" aria-label="A simple order journey">
        <div className="about-note-header">
          <span className="note-avatar">O</span>

          <span>
            <strong>A better order flow</strong>
            <span>Storefront to conversation</span>
          </span>

          <span className="note-check">
            <Check size={15} aria-hidden="true" />
          </span>
        </div>

        <div className="journey-line">
          <span className="journey-step">
            <span className="journey-dot journey-dot-store">
              <Store size={15} aria-hidden="true" />
            </span>
            <span>Browse your store</span>
          </span>

          <span className="journey-connector" aria-hidden="true" />

          <span className="journey-step">
            <span className="journey-dot journey-dot-order">
              <ShoppingBag size={15} aria-hidden="true" />
            </span>
            <span>Send an order</span>
          </span>

          <span className="journey-connector" aria-hidden="true" />

          <span className="journey-step">
            <span className="journey-dot journey-dot-chat">
              <WhatsAppIcon size={15} />
            </span>
            <span>Chat on WhatsApp</span>
          </span>
        </div>

        <div className="about-note-footer">
          <Clock3 size={14} aria-hidden="true" /> Clear details, right when you
          need them.
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="closing-cta" aria-labelledby="closing-title">
      <div className="closing-copy">
        <p className="closing-kicker">JUST GETTING STARTED</p>

        <h2 id="closing-title">Be one of our first sellers.</h2>

        <p>
          OdaLink is new, and we are looking for our first sellers. Message us
          and we will help you set up your shop.
        </p>
      </div>

      <div className="closing-actions">
        <a className="closing-button" href="/signup">
          Start for free <ArrowUpRight aria-hidden="true" size={17} />
        </a>

        <a
          className="closing-contact"
          href="https://wa.me/255659148967?text=Hi%2C%20I%20want%20to%20set%20up%20my%20shop%20on%20OdaLink"
        >
          Chat with us on WhatsApp <WhatsAppIcon size={16} />
        </a>
      </div>

      <span className="closing-decoration" aria-hidden="true" />
    </section>
  );
}

export default function OdaLinkLanding() {
  return (
    <div className="oda-page" id="top">
      <SiteHeader />

      <main>
        <div className="hero-shell">
          <HeroSection />
        </div>

        <FeaturesSection />
        <HowItWorksSection />
        <AboutSection />
        <ClosingCta />
      </main>

      <SiteFooter />
    </div>
  );
}
