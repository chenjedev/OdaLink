"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
} from "lucide-react";

import OrdersPage from "./orders/page";
import ProductsPage from "./products/page";
import SettingsPage from "./settings/page";

type Tab = "overview" | "orders" | "products" | "settings";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "products", label: "Products", icon: Package },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>OdaLink Dashboard</h1>
          <p>Manage your shop in one place</p>
        </div>
      </header>

      <nav className="dashboard-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`dashboard-tab ${
                activeTab === tab.id ? "active" : ""
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <section className="dashboard-content">
        {activeTab === "overview" && (
          <div className="overview-content">
            <h2>Welcome to your dashboard 👋</h2>
            <p>
              Select Orders to manage customer orders, Products to manage
              your inventory, or Settings to manage your shop.
            </p>

            <div className="overview-actions">
              <button onClick={() => setActiveTab("orders")}>
                <ShoppingCart size={20} />
                Manage Orders
              </button>

              <button onClick={() => setActiveTab("products")}>
                <Package size={20} />
                Manage Products
              </button>

              <button onClick={() => setActiveTab("settings")}>
                <Settings size={20} />
                Shop Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === "orders" && <OrdersPage />}

        {activeTab === "products" && <ProductsPage />}

        {activeTab === "settings" && <SettingsPage />}
      </section>

      <style jsx>{`
        .dashboard-container {
          width: 100%;
          min-height: 100vh;
          padding: 24px;
          background: #f8fafc;
          color: #0f172a;
        }

        .dashboard-header {
          margin-bottom: 24px;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
        }

        .dashboard-header p {
          margin-top: 6px;
          color: #64748b;
        }

        .dashboard-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 12px;
          margin-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .dashboard-tab {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: white;
          color: #475569;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .dashboard-tab.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .dashboard-content {
          min-width: 0;
        }

        .overview-content {
          padding: 24px;
          border-radius: 16px;
          background: white;
          border: 1px solid #e2e8f0;
        }

        .overview-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .overview-actions button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: 0;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 600px) {
          .dashboard-container {
            padding: 14px;
          }

          .dashboard-header h1 {
            font-size: 23px;
          }

          .dashboard-tab {
            padding: 10px 12px;
          }
        }
      `}</style>
    </main>
  );
}