import React, { RefObject } from "react";

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
  titleMatches: boolean[];
  artistMatches: boolean[];
  albumMatches: boolean[];
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
  artistMatches,
  albumMatches,
  titleMatches,
}: GuessSlotsProps) {
  const isGameEnded = isCorrect || currentSlot >= MAX_GUESSES;
  return (
    <div className="space-y-2 mb-3 w-full flex flex-col items-center">
      {Array.from({ length: MAX_GUESSES }, (_, index) => (
        <div
          key={index}
          className={`h-12 flex items-center justify-center w-full rounded-lg text-center text-lg font-bold ${
            index === currentSlot
              ? isGameEnded
                ? "bg-zinc-600 text-gray-300"
                : "border-2 border-purple-500 bg-transparent"
              : pastGuesses[index]
              ? titleMatches[index]
                ? "bg-green-500 text-white"
                : albumMatches[index]
                ? "bg-munsell_blue text-white"
                : artistMatches[index]
                ? "bg-mulberry-500 text-white" 
                : "bg-zinc-700 text-gray-300"
              : "bg-zinc-600"
          }`}
        >
      
          {index === currentSlot && !isGameEnded ? (
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
