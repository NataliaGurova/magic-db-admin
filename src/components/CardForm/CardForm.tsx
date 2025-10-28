"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import Image from "next/image";

interface CardFormData {
  name: string;
  prices: string;
  number: string;
  lang: string;
  isFoil: boolean;
}

interface PreviewCard {
  name: string;
  imageUrl: string;
}

export default function CardForm() {
  const [formData, setFormData] = useState<CardFormData>({
    name: "",
    prices: "",
    number: "",
    lang: "EN",
    isFoil: false,
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [preview, setPreview] = useState<PreviewCard | null>(null);
  const [message, setMessage] = useState("");

  // 🔹 Автоподсказки Scryfall (autocomplete)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.name.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await axios.get(
          `https://api.scryfall.com/cards/autocomplete?q=${formData.name}`
        );
        setSuggestions(res.data.data);
      } catch {
        setSuggestions([]);
      }
    };

    const timer = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timer);
  }, [formData.name]);

  // 🔹 При выборе подсказки — загрузка данных карты
  const handleSelectSuggestion = async (name: string) => {
    setFormData((prev) => ({ ...prev, name }));
    setSuggestions([]);

    try {
      const res = await axios.get(
        `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`
      );
      const card = res.data;
      const imageUrl =
        card.image_uris?.normal ||
        card.card_faces?.[0]?.image_uris?.normal ||
        "";

      setPreview({ name: card.name, imageUrl });
    } catch {
      setPreview(null);
    }
  };

  // 🔹 Обработка изменений формы
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : undefined;

    let newValue: string | boolean = value;

    if (name === "name") {
      // Каждое слово с заглавной буквы
      newValue = value
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? !!checked : newValue,
    }));
  };

  // 🔹 Отправка формы
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("⏳ Adding card...");

    try {
      const payload = {
        ...formData,
        prices: Number(formData.prices).toFixed(2),
        imageUrl: preview?.imageUrl || "",
      };

      const res = await axios.post("/api/cards", payload);

      if (res.data.success) {
        setMessage("✅ Card added successfully!");
        setFormData({ name: "", prices: "", number: "", lang: "EN", isFoil: false });
        setPreview(null);
      } else {
        setMessage("⚠️ Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add card.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Add Magic Card</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Card Name"
          value={formData.name}
          onChange={handleChange}
          autoComplete="off"
          required
        />

        {/* Подсказки */}
        {suggestions.length > 0 && (
          <ul
            style={{
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: 8,
              background: "#fff",
              listStyle: "none",
              maxHeight: 150,
              overflowY: "auto",
              marginTop: -8,
              marginBottom: 8,
            }}
          >
            {suggestions.map((s, i) => (
              <li
                key={i}
                style={{
                  padding: "4px 6px",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
                onClick={() => handleSelectSuggestion(s)}
                onKeyDown={(e) => e.key === "Enter" && handleSelectSuggestion(s)}
                tabIndex={0}
              >
                {s}
              </li>
            ))}
          </ul>
        )}

        {/* Price */}
        <input
          type="text"
          name="prices"
          placeholder="Price ($)"
          value={formData.prices}
          onChange={handleChange}
          onBlur={() => {
            if (formData.prices) {
              const num = parseFloat(formData.prices);
              if (!isNaN(num))
                setFormData((prev) => ({
                  ...prev,
                  prices: num.toFixed(2),
                }));
            }
          }}
          required
        />

        {/* Number */}
        <input
          type="number"
          name="number"
          placeholder="Number in stock"
          value={formData.number}
          onChange={handleChange}
          required
        />

        {/* Language */}
        <select name="lang" value={formData.lang} onChange={handleChange}>
          <option value="EN">EN</option>
          <option value="JP">JP</option>
          <option value="DE">DE</option>
          <option value="RU">RU</option>
        </select>

        {/* Foil */}
        <label>
          <input
            type="checkbox"
            name="isFoil"
            checked={formData.isFoil}
            onChange={handleChange}
          />
          Foil?
        </label>

        <button type="submit">Add Card</button>
      </form>

      {/* Превью */}
      {preview && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <h3>{preview.name}</h3>
          <Image
            src={preview.imageUrl}
            alt={preview.name}
            width={210}
            height={293} // округляем до ближайшего целого
            style={{ objectFit: "cover", borderRadius: 8 }}
          />
        </div>
      )}

      {message && <p style={{ marginTop: 16 }}>{message}</p>}
    </div>
  );
}




