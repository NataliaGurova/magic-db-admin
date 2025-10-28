
//   //  ==  Правильное !!!!!=======

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";

interface CardForm {
  name: string;
  prices: string;
  number: string;
  lang: string;
  isFoil: boolean;
}

interface PreviewCard {
  imageUrl: string;
  name: string;
}

export default function AdminPage() {
  const [formData, setFormData] = useState<CardForm>({
    name: "",
    prices: "",
    number: "",
    lang: "en",
    isFoil: false,
  });
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<PreviewCard | null>(null);

  // 🔹 Автопоиск по имени
  useEffect(() => {
    if (!formData.name) {
      setPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(formData.name)}`);
        const card = res.data;
        const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || "";
        setPreview({ name: card.name, imageUrl });
      } catch {
        setPreview(null);
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(timer);
  }, [formData.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    const checked = type === "checkbox" ? (target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? !!checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("⏳ Adding card...");

    try {
      const response = await axios.post("/api/cards", formData);
      setMessage(`✅ Added: ${response.data.card.name}`);
      setFormData({ name: "", prices: "", number: "", lang: "EN", isFoil: false });
      setPreview(null);
    } catch (error) {
      if (error instanceof Error) setMessage("❌ " + error.message);
      else setMessage("❌ Unknown error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Add Magic Card</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Card Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl"
          required
        />

        <input
          type="text"
          name="prices"
          placeholder="Price ($)"
          value={formData.prices}
          onChange={handleChange}
          onBlur={() => {
            if (formData.prices) {
              const num = parseFloat(formData.prices);
              if (!isNaN(num)) setFormData(prev => ({ ...prev, prices: num.toFixed(2) }));
            }
          }}
          className="w-full p-3 border rounded-xl"
          required
        />

        <input
          type="number"
          name="number"
          placeholder="Number in stock"
          value={formData.number}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl"
          required
        />

        <select name="lang" value={formData.lang} onChange={handleChange} className="p-3 mr-10 border rounded-xl">
          <option value="en">English</option>
          <option value="ru">Russian</option>
          <option value="fr">French</option>
          <option value="ja">Japanese</option>
          <option value="de">DE</option>
        </select>

        <label>
          <input
            type="checkbox"
            name="isFoil"
            checked={formData.isFoil}
            onChange={handleChange}
          />
          Foil?
        </label>

        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl transition">Add Card</button>
      </form>

      {preview && (
  <div style={{ marginTop: 16, textAlign: "center" }}>
    <h3>{preview.name}</h3>
    <Image
      src={preview.imageUrl}
      alt={preview.name}
      width={210}
      height={293} // Next.js не поддерживает дробные height, округли до 293
      style={{ objectFit: "cover", borderRadius: 8 }}
    />
  </div>
)}

      {message && <p style={{ marginTop: 16 }}>{message}</p>}
    </div>
  );
}


