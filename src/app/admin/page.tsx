

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  fetchPrintsByName,
  mapToCardData,
  ScryfallCard,
} from "@/lib/scryfall";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import Image from "next/image";

// ответ Scryfall “list”
interface ScryfallListResponse<T> {
  object: "list";
  data: T[];
  has_more?: boolean;
  next_page?: string;
  total_cards?: number;
}

// ответ Scryfall “error”
interface ScryfallErrorResponse {
  object: "error";
  code: string;
  status: number;
  details: string;
  type?: string;
}

// то, что мы показываем в списке сетов
interface SetItem {
  scryfall_id: string;
  name: string;
  set: string;
  set_name: string;
  lang: string;
}

// то, что вернёт mapToCardData
type MappedCard = ReturnType<typeof mapToCardData>;

interface DbCard {
  _id: string;
  scryfall_id: string;
  name: string;
  set: string;
  set_name: string;
  variant: string;
  collector_number: string;
  faces?: Array<{ imageUrl: string }>;
  foilType: "nonfoil" | "foil" | "etched" | "surgefoil" | "rainbowfoil";
  isFoil: boolean;
  condition: "NM" | "LP" | "HP";
  prices: string;
  quantity: number;
  lang: string;
}



export default function AdminPage() {

  const router = useRouter();

  // 1. что ввёл пользователь
  const [name, setName] = useState<string>("");

  // 2. все принты карты, которые мы стянули из Scryfall по имени
  const [allPrints, setAllPrints] = useState<ScryfallCard[]>([]);

  // 3. уникальные сеты, которые показываем в ScrollArea
  const [sets, setSets] = useState<SetItem[]>([]);

  // 4. выбранная карточка (конкретная печать) — чтобы показать “Вы выбрали сет …”
  const [selectedCard, setSelectedCard] = useState<MappedCard | null>(null);

  // 5. варианты внутри выбранного сета (regular/borderless/…)
  const [setVariants, setSetVariants] = useState<MappedCard[]>([]);

  // 6. карты из БД с таким именем (чтобы не добавлять дубликаты)
  // const [dbCards, setDbCards] = useState<MappedCard[]>([]);
  const [dbCards, setDbCards] = useState<DbCard[]>([]);


  // служебные
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);



  // Из всех принтов вытащить уникальные сеты в удобный вид
  
  const buildSetsFromPrints = (prints: ScryfallCard[]): SetItem[] => {
    const map = new Map<string, SetItem>();

    for (const card of prints) {
      if (!map.has(card.set)) {
        map.set(card.set, {
          scryfall_id: card.id,
          name: card.name,
          set: card.set,
          set_name: card.set_name,
          lang: card.lang,
        });
      }
    }

    return Array.from(map.values());
  };

  /**
   * Когда пользователь кликает по сету в списке
   */
  const handleSelectSet = (scryfallId: string) => {
    // найдём ту печать, по которой кликнули
    const baseCard = allPrints.find((c) => c.id === scryfallId);
    if (!baseCard) {
      setMessage("Не удалось найти карту для выбранного сета");
      return;
    }

    // код сета
    const setCode = baseCard.set;

    // все принты именно этого сета
    const cardsInThisSet = allPrints.filter((c) => c.set === setCode);

    // мапим в формат БД (то, что у тебя в mapToCardData)
    const mappedVariants = cardsInThisSet.map((card) => mapToCardData(card));

    setSelectedCard(mapToCardData(baseCard));
    setSetVariants(mappedVariants);
    setMessage(`Выбран сет: ${baseCard.set_name}. Вариантов: ${mappedVariants.length}`);
  };

  // ======== эффект на ввод имени (дебаунс) ========
  useEffect(() => {
    if (!name.trim()) {
      // пусто — всё сбрасываем
      setAllPrints([]);
      setSets([]);
      setSelectedCard(null);
      setSetVariants([]);
      setMessage("");
      return;
    }

    // дебаунс — не долбим Scryfall на каждый символ
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const prints = await fetchPrintsByName(name.trim(), controller.signal);
        setAllPrints(prints);

        // извлечение уникальных сетов
        const uniqueSets = buildSetsFromPrints(prints);
        setSets(uniqueSets);

        // загрузка карт из БД------------
        
        const dbRes = await fetch(`/api/cards/by-name?name=${encodeURIComponent(name.trim())}`);
        const dbData = await dbRes.json();
        setDbCards(dbData.cards || []);
        //-------------------------------

        setSelectedCard(null);
        setSetVariants([]);

        if (prints.length === 0) {
          setMessage("Не удалось найти карты");
        } else {
          setMessage(
            `Найдено ${prints.length} печатей в ${uniqueSets.length} сет(ах)`
          );
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          // запрос отменён — ничего не делаем
          return;
        }
        setMessage(error instanceof Error ? error.message : "Ошибка загрузки с Scryfall");
        setAllPrints([]);
        setSets([]);
        setSelectedCard(null);
        setSetVariants([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 0.5 секунды — комфортно

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [name]);


  function toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  


  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-6">Add Magic Card</h1>
  
      {/* === Две колонки === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
        {/* ================= LEFT COLUMN  Input================= */}
        <div>
          {/* Input */}
{/* Ввод имени карты */}
<div className="space-y-2 relative w-[400px]">

  <Input
    value={name}
    onChange={async (e) => {
      const value = e.target.value;
      const title = toTitleCase(value);
      setName(title);

      // если меньше 3 символов — скрываем подсказки
      if (value.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // 🔥 Scryfall Autocomplete API
      try {
        const res = await fetch(
          `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(value)}`
        );
        const data = await res.json();

        if (data.data) {
          setSuggestions(data.data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    }}
    placeholder="Введите название карты…"
    className="w-full"
  />

  {/* 🔻 Выпадающий список автоподсказок */}
  {showSuggestions && suggestions.length > 0 && (
    <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow max-h-60 overflow-y-auto z-50">
      {suggestions.map((s) => (
        <div
          key={s}
          onClick={() => {
            setName(s);
            setShowSuggestions(false);

            // запускаем твою логику поиска по выбранному имени
            setTimeout(() => setName(s), 0);
          }}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          {s}
        </div>
      ))}
    </div>
  )}

  {/* Статусное сообщение */}
  {isLoading && (
    <p className="text-sm text-gray-500">Загружаю варианты с Scryfall…</p>
  )}
  {message && !isLoading && (
    <p className="text-sm text-gray-700">{message}</p>
  )}

  {/* 🔹 Если выбран сет — показываем кнопку "Изменить сет" */}
  {selectedCard && (
    <div className="mt-4 flex justify-between items-center w-full">
      <h2 className="text-lg font-semibold">
        {selectedCard.set_name} ({selectedCard.set.toUpperCase()})
      </h2>

      <button
        onClick={() => {
          setSelectedCard(null);
          setSetVariants([]);
          setMessage("Выберите другой сет для этой карты");
        }}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        Изменить сет
      </button>
    </div>
  )}
</div>

  
          {/* ==== SET LIST (Scryfall) ==== */}
          {sets.length > 0 && !selectedCard && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Найдена в таких сетах:</h3>
  
              <ScrollArea className="h-[250px] border rounded-xl bg-white p-3">
                <ul className="space-y-1">
                  {sets.map((s) => (
                    <li
                      key={s.scryfall_id}
                      onClick={() => handleSelectSet(s.scryfall_id)}
                      className="cursor-pointer hover:bg-gray-100 border-b pb-1 last:border-none"
                    >
                      {s.name} — {s.set_name} • ({s.lang.toUpperCase()})
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
  
          {/* ==== SELECTED SET VARIANTS ==== */}
          {setVariants.length > 0 && (
            <section className="mt-8 space-y-4">
              <h3 className="text-xl font-semibold">
                Варианты в сете {setVariants[0].set_name} ({setVariants.length})
              </h3>
  
              <div className="grid sm:grid-cols-2 gap-4">
                {setVariants.map((variant) => (
                  <div
                    key={variant.scryfall_id}
                    className="rounded-xl border p-3 bg-white hover:shadow transition"
                  >
                    <div className="text-sm font-semibold mb-2">
                      {variant.name}{" "}
                      {variant.collector_number && (
                        <span className="text-gray-500 text-xs">
                          #{variant.collector_number}
                        </span>
                      )}
                      <div className="text-xs text-gray-700 mt-0.5">
                        {variant.variant
                          ? `— ${variant.variant.toUpperCase()}`
                          : "— REGULAR"}
                      </div>
                    </div>
  
                    <div className="flex gap-2 justify-center">
                      {variant.faces.map((face, i) => (
                        <Image
                          key={i}
                          src={face.imageUrl}
                          alt={`${variant.name}-face-${i}`}
                          width={128} // ← обязательно!
                          height={176} // ← обязательно!
                          className="w-32 h-44 object-contain rounded-lg border"
                        />
                      ))}
                    </div>
  
                    <Button
                      onClick={() =>
                        router.push(`/admin/add/${variant.scryfall_id}`)
                      }
                      className="mt-3 w-full bg-black text-white hover:bg-gray-800"
                    >
                      Добавить в базу
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
  

{/* ================= RIGHT COLUMN — CARDS FROM DB ================= */}
<div>
  <h2 className="text-xl font-semibold mb-3">
    В базе: {dbCards.length}
  </h2>

  {dbCards.length === 0 && (
    <div className="text-gray-500">
      Карт с таким названием пока нет
    </div>
  )}

  {/* GRID: 3 карточки в ряд */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {dbCards.map((card) => (
      <div
        key={card._id}
        className="bg-white border rounded-lg p-3 shadow hover:shadow-md transition flex flex-col"
      >
        {/* ===== TOP — TITLE BLOCK ===== */}
        <div className="mb-3">
          <div className="font-semibold text-base leading-tight">
            {card.name}
          </div>

          <div className="text-gray-500 text-xs">
            #{card.collector_number}
          </div>

          <div className="text-gray-600 text-xs">
            {card.set_name}
          </div>
        </div>

        {/* ===== MIDDLE — IMAGE + INFO ROW ===== */}
        <div className="flex gap-3 mt-auto">
          {/* LEFT: IMAGE */}
          <div className="w-20 min-w-20">
  {card.faces && card.faces.length > 0 && card.faces[0].imageUrl ? (
    <Image
      src={card.faces[0].imageUrl}
      alt={card.name}
      width={128}
      height={176}
      className="w-full h-auto rounded border"
    />
  ) : (
    <div className="w-full h-[176px] flex items-center justify-center bg-gray-100 text-xs text-gray-500 rounded border">
      Нет изображения
    </div>
  )}
</div>

          {/* RIGHT: INFO */}
          <div className="flex flex-col text-sm space-y-0.5 text-gray-700">
            <div><span className="font-medium">{card.variant}</span></div>
            <div>Foil: <span className="font-medium">{card.isFoil ? card.foilType : "nonfoil"}</span></div>
            <div>Состояние: <span className="font-medium">{card.condition}</span></div>
            <div>Язык: <span className="font-medium">{card.lang}</span></div>
            <div>Цена: <span className="font-medium">{card.prices}</span></div>
            <div>Кол-во: <span className="font-medium">{card.quantity}</span></div>
          </div>
        </div>

        {/* BUTTON */}
        <Button
          onClick={() =>
            router.push(`/admin/add/${card.scryfall_id}?db=${card._id}`)
          }
          className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-700 text-sm"
        >
          Редактировать
        </Button>
      </div>
    ))}
  </div>
</div>

        

      </div>
    </main>
  );
  
}











{/* 💾 кнопка (оставляю как в разметке) */}
{/* <button
  onClick={() =>
    console.log("💾 Добавить", variant.scryfall_id, variant)
  }
  className="mt-3 w-full rounded-lg bg-black text-white py-2 text-sm hover:bg-gray-800"
>
  Добавить в базу
</button> */}
{/* <Button
onClick={async () => {
try {
const res = await fetch("/api/cards", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(variant),
});

const data = await res.json();

if (res.ok) {
alert(`✅ ${data.message}`);
} else if (res.status === 409) {
alert("⚠️ Эта карта уже есть в базе");
} else {
alert(`❌ Ошибка: ${data.message}`);
}
} catch (err) {
console.error("Ошибка при добавлении:", err);
alert("⚠️ Не удалось добавить карту");
}
}}
className="mt-3 w-full bg-black text-white hover:bg-gray-800"
>
Добавить в базу
</Button> */}