import React from "react";

interface HeaderProps {
  gameMode: string;
  setGameMode: (mode: "daily" | "genre" | "artist") => void;
}

export default function Header({ gameMode, setGameMode }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-zinc-900 shadow-md">
      {/* Logo */}
      <div className="text-xl font-bold text-violet-500 flex items-center gap-2">
        <span role="img" aria-label="music-note">🎵</span>
        <span>Tempo Run</span>
      </div>

      {/* Game Mode Selector */}
      <div className="flex items-center gap-4">
        <label className="text-white font-semibold">Mode:</label>
        <select
          className="bg-violet-500 text-white px-3 py-2 rounded-lg focus:outline-none"
          value={gameMode}
          onChange={(e) => setGameMode(e.target.value as "daily" | "genre" | "artist")}
        >
          <option value="daily">Daily Challenge</option>
          <option value="genre">Genres</option>
          <option value="artist">Artists</option>
        </select>
      </div>

      {/* Help Button */}
      <button
        className="text-white bg-violet-500 px-3 py-1 rounded-full hover:bg-violet-700 transition duration-300"
        onClick={() => alert("Help menu coming soon!")}
      >
        ?
      </button>
    </header>
  );
}
