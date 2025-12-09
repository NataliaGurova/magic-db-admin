
// "use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { VariantItem } from "@/types/cards";
import { getSmallImageUrl } from "@/lib/helpers/image";



export default function VariantsList({ variants }: { variants: VariantItem[] }) {
  const router = useRouter();

  if (!variants.length) return null;

  return (
    <section className="mt-8 space-y-4">
      <div className="flex flex-wrap gap-4">
        {variants.map((variant) => (
          <div
            key={variant.scryfall_id}
            className="rounded-xl border p-3 bg-white hover:shadow transition w-[280px]"
          >
            {/* TITLE */}
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

            {/* IMAGES */}
            <div className="flex gap-2 justify-center">
  {variant.faces.map((face, i) =>
    face.imageUrl ? (
      <Image
        key={i}
        // src={face.imageUrl}
        src={getSmallImageUrl(face.imageUrl ?? "")}
        alt={`${variant.name}-face-${i}`}
        width={128}
        height={176}
        className="w-32 h-44 object-contain rounded-lg border"
      />
    ) : (
      <div
        key={i}
        className="w-32 h-44 flex items-center justify-center bg-gray-100 text-xs text-gray-500 rounded-lg border"
      >
        No Image
      </div>
    )
  )}
</div>


            {/* BUTTON */}
            <Button
              onClick={() =>
                router.push(`/admin/add/${variant.scryfall_id}`)
              }
              className="mt-3 w-full bg-black text-white hover:bg-gray-800"
            >
              Add to DB
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
