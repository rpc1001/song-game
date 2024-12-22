import React, { useState, useEffect } from "react";
import axios from "axios";

interface HeaderProps {
  gameMode: string;
  setGameMode: (mode: "daily" | "genre" | "artist") => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  artistInput: string;
  onArtistInputChange: (artist: string) => void;
  onArtistConfirm: () => void;
  setShowHelpModal: (visible: boolean) => void;
}


export default function Header({
  gameMode,
  setGameMode,
  selectedGenre,
  onGenreChange,
  artistInput,
  onArtistInputChange,
  onArtistConfirm,
  setShowHelpModal,
}: HeaderProps) {
  const [genres, setGenres] = useState<string[]>([]);
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get("http://localhost:3000/genres");
        setGenres(response.data.genres || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    if (gameMode === "genre") {
      fetchGenres();
    }
  }, [gameMode]);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-zinc-900 shadow-md">
      {/* Logo */}
      <div className="text-xl font-bold text-violet-500 flex items-center gap-2">
        <span role="img" aria-label="music-note">🎵</span>
        <span>Tempo Run</span>
      </div>

      {/* Game Mode Controls */}
      <div className="flex items-center gap-4">
        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">Mode:</span>
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

        {/* Genre Dropdown */}
        {gameMode === "genre" && (
          <select
            className="bg-violet-500 text-white px-3 py-2 rounded-lg focus:outline-none"
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
          >
            <option value="">Select Genre</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        )}

        {/* Artist Input */}
        {gameMode === "artist" && (
          <div className="relative w-27">
            <input
              type="text"
              placeholder="Type an artist here... (Press Enter to confirm)"
              className="bg-violet-500 text-white px-3 py-2 pr-28 rounded-lg focus:outline-none placeholder-gray-300 w-full"
              value={artistInput}
              onChange={(e) => onArtistInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter"){
                  e.preventDefault();
                  onArtistConfirm();
                }
              }}
              />
          </div>
        )}
      </div>

      {/* Help Button */}
      <button
        className="text-white bg-violet-500 px-3 py-1 rounded-full hover:bg-violet-700 transition duration-300"
        onClick={() => setShowHelpModal(true)}
      >
        ?
      </button>
    </header>
  );
}
