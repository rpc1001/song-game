import React from "react";

interface GuessSlotsProps {
  MAX_GUESSES: number;
  currentSlot: number;
  pastGuesses: string[];
  guess: string;
  setGuess: (value: string) => void;
  handleGuess: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isReadyToPlay: boolean;
  isCorrect: boolean;
  inputRef: RefObject<HTMLInputElement>;
}

export default function GuessSlots({
  MAX_GUESSES,
  currentSlot,
  pastGuesses,
  guess,
  setGuess,
  handleGuess,
  isReadyToPlay,
  isCorrect,
  inputRef,
}: GuessSlotsProps) {
  return (
    <div className="space-y-2 mb-6 w-full flex flex-col items-center">
      {Array.from({ length: MAX_GUESSES }, (_, index) => (
        <div
          key={index}
          className={`h-12 flex items-center justify-center w-full rounded-lg text-center text-lg font-bold ${
            index === currentSlot
              ? "border-2 border-violet-400 bg-transparent"
              : pastGuesses[index]
                ? "bg-zinc-700 text-gray-300"
                : "bg-zinc-600"
          }`}
        >
          {index === currentSlot ? (
            <input
              ref={index === currentSlot ? inputRef : null}
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={handleGuess}
              className="w-full bg-transparent text-center text-white border-0 focus:outline-none placeholder-gray-400"
              placeholder="Enter your guess..."
              disabled={
                !isReadyToPlay || isCorrect || currentSlot >= MAX_GUESSES
              }
            />
          ) : (
            <span className="truncate">{pastGuesses[index] || ""}</span>
          )}
        </div>
      ))}
    </div>
  );
}
