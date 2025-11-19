
//   //  ==  Правильное !!!!!=======

// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import Image from "next/image";

// interface CardForm {
//   name: string;
//   prices: string;
//   number: string;
//   lang: string;
//   isFoil: boolean;
// }

// interface PreviewCard {
//   imageUrl: string;
//   name: string;
// }

// export default function AdminPage() {
//   const [formData, setFormData] = useState<CardForm>({
//     name: "",
//     prices: "",
//     number: "",
//     lang: "en",
//     isFoil: false,
//   });
//   const [message, setMessage] = useState("");
//   const [preview, setPreview] = useState<PreviewCard | null>(null);

//   // 🔹 Автопоиск по имени
//   useEffect(() => {
//     if (!formData.name) {
//       setPreview(null);
//       return;
//     }

//     const timer = setTimeout(async () => {
//       try {
//         const res = await axios.get(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(formData.name)}`);
//         const card = res.data;
//         const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || "";
//         setPreview({ name: card.name, imageUrl });
//       } catch {
//         setPreview(null);
//       }
//     }, 500); // debounce 500ms

//     return () => clearTimeout(timer);
//   }, [formData.name]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const target = e.target as HTMLInputElement | HTMLSelectElement;
//     const { name, value, type } = target;
//     const checked = type === "checkbox" ? (target as HTMLInputElement).checked : undefined;

//     setFormData(prev => ({
//       ...prev,
//       [name]: type === "checkbox" ? !!checked : value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setMessage("⏳ Adding card...");

//     try {
//       const response = await axios.post("/api/cards", formData);
//       setMessage(`✅ Added: ${response.data.card.name}`);
//       setFormData({ name: "", prices: "", number: "", lang: "EN", isFoil: false });
//       setPreview(null);
//     } catch (error) {
//       if (error instanceof Error) setMessage("❌ " + error.message);
//       else setMessage("❌ Unknown error");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
//       <h1 className="text-3xl font-bold mb-6">Add Magic Card</h1>

//       <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md space-y-4">
//         <input
//           type="text"
//           name="name"
//           placeholder="Card Name"
//           value={formData.name}
//           onChange={handleChange}
//           className="w-full p-3 border rounded-xl"
//           required
//         />

//         {/* Поле Set — всегда видно, только для чтения */}
//         <input
//         type="text"
//         name="set_name"
//         placeholder="Set"
//         // value={formData.set_name}
//         // onChange={handleChange}
//         className="w-full p-3 border rounded-xl"
//         readOnly
//         />


//         <input
//           type="text"
//           name="prices"
//           placeholder="Price ($)"
//           value={formData.prices}
//           onChange={handleChange}
//           onBlur={() => {
//             if (formData.prices) {
//               const num = parseFloat(formData.prices);
//               if (!isNaN(num)) setFormData(prev => ({ ...prev, prices: num.toFixed(2) }));
//             }
//           }}
//           className="w-full p-3 border rounded-xl"
//           required
//         />

//         <input
//           type="number"
//           name="number"
//           placeholder="Number in stock"
//           value={formData.number}
//           onChange={handleChange}
//           className="w-full p-3 border rounded-xl"
//           required
//         />

//         <select name="lang" value={formData.lang} onChange={handleChange} className="p-3 mr-10 border rounded-xl">
//           <option value="en">English</option>
//           <option value="ru">Russian</option>
//           <option value="fr">French</option>
//           <option value="ja">Japanese</option>
//           <option value="de">German</option>
//         </select>

//         <label>
//           <input
//             type="checkbox"
//             name="isFoil"
//             checked={formData.isFoil}
//             onChange={handleChange}
//           />
//           Foil?
//         </label>

//         <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl transition">Add Card</button>
//       </form>

//       {preview && (
//   <div style={{ marginTop: 16, textAlign: "center" }}>
//     <h3>{preview.name}</h3>
//     <Image
//       src={preview.imageUrl}
//       alt={preview.name}
//       width={210}
//       height={293} // Next.js не поддерживает дробные height, округли до 293
//       style={{ objectFit: "cover", borderRadius: 8 }}
//     />
//   </div>
// )}

//       {message && <p style={{ marginTop: 16 }}>{message}</p>}
//     </div>
//   );
// }



// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import Image from "next/image";
// import { getAllPrintsByName, ScryfallCard, VariantType } from "@/lib/scryfall";
// import VariantSelector from "./components/VariantSelector";

// export default function AdminPage() {
//   const [name, setName] = useState("");
//   const [cards, setCards] = useState<ScryfallCard[]>([]);
//   const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
//   const [variant, setVariant] = useState<VariantType>("regular");

//   const [price, setPrice] = useState("");
//   const [number, setNumber] = useState("");
//   const [lang, setLang] = useState("en");
//   const [isFoil, setIsFoil] = useState(false);
//   const [foilType, setFoilType] = useState("nonfoil");

//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   // 🔹 Поиск карты по имени
//   useEffect(() => {
//     if (!name.trim()) {
//       setCards([]);
//       return;
//     }

//     const timer = setTimeout(async () => {
//       try {
//         setLoading(true);
//         setMessage("🔍 Идёт поиск...");
//         const results = await getAllPrintsByName(name.trim());
//         setCards(results);
//         setMessage(`✅ Найдено ${results.length} версий`);
//       } catch {
//         setMessage("❌ Ошибка при поиске карт");
//       } finally {
//         setLoading(false);
//       }
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [name]);

//   // 🔹 Сохранение карты в БД
//   const handleSave = async () => {
//     if (!selectedCard) return;

//     try {
//       setLoading(true);
//       setMessage("💾 Сохранение...");

//       await axios.post("/api/cards", {
//         scryfall_id: selectedCard.id,
//         prices: price,
//         number,
//         lang,
//         isFoil,
//         foilType,
//         variant,
//       });

//       setMessage("✅ Карта успешно добавлена в базу");
//       setPrice("");
//       setNumber("");
//       setIsFoil(false);
//       setFoilType("nonfoil");
//     } catch (err: unknown) {
//       if (axios.isAxiosError(err)) {
//         const status = err.response?.status;

//         if (status === 409) {
//           setMessage("⚠️ Такая карта уже есть в базе данных");
//         } else if (status === 400) {
//           setMessage("⚠️ Ошибка запроса — проверь данные");
//         } else {
//           setMessage(`❌ Ошибка при сохранении: ${err.message}`);
//         }
//       } else {
//         setMessage("❌ Неизвестная ошибка при сохранении");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 Очистить выбор
//   const handleReset = () => {
//     setSelectedCard(null);
//     setVariant("regular");
//     setMessage("");
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
//       <h1 className="text-3xl font-bold mb-6">Add Magic Card</h1>

//       {/* Ввод имени */}
//       <input
//         type="text"
//         placeholder="Введите имя карты"
//         value={name}
//         onChange={(e) =>
//           setName(
//             e.target.value
//               .toLowerCase()
//               .replace(/\b\w/g, (char) => char.toUpperCase()) // Title Case
//           )
//         }
//         className="w-full max-w-md border rounded-xl p-3 mb-4"
//       />

//       {/* Сообщение о статусе */}
//       {message && (
//         <p
//           className={`text-center mb-4 ${
//             message.startsWith("✅")
//               ? "text-green-600"
//               : message.startsWith("⚠️")
//               ? "text-yellow-600"
//               : message.startsWith("❌")
//               ? "text-red-600"
//               : "text-gray-600"
//           }`}
//         >
//           {message}
//         </p>
//       )}

//       {/* Выбор варианта оформления */}
//       {!selectedCard && cards.length > 0 && (
//         <VariantSelector
//           cards={cards}
//           onSelect={(card, chosenVariant) => {
//             setSelectedCard(card);
//             setVariant(chosenVariant);
//             setMessage(`🖼️ Выбран вариант: ${chosenVariant}`);
//           }}
//         />
//       )}

//       {/* Подробности карты + форма */}
//       {selectedCard && (
//         <div className="mt-6 w-full max-w-lg bg-white rounded-xl shadow p-5">
//           <div className="flex justify-between items-start">
//             <div>
//               <h3 className="text-xl font-semibold mb-1">{selectedCard.name}</h3>
//               <p className="text-gray-600 mb-2">{selectedCard.set_name}</p>
//               <p>
//                 <b>Variant:</b> {variant}
//               </p>
//               <p>
//                 <b>Lang:</b> {lang.toUpperCase()}
//               </p>
//             </div>

//             <button
//               onClick={handleReset}
//               className="text-sm text-blue-500 hover:underline"
//             >
//               🔄 Изменить
//             </button>
//           </div>

//           {/* Картинка */}
//           <div className="mt-4 flex justify-center">
//             {selectedCard.image_uris?.normal ? (
//               <Image
//                 src={selectedCard.image_uris.normal}
//                 alt={selectedCard.name}
//                 width={250}
//                 height={350}
//                 className="rounded-md shadow"
//               />
//             ) : (
//               <p className="text-gray-500 italic">Нет изображения</p>
//             )}
//           </div>

//           {/* Поля ввода */}
//           <div className="mt-5 space-y-2">
//             <input
//               type="text"
//               placeholder="Price ($)"
//               value={price}
//               onChange={(e) => setPrice(e.target.value)}
//               className="w-full border rounded p-2"
//             />
//             <input
//               type="number"
//               placeholder="Number in stock"
//               value={number}
//               onChange={(e) => setNumber(e.target.value)}
//               className="w-full border rounded p-2"
//             />

//             <select
//               value={lang}
//               onChange={(e) => setLang(e.target.value)}
//               className="w-full border rounded p-2"
//             >
//               <option value="en">English</option>
//               <option value="ru">Russian</option>
//               <option value="ja">Japanese</option>
//               <option value="de">German</option>
//               <option value="fr">French</option>
//             </select>

//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={isFoil}
//                 onChange={(e) => setIsFoil(e.target.checked)}
//               />
//               Foil
//             </label>

//             <select
//               value={foilType}
//               onChange={(e) => setFoilType(e.target.value)}
//               className="w-full border rounded p-2"
//             >
//               <option value="nonfoil">Nonfoil</option>
//               <option value="foil">Foil</option>
//               <option value="etched">Etched</option>
//               <option value="surgefoil">Surgefoil</option>
//               <option value="rainbowfoil">Rainbowfoil</option>
//             </select>
//           </div>

//           {/* Кнопка сохранения */}
//           <button
//             onClick={handleSave}
//             disabled={loading}
//             className={`w-full mt-5 py-2 rounded-md font-semibold text-white transition ${
//               loading
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700"
//             }`}
//           >
//             {loading ? "💾 Сохранение..." : "💾 Добавить в БД"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
// ---------------------------------------прошлое--------------------

// "use client";

// import { useState, useEffect, ChangeEvent } from "react";
// import axios from "axios";
// import Image from "next/image";

// import SetList from "./components/SetList";
// import VariantSelector from "./components/VariantSelector";

// import { getAllPrintsByName, ScryfallCard, VariantType } from "@/lib/scryfall";

// export default function AdminPage() {
//   // --- состояния ---
//   const [formData, setFormData] = useState({
//     name: "",
//     prices: "",
//     number: "",
//     lang: "en",
//     isFoil: false,
//   });

//   const [sets, setSets] = useState<ScryfallCard[]>([]);
//   const [selectedSet, setSelectedSet] = useState<ScryfallCard | null>(null);
//   const [selectedVariant, setSelectedVariant] = useState<VariantType | null>(null);
//   const [selectedCardImage, setSelectedCardImage] = useState<string | null>(null);
//   const [message, setMessage] = useState("");

//   // --- поиск сетов при вводе имени ---
//   useEffect(() => {
//     if (!formData.name.trim()) {
//       setSets([]);
//       setSelectedSet(null);
//       setSelectedVariant(null);
//       return;
//     }

//     const timer = setTimeout(async () => {
//       const prints = await getAllPrintsByName(formData.name.trim());
//       setSets(prints);
//       setMessage(prints.length > 0 ? `Найдено в ${prints.length} сетах` : "❌ Карта не найдена");
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [formData.name]);

//   // --- обработка изменения полей ---
//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, type, value } = e.target;
//     const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

//     let newValue = value;
//     if (name === "name") {
//       // Title Case
//       newValue = value
//         .toLowerCase()
//         .replace(/\b\w/g, (char) => char.toUpperCase());
//     }

//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? !!checked : newValue,
//     }));
//   };

//   // --- выбор сета ---
//   const handleSelectSet = async (card: ScryfallCard) => {
//     setSelectedSet(card);
//     setMessage(`Выбран сет: ${card.set_name}`);
//   };

//   // --- выбор варианта ---
//   const handleSelectVariant = async (variant: VariantType) => {
//     setSelectedVariant(variant);

//     // пробуем получить нужное изображение (по variant)
//     try {
//       const res = await axios.get(`https://api.scryfall.com/cards/${selectedSet?.id}`);
//       const data = res.data;
//       let image = "";

//       if (variant === "extended" && data.frame_effects?.includes("extendedart")) {
//         image = data.image_uris?.normal ?? "";
//       } else if (variant === "borderless" && data.border_color === "borderless") {
//         image = data.image_uris?.normal ?? "";
//       } else if (variant === "retro" && data.frame === "1997") {
//         image = data.image_uris?.normal ?? "";
//       } else {
//         image = data.image_uris?.normal ?? "";
//       }

//       setSelectedCardImage(image || null);
//       setMessage(`Выбран вариант: ${variant}`);
//     } catch {
//       setMessage("❌ Ошибка при загрузке изображения");
//     }
//   };

//   // --- сохранение карты в БД ---
//   const handleSave = async () => {
//     if (!selectedSet || !selectedVariant) {
//       setMessage("⚠️ Выберите сет и вариант перед сохранением");
//       return;
//     }

//     try {
//       await axios.post("/api/cards", {
//         scryfall_id: selectedSet.id,
//         name: selectedSet.name,
//         set: selectedSet.set,
//         set_name: selectedSet.set_name,
//         rarity: selectedSet.rarity,
//         artist: selectedSet.artist,
//         type_line: selectedSet.type_line,
//         colors: selectedSet.colors ?? [],
//         legalities: selectedSet.legalities ?? {},
//         faces: selectedSet.card_faces ?? [],
//         prices: formData.prices,
//         number: formData.number,
//         lang: formData.lang,
//         isFoil: formData.isFoil,
//         variant: selectedVariant,
//       });

//       setMessage("✅ Карта успешно добавлена в базу данных");
//     } catch (err) {
//       if (axios.isAxiosError(err)) {
//         const status = err.response?.status;
//         if (status === 409) {
//           setMessage("⚠️ Данная карта уже есть в базе. Хотите изменить информацию?");
//         } else {
//           setMessage(`❌ Ошибка при сохранении: ${err.message}`);
//         }
//       } else {
//         setMessage("❌ Неизвестная ошибка при сохранении");
//       }
//     }
//   };

//   // --- разметка ---
//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-6">
//       <h1 className="text-3xl font-bold mb-4">🧙‍♂️ Add Magic Card</h1>

//       {/* поле имени */}
//       <form className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md space-y-4">
//         <input
//           type="text"
//           name="name"
//           placeholder="Card Name"
//           value={formData.name}
//           onChange={handleChange}
//           className="w-full p-3 border rounded-xl"
//           required
//         />
//       </form>

//       {message && <p className="mt-3 text-gray-700">{message}</p>}

//       {/* список сетов */}
//       {!selectedSet && sets.length > 0 && (
//         <SetList sets={sets} onSelectSet={handleSelectSet} />
//       )}

//       {/* выбор варианта */}
//       {selectedSet && !selectedVariant && (
//         <VariantSelector onSelectVariant={handleSelectVariant} />
//       )}

//       {/* превью и форма */}
//       {selectedVariant && selectedSet && (
//         <div className="mt-6 w-full max-w-2xl bg-white rounded-xl shadow p-4">
//           <div className="flex justify-between items-start mb-2">
//             <h3 className="text-xl font-semibold">{selectedSet.name}</h3>
//             <button
//               onClick={() => {
//                 setSelectedVariant(null);
//                 setSelectedSet(null);
//                 setSelectedCardImage(null);
//               }}
//               className="text-sm text-blue-600 hover:text-blue-800 underline"
//             >
//               Изменить выбор
//             </button>
//           </div>

//           <p><b>Set:</b> {selectedSet.set_name}</p>
//           <p><b>Rarity:</b> {selectedSet.rarity}</p>
//           <p><b>Artist:</b> {selectedSet.artist}</p>

//           {selectedCardImage && (
//             <div className="relative w-[300px] h-[420px] mx-auto mt-4">
//               <Image
//                 src={selectedCardImage}
//                 alt={selectedSet.name}
//                 fill
//                 className="object-contain rounded-lg shadow-md"
//               />
//             </div>
//           )}

//           {/* форма */}
//           <div className="mt-6 space-y-2">
//             <input
//               type="text"
//               name="prices"
//               placeholder="Price ($)"
//               value={formData.prices}
//               onChange={handleChange}
//               onBlur={() => {
//                 const num = parseFloat(formData.prices);
//                 if (!isNaN(num)) setFormData((p) => ({ ...p, prices: num.toFixed(2) }));
//               }}
//               className="w-full p-2 border rounded"
//               required
//             />

//             <input
//               type="number"
//               name="number"
//               placeholder="Number in stock"
//               value={formData.number}
//               onChange={handleChange}
//               className="w-full p-2 border rounded"
//               required
//             />

//             <select
//               name="lang"
//               value={formData.lang}
//               onChange={handleChange}
//               className="w-full p-2 border rounded"
//             >
//               <option value="en">English</option>
//               <option value="ru">Russian</option>
//               <option value="fr">French</option>
//               <option value="ja">Japanese</option>
//               <option value="de">German</option>
//             </select>

//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 name="isFoil"
//                 checked={formData.isFoil}
//                 onChange={handleChange}
//               />
//               Foil?
//             </label>

//             <button
//               onClick={handleSave}
//               className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl transition mt-3"
//             >
//               💾 Добавить в БД
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // -------------------------последнее------------------==============

// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import { getPrintsByName, uniqueByKey, detectVariant, mapToCardData, ScryfallCard } from "@/lib/scryfall";
// import { ScrollArea } from "@/components/ui/scroll-area";

// // 1
// interface SetItem {
//   scryfall_id: string;
//   name: string;
//   set_name: string;
//   collector_number: string;
//   lang: string;
// }

// // 2
// interface VariantsCard {
//   _id: string;
//   scryfall_id: string;
//   name: string;
//   set_name: string;
//   collector_number: string;
//   lang: string;
//   isFoil: boolean;
//   prices: string;
//   number: string;
//   faces?: Array<{ imageUrl: string }>;
//   variant?: string;     // 🔹 добавить
//   foilType?: string;    // 🔹 добавить
  
// }


// export default function AdminPage() {
//   const [name, setName] = useState("");
//   const [sets, setSets] = useState<SetItem[]>([]);
//   const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
//   const [message, setMessage] = useState("");
//   // const [existingVersions, setExistingVersions] = useState<unknown[]>([]);
//   const [setVariants, setSetVariants] = useState<VariantsCard[]>([]);


// // 1  проверка🔍 Поиск всех сетов для выбранной карты
// useEffect(() => {
//   if (!name.trim()) {
//     // ✅ Полностью сбрасываем состояние при очистке поля
//     setSets([]);
//     setSelectedCard(null);
//     setSetVariants([]);
//     setMessage("");
//     return;
//   }

//   const timer = setTimeout(async () => {
//     try {
//       // ✅ При новом поиске тоже очищаем старый выбор
//       setSelectedCard(null);
//       setSetVariants([]);
//       setMessage("🔍 Идёт поиск...");

//       const all = await getPrintsByName(name.trim());
//       const uniqueSets = uniqueByKey(all, (i) => `${i.name}-${i.set}-${i.lang}`).map((card) => ({
//         scryfall_id: card.id,
//         name: card.name,
//         set_name: card.set_name,
//         collector_number: card.collector_number ?? "", // ✅ безопасное значение
//         lang: card.lang,
//       }));

//       setSets(uniqueSets);
//       setMessage(`Найдена в ${uniqueSets.length} сетах`);
//     } catch {
//       setSets([]);
//       setSetVariants([]);
//       setSelectedCard(null);
//       setMessage("❌ Не удалось найти карты");
//     }
//   }, 400);

//   return () => clearTimeout(timer);
// }, [name]);

  
  

//   // ???🧩 Выбор конкретного сета и вывод в консол вариантов принтов карты
//   const handleSelectSet = async (scryfall_id: string) => {
//     try {
//       console.log("🆔 выбран scryfall_id:", scryfall_id);
  
//       // 1️⃣ Загружаем выбранную карту
//       const res = await axios.get<ScryfallCard>(`https://api.scryfall.com/cards/${scryfall_id}`);
//       const cardData = res.data;
//       setSelectedCard(cardData);
  
//       const variant = detectVariant(cardData);
//       const ready = mapToCardData(cardData);
  
//       setMessage(`🧩 Найдена карта: ${cardData.name} (${variant})`);
//       console.log("✅ Основная карта:", ready);
  

//   // // ------------------------------------------
//     } catch (error) {
//       console.error("❌ Ошибка при загрузке данных:", error);
//       setMessage("❌ Не удалось получить данные карт из выбранного сета.");
//     }
//   };
  

 

  
// useEffect(() => {
//   if (!selectedCard) return;

//   const fetchSetVariants = async () => {
//     try {
//       const all = await getPrintsByName(selectedCard.name);
//       const sameSet = all.filter((c) => c.set === selectedCard.set);

//       if (sameSet.length > 1) {
//         console.log(`🔍 Найдено ${sameSet.length} версий в сете ${selectedCard.set_name}`);

//         const mapped = sameSet.map((card) => {
//           const mappedData = mapToCardData(card);
//           return {
//             _id: "", // пока нет, появится после сохранения в БД
//             scryfall_id: mappedData.scryfall_id,
//             name: mappedData.name,
//             set_name: mappedData.set_name,
//             collector_number: mappedData.collector_number,
//             lang: mappedData.lang,
//             isFoil: mappedData.isFoil,
//             prices: mappedData.prices,
//             number: mappedData.number,
//             faces: mappedData.faces,
//             variant: mappedData.variant, // ✅ вот оно!
//             foilType: mappedData.foilType, // ✅ добавить
//           } satisfies VariantsCard;
//         });

//         setSetVariants(mapped);
//         setMessage(`В этом сете найдено ${mapped.length} вариантов`);
//       }
//     } catch (err) {
//       console.error("Ошибка при загрузке вариантов:", err);
//     }
//   };

//   fetchSetVariants();
// }, [selectedCard]);



//   return (
//     <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
//       <h1 className="text-2xl font-semibold">Add Magic Card</h1>

//       {/* Ввод имени карты */}
//       <div className="space-y-2">
        
//         <input
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="w-[400px] rounded-lg border p-3"
//           placeholder="Введите название карты…"
//         />
//         <div>
//         {message && <p className="text-sm text-gray-700">{message}</p>}

//           {/* 🔹 Если выбран сет */}
// {selectedCard && (
//   <div className="mt-4 flex justify-between items-center w-full max-w-2xl">
//     <h2 className="text-lg font-semibold">
//       {selectedCard.set_name} ({selectedCard.set.toUpperCase()})
//     </h2>
//     <button
//       onClick={() => {
//         setSelectedCard(null);
//         setSetVariants([]);
//         setMessage("Выберите другой сет для этой карты");
//       }}
//       className="text-sm text-blue-600 hover:text-blue-800 underline"
//     >
//       Изменить сет
//     </button>
//   </div>
// )}

//         </div>
//       </div>

//       {/* 🔹 Прокручиваемый список сетов */}
//       {sets.length > 0 && !selectedCard && (
//         <div className="mt-6 w-full max-w-2xl">
//           <h3 className="text-xl font-semibold mb-2">Найдена в таких сетах:</h3>
//           <ScrollArea className="h-[200px] border rounded-xl bg-white p-3">
//             <ul className="space-y-1">
//               {sets.map((s) => (
//                 <li
//                 key={s.scryfall_id}
//                 onClick={() => handleSelectSet(s.scryfall_id)}
//                 className="cursor-pointer hover:bg-gray-100 border-b pb-1 last:border-none"
//                 >
//                   {s.name} — {s.set_name} • ({s.lang.toUpperCase()})
//                 </li>
//               ))}
//             </ul>
//           </ScrollArea>
//         </div>
//       )}




//       {/* Варианты карты в выбранном сете */}
//       {setVariants.length > 0 && (
//         <section className="mt-8 space-y-4">
//     <h3 className="text-xl font-semibold">
//       Варианты в сете {setVariants[0].set_name} ({setVariants.length})
//     </h3>

//     <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
//       {setVariants.map((variant) => (
//         <div
//         key={variant.scryfall_id}
//         className="rounded-xl border p-3 bg-white hover:shadow transition"
//         >
//           {/* 🔹 Название + оформление */}
//           <div className="text-sm font-semibold mb-2">
//             {variant.name}{" "}
//             {variant.number && (
//               <span className="text-gray-500 text-xs">#{variant.number}</span>
//             )}
//             <div className="text-xs text-gray-700 mt-0.5">
//               {/* Отображаем оформление, если есть */}
//               {variant.variant
//                 ? `— ${variant.variant.toUpperCase()}`
//                 : "— REGULAR"}
//             </div>
//           </div>

//           {/* 🔹 Изображения */}
//           <div className="flex gap-2 justify-center">
//             {variant.faces && variant.faces.length > 0 ? (
//               variant.faces.map((face, i) => (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img
//                 key={i}
//                 src={face.imageUrl}
//                 alt={`${variant.name}-face-${i}`}
//                 className="w-40 h-56 object-contain rounded-lg border"
//                 />
//               ))
//             ) : (
//               <div className="text-xs text-gray-500">Нет изображения</div>
//             )}
//           </div>

//           {/* 🔹 Информация о фойле */}
//           <div className="mt-2 text-xs text-gray-600 space-y-0.5">

//             <div>Номер в колекции: {variant.collector_number}</div>

//           </div>

//           {/* 💾 кнопка */}
//           <button
//             onClick={() => console.log("💾 Добавить", variant.scryfall_id)}
//             className="mt-3 w-full rounded-lg bg-black text-white py-2 text-sm hover:bg-gray-800"
//             >
//             Добавить в базу
//           </button>
//         </div>
//       ))}
//     </div>
//   </section>
// )}

//       </main>
//       );
//       }



// {/* ============================================== */}



//       {/* Список сетов */}
//       {/* {sets.map((s) => (
//   <button
//     key={s.scryfall_id}    // ← вот это должно быть уникальным
//     onClick={() => handleSelectSet(s.scryfall_id)}
//     className="rounded-xl border p-3 text-left hover:shadow transition"
//   >
//     <div className="font-semibold">{s.name}</div>
//     <div className="text-xs text-gray-500">
//       {s.set_name} • {s.lang.toUpperCase()}
//     </div>
//   </button>
//       ))} */}
      
// {/* =======================================new========= */}
//       {/* Выбранная карта
//       {selectedCard && (
//         <section className="space-y-4">
//           <div className="font-medium text-lg">{selectedCard.name}
//           <button
//               onClick={() => setSelectedCard(null)}
//               className="text-sm text-blue-600 hover:text-blue-800 underline"
//             >
//               Изменить сет
//             </button>
//           </div>
//           {selectedCard.image_uris && (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img
//               src={selectedCard.image_uris.large ?? selectedCard.image_uris.normal ?? ""}
//               alt={selectedCard.name}
//               className="w-60 rounded-lg border"
//             />
//           )}
//         </section>
//       )} */}






"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  fetchPrintsByName,
  mapToCardData,
  ScryfallCard,
} from "@/lib/scryfall";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

// ответ Scryfall “list”
interface ScryfallListResponse<T> {
  object: "list";
  data: T[];
  has_more?: boolean;
  next_page?: string;
  total_cards?: number;
}

// ответ Scryfall “error”
interface ScryfallErrorResponse {
  object: "error";
  code: string;
  status: number;
  details: string;
  type?: string;
}

// то, что мы показываем в списке сетов
interface SetItem {
  scryfall_id: string;
  name: string;
  set: string;
  set_name: string;
  lang: string;
}

// то, что вернёт mapToCardData
type MappedCard = ReturnType<typeof mapToCardData>;

export default function AdminPage() {

  const router = useRouter();

  // 1. что ввёл пользователь
  const [name, setName] = useState<string>("");

  // 2. все принты карты, которые мы стянули из Scryfall по имени
  const [allPrints, setAllPrints] = useState<ScryfallCard[]>([]);

  // 3. уникальные сеты, которые показываем в ScrollArea
  const [sets, setSets] = useState<SetItem[]>([]);

  // 4. выбранная карточка (конкретная печать) — чтобы показать “Вы выбрали сет …”
  const [selectedCard, setSelectedCard] = useState<MappedCard | null>(null);

  // 5. варианты внутри выбранного сета (regular/borderless/…)
  const [setVariants, setSetVariants] = useState<MappedCard[]>([]);

  // служебные
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);


  // Из всех принтов вытащить уникальные сеты в удобный вид
  
  const buildSetsFromPrints = (prints: ScryfallCard[]): SetItem[] => {
    const map = new Map<string, SetItem>();

    for (const card of prints) {
      if (!map.has(card.set)) {
        map.set(card.set, {
          scryfall_id: card.id,
          name: card.name,
          set: card.set,
          set_name: card.set_name,
          lang: card.lang,
        });
      }
    }

    return Array.from(map.values());
  };

  /**
   * Когда пользователь кликает по сету в списке
   */
  const handleSelectSet = (scryfallId: string) => {
    // найдём ту печать, по которой кликнули
    const baseCard = allPrints.find((c) => c.id === scryfallId);
    if (!baseCard) {
      setMessage("Не удалось найти карту для выбранного сета");
      return;
    }

    // код сета
    const setCode = baseCard.set;

    // все принты именно этого сета
    const cardsInThisSet = allPrints.filter((c) => c.set === setCode);

    // мапим в формат БД (то, что у тебя в mapToCardData)
    const mappedVariants = cardsInThisSet.map((card) => mapToCardData(card));

    setSelectedCard(mapToCardData(baseCard));
    setSetVariants(mappedVariants);
    setMessage(`Выбран сет: ${baseCard.set_name}. Вариантов: ${mappedVariants.length}`);
  };

  // ======== эффект на ввод имени (дебаунс) ========
  useEffect(() => {
    if (!name.trim()) {
      // пусто — всё сбрасываем
      setAllPrints([]);
      setSets([]);
      setSelectedCard(null);
      setSetVariants([]);
      setMessage("");
      return;
    }

    // дебаунс — не долбим Scryfall на каждый символ
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const prints = await fetchPrintsByName(name.trim(), controller.signal);
        setAllPrints(prints);
        const uniqueSets = buildSetsFromPrints(prints);
        setSets(uniqueSets);
        setSelectedCard(null);
        setSetVariants([]);

        if (prints.length === 0) {
          setMessage("Не удалось найти карты");
        } else {
          setMessage(
            `Найдено ${prints.length} печатей в ${uniqueSets.length} сет(ах)`
          );
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          // запрос отменён — ничего не делаем
          return;
        }
        setMessage(error instanceof Error ? error.message : "Ошибка загрузки с Scryfall");
        setAllPrints([]);
        setSets([]);
        setSelectedCard(null);
        setSetVariants([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 0.5 секунды — комфортно

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [name]);

  // ======== РАЗМЕТКА предідущая ========
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold">Add Magic Card</h1>

      {/* Ввод имени карты */}
      <div className="space-y-2">

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите название карты…"
          className="w-[400px]"
        />

        <div>
          {isLoading && (
            <p className="text-sm text-gray-500">Загружаю варианты с Scryfall…</p>
          )}
          {message && !isLoading && (
            <p className="text-sm text-gray-700">{message}</p>
          )}

          {/* 🔹 Если выбран сет */}
          {selectedCard && (
            <div className="mt-4 flex justify-between items-center w-full max-w-2xl">
              <h2 className="text-lg font-semibold">
                {selectedCard.set_name} ({selectedCard.set.toUpperCase()})
              </h2>
              <button
                onClick={() => {
                  setSelectedCard(null);
                  setSetVariants([]);
                  setMessage("Выберите другой сет для этой карты");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Изменить сет
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Прокручиваемый список сетов */}
      {sets.length > 0 && !selectedCard && (
        <div className="mt-6 w-full max-w-2xl">
          <h3 className="text-xl font-semibold mb-2">Найдена в таких сетах:</h3>
          <ScrollArea className="h-[200px] border rounded-xl bg-white p-3">
            <ul className="space-y-1">
              {sets.map((s) => (
                <li
                  key={s.scryfall_id}
                  onClick={() => handleSelectSet(s.scryfall_id)}
                  className="cursor-pointer hover:bg-gray-100 border-b pb-1 last:border-none"
                >
                  {s.name} — {s.set_name} • ({s.lang.toUpperCase()})
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}

      {/* Варианты карты в выбранном сете */}
      {setVariants.length > 0 && (
        <section className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold">
            Варианты в сете {setVariants[0].set_name} ({setVariants.length})
          </h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {setVariants.map((variant) => (
              <div
                key={variant.scryfall_id}
                className="rounded-xl border p-3 bg-white hover:shadow transition"
              >
                {/* 🔹 Название + оформление */}
                <div className="text-sm font-semibold mb-2">
                  {variant.name}{" "}
                  {variant.quantity && (
                    <span className="text-gray-500 text-xs">
                      #{variant.quantity}
                    </span>
                  )}
                  <div className="text-xs text-gray-700 mt-0.5">
                    {variant.variant
                      ? `— ${variant.variant.toUpperCase()}`
                      : "— REGULAR"}
                  </div>
                </div>

                {/* 🔹 Изображения */}
                <div className="flex gap-2 justify-center">
                  {variant.faces && variant.faces.length > 0 ? (
                    variant.faces.map((face, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={face.imageUrl}
                        alt={`${variant.name}-face-${i}`}
                        className="w-40 h-56 object-contain rounded-lg border"
                      />
                    ))
                  ) : (
                    <div className="text-xs text-gray-500">Нет изображения</div>
                  )}
                </div>

                {/* 🔹 Информация о фойле */}
                <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                  <div>Номер в колекции: {variant.collector_number}</div>
                </div>

                <Button
      onClick={() => router.push(`/admin/add/${variant.scryfall_id}`)}
      className="mt-3 w-full bg-black text-white hover:bg-gray-800"
    >
      Добавить в базу
    </Button>

              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}











{/* 💾 кнопка (оставляю как в разметке) */}
{/* <button
  onClick={() =>
    console.log("💾 Добавить", variant.scryfall_id, variant)
  }
  className="mt-3 w-full rounded-lg bg-black text-white py-2 text-sm hover:bg-gray-800"
>
  Добавить в базу
</button> */}
{/* <Button
onClick={async () => {
try {
const res = await fetch("/api/cards", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(variant),
});

const data = await res.json();

if (res.ok) {
alert(`✅ ${data.message}`);
} else if (res.status === 409) {
alert("⚠️ Эта карта уже есть в базе");
} else {
alert(`❌ Ошибка: ${data.message}`);
}
} catch (err) {
console.error("Ошибка при добавлении:", err);
alert("⚠️ Не удалось добавить карту");
}
}}
className="mt-3 w-full bg-black text-white hover:bg-gray-800"
>
Добавить в базу
</Button> */}