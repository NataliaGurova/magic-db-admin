<<<<<<< Updated upstream
useEffect(() => {
  if (!name.trim()) {
    // ✅ Полностью сбрасываем состояние при очистке поля
    setSets([]);
    setSelectedCard(null);
    setSetVariants([]);
    setMessage("");
    return;
  }

  const timer = setTimeout(async () => {
    try {
      // ✅ При новом поиске тоже очищаем старый выбор
      setSelectedCard(null);
      setSetVariants([]);
      setMessage("🔍 Идёт поиск...");

      const all = await getPrintsByName(name.trim());
      const uniqueSets = uniqueByKey(all, (i) => `${i.name}-${i.set}-${i.lang}`).map((card) => ({
        scryfall_id: card.id,
        name: card.name,
        set_name: card.set_name,
        collector_number: card.collector_number ?? "", // ✅ безопасное значение
        lang: card.lang,
      }));

      setSets(uniqueSets);
      setMessage(`Найдена в ${uniqueSets.length} сетах`);
    } catch {
      setSets([]);
      setSetVariants([]);
      setSelectedCard(null);
      setMessage("❌ Не удалось найти карты");
    }
  }, 400);

  return () => clearTimeout(timer);
}, [name]);


<!--        ==================              -->

export function mapToCardData(card: ScryfallCard) {
  const variant = detectVariant(card);
  const finishes = card.finishes || [];

  const foilType = finishes.includes("surgefoil")
    ? "surgefoil"
    : finishes.includes("etched")
    ? "etched"
    : finishes.includes("rainbowfoil")
    ? "rainbowfoil"
    : finishes.includes("foil")
    ? "foil"
    : "nonfoil";

  const faces =
    card.card_faces?.map((f, i) => ({
      side: i === 0 ? "front" : "back",
      imageUrl: f.image_uris?.large ?? f.image_uris?.normal ?? "",
    })) ??
    [
      {
        side: "front",
        imageUrl: card.image_uris?.large ?? card.image_uris?.normal ?? "",
      },
    ];

  return {
    scryfall_id: card.id,
    name: card.name,
    set: card.set,
    set_name: card.set_name,
    rarity: card.rarity ?? "",
    artist: card.artist ?? "",
    type_line: card.type_line ?? "",
    colors: card.colors ?? [],
    legalities: card.legalities ?? {},
    faces,
    variant,
    foilType,
    prices: "",
    collector_number: card.collector_number ?? "", // ✅ добавлено
    number: "", // ✅ пока пустое, заполнишь вручную в админке
    lang: card.lang ?? "en",
    isFoil: finishes.includes("foil"),
  };
}


<!-- старое -->

 const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(formData.name)}`);
        const card = res.data;
        const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || "";
        setPreview({ name: card.name, imageUrl });
      } catch {
        setPreview(null);
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(timer);
  }, [formData.name]);

=======
// 🔹 Функция для Title Case
function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

  // const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, type, value } = e.target;
  //   const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: type === "checkbox" ? !!checked : value,
  //   }));
  // };





              {/* Поле Set — всегда видно, только для чтения */}
        <input
          type="text"
          name="set_name"
          placeholder="Set"
          value={formData.set_name}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl"
          readOnly
        />

        {/* Список сетов (показываем даже один) */}
        {sets.length > 0 && (
          <div className="border rounded-lg p-2 bg-gray-50 max-h-40 overflow-auto">
            <p className="text-sm mb-2 text-gray-600">Choose set:</p>
            <ul className="divide-y">
              {sets.map(s => (
                <li
                  key={s.id}
                  onClick={() => handleSelectSet(s)}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${s.set_name === formData.set_name ? "bg-blue-100" : ""}`}
                >
                  {s.name} — <span className="text-gray-500">{s.set_name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}


        interface ScryfallCard {
  id: string;
  name: string;
  set_name: string;
  lang: string;
}

export default function AdminPage() {
  const [formData, setFormData] = useState<CardForm>({
    name: "",
    prices: "",
    number: "",
    lang: "en",
    isFoil: false,
  });

  const [message, setMessage] = useState("");
  const [cards, setCards] = useState<ScryfallCard[]>([]);

  useEffect(() => {
    if (!formData.name) {
      setCards([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const query = encodeURIComponent(formData.name.trim());
        let url = `https://api.scryfall.com/cards/search?q=${query}`;
        const allCards: ScryfallCard[] = [];

        while (url) {
          const res = await axios.get(url);
          const data = res.data;

          if (data.object === "error") break;

          const pageCards: ScryfallCard[] = data.data.map((card: any) => ({
            id: card.id,
            name: card.name,
            set_name: card.set_name,
            lang: card.lang,
          }));

          allCards.push(...pageCards);

          if (data.has_more) url = data.next_page;
          else url = "";
        }

        console.log(`Найдено карт: ${allCards.length}`);
        setCards(allCards);
      } catch (error) {
        console.error("Ошибка поиска:", error);
        setCards([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.name]);

  // ...остальной код формы (handleChange, handleSubmit и т.д.)
>>>>>>> Stashed changes
