import { NextResponse } from "next/server";
import axios from "axios";

/**
 * Прокси-запросы к Scryfall API без CORS
 * Пример вызова: /api/scryfall?q="Sol Ring"
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  try {
    const url = `https://api.scryfall.com/cards/search?order=released&unique=prints&q=${encodeURIComponent(q)}`;
    const res = await axios.get(url);
    return NextResponse.json(res.data);
  } catch (error) {
    console.error("❌ Scryfall proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch data from Scryfall" }, { status: 500 });
  }
}
