

// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";

// interface CardFace {
//   side: string;
//   imageUrl: string;
// }

// interface CardItem {
//   _id: string;
//   name: string;
//   faces: CardFace[];
// }

// interface ApiResponse {
//   cards: CardItem[];
//   page: number;
//   totalPages: number;
// }

// // ———————————————————————
// // Безопасное получение параметра
// // ———————————————————————
// function getParam(value: string | string[] | undefined): string {
//   if (!value) {
//     throw new Error("Route parameter is missing");
//   }
//   return Array.isArray(value) ? value[0] : value;
// }

// // ———————————————————————
// // Главная страница сета
// // ———————————————————————
// export default function SetPage() {
//   const router = useRouter();
//   const params = useParams();
//   const searchParams = useSearchParams();

//   // 1️⃣ Получаем set name
//   const rawSetParam = getParam(params.set);
//   const setName = decodeURIComponent(rawSetParam);

//   // 2️⃣ Текущая страница
//   const page = Number(searchParams.get("page")) || 1;

//   // 3️⃣ Состояния
//   const [data, setData] = useState<ApiResponse>({
//     cards: [],
//     page: 1,
//     totalPages: 1,
//   });

//   const [loading, setLoading] = useState(true);

//   // 4️⃣ Загрузка карточек
//   useEffect(() => {
//     async function loadCards() {
//       setLoading(true);

//       try {
//         const res = await fetch(
//           `/api/sets/${encodeURIComponent(setName)}?page=${page}&limit=60`
//         );
//         const json = await res.json();

//         if (json && Array.isArray(json.cards)) {
//           setData(json);
//         } else {
//           setData({ cards: [], page: 1, totalPages: 1 });
//         }
//       } catch (error) {
//         console.error("Error:", error);
//         setData({ cards: [], page: 1, totalPages: 1 });
//       }

//       setLoading(false);
//     }

//     loadCards();
//   }, [page, setName]);

//   // 5️⃣ Loader
//   if (loading) {
//     return (
//       <div className="max-w-6xl mx-auto px-6 py-16 text-xl">
//         Loading cards...
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-6 py-12">
//       <h1 className="text-3xl font-bold mb-8">{setName}</h1>

//       {/* ——————————————————— */}
//       {/* Список карточек       */}
//       {/* ——————————————————— */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
//         {data.cards.map((card) => {
//           const imgUrl =
//             card.faces?.[0]?.imageUrl ||
//             null; // односторонние и двусторонние

//           return (
//             <div
//               key={card._id}
//               className="border rounded-lg p-2 shadow hover:shadow-lg transition"
//             >
//               {imgUrl ? (
//                 <Image
//                   src={imgUrl}
//                   alt={card.name}
//                   width={128}
//                   height={176}
//                   className="w-full rounded-md"
//                 />
//               ) : (
//                 <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md">
//                   <span className="text-gray-500 text-sm">No Image</span>
//                 </div>
//               )}

//               <p className="mt-2 font-semibold text-sm">{card.name}</p>
//             </div>
//           );
//         })}
//       </div>

//       {/* ——————————————————— */}
//       {/* Пагинация             */}
//       {/* ——————————————————— */}
//       <div className="flex gap-4 mt-10">
//         <button
//           disabled={page <= 1}
//           onClick={() => router.push(`?page=${page - 1}`)}
//           className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
//         >
//           Previous
//         </button>

//         <button
//           disabled={page >= data.totalPages}
//           onClick={() => router.push(`?page=${page + 1}`)}
//           className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
// import RightColumnCards from "@/components/RightColumnCards";
import type { CardFromDB } from "@/types/cards";  // ← твоя типизация
import RightColumnCards from "@/components/admin/RightColumnCards";

interface ApiResponse {
  cards: CardFromDB[];
  page: number;
  totalPages: number;
}

// Безопасный геттер параметров
function getParam(value: string | string[] | undefined): string {
  if (!value) throw new Error("Route param is missing");
  return Array.isArray(value) ? value[0] : value;
}

export default function SetPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // set name
  const raw = getParam(params.set);
  const setName = decodeURIComponent(raw);

  // pagination
  const page = Number(searchParams.get("page")) || 1;

  // state
  const [data, setData] = useState<ApiResponse>({
    cards: [],
    page: 1,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);

  // Load cards
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await fetch(
          `/api/sets/${encodeURIComponent(setName)}?page=${page}&limit=60`
        );

        const json = await res.json();

        if (json && Array.isArray(json.cards)) {
          setData(json);
        } else {
          setData({ cards: [], page: 1, totalPages: 1 });
        }
      } catch (err) {
        console.error("Set page error:", err);
        setData({ cards: [], page: 1, totalPages: 1 });
      }

      setLoading(false);
    }

    load();
  }, [setName, page]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-xl">
        Loading cards...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      <h1 className="text-3xl font-bold mb-8">{setName}</h1>

      {/* 🔥 Полностью заменяем вывод карт */}
      <RightColumnCards dbCards={data.cards} />

      {/* Пагинация */}
      <div className="flex gap-4 mt-10">
        <button
          onClick={() => router.push(`?page=${page - 1}`)}
          disabled={page <= 1}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-40"
        >
          Previous
        </button>

        <button
          onClick={() => router.push(`?page=${page + 1}`)}
          disabled={page >= data.totalPages}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
