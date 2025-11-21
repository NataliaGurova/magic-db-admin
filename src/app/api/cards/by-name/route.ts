import { NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import { Card } from "@/db/models/Card";


export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json({ cards: [] });
    }

    // точное совпадение имени (как у Scryfall)
    const cards = await Card.find({ name }).sort({ set_name: 1 });

    return NextResponse.json({ cards }, { status: 200 });
  } catch (err) {
    console.error("❌ Ошибка в /api/cards/by-name:", err);
    return NextResponse.json({ cards: [] }, { status: 500 });
  }
}
