"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import axios from "axios";

import { fetchPrintsByName, mapToCardData, ScryfallCard } from "@/lib/scryfall";

import AutocompleteInput from "@/components/admin/AutocompleteInput";
import SetsList from "@/components/admin/SetsList";
import VariantsList from "@/components/admin/VariantsList";
import RightColumnCards from "@/components/admin/RightColumnCards";
import SelectSetHeader from "@/components/admin/SelectSetHeader";

import { SetItem, DbCard, MappedCard } from "@/types/cards";

export default function AdminPage() {
  const router = useRouter();

  // === STATE ===
  const [name, setName] = useState("");
  const [allPrints, setAllPrints] = useState<ScryfallCard[]>([]);
  const [sets, setSets] = useState<SetItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<MappedCard | null>(null);
  const [setVariants, setSetVariants] = useState<MappedCard[]>([]);
  const [dbCards, setDbCards] = useState<DbCard[]>([]);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // === BUILD UNIQUE SETS ===
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

  // === SELECT SET ===
  const handleSelectSet = (scryfallId: string) => {
    const baseCard = allPrints.find((c) => c.id === scryfallId);
    if (!baseCard) {
      setMessage("Не удалось найти карту для выбранного сета");
      return;
    }

    const setCode = baseCard.set;
    const cardsInThisSet = allPrints.filter((c) => c.set === setCode);

    const mappedVariants = cardsInThisSet.map((card) => mapToCardData(card));

    setSelectedCard(mapToCardData(baseCard));
    setSetVariants(mappedVariants);

    setMessage(
      `Выбран сет: ${baseCard.set_name}. Вариантов: ${mappedVariants.length}`
    );
  };

  // === LOAD PRINTS FROM SCRYFALL ===
  useEffect(() => {
    if (!name.trim()) {
      setAllPrints([]);
      setSets([]);
      setSelectedCard(null);
      setSetVariants([]);
      setMessage("");
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsLoading(true);

      try {
        const prints = await fetchPrintsByName(name.trim(), controller.signal);

        setAllPrints(prints);
        setSets(buildSetsFromPrints(prints));

        // === LOAD CARDS FROM DB ===
        const dbRes = await fetch(
          `/api/cards/by-name?name=${encodeURIComponent(name.trim())}`
        );
        const dbData = await dbRes.json();
        setDbCards(dbData.cards || []);

        setSelectedCard(null);
        setSetVariants([]);

        setMessage(
          prints.length === 0
            ? "Не удалось найти карты"
            : `Найдено ${prints.length} печатей в ${sets.length} сет(ах)`
        );
      } catch (error) {
        if (!axios.isCancel(error)) {
          setMessage("Ошибка загрузки данных с Scryfall");
          setAllPrints([]);
          setSets([]);
          setSelectedCard(null);
          setSetVariants([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [name]);

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-6">
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold mb-6">
          Add new entry, Edit details
        </h1>

        </div>
      </div>

      {/* LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-4 w-[580px]">
          <AutocompleteInput
            value={name}
            onChange={setName}
            placeholder="Введите название карты…"
          />

          <SelectSetHeader
            selectedCard={selectedCard}
            onReset={() => {
              setSelectedCard(null);
              setSetVariants([]);
              setMessage("Выберите другой сет для этой карты");
            }}
          />

          {!selectedCard && sets.length > 0 && (
            <SetsList sets={sets} onSelect={handleSelectSet} />
          )}

          {setVariants.length > 0 && <VariantsList variants={setVariants} />}
        </div>

        {/* RIGHT COLUMN */}
        <RightColumnCards dbCards={dbCards} />
      </div>
    </main>
  );
}










