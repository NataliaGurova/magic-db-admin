// "use client";

// import { ScrollArea } from "@/components/ui/scroll-area";
// import { ScryfallCard } from "@/lib/scryfall";

// interface SetListProps {
//   sets: ScryfallCard[];
//   onSelectSet: (card: ScryfallCard) => void;
// }

// export default function SetList({ sets, onSelectSet }: SetListProps) {
//   return (
//     <div className="mt-6 w-full max-w-2xl">
//       <h3 className="text-xl font-semibold mb-2">Найдена в таких сетах:</h3>
//       <ScrollArea className="h-[240px] border rounded-xl bg-white p-3">
//         <ul className="space-y-2">
//           {sets.map((s) => (
//             <li
//               key={s.id}
//               onClick={() => onSelectSet(s)}
//               className="cursor-pointer hover:bg-gray-100 border-b pb-1 last:border-none transition"
//             >
//               <b>{s.name}</b> — {s.set_name} ({s.lang.toUpperCase()})
//             </li>
//           ))}
//         </ul>
//       </ScrollArea>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScryfallCard } from "@/lib/scryfall";
import axios from "axios";

interface SetListProps {
  sets: ScryfallCard[];
  onSelectSet: (card: ScryfallCard) => void;
}

interface SetIconMap {
  [code: string]: string; // set → icon_svg_uri
}

export default function SetList({ sets, onSelectSet }: SetListProps) {
  const [icons, setIcons] = useState<SetIconMap>({});

  // Загружаем иконки сетов
  useEffect(() => {
    const loadIcons = async () => {
      const uniqueSets = Array.from(new Set(sets.map((s) => s.set)));
      const result: SetIconMap = {};

      await Promise.all(
        uniqueSets.map(async (setCode) => {
          try {
            const res = await axios.get(`https://api.scryfall.com/sets/${setCode}`);
            result[setCode] = res.data.icon_svg_uri;
          } catch {
            result[setCode] = "";
          }
        })
      );

      setIcons(result);
    };

    if (sets.length > 0) loadIcons();
  }, [sets]);

  return (
    <div className="mt-6 w-full max-w-2xl">
      <h3 className="text-xl font-semibold mb-2">Найдена в таких сетах:</h3>
      <ScrollArea className="h-[240px] border rounded-xl bg-white p-3">
        <ul className="space-y-2">
          {sets.map((s) => (
            <li
              key={s.id}
              onClick={() => onSelectSet(s)}
              className="cursor-pointer hover:bg-gray-100 border-b pb-1 last:border-none transition flex items-center gap-2"
            >
              {/* Иконка сета */}
              {icons[s.set] ? (
                <Image
                  src={icons[s.set]}
                  alt={s.set_name}
                  width={20}
                  height={20}
                  className="inline-block"
                />
              ) : (
                <div className="w-[20px] h-[20px] bg-gray-200 rounded-sm" />
              )}

              <div>
                <b>{s.name}</b> — {s.set_name} ({s.lang.toUpperCase()})
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

