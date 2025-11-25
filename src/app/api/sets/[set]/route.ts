
// import { NextResponse } from "next/server";
// import { NextRequest } from "next/server";
// import { connectDB } from "@/db/mongodb";
// import { Card } from "@/db/models/Card";

// export async function GET(req: NextRequest, { params }: { params: { set: string } }) {
//   await connectDB();

//   if (!params?.set) {
//     return NextResponse.json({ error: "Set name is required" }, { status: 400 });
//   }

//   const setName = decodeURIComponent(params.set);
//   if (!setName) {
//     return NextResponse.json({ error: "Set name is required" }, { status: 400 });
//   }

//   const { searchParams } = new URL(req.url);

//   // const page = Number(searchParams.get("page")) || 1;
//   // const limit = Number(searchParams.get("limit")) || 60;
//   const page = Math.max(Number(searchParams.get("page")) || 1, 1);
//   const limit = Math.max(Number(searchParams.get("limit")) || 60, 1);

//   const cards = await Card.find({ set_name: setName })
//     .skip((page - 1) * limit)
//     .limit(limit)
//     .select("name imageUrl prices rarity colors faces")
//     .lean();

//   const total = await Card.countDocuments({ set_name: setName });

//   return NextResponse.json({
//     cards,
//     page,
//     totalPages: Math.ceil(total / limit),
//   });
// }


import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/db/mongodb";
import { Card } from "@/db/models/Card";

type RouteContext = {
  params: Promise<{
    set: string | string[] | undefined;
  }>;
};

// Helper to normalize dynamic route param
function getParam(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

export async function GET(req: NextRequest, context: RouteContext) {
  // MUST AWAIT params
  const resolved = await context.params;
  const rawSet = getParam(resolved.set);

  if (!rawSet) {
    return NextResponse.json(
      { error: "Set name is required" },
      { status: 400 }
    );
  }

  const setName = decodeURIComponent(rawSet);

  await connectDB();

  const { searchParams } = new URL(req.url);

  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.max(Number(searchParams.get("limit")) || 60, 1);

  const cards = await Card.find({ set_name: setName })
    .skip((page - 1) * limit)
    .limit(limit)
    // .select("name imageUrl prices rarity colors faces")
    .lean();

  const total = await Card.countDocuments({ set_name: setName });

  return NextResponse.json({
    cards,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
