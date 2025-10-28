import clientPromise from "@/lib/scryfall";
import { NextResponse } from "next/server";

// 🔹 Проверка подключения (GET)
export async function GET() {
  try {
    const client = await clientPromise;
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();

    return NextResponse.json({
      message: "✅ Connected to MongoDB successfully",
      databases: dbs.databases.map((db) => db.name),
    });
  } catch (error) {
    console.error("MongoDB test connection error:", error);
    return NextResponse.json(
      { message: "❌ MongoDB connection failed", error: String(error) },
      { status: 500 }
    );
  }
}

// 🔹 Проверка записи (POST)
export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("magicdb"); // твоя база
    const result = await db.collection("test").insertOne({
      ping: "ok",
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: "✅ Document inserted successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("MongoDB insert error:", error);
    return NextResponse.json(
      { message: "❌ Insert failed", error: String(error) },
      { status: 500 }
    );
  }
}
