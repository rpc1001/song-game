import React from "react";
import Modal from "./Modal";

interface EndGameModalProps {
  isVisible: boolean;
  onClose: () => void;
  isCorrect: boolean;
  songTitle: string;
  songArtist: string;
  gameMode: "daily" | "genre" | "artist";
  onSwitchToGenre: () => void;
  onSwitchToArtist: () => void;
  onPlayAgain: () => void;
}

export default function EndGameModal({
  isVisible,
  onClose,
  isCorrect,
  songTitle,
  songArtist,
  gameMode,
  onSwitchToGenre,
  onSwitchToArtist,
  onPlayAgain,
}: EndGameModalProps) {
  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4 text-violet-400">
        {isCorrect ? "You Guessed It!" : "Game Over"}
      </h2>
      <p className="text-gray-300 mb-4">
        The song was <span className="text-white font-bold">{songTitle}</span> by{" "}
        <span className="text-white font-bold">{songArtist}</span>.
      </p>

      {gameMode === "daily" ? (
        <div className="flex justify-between gap-4 mb-4">
          <button
            className="flex-1 bg-violet-400 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition"
            onClick={() => {
              onSwitchToGenre();
              onClose();
            }}
          >
            Genres
          </button>
          <button
            className="flex-1 bg-violet-400 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition"
            onClick={() => {
              onSwitchToArtist();
              onClose();
            }}
          >
            Artists
          </button>
        </div>
      ) : (
        <button
          className="bg-violet-400 text-white px-4 py-2 rounded-lg w-full hover:bg-violet-600 transition mb-4"
          onClick={() => {
            onPlayAgain();
            onClose();
          }}
        >
          Play Again
        </button>
      )}
    </Modal>
  );
}
