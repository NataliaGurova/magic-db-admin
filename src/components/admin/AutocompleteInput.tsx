
"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export default function AutocompleteInput({
  value,
  onChange,
  placeholder = "Введите название…",
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // закрытие списка при клике вне
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // запрос к Scryfall Autocomplete API
  async function fetchSuggestions(query: string) {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(
        `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (data.data) {
        setSuggestions(data.data);
        setShowSuggestions(true);
      }
    } catch (e) {
      console.error("Autocomplete error:", e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* INPUT */}
      <Input
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          const title = toTitleCase(raw);
          onChange(title);
          fetchSuggestions(raw);
        }}
        placeholder={placeholder}
        className="w-full"
      />

      {/* AUTOCOMPLETE DROPDOWN */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow max-h-60 overflow-y-auto z-50">
          {suggestions.map((s) => (
            <div
              key={s}
              onClick={() => {
                onChange(s);
                setShowSuggestions(false);
              }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {s}
            </div>
          ))}
        </div>
      )}

      {/* STATUS TEXT */}
      {isLoading && (
        <p className="text-sm text-gray-500 mt-1">
          Загружаю варианты с Scryfall…
        </p>
      )}

      {!isLoading && suggestions.length === 0 && value.length > 3 && (
        <p className="text-sm text-gray-500 mt-1">
          Ничего не найдено.
        </p>
      )}
    </div>
  );
}
