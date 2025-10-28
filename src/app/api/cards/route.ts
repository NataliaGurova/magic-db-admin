
import { NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import Card from "@/db/models/Card";
import { mapScryfallToCard } from "@/lib/scryfall";

// 🔹 Получение всех карточек
export async function GET() {
  try {
    await connectDB();
    const cards = await Card.find().sort({ createdAt: -1 });
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error getting cards:", error);
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
    // return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// 🔹 Добавление карты 
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, prices, number, lang, isFoil } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Получаем карту с Scryfall
    const res = await fetch(
      `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Card not found on Scryfall" }, { status: 404 });
    }

    const data = await res.json();
    const base = mapScryfallToCard(data);

    const fullCard = {
      ...base,
      prices,
      number,
      lang,
      isFoil,
    };

    // Обновляем или создаём
    await Card.updateOne(
      { scryfall_id: base.scryfall_id },
      { $set: fullCard },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, card: fullCard });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
