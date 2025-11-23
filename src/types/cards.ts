
export interface Face {
  imageUrl?: string;
}

export interface CardFromDB {
  _id: string;
  scryfall_id: string;
  name: string;
  collector_number: string;
  set_name: string;
  lang: string;
  variant?: string;
  isFoil: boolean;
  foilType?: string;
  condition: string;
  prices: string;
  quantity: number;
  faces?: Face[];
}

export interface VariantItem {
  scryfall_id: string;
  name: string;
  collector_number?: string;
  variant?: string;
  faces: Face[];
}


/* ------------------------------------------------------
  SET ITEM (для меню выбора сета в AdminPage)
------------------------------------------------------ */
export interface SetItem {
  scryfall_id: string;
  name: string;
  set: string;
  set_name: string;
  lang: string;
}

/* ------------------------------------------------------
  CARD FROM DB  (твой формат в MongoDB)
------------------------------------------------------ */
export interface DbCard {
  _id: string;
  scryfall_id: string;
  name: string;
  set: string;
  set_name: string;
  variant: string;
  collector_number: string;
  faces?: Face[];

  foilType: "nonfoil" | "foil" | "etched" | "surgefoil" | "rainbowfoil";
  isFoil: boolean;

  condition: "NM" | "LP" | "HP";
  prices: string;
  quantity: number;
  lang: string;
}

/* ------------------------------------------------------
  MAPPED CARD (результат mapToCardData)
------------------------------------------------------ */
export interface MappedCard {
  scryfall_id: string;
  name: string;

  set: string;
  set_name: string;
  collector_number: string;

  variant?: string;
  lang: string;

  faces: Face[];

  foilType?: string;
  isFoil?: boolean;
  prices?: string;
}
