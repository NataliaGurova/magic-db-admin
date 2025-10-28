
export interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  set_name: string;
  rarity?: string;
  artist?: string;
  type_line?: string;
  colors?: string[];
  image_uris?: { normal?: string };
  card_faces?: Array<{
    side?: "front" | "back";
    image_uris?: { normal?: string };
  }>;
  legalities?: Record<string, string>;
}

export function mapScryfallToCard(data: ScryfallCard) {
  const faces =
    data.card_faces?.length
      ? data.card_faces
          .map((f) => ({
            side: f.side ?? "front",
            imageUrl: f.image_uris?.normal ?? "",
          }))
          .filter((f) => !!f.imageUrl)
      : data.image_uris?.normal
        ? [{ side: "front", imageUrl: data.image_uris.normal }]
        : [];

  return {
    scryfall_id: data.id,
    name: data.name,
    set: data.set,
    set_name: data.set_name,
    rarity: data.rarity ?? "",
    artist: data.artist ?? "",
    types: data.type_line ?? "",
    colors: data.colors ?? [],
    legalities: data.legalities ?? {},
    faces,
  };
}
