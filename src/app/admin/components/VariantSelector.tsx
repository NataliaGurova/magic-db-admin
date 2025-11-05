// "use client";
// import { VariantType, ScryfallCard } from "@/lib/scryfall";
// import Image from "next/image";
// import { useState } from "react";

// interface Props {
//   cards: ScryfallCard[];
//   onSelect: (card: ScryfallCard, variant: VariantType) => void;
// }

// export default function VariantSelector({ cards, onSelect }: Props) {
//   const [variant, setVariant] = useState<VariantType>("regular");

//   const handleVariantChange = (v: VariantType) => {
//     setVariant(v);
//   };

//   const filtered = cards.filter((c) => {
//     if (variant === "borderless") return c.border_color === "borderless";
//     if (variant === "extended") return c.frame_effects?.includes("extendedart");
//     if (variant === "retro") return c.promo_types?.includes("retro");
//     return !c.frame_effects && !c.promo_types?.includes("borderless");
//   });

//   return (
//     <div className="mt-6 bg-white rounded-xl shadow p-4 w-full max-w-2xl">
//       <h3 className="text-lg font-semibold mb-2">Выбери оформление:</h3>

//       <div className="flex gap-3 mb-4">
//         {(["regular", "borderless", "extended", "retro"] as VariantType[]).map((v) => (
//           <button
//             key={v}
//             onClick={() => handleVariantChange(v)}
//             className={`px-4 py-2 rounded-md border ${
//               variant === v ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
//             }`}
//           >
//             {v}
//           </button>
//         ))}
//       </div>

//       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//         {filtered.map((card) => {
//           const img =
//             card.image_uris?.normal ||
//             card.card_faces?.[0]?.image_uris?.normal ||
//             "";
//           return (
//             <div
//               key={card.id}
//               onClick={() => onSelect(card, variant)}
//               className="cursor-pointer text-center hover:opacity-80"
//             >
//               {img ? (
//                 <Image
//                   src={img}
//                   alt={card.name}
//                   width={180}
//                   height={250}
//                   className="rounded-md shadow"
//                 />
//               ) : (
//                 <div className="w-[180px] h-[250px] bg-gray-200 rounded-md" />
//               )}
//               <p className="mt-1 text-sm">{card.set_name}</p>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }



"use client";

import { VariantType } from "@/lib/scryfall";

interface VariantSelectorProps {
  onSelectVariant: (variant: VariantType) => void;
}

const variants: VariantType[] = ["regular", "borderless", "extended", "retro"];

export default function VariantSelector({ onSelectVariant }: VariantSelectorProps) {
  return (
    <div className="mt-4 w-full max-w-md bg-white border rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Выберите вариант оформления:</h3>
      <div className="grid grid-cols-2 gap-2">
        {variants.map((variant) => (
          <button
            key={variant}
            onClick={() => onSelectVariant(variant)}
            className="p-2 border rounded-md hover:bg-blue-50 capitalize transition"
          >
            {variant}
          </button>
        ))}
      </div>
    </div>
  );
}
