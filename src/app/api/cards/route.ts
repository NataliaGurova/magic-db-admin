
import { NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import { mapToCardData } from "@/lib/scryfall";
import { Card } from "@/db/models/Card";

/**
 * 🔹 GET — получить все карточки из базы
 */
export async function GET() {
  try {
    await connectDB();
    const cards = await Card.find().sort({ createdAt: -1 });
    return NextResponse.json(cards);
  } catch (error) {
    console.error("❌ Ошибка при загрузке карт:", error);
    return NextResponse.json({ error: "Ошибка при получении карт" }, { status: 500 });
  }
}

/**
 * 🔹 POST — добавить новую карту в базу
 * Проверяет дубликаты по scryfall_id + lang + isFoil + variant
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { scryfall_id, prices, number, lang, isFoil, variant, foilType } = body;

    if (!scryfall_id) {
      return NextResponse.json({ error: "Отсутствует scryfall_id" }, { status: 400 });
    }

    // Проверка на дубликат
    const exists = await Card.findOne({ scryfall_id, lang, isFoil, variant });
    if (exists) {
      return NextResponse.json(
        {
          error: "Карта с таким языком, фойлом и оформлением уже есть в базе",
          cardId: exists._id,
        },
        { status: 409 }
      );
    }

    // Получаем данные с Scryfall API
    const res = await fetch(`https://api.scryfall.com/cards/${scryfall_id}`);
    if (!res.ok) {
      return NextResponse.json({ error: "Не удалось получить данные с Scryfall" }, { status: 404 });
    }

    const data = await res.json();
    const base = mapToCardData(data);

    // Формируем финальный объект
    const fullCard = {
      ...base,
      prices,
      number,
      lang,
      isFoil,
      variant,
      foilType,
    };

    // Сохраняем в базу
    const newCard = await Card.create(fullCard);

    return NextResponse.json({ ok: true, card: newCard }, { status: 201 });
  } catch (error: unknown) {
    console.error("❌ Ошибка при сохранении:", error);

    // Ошибка MongoDB — дубликат уникального индекса
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "Такая карта уже существует в базе (уникальный индекс)" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Ошибка на сервере" }, { status: 500 });
  }
}



// //   второй вариант ===========================
// import { NextResponse } from "next/server";
// import { connectDB } from "@/db/mongodb";
// import { Card } from "@/db/models/Card";

// export async function POST(req: Request) {
//   try {
//     await connectDB();
//     const body = await req.json();

//     const existing = await Card.findOne({ scryfall_id: body.scryfall_id });
//     if (existing) {
//       return NextResponse.json(
//         { message: "Карта уже есть в базе" },
//         { status: 409 }
//       );
//     }

//     const newCard = await Card.create(body);
//     return NextResponse.json({ message: "Добавлено", card: newCard });
//   } catch (err) {
//     console.error("Ошибка при сохранении:", err);
//     return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
//   }
// }
