import React, { useState, useEffect } from "react";
import axios from "axios";

interface HeaderProps {
  gameMode: string;
  setGameMode: (mode: "daily" | "genre" | "artist") => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void; // if genre selected
  artistInput: string;
  setArtistInput: (artist: string) => void; //
  setIsReadyToPlay: (ready: boolean) => void; // if game is ready
  setShowHelpModal: (visible: boolean) => void; 
}

export default function Header({
  gameMode,
  setGameMode,
  selectedGenre,
  setSelectedGenre,
  artistInput,
  setArtistInput,
  setIsReadyToPlay,
  setShowHelpModal,
}: HeaderProps) {
  const [genres, setGenres] = useState<string[]>([]); // genres from backend
  const [artistConfirmed, setArtistConfirmed] = useState<boolean>(false); //  artist input confirmed?
  const [showHint, setShowHint] = useState<boolean>(true); // toggle hint telling user to do enter to confirm

  // get genres from backend
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get("http://localhost:3000/genres");
        setGenres(response.data.genres);
      } catch (error) {
        console.error("Error fetching genres:", error.message);
      }
    };

    fetchGenres();
  }, []); // only run on mount

  // artist confirmation when Enter is pressed
  const handleArtistKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (artistInput.trim()) {
        setArtistConfirmed(true); //
        setShowHint(false); // get rid of hint
        setIsReadyToPlay(true);
      } else {
        alert("Please enter a valid artist name.");
        setArtistConfirmed(false);
        setShowHint(true); //enter to confirm still
      }
    }
  };

  // gameplay disabled until user makes a valid selection
  useEffect(() => {
    if (gameMode === "genre" && !selectedGenre) {
      setIsReadyToPlay(false); // disable play button and text is no genre selected
    } else if (
      gameMode === "artist" &&
      (!artistConfirmed || artistInput.trim() === "")
    ) {
      setIsReadyToPlay(false); // same thing bu for artists
    } else {
      setIsReadyToPlay(true);
    }
  }, [gameMode, selectedGenre, artistConfirmed, artistInput, setIsReadyToPlay]);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-zinc-900 shadow-md">
      {/* Logo */}
      <div className="text-xl font-bold text-violet-500 flex items-center gap-2">
        <span role="img" aria-label="music-note">
          🎵
        </span>
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
            onChange={(e) => {
              setGameMode(e.target.value as "daily" | "genre" | "artist");
              setIsReadyToPlay(false); // prevent gameplay until a selection
              setSelectedGenre(""); // reset genre selection in between modes
              setArtistInput(""); // clear arists in between modes
              setArtistConfirmed(false); // artist input is unconfirmed
            }}
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
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setIsReadyToPlay(e.target.value !== "");
            }}
          >
            <option value="">Select Genre</option> {/* Placeholder value */}
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
              placeholder="Type an artist here..."
              className={`bg-violet-500 text-white px-3 py-2 pr-28 rounded-lg focus:outline-none placeholder-gray-300 w-full ${
                artistConfirmed ? "border-green-400" : "border-gray-400"
              }`}
              value={artistInput}
              onChange={(e) => {
                setArtistInput(e.target.value);
                setArtistConfirmed(false);
                setShowHint(true);
              }}
              onKeyDown={handleArtistKeyPress}
            />
            {showHint && !artistConfirmed && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 text-sm">
                Enter to confirm
              </span>
            )}
            {artistConfirmed && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 text-sm">
                ✅ Confirmed
              </span>
            )}
            {!artistConfirmed && artistInput.trim() === "" && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 text-sm">
                ❌ Invalid
              </span>
            )}
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
