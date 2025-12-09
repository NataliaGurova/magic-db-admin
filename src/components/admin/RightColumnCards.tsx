
// "use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CardFromDB } from "@/types/cards";
import { getSmallImageUrl } from "@/lib/helpers/image";

export default function RightColumnCards({ dbCards }: { dbCards: CardFromDB[] }) {
  const router = useRouter();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">
        In DB: {dbCards.length}
      </h2>

      {dbCards.length === 0 && (
        <div className="text-gray-500">
          No cards with this name yet
        </div>
      )}

      <div className="flex flex-wrap gap-4">

        {dbCards.map((card) => (
          <div
            key={card._id}
            className="w-[230px] bg-white border rounded-lg p-3 shadow hover:shadow-md transition flex flex-col"
          >
            {/* TITLE */}
            <div className="mb-3">
              <div className="font-semibold text-base leading-tight">{card.name}</div>

              <div className="text-gray-500 text-xs">#{card.collector_number}</div>

              <div className="text-gray-600 text-xs">{card.set_name}</div>
            </div>

            {/* IMAGE + INFO */}
            <div className="flex gap-3 mt-auto">
              <div className="w-20 min-w-20">
                {card.faces?.[0]?.imageUrl ? (
                  <Image
                    // src={card.faces[0].imageUrl}
                    src={getSmallImageUrl(card.faces[0].imageUrl ?? "")}
                    alt={card.name}
                    width={128}
                    height={176}
                    className="w-full h-auto rounded border"
                  />
                ) : (
                  <div className="w-full h-[176px] flex items-center justify-center
                    bg-gray-100 text-xs text-gray-500 rounded border">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex flex-col text-sm space-y-0.5 text-gray-700">
                <div>
                  <span className="font-medium text-red-700">{card.variant}</span>
                </div>

                <div>
                  Foil:{" "}
                  <span className="font-medium text-black">
                    {card.isFoil ? card.foilType : "nonfoil"}
                  </span>
                </div>

                <div>
                  Condition:{" "}
                  <span className="font-medium text-black">{card.condition}</span>
                </div>

                <div>
                  Lang:{" "}
                  <span className="font-medium text-black">{card.lang}</span>
                </div>

                <div>
                  Price:{" "}
                  <span className="font-medium text-black">{card.prices}</span>
                </div>

                <div>
                  Quantity:{" "}
                  <span className="font-medium text-black">{card.quantity}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() =>
                router.push(`/admin/add/${card.scryfall_id}?db=${card._id}`)
              }
              className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-700 text-sm"
            >
              Edit
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
