
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export interface CardOption {
  id: string;
  name: string;
  set: string;
  set_name: string;
}

interface CardSearchInputProps {
  onSelect: (card: CardOption) => void;
}

export default function CardSearchInput({ onSelect }: CardSearchInputProps) {
  const [query, setQuery] = useState<string>("");
  const [options, setOptions] = useState<CardOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const toTitleCase = (str: string): string =>
    str.replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.substring(1).toLowerCase());

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async (): Promise<void> => {
      if (query.trim().length < 3) {
        setOptions([]);
        return;
      }

      try {
        setLoading(true);

        // 1️⃣ Autocomplete
        const auto = await axios.get<{ data: string[] }>(
          `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        const first = auto.data.data?.[0];
        if (!first) {
          setOptions([]);
          return;
        }

        // 2️⃣ Search all printings
        const res = await axios.get<{ data: Array<Record<string, unknown>> }>(
          `https://api.scryfall.com/cards/search?q=!${encodeURIComponent(first)}`,
          { signal: controller.signal }
        );

        const cards: CardOption[] = res.data.data.map((c) => ({
          id: String(c.id),
          name: toTitleCase(String(c.name)),
          set: String(c.set),
          set_name: String(c.set_name),
        }));

        setOptions(cards);
      } catch (err) {
        if (!axios.isCancel(err)) console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchData, 400); // debounce 0.4s
    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="space-y-2">
      <input
        className="border rounded p-2 w-full"
        placeholder="Введите имя карты"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <div className="text-sm text-gray-500">Загрузка...</div>}

      {!loading && options.length > 0 && (
        <ul className="border rounded divide-y max-h-60 overflow-auto bg-white shadow-sm">
          {options.map((opt) => (
            <li
              key={opt.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelect(opt)}
            >
              {opt.name} — <span className="text-gray-500">{opt.set_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
