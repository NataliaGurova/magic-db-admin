// // import { Schema, model, models } from "mongoose";

// // const FaceSchema = new Schema(
// //   {
// //     side: { type: String, enum: ["front", "back"], required: true },
// //     imageUrl: { type: String, required: true },
// //   },
// //   { _id: false }
// // );

// // const CardSchema = new Schema(
// //   {
// //     scryfall_id: { type: String, required: true },
// //     name: { type: String, required: true },
// //     set: { type: String, required: true },
// //     set_name: { type: String, required: true },
// //     rarity: { type: String },
// //     artist: { type: String },
// //     type_line: { type: String },
// //     colors: { type: [String], default: [] },
// //     legalities: { type: Object, default: {} },
// //     faces: { type: [FaceSchema], default: [] },

// //     // 🔹 Новые поля
// //     variant: {
// //       type: String,
// //       enum: ["regular", "borderless", "extended", "retro"],
// //       default: "regular",
// //     },
// //     foilType: {
// //       type: String,
// //       enum: ["nonfoil", "foil", "etched", "surgefoil", "rainbowfoil"],
// //       default: "nonfoil",
// //     },

// //     // 🔹 Дополнительные поля из формы
// //     prices: { type: String, default: "" },
// //     number: { type: String, default: "" },
// //     lang: { type: String, default: "en" },
// //     isFoil: { type: Boolean, default: false },
// //   },
// //   {
// //     timestamps: true,
// //     versionKey: false,
// //   }
// // );

// // export default models.Card || model("Card", CardSchema);



// //  второй вариант===========================================

// import { Schema, model, models } from "mongoose";

// // 🔹 Схема для лиц карты (односторонняя / двусторонняя)
// const FaceSchema = new Schema(
//   {
//     side: { type: String, enum: ["front", "back"], required: true },
//     imageUrl: { type: String, required: true },
//   },
//   { _id: false }
// );

// // 🔹 Основная схема карточки
// const CardSchema = new Schema(
//   {
//     scryfall_id: { type: String, required: true, index: true },
//     name: { type: String, required: true },
//     set: { type: String, required: true },
//     set_name: { type: String, required: true },
//     collector_number: { type: String, required: true },
//     rarity: { type: String },
//     artist: { type: String },
//     type_line: { type: String },
//     colors: { type: [String], default: [] },
//     legalities: { type: Object, default: {} },
//     faces: { type: [FaceSchema], default: [] },

//     // 🔹 Вариант оформления (выбирает админ)
//     variant: {
//       type: String,
//       enum: ["regular", "borderless", "extended", "retro"],
//       default: "regular",
//     },

//     // 🔹 Тип фойла (тоже выбирает админ)
//     foilType: {
//       type: String,
//       enum: ["nonfoil", "foil", "etched", "surgefoil", "rainbowfoil"],
//       default: "nonfoil",
//     },

//     // 🔹 Дополнительные поля из формы
//     prices: { type: String, default: "" },
//     number: { type: String, default: "" },
//     lang: { type: String, default: "en" },
//     isFoil: { type: Boolean, default: false },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//   }
// );

// // 🔹 Индекс предотвращает дубли по уникальной комбинации
// CardSchema.index(
//   { scryfall_id: 1, lang: 1, isFoil: 1, variant: 1 },
//   { unique: true }
// );

// export default models.Card || model("Card", CardSchema);



import { Schema, model, models } from "mongoose";

const FaceSchema = new Schema({
  side: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

const CardSchema = new Schema(
  {
    scryfall_id: { type: String, required: true, unique: true },
    name: String,
    set: String,
    set_name: String,
    rarity: String,
    artist: String,
    type_line: String,
    colors: [String],
    legalities: Object,
    faces: [FaceSchema],
    variant: String,
    foilType: String,
    collector_number: String,
    prices: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    lang: String,
    isFoil: Boolean,
     // 🔹 поле состояния карты
    condition: {
      type: String,
      enum: ["NM", "LP", "HP"],
      default: "NM",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 🔹 теперь уникальность проверяем по (scryfall_id + foilType + lang + condition)
  CardSchema.index(
  { scryfall_id: 1, foilType: 1, lang: 1, condition: 1 },
  { unique: true }
);

export const Card = models.Card || model("Card", CardSchema);

