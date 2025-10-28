
// import axios from "axios";

// // Только необходимые поля из Scryfall
// export interface ScryfallCard {
//   name: string;
//   image_uris?: { normal: string };
//   card_faces?: { image_uris?: { normal: string } }[];
//   colors?: string[];
//   rarity?: string;
//   set_name?: string;
//   type_line?: string;
//   artist?: string;
// }

// // Карточка для превью и добавленных карточек
// export interface Card {
//   name: string;
//   imageUrl: string | null;
//   colors: string[];
//   rarity: string;
//   set_name: string;
//   types: string;
//   artist: string;
//   prices?: string;
//   number?: string;
//   lang?: string;
//   isFoil?: boolean;
// }

// export const fetchScryfallCard = async (name: string): Promise<Card | null> => {
//   try {
//     const res = await axios.get<ScryfallCard>(
//       "https://api.scryfall.com/cards/named",
//       { params: { exact: name } }
//     );

//     const card = res.data;
//     const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null;

//     return {
//       name: card.name,
//       imageUrl,
//       colors: card.colors || [],
//       rarity: card.rarity || "",
//       set_name: card.set_name || "",
//       types: card.type_line || "",
//       artist: card.artist || "",
//     };
//   } catch (error) {
//     console.error("Scryfall fetch error:", error);
//     return null;
//   }
// };


import useSWR from "swr";
import axios from "axios";

// Типы из Scryfall API
export interface ScryfallCard {
  name: string;
  image_uris?: { normal: string };
  card_faces?: { image_uris?: { normal: string } }[];
  colors?: string[];
  rarity?: string;
  set_name?: string;
  type_line?: string;
  artist?: string;
  legalities?: Record<string, string>; // добавили
}

// Тип карточки в нашем приложении
export interface Card {
  name: string;
  imageUrl: string | null;
  colors: string[];
  rarity: string;
  set_name: string;
  types: string;
  artist: string;
  legalities?: Record<string, string>; // добавили
  prices?: string;
  number?: string;
  lang?: string;
  isFoil?: boolean;
}

// SWR fetcher
const fetcher = async (url: string) => {
  const res = await axios.get<ScryfallCard>(url);
  return res.data;
};

// Хук для получения данных
export const useScryfallCard = (name: string) => {
  const { data, error, isLoading } = useSWR(
    name ? `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}` : null,
    fetcher
  );

  const card: Card | null = data
    ? {
        name: data.name,
        imageUrl: data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal || null,
        colors: data.colors || [],
        rarity: data.rarity || "",
        set_name: data.set_name || "",
        types: data.type_line || "",
        artist: data.artist || "",
        legalities: data.legalities || {},
      }
    : null;

  return { card, error, isLoading };
};
