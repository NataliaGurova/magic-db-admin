
// import { Card } from "@/db/models/Card";
// import { connectDB } from "@/db/mongodb";
// import { NextResponse } from "next/server";



// export async function GET() {
//   await connectDB();

//   const sets = await Card.aggregate([
//     { $group: { _id: "$set_name", count: { $sum: 1 } } },
//     { $sort: { _id: 1 } }
//   ]);

//   return NextResponse.json(sets);
// }

import { NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import { Card } from "@/db/models/Card";

export async function GET() {
  await connectDB();

  const sets = await Card.aggregate([
    {
      $group: {
        _id: "$set",               // ← set code
        set_name: { $first: "$set_name" }, // красивое название сета
        count: { $sum: 1 },
      },
    },
    { $sort: { set_name: 1 } },     // ← сортировка по алфавиту
  ]);

  return NextResponse.json(sets);
}
