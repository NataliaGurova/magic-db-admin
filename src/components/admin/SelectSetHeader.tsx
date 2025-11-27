
"use client";

interface SelectSetHeaderProps {
  selectedCard: {
    set_name: string;
    set: string;
  } | null;
  onReset: () => void;
}

export default function SelectSetHeader({ selectedCard, onReset }: SelectSetHeaderProps) {
  if (!selectedCard) return null;

  return (
    <div className="mt-4 flex justify-between items-center w-full">
      <h2 className="text-lg font-semibold">
        {selectedCard.set_name} ({selectedCard.set.toUpperCase()})
      </h2>

      <button
        onClick={onReset}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        Change Set
      </button>
    </div>
  );
}
