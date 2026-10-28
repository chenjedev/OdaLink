
"use client";

import React, { useState } from "react";

type Language = "en" | "sw";

function AddOrder({ onClose }: { onClose: () => void }) {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [items, setItems] = useState("");
  const [total, setTotal] = useState("");
  const [isAdd, setIsAdd] = useState(false);
  const [language, setLanguage] = useState<Language>("en");

  const translations = {
    en: {
      title: "Add Order",
      success: "Order added successfully",
      customer: "Customer",
      customerPlaceholder: "Customer name...",
      phone: "Phone",
      phonePlaceholder: "Phone number...",
      items: "Items",
      itemsPlaceholder: "Order items...",
      total: "Total",
      totalPlaceholder: "Total amount...",
      save: "Save",
      done: "Done",
      close: "Close",
    },
    sw: {
      title: "Ongeza Oda",
      success: "Oda imeongezwa kikamilifu",
      customer: "Mteja",
      customerPlaceholder: "Jina la mteja...",
      phone: "Simu",
      phonePlaceholder: "Namba ya simu...",
      items: "Bidhaa",
      itemsPlaceholder: "Bidhaa zilizoagizwa...",
      total: "Jumla",
      totalPlaceholder: "Kiasi cha jumla...",
      save: "Hifadhi",
      done: "Maliza",
      close: "Funga",
    },
  };

  const t = translations[language];

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsAdd(true);
  }

  return (
    <div className="modal-overlay">
      <div className="add-prod-page">
        <div className="register-form">
          <div className="add-prod-header">
            <h2>{isAdd ? t.success : t.title}</h2>

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              aria-label={t.close}
            >
              x
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="language">Language / Lugha</label>
            <select
              id="language"
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as Language)
              }
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
            </select>
          </div>

          {!isAdd ? (
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label htmlFor="customer">{t.customer}</label>
                <input
                  id="customer"
                  type="text"
                  placeholder={t.customerPlaceholder}
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">{t.phone}</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder={t.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="items">{t.items}</label>
                <input
                  id="items"
                  type="text"
                  placeholder={t.itemsPlaceholder}
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="total">{t.total}</label>
                <input
                  id="total"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={t.totalPlaceholder}
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <button type="submit" className="save-btn">
                  {t.save}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="detail-row">
                <span>{t.customer}</span>
                <strong>{customer}</strong>
              </div>

              <div className="detail-row">
                <span>{t.phone}</span>
                <strong>{phone}</strong>
              </div>

              <div className="detail-row">
                <span>{t.items}</span>
                <strong>{items}</strong>
              </div>

              <div className="detail-row">
                <span>{t.total}</span>
                <strong>
                  {Number(total).toLocaleString(
                    language === "sw" ? "sw-TZ" : "en-US"
                  )}{" "}
                  Tsh
                </strong>
              </div>

              <div className="form-group">
                <button
                  type="button"
                  className="save-btn"
                  onClick={onClose}
                >
                  {t.done}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddOrder;
