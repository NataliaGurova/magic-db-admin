

export type FoilType =
  | "nonfoil"
  | "foil"
  | "etched"
  | "surgefoil"
  | "rainbowfoil";

export type Condition = "NM" | "LP" | "HP";

// === Изображения для карточки ===

export interface CardFace {
  side: string;
  imageUrl: string;
}

// === Тип формы Add/Edit ===

export interface CardForm {
  scryfall_id: string;
  name: string;
  set_name: string;
  rarity: string;
  type_line: string;
  colors: string[];
  faces: CardFace[];
  variant: string;
  foilType: FoilType;
  prices: string;      // ← ВСЕГДА строка (input)
  quantity: string;    // ← ВСЕГДА строка (input)
  collector_number: string;
  lang: string;
  isFoil: boolean;
  condition: Condition;
}

// === Карта из БД ===

export interface DbCard extends Omit<CardForm, "prices" | "quantity"> {
  _id: string;
  prices: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}
