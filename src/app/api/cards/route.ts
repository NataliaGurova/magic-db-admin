
import { NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import { mapToCardData } from "@/lib/scryfall";
import { Card } from "@/db/models/Card";

// 🔹 GET — получить карту по Mongo `_id` (для редактирования)
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Не указан id" }, { status: 400 });
    }

    const card = await Card.findById(id);
    // const card = await Card.findOne({ scryfall_id: id });

    if (!card) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({ exists: true, card }, { status: 200 });
  } catch (err) {
    console.error("❌ Ошибка при GET /api/cards:", err);
    return NextResponse.json(
      { error: "Ошибка на сервере" },
      { status: 500 }
    );
  }
}

/**
 * 🔹 POST — добавить новую карту в базу
 * Проверяет дубликаты по scryfall_id + lang + isFoil + variant + condition
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json() as {
      scryfall_id?: string;
      prices?: string;
      quantity?: string;
      lang?: string;
      isFoil?: boolean;
      variant?: string;
      foilType?: string;
      condition?: string;
    };
    // const body = await req.json();

    const {
      scryfall_id,
      prices,
      quantity,
      lang,
      isFoil,
      variant,
      foilType,
      condition,
    } = body;

    if (!scryfall_id) {
      return NextResponse.json(
        { error: "Отсутствует scryfall_id" },
        { status: 400 }
      );
    }

    // Проверка дубликата
    const exists = await Card.findOne({
      scryfall_id,
      lang,
      isFoil,
      variant,
      condition,
    });

    if (exists) {
      return NextResponse.json(
        {
          message: "Такая карта уже есть в базе",
          card: exists,
        },
        { status: 409 }
      );
    }

    // Подтягиваем данные из Scryfall
    const scryRes = await fetch(`https://api.scryfall.com/cards/${scryfall_id}`);
    if (!scryRes.ok) {
      return NextResponse.json(
        { error: "Не удалось получить данные с Scryfall" },
        { status: 404 }
      );
    }

    const scryData = await scryRes.json();
    const base = mapToCardData(scryData);

    // Нормализация цены и количества
    const normalizedPrice =
      prices && prices.trim() !== "" && !Number.isNaN(Number(prices))
        ? Number(prices)
        : 0;

    const normalizedQuantity =
      quantity && quantity.trim() !== "" && !Number.isNaN(Number(quantity))
        ? Number(quantity)
        : 0;
        // const normalizedPrice = Number(prices) || 0;
        // const normalizedCount = Number(quantity) || 0;

    const fullCard = {
      ...base,
      scryfall_id,
      prices: normalizedPrice,
      quantity: normalizedQuantity,
      lang: lang ?? base.lang,
      isFoil: Boolean(isFoil),
      variant: variant ?? base.variant,
      foilType: foilType ?? base.foilType,
      condition: condition ?? base.condition,
    };

    const newCard = await Card.create(fullCard);

    return NextResponse.json({ ok: true, card: newCard }, { status: 201 });
  } catch (error) {
    console.error("❌ Ошибка при POST /api/cards:", error);

    // ловим дубликат по уникальному индексу
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          message: "Такая карта уже существует в базе (уникальный индекс)",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Ошибка на сервере" },
      { status: 500 }
    );
  }
}

/**
 * 🔹 PATCH — обновить ТОЛЬКО price и quantity по Mongo `_id`
 */
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Не указан id" }, { status: 400 });
    }

    const body = await req.json() as {
      prices?: string;
      quantity?: string;
    };

    const { prices, quantity } = body;

    const normalizedPrice =
      prices && prices.trim() !== "" && !Number.isNaN(Number(prices))
        ? Number(prices)
        : 0;

    const normalizedQuantity =
      quantity && quantity.trim() !== "" && !Number.isNaN(Number(quantity))
        ? Number(quantity)
        : 0;

    const updated = await Card.findByIdAndUpdate(
      id,
      {
        prices: normalizedPrice,
        quantity: normalizedQuantity,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Карта не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, card: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Ошибка при PATCH /api/cards:", error);
    return NextResponse.json(
      { error: "Ошибка на сервере" },
      { status: 500 }
    );
  }
}
