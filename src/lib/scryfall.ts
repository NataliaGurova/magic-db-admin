

import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                                 Типы данных                                */
/* -------------------------------------------------------------------------- */

/** --- Ссылки на изображения карты --- */
export interface ScryfallImageUris {
  small?: string;
  normal?: string;
  large?: string;
}

/** --- Одна сторона карты (для двусторонних) --- */
export interface ScryfallCardFace {
  name: string;
  image_uris?: ScryfallImageUris;
}

/** --- Полная карточка из API Scryfall --- */
export interface ScryfallCard {
  id: string;
  name: string;
  lang: string;
  set: string;
  set_name: string;
  rarity?: string;
  artist?: string;
  type_line?: string;
  colors?: string[];
  legalities?: Record<string, string>;
  finishes?: string[];
  border_color?: string | string[];
  frame_effects?: string[];
  promo_types?: string[];
  collector_number?: string;
  card_faces?: ScryfallCardFace[];
  image_uris?: ScryfallImageUris;
  frame?: string;
}

/** --- Ответ Scryfall при успешном запросе списка карт --- */
export interface ScryfallListResponse<T> {
  object: "list";
  data: T[];
  has_more?: boolean;
  next_page?: string;
  total_cards?: number;
}

/** --- Ответ Scryfall при ошибке --- */
export interface ScryfallErrorResponse {
  object: "error";
  code: string;
  status: number;
  details: string;
  type?: string;
}

/* -------------------------------------------------------------------------- */
/*                              Варианты оформления                           */
/* -------------------------------------------------------------------------- */

export type CardVariant =
  | "regular"
  | "borderless"
  | "extended"
  | "retro"
  | "showcase"
  | "gilded";

/** --- Определение оформления карты --- */
export function detectVariant(card: ScryfallCard): CardVariant {
  const effects = new Set(card.frame_effects || []);
  const promo = new Set(card.promo_types || []);

  const border = card.border_color;
  const isBorderless =
    border === "borderless" ||
    (Array.isArray(border) && border.includes("borderless"));

  if (effects.has("gilded")) return "gilded";
  if (effects.has("showcase")) return "showcase";
  if (effects.has("extendedart")) return "extended";
  if (isBorderless) return "borderless";
  // if (promo.has("retro")) return "retro";
  if (promo.has("retro") || card.frame === "1997") return "retro"; // 👈 добавили условие

  return "regular";
}

/* -------------------------------------------------------------------------- */
/*                             Форматирование карты                           */
/* -------------------------------------------------------------------------- */

/** --- Приведение данных карты к формату БД --- */
export function mapToCardData(card: ScryfallCard) {
  const variant = detectVariant(card);

  // Односторонние и двусторонние карты
  const faces =
    card.card_faces && card.card_faces.length > 0
      ? card.card_faces.map((face, i) => ({
          side: i === 0 ? "front" : "back",
          imageUrl: face.image_uris?.large ?? face.image_uris?.normal ?? "",
        }))
      : [
          {
            side: "front",
            imageUrl: card.image_uris?.large ?? card.image_uris?.normal ?? "",
          },
        ];

  return {
    scryfall_id: card.id,
    name: card.name,
    set: card.set,
    set_name: card.set_name,
    rarity: card.rarity ?? "",
    artist: card.artist ?? "",
    type_line: card.type_line ?? "",
    colors: card.colors ?? [],
    legalities: card.legalities ?? {},
    faces,
    variant,
    foilType: "nonfoil", // админ выберет вручную
    prices: "",
    collector_number: card.collector_number ?? "",
    number: "",
    lang: card.lang ?? "en",
    isFoil: false,
  };
}

/* -------------------------------------------------------------------------- */
/*                            Загрузка принтов карты                          */
/* -------------------------------------------------------------------------- */

/**
 * Получить все принты карты по её названию (все сеты, языки и варианты).
 * Автоматически собирает все страницы Scryfall (до конца пагинации).
 */
export async function fetchPrintsByName(
  cardName: string,
  signal?: AbortSignal
): Promise<ScryfallCard[]> {
  const encoded = encodeURIComponent(`"${cardName}"`);
  let url = `https://api.scryfall.com/cards/search?order=released&unique=prints&q=${encoded}`;
  const collected: ScryfallCard[] = [];

  while (url) {
    const res = await axios.get<
      ScryfallListResponse<ScryfallCard> | ScryfallErrorResponse
    >(url, { signal });

    const data = res.data;

    if (data.object === "error") {
      throw new Error(data.details);
    }

    // Добавляем страницу данных
    const list = data as ScryfallListResponse<ScryfallCard>;
    collected.push(...list.data);

    // Проверяем, есть ли следующая страница
    if (list.has_more && list.next_page) {
      url = list.next_page;
    } else {
      url = "";
    }
  }

  return collected;
}
