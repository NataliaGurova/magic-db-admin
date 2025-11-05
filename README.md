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

