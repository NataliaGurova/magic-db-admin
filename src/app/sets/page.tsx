
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

// export default function SetsPage() {
//   const [sets, setSets] = useState<{ _id: string; count: number }[]>([]);

//   useEffect(() => {
//     fetch("/api/sets")
//       .then(res => res.json())
//       .then(data => setSets(data));
//   }, []);

//   return (
//     <div className="max-w-5xl mx-auto px-6 py-12">
//       <h1 className="text-3xl font-bold mb-8">All Magic Sets</h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {sets.map((s) => (
//           <Link
//             key={s._id}
//             href={`/sets/${encodeURIComponent(s._id)}`}
//             className="border p-4 rounded shadow hover:shadow-lg transition"
//           >
//             <h2 className="text-xl font-semibold">{s._id}</h2>
//             <p className="text-gray-600">{s.count} cards</p>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

// interface SetItem {
//   _id: string;   // set_name
//   count: number; // number of cards
// }

// export default function SetsPage() {
//   const [sets, setSets] = useState<SetItem[]>([]);

//   useEffect(() => {
//     fetch("/api/sets")
//       .then((res) => res.json())
//       .then((data) => {
//         // сортировка по алфавиту
//         const sorted = [...data].sort((a, b) =>
//           a._id.localeCompare(b._id)
//         );
//         setSets(sorted);
//       });
//   }, []);

//   return (
//     <div className="max-w-4xl mx-auto px-6 py-10">
//       <h1 className="text-3xl font-bold mb-6">All Sets</h1>

//       {/* ——————————————— */}
//       {/* компактный лист в одну строку */}
//       {/* ——————————————— */}
//       <div className="space-y-2">
//         {sets.map((s) => (
//           <Link
//             key={s._id}
//             href={`/sets/${encodeURIComponent(s._id)}`}
//             className="flex items-center justify-between
//                       px-4 py-2 bg-white border rounded-md shadow-sm
//                       hover:bg-gray-100 transition text-sm"
//           >
//             {/* Название сета */}
//             <span className="font-medium truncate">{s._id}</span>

//             {/* Кол-во карт */}
//             <span className="text-gray-500">{s.count} cards</span>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface SetItem {
  _id: string;      // set code: "tla"
  set_name: string; // readable name
  count: number;
}

export default function SetsPage() {
  const [sets, setSets] = useState<SetItem[]>([]);

  useEffect(() => {
    fetch("/api/sets")
      .then(res => res.json())
      .then((data) => setSets(data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">All Sets</h1>

      <div className="space-y-2">
        {sets.map((s) => (
          <Link
            key={s._id}
            href={`/sets/${encodeURIComponent(s.set_name)}`} 
            className="group flex items-center justify-between 
                      px-4 py-2 border rounded-md shadow-sm bg-white
                      hover:bg-gray-100 transition cursor-pointer"
          >
            {/* <div className="flex items-center gap-3">
              
              <Image
                src={`https://svgs.scryfall.io/sets/${s._id}.svg`}
                onError={(e) => (e.currentTarget.style.opacity = "0.3")}
                alt={`${s._id} icon`}
                width={20}
                height={20}
                className="w-5 h-5 opacity-80 group-hover:opacity-100 transition"
              />

              
              <span className="font-medium text-sm truncate">
                {s.set_name}
              </span>
            </div> */}

            <div className="flex items-center gap-3">

{/* ICON OR FALLBACK */}
              <div className="w-6 h-6 flex items-center justify-center">
                
                <Image
                  src={`https://svgs.scryfall.io/sets/${s._id.toLowerCase()}.svg`}
                  alt="set icon"
                  width={20}
                  height={20}
                  className="w-5 h-5 opacity-80 group-hover:opacity-100 transition"
                  onError={(e) => {
                  // скрываем иконку
                  e.currentTarget.style.display = "none";

      // показываем fallback текст-код
      const parent = e.currentTarget.parentElement;
      if (parent) {
        parent.innerHTML = `
          <span style="
            font-size: 12px;
            font-weight: 600;
            color: #444;
          ">
            ${s._id.toUpperCase()}
          </span>
        `;
      }
    }}
  />
</div>

{/* Название */}
<span className="font-medium text-sm truncate">
  {s.set_name}
</span>
</div>


            {/* Count */}
            <span className="text-gray-500 text-xs">{s.count} cards</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

