"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { fetchPrintsByName, mapToCardData, ScryfallCard } from "@/lib/scryfall";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CardForm {
  name: string;
  set_name: string;
  rarity: string;
  type_line: string;
  colors: string[];
  faces: Array<{ side: string; imageUrl: string }>;
  variant: string;
  // foilType: string;
  foilType: "nonfoil" | "foil" | "etched" | "surgefoil" | "rainbowfoil";
  prices: string;
  collector_number: string;
  quantity: string;
  lang: string;
  isFoil: boolean;
  condition: string;
  // condition: "NM" | "LP" | "HP";
}


export default function AddCardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [card, setCard] = useState<CardForm | null>(null);

  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);


  useEffect(() => {
    const loadCard = async () => {
      
      try {
        const res = await fetch(`https://api.scryfall.com/cards/${id}`);
        const data: ScryfallCard = await res.json();
        setCard(mapToCardData(data));
      } catch (err) {
        console.error("Ошибка загрузки карты:", err);
      }
    }
    if (id) loadCard();
      }, [id]);
      


  if (!card) {
    return (
      <div className="p-10 text-center text-gray-600">
        Загрузка данных карты...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Добавить карту в базу
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl space-y-6">
        {/* Изображение */}
        <div className="flex justify-center">
          {card.faces.map((face, i) => (
            <Image
              key={i}
              src={face.imageUrl}
              alt={`${card.name}-face-${i}`}
              width={250}
              height={350}
              className="rounded-lg border"
            />
          ))}
        </div>

        {/* Основные данные */}
        <div className="space-y-3 text-sm">
          <p>
            <strong>Название:</strong> {card.name}
          </p>
          <p>
            <strong>Сет:</strong> {card.set_name}
          </p>
          <p>
            <strong>Редкость:</strong> {card.rarity}
          </p>
          <p>
            <strong>Тип:</strong> {card.type_line}
          </p>
          <p>
            <strong>Цвета:</strong>{" "}
            {card.colors.length > 0 ? card.colors.join(", ") : "—"}
          </p>
          <p>
            <strong>Оформление:</strong> {card.variant}
          </p>
        </div>

        <div className="space-y-4">
        {/* Настройки перед добавлением */}
        {/* <div className="space-y-4">
          foilType
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Foil Type
            </label>
            <Select
              value={card.foilType}
              onValueChange={(value) =>
                setCard((prev) => (prev ? { ...prev, foilType: value } : prev))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nonfoil">Nonfoil</SelectItem>
                <SelectItem value="foil">Foil</SelectItem>
                <SelectItem value="etched">Etched</SelectItem>
                <SelectItem value="surgefoil">Surgefoil</SelectItem>
                <SelectItem value="rainbowfoil">Rainbowfoil</SelectItem>
              </SelectContent>
            </Select>
          </div> */}


          {/* 🔹 Foil версия */}
<div className="flex items-center gap-6 mt-2">
  {/* Переключатель */}
  <div className="flex items-center gap-3">
    <Switch
      id="isFoil"
      checked={card.isFoil}
      onCheckedChange={(checked) =>
        setCard((prev) =>
          prev
            ? {
                ...prev,
                isFoil: checked,
                foilType: checked ? "foil" : "nonfoil",
              }
            : prev
        )
      }
    />
    <Label htmlFor="isFoil" className="text-sm font-medium text-gray-800">
      Foil версия
    </Label>
  </div>

  {/* Селект для выбора типа фойла */}
  {card.isFoil && (
    <div className="flex items-center gap-2">
      <Label className="text-sm text-gray-700">Тип:</Label>
      <Select
        value={card.foilType}
        onValueChange={(val) =>
          setCard((prev) => (prev ? { ...prev, foilType: val as CardForm["foilType"] } : prev))
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Выбери тип" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="foil">Foil</SelectItem>
          <SelectItem value="etched">Etched</SelectItem>
          <SelectItem value="surgefoil">Surgefoil</SelectItem>
          <SelectItem value="rainbowfoil">Rainbowfoil</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )}
</div>

          {/* Состояние карты */}
<div>
  <label className="block mb-1 text-sm font-medium text-gray-700">
    Состояние карты
  </label>
  <Select
    value={card.condition}
    onValueChange={(value) =>
      setCard((prev) => (prev ? { ...prev, condition: value } : prev))
    }
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Выберите состояние" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="NM">Near Mint (NM)</SelectItem>
      <SelectItem value="LP">Lightly Played (LP)</SelectItem>
      <SelectItem value="HP">Heavily Played (HP)</SelectItem>
    </SelectContent>
  </Select>
</div>



          {/* Цена (USD) */}
<div>
  <label className="block mb-1 text-sm font-medium text-gray-700">
    Цена (USD)
  </label>
  <Input
    type="number"
    step="1"
    min="0"
    value={card.prices}
    onChange={(e) =>
      setCard((prev) => (prev ? { ...prev, prices: e.target.value } : prev))
    }
    placeholder="0"
  />
</div>


          {/* Количество */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Количество
            </label>
            <Input
              type="number"
              value={card.quantity}
              onChange={(e) =>
                setCard((prev) =>
                  prev ? { ...prev, quantity: e.target.value } : prev
                )
              }
              placeholder="0"
            />
          </div>

          {/* Язык */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Язык
            </label>
            <Select
              value={card.lang}
              onValueChange={(value) =>
                setCard((prev) => (prev ? { ...prev, lang: value } : prev))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите язык" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="jp">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Фойл чекбокс */}
          {/* <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={card.isFoil}
              onChange={(e) =>
                setCard((prev) =>
                  prev ? { ...prev, isFoil: e.target.checked } : prev
                )
              }
            />
            <label>Foil версия</label>
          </div> */}
        </div>

        {/* Кнопки */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => router.back()}>
            Назад
          </Button>
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={async () => {
              try {
                const res = await fetch("/api/cards", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(card),
                });
                const data = await res.json();
                if (res.ok) {
                  alert("✅ Карта добавлена");
                  router.push("/admin");
                } else {
                  alert(`⚠️ Ошибка: ${data.message}`);
                }
              } catch (err) {
                alert("❌ Ошибка при добавлении");
                console.error(err);
              }
            }}
          >
            💾 Сохранить
          </Button>

        </div>
      </div>
    </main>
  );
}
