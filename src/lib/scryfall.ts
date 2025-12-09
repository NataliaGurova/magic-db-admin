

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
  colors?: string[];        // 👈 ДОБАВИЛИ
  type_line?: string;       // 👈 полезно для некоторых DFC
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

  /* ---------- Цвета (учитываем двусторонние) ---------- */

  const isLand = (card.type_line ?? "").toLowerCase().includes("land");

  let finalColors: string[] = [];

  if (Array.isArray(card.colors) && card.colors.length > 0) {
    finalColors = card.colors;
  } else if (isLand) {
    finalColors = [];
  } else if (Array.isArray(card.card_faces) && card.card_faces.length > 0) {
    const faceColors = [
      ...(card.card_faces[0]?.colors ?? []),
      ...(card.card_faces[1]?.colors ?? []),
    ];
    const unique = [...new Set(faceColors)];
    finalColors = unique.length > 0 ? unique : ["Colorless"];
  } else {
    finalColors = ["Colorless"];
  }

  /* ---------- Выбор нужного URL (только normal/small) ---------- */

  // const pickImageUrl = (
  //   face?: ScryfallCardFace,
  //   fallbackCard?: ScryfallCard
  // ): string => {
  //   if (face?.image_uris) {
  //     return face.image_uris.normal ?? face.image_uris.small ?? "";
  //   }
  //   if (fallbackCard?.image_uris) {
  //     return fallbackCard.image_uris.normal ?? fallbackCard.image_uris.small ?? "";
  //   }
  //   return "";
  // };

  const pickImageUrl = (face?: ScryfallCardFace, card?: ScryfallCard): string => {
    return (
      face?.image_uris?.normal ||
      face?.image_uris?.small ||
      card?.image_uris?.normal ||
      card?.image_uris?.small ||
      ""
    );
  };

  /* ---------- Формируем faces для БД ---------- */

  let faces: Array<{ side: string; imageUrl: string }> = [];

  if (Array.isArray(card.card_faces) && card.card_faces.length > 0) {
    const facesHaveImages = card.card_faces.some(
      (f) => f.image_uris?.normal || f.image_uris?.small
    );

    if (facesHaveImages) {
      // двусторонняя карта с нормальными image_uris
      faces = card.card_faces.map((face, index) => ({
        side: index === 0 ? "front" : "back",
        imageUrl: pickImageUrl(face, card), // ⬅️ normal / small
      }));
    } else {
      // кривые split/adventure → считаем односторонними
      faces = [
        {
          side: "front",
          imageUrl: pickImageUrl(undefined, card),
        },
      ];
    }
  } else {
    // точно односторонняя карта
    faces = [
      {
        side: "front",
        imageUrl: pickImageUrl(undefined, card),
      },
    ];
  }

  /* ---------- Возврат объекта для БД / формы ---------- */

  return {
    scryfall_id: card.id,
    name: card.name,
    set: card.set,
    set_name: card.set_name,
    rarity: card.rarity ?? "",
    artist: card.artist ?? "",
    type_line: card.type_line ?? "",
    colors: finalColors,
    legalities: card.legalities ?? {},
    faces,
    variant,
    foilType: "nonfoil" as "nonfoil" | "foil" | "etched" | "surgefoil" | "rainbowfoil",
    prices: "",
    collector_number: card.collector_number ?? "",
    quantity: "",
    lang: card.lang ?? "en",
    isFoil: false,
    condition: "NM",
  };
}


















// /** --- Приведение данных карты к формату БД --- */
// export function mapToCardData(card: ScryfallCard) {
//   const variant = detectVariant(card);

//   // Односторонние и двусторонние карты
//   // const faces =
//   //   card.card_faces && card.card_faces.length > 0
//   //     ? card.card_faces.map((face, i) => ({
//   //         side: i === 0 ? "front" : "back",
//   //         imageUrl: face.image_uris?.large ?? face.image_uris?.normal ?? "",
//   //       }))
//   //     : [
//   //         {
//   //           side: "front",
//   //           imageUrl: card.image_uris?.large ?? card.image_uris?.normal ?? "",
//   //         },
//   //     ];

// // ===== UNIFIED IMAGE HANDLING =====

// let faces: Array<{ side: string; imageUrl: string }> = [];

// // Есть card_faces → возможно двусторонняя карта
// if (Array.isArray(card.card_faces) && card.card_faces.length > 0) {
//   // Проверяем: есть ли изображения у faces
//   const facesHaveImages = card.card_faces.some(
//     (f) => f.image_uris?.large || f.image_uris?.normal
//     // (f) => f.image_uris?.normal || f.image_uris?.large
//   );

//   if (facesHaveImages) {
//     // Нормальная двусторонняя карта
//     faces = card.card_faces.map((face, i) => ({
//       side: i === 0 ? "front" : "back",
//       imageUrl:
//       face.image_uris?.normal ??
//       face.image_uris?.large ??
//         "",
//     }));
//   } else {
//     // Кривые split/adventure карты без image_uris в faces
//     // → считаем односторонней
//     faces = [
//       {
//         side: "front",
//         imageUrl:
//         card.image_uris?.normal ??
//         card.image_uris?.large ??
//           "",
//       },
//     ];
//   }
// } else {
//   // Точно односторонняя карта
//   faces = [
//     {
//       side: "front",
//       imageUrl:
//       card.image_uris?.normal ??
//       card.image_uris?.large ??
//         "",
//     },
//   ];
// }

  
//   // 🧩 Логика для цвета:
//   // если нет цветов и карта не земля → ["colorless"]
//   // если земля → []
//   // const isLand = (card.type_line ?? "").toLowerCase().includes("land");
//   // let finalColors: string[] = [];

//   // if (card.colors && card.colors.length > 0) {
//   //   finalColors = card.colors;
//   // } else if (isLand) {
//   //   finalColors = [];
//   // } else {
//   //   finalColors = ["Colorless"];
//   // }


//   // ===== COLOR HANDLING =====

// // Определяем, является ли карта землей
//   {*----*} const isLand = (card.type_line ?? "").toLowerCase().includes("land");

//   {*----*}let finalColors: string[] = [];

// // 1. Если есть цвета на верхнем уровне — берем их
// if (Array.isArray(card.colors) && card.colors.length > 0) {
//   finalColors = card.colors;
// }

// // 2. Если это земля — всегда []
// else if (isLand) {
//   finalColors = [];
// }

// // 3. Если есть card_faces и в них есть цвета
// else if (
//   Array.isArray(card.card_faces) &&
//   card.card_faces.length > 0
// ) {
//   const faceColors = [
//     ...(card.card_faces[0]?.colors ?? []),
//     ...(card.card_faces[1]?.colors ?? []),
//   ];

//   // фильтруем дубли
//   const unique = [...new Set(faceColors)];

// //   if (unique.length > 0) {
// //     finalColors = unique;
// //   } else {
// //     finalColors = ["Colorless"];
// //   }
// // }

// // // 4. Во всех остальных случаях — Colorless
// // else {
// //   finalColors = ["Colorless"];
// // }


// finalColors = unique.length > 0 ? unique : ["Colorless"];
// } else {
//   finalColors = ["Colorless"];
// }
  


//   return {
//     scryfall_id: card.id,
//     name: card.name,
//     set: card.set,
//     set_name: card.set_name,
//     rarity: card.rarity ?? "",
//     artist: card.artist ?? "",
//     type_line: card.type_line ?? "",
//     // colors: card.colors ?? [],
//     colors: finalColors,
//     legalities: card.legalities ?? {},
//     faces,
//     variant,
//     foilType: "nonfoil" as "nonfoil" | "foil" | "etched" | "surgefoil" | "rainbowfoil",
//     prices: "",
//     collector_number: card.collector_number ?? "",
//     quantity: "",
//     lang: card.lang ?? "en",
//     isFoil: false,
//     condition: "NM",

//   };
// }

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
