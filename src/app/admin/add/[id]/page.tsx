
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { mapToCardData, ScryfallCard } from "@/lib/scryfall";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type FoilType = "nonfoil" | "foil" | "etched" | "surgefoil" | "rainbowfoil";
type Condition = "NM" | "LP" | "HP";

interface CardFace {
  side: string;
  imageUrl: string;
}

interface CardForm {
  scryfall_id: string;
  name: string;
  set_name: string;
  rarity: string;
  type_line: string;
  colors: string[];
  faces: CardFace[];
  variant: string;
  foilType: FoilType;
  prices: string;      // ← в форме ВСЕГДА строка
  quantity: string;    // ← в форме ВСЕГДА строка
  collector_number: string;
  lang: string;
  isFoil: boolean;
  condition: Condition;
}

// Карта из БД (то, что приходит из /api/cards)
interface DbCard extends Omit<CardForm, "prices" | "quantity"> {
  _id: string;
  prices: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function AddCardPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const dbId = searchParams.get("db"); // ?db=<mongoId>, если редактируем

  const [card, setCard] = useState<CardForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // режим редактирования существующей карты

  // универсальный апдейтер
  const update = <K extends keyof CardForm>(key: K, value: CardForm[K]) => {
    setCard((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  // ===== Загрузка: либо из БД (редактирование), либо из Scryfall (новая) =====
  useEffect(() => {
    const load = async () => {
      try {
        // 1) Если есть dbId — редактируем уже существующую карту
        if (dbId) {
          const res = await fetch(`/api/cards?id=${encodeURIComponent(dbId)}`);
          if (res.ok) {
            const data = await res.json();

            if (data.exists && data.card) {
              const dbCard = data.card as DbCard;

              const formCard: CardForm = {
                scryfall_id: dbCard.scryfall_id,
                name: dbCard.name,
                set_name: dbCard.set_name,
                rarity: dbCard.rarity,
                type_line: dbCard.type_line,
                colors: dbCard.colors,
                faces: dbCard.faces,
                variant: dbCard.variant,
                foilType: dbCard.foilType,
                prices: dbCard.prices.toString(),
                quantity: dbCard.quantity.toString(),
                collector_number: dbCard.collector_number,
                lang: dbCard.lang,
                isFoil: dbCard.isFoil,
                condition: dbCard.condition,
              };

              setCard(formCard);
              setIsEditing(true);
              setLoading(false);
              return;
            }
          }
        }

        // 2) Новая карта — грузим Scryfall
        const scryRes = await fetch(`https://api.scryfall.com/cards/${id}`);
        const scryData: ScryfallCard = await scryRes.json();
        const base = mapToCardData(scryData);

        const formFromScry: CardForm = {
          scryfall_id: base.scryfall_id,
          name: base.name,
          set_name: base.set_name,
          rarity: base.rarity,
          type_line: base.type_line,
          colors: base.colors,
          faces: base.faces,
          variant: base.variant,
          foilType: base.foilType,
          prices: "",
          quantity: "",
          collector_number: base.collector_number,
          lang: base.lang,
          isFoil: base.isFoil,
          condition: base.condition as Condition,
        };

        setCard(formFromScry);
        setIsEditing(false);
      } catch (error) {
        console.error("Ошибка загрузки карты:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void load();
    }
  }, [id, dbId]);

  if (loading || !card) {
    return (
      <div className="p-10 text-center text-gray-600">
        Загрузка данных карты...
      </div>
    );
  }

  // ===== Сохранение НОВОЙ карты (POST) =====
  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });

      const data = await res.json();

      if (res.status === 409 && data.card) {
        // дубликат — карта уже есть в базе
        alert("⚠️ Такая карта уже есть в базе. Подгружаю её данные.");
        const dbCard = data.card as DbCard;

        const formCard: CardForm = {
          scryfall_id: dbCard.scryfall_id,
          name: dbCard.name,
          set_name: dbCard.set_name,
          rarity: dbCard.rarity,
          type_line: dbCard.type_line,
          colors: dbCard.colors,
          faces: dbCard.faces,
          variant: dbCard.variant,
          foilType: dbCard.foilType,
          prices: dbCard.prices.toString(),
          quantity: dbCard.quantity.toString(),
          collector_number: dbCard.collector_number,
          lang: dbCard.lang,
          isFoil: dbCard.isFoil,
          condition: dbCard.condition,
        };

        setCard(formCard);
        setIsEditing(true);
        if (dbCard._id) {
          router.replace(
            `/admin/add/${dbCard.scryfall_id}?db=${encodeURIComponent(dbCard._id)}`
          );
        }
        return;
      }

      if (!res.ok) {
        alert(`❌ Ошибка: ${data.message ?? data.error ?? "Неизвестно"}`);
        return;
      }

      alert("✅ Карта добавлена");
      router.push("/admin");
    } catch (error) {
      console.error("Ошибка при добавлении:", error);
      alert("❌ Ошибка при добавлении карты");
    } finally {
      setSaving(false);
    }
  };

  // ===== Обновление ТОЛЬКО цены и количества (PATCH) =====
  const handleUpdate = async () => {
    if (!dbId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/cards?id=${encodeURIComponent(dbId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prices: card.prices,
          quantity: card.quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`❌ Ошибка: ${data.message ?? data.error ?? "Неизвестно"}`);
        return;
      }

      alert("✅ Цена и количество обновлены");
      router.push("/admin");
    } catch (error) {
      console.error("Ошибка при обновлении:", error);
      alert("❌ Ошибка при обновлении карты");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (isEditing) {
      void handleUpdate();
    } else {
      void handleCreate();
    }
  };

  // ================== UI ==================
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-semibold mb-6">
        {isEditing ? "Редактирование карты" : "Добавить карту в базу"}
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl space-y-6">
        {/* Картинки */}
        <div className="flex justify-center gap-3">
          {card.faces.map((face) => (
            <Image
              key={face.side}
              src={face.imageUrl}
              alt={`${card.name}-${face.side}`}
              width={250}
              height={350}
              className="rounded-lg border"
            />
          ))}
        </div>

        {/* Основные данные (только чтение) */}
        <div className="space-y-2 text-sm">
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

        {/* Foil (при редактировании — только просмотр) */}
        <div className="flex items-center gap-4">
          <Switch
            checked={card.isFoil}
            disabled={isEditing}
            onCheckedChange={(checked) => {
              if (isEditing) return;
              update("isFoil", checked);
              update("foilType", checked ? "foil" : "nonfoil");
            }}
          />
          <Label className={isEditing ? "opacity-60" : ""}>Foil версия</Label>

          {card.isFoil && (
            <Select
              disabled={isEditing}
              value={card.foilType}
              onValueChange={(val) =>
                update("foilType", val as FoilType)
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Тип foil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="foil">Foil</SelectItem>
                <SelectItem value="etched">Etched</SelectItem>
                <SelectItem value="surgefoil">Surgefoil</SelectItem>
                <SelectItem value="rainbowfoil">Rainbowfoil</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Состояние (при редактировании тоже нельзя менять) */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Состояние карты
          </label>
          <Select
            disabled={isEditing}
            value={card.condition}
            onValueChange={(value) =>
              update("condition", value as Condition)
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

        {/* Цена */}
        <div>
          <label className="block mb-1 text-sm font-medium">Цена</label>
          <Input
            type="number"
            min="0"
            step="1"
            value={card.prices}
            onChange={(e) => update("prices", e.target.value)}
            placeholder="0"
          />
        </div>

        {/* Количество */}
        <div>
          <label className="block mb-1 text-sm font-medium">Количество</label>
          <Input
            type="number"
            min="0"
            step="1"
            value={card.quantity}
            onChange={(e) => update("quantity", e.target.value)}
            placeholder="0"
          />
        </div>

        {/* Язык (при редактировании — нельзя менять) */}
        <div>
          <label className="block mb-1 text-sm font-medium">Язык</label>
          <Select
            disabled={isEditing}
            value={card.lang}
            onValueChange={(value) => update("lang", value)}
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

        {/* Кнопки */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => router.back()}>
            Назад
          </Button>
          <Button
            className="bg-black text-white hover:bg-gray-800"
            disabled={saving}
            onClick={handleSaveClick}
          >
            {saving
              ? "Сохраняю..."
              : isEditing
              ? "💾 Обновить цену и количество"
              : "💾 Сохранить"}
          </Button>
        </div>
      </div>
    </main>
  );
}

