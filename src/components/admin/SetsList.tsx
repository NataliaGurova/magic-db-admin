
// "use client";

import { ScrollArea } from "@/components/ui/scroll-area";

interface SetItem {
  scryfall_id: string;
  name: string;
  set_name: string;
}

export default function SetsList({
  sets,
  onSelect,
}: {
  sets: SetItem[];
  onSelect: (id: string) => void;
}) {
  if (!sets.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-2">Найдена в таких сетах:</h3>

      <ScrollArea className="h-[250px] w-[600px] border rounded-xl bg-white p-3">
        <ul className="space-y-1">
          {sets.map((s) => (
            <li
              key={s.scryfall_id}
              onClick={() => onSelect(s.scryfall_id)}
              className="cursor-pointer hover:bg-gray-100 border-b pb-1 last:border-none"
            >
              {s.name} — {s.set_name}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
