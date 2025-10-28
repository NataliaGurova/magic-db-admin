import { Schema, model, models } from "mongoose";

const FaceSchema = new Schema(
  {
    side: { type: String, enum: ["front", "back"], required: true },
    imageUrl: { type: String, required: true },
  },
  { _id: false }
);

const CardSchema = new Schema(
  {
    scryfall_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    set: { type: String, required: true },
    set_name: { type: String, required: true },
    rarity: { type: String },
    artist: { type: String },
    types: { type: String },
    colors: { type: [String], default: [] },
    legalities: { type: Object, default: {} },
    faces: { type: [FaceSchema], default: [] },

    // Дополнительные поля из формы
    prices: { type: String, default: "" },
    number: { type: String, default: "" },
    lang: { type: String, default: "en" },
    isFoil: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default models.Card || model("Card", CardSchema);

