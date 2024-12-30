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
  return (
    <div className="space-y-2 mb-6 w-full flex flex-col items-center">
      {Array.from({ length: MAX_GUESSES }, (_, index) => (
        <div
          key={index}
          className={`h-12 flex items-center justify-center w-full rounded-lg text-center text-lg font-bold ${
            index === currentSlot
              ? "border-2 border-violet-400 bg-transparent"
              : pastGuesses[index]
              ? titleMatches[index]
                ? "bg-green-400 text-black"
                : albumMatches[index]
                ? "bg-blue-400 text-black"
                : artistMatches[index]
                ? "bg-yellow-400 text-black" 
                : "bg-zinc-700 text-gray-300"
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
