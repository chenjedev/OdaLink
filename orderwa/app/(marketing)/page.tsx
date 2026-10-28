
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
              <MessageCircle aria-hidden="true" size={15} /> Chat on WhatsApp
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
    <ArrowRight
      className="downward-arrow"
      aria-hidden="true"
      size={16}
    />
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
              <MessageCircle size={15} aria-hidden="true" />
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
          Chat with us on WhatsApp{" "}
          <MessageCircle aria-hidden="true" size={16} />
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
