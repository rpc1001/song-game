import { useState } from "react";
import Modal from "./Modal";
import NextSongButton from "./NextSongButton";
import GenreStatsSlide from "./stats/GenreStatsSlide";
import DailyStatsSlide from "./stats/DailyStatsSlide";
import ArtistStatsSlide from "./stats/ArtistStatsSlide";


import { songObject } from "../types/interfaces";


import { ChevronRight, ChevronLeft } from "lucide-react";


interface EndGameModalProps {
  isVisible: boolean;
  onClose: () => void;
  isCorrect: boolean;
  song: songObject;
  gameMode: "daily" | "genre" | "artist";
  onSwitchToGenre: () => void;
  onSwitchToArtist: () => void;
  onNextSong: () => void;
  onChangeGenre?: () => void;
  onChangeArtist?: () => void;
  onViewStats?: () => void;
  isGenreDailyRound?: boolean;
  selectedGenre?: string;
}

export default function EndGameModal({
  isVisible,
  onClose,
  isCorrect,
  song,
  onSwitchToGenre,
  onSwitchToArtist,
  onNextSong,
  gameMode,
  onViewStats,
  isGenreDailyRound,
  selectedGenre,
}: EndGameModalProps) {
  const [showChart, setShowChart] = useState(false);
  const [, setHasSwitchedManually] = useState(false);

  // Auto-switch to the chart after 3 seconds
  // useEffect(() => {
  //   if (!hasSwitchedManually) {
  //     const timer = setTimeout(() => setShowChart(true), 5000);
  //     return () => clearTimeout(timer);
  //   }

  // }, [hasSwitchedManually]);

  if (!isVisible) return null;

  const formatContributors = (contributors: string[]): JSX.Element => {
    if (contributors.length === 1) {
      return <strong style={{ color: "#f0f0f0" }}>{contributors[0]}</strong>;
    }
    const last = contributors.pop()!;
    return (
      <>
        {contributors.map((c, i) => (
          <span key={i}>
            <strong style={{ color: "#f0f0f0" }}>{c}</strong>
            {i < contributors.length - 1 ? ", " : ""}
          </span>
        ))}
        , and <strong style={{ color: "#f0f0f0" }}>{last}</strong>
      </>
    );
  };

  const mainContributors = song.contributors
    .filter((c) => c.role.toLowerCase() === "main")
    .map((c) => c.name);

  const featuredArtists = song.contributors
    .filter((c) => c.role.toLowerCase() === "featured")
    .map((c) => c.name);

  const cleanTitle = (title: string): string =>
    title.replace(/\s*\([^)]*(feat|featured)[^)]*\)\s*/gi, "").trim();

  const description = (
    <>
      {gameMode === "daily"
        ? "Song of the day was "
        : isGenreDailyRound
        ? ` ${selectedGenre} song of the day was `
        : "The song was "}
      <strong style={{ color: "#f0f0f0" }}>{cleanTitle(song.title)}</strong> by{" "}
      {formatContributors(mainContributors)}
      {featuredArtists.length > 0 && (
        <>
          {" "}
          featuring {formatContributors(featuredArtists)}
        </>
      )}
      .
    </>
  );

  return (
    <Modal isVisible={isVisible} onClose={onClose} dismissible>
      {/* Title */}
      <h2
        className={`text-2xl font-bold mb-4 ${
          isCorrect ? "text-green-500" : "text-bright_pink_(crayola)-500"
        }`}
      >
        {isCorrect
          ? isGenreDailyRound || gameMode === "daily"
            ? "You Got Today's Song!"
            : "You Guessed It!"
          : "Game Over"}
      </h2>

      {/* Description */}
      <p className="text-gray-300 mb-4">{description}</p>

      {/* Container for Album vs. Chart  */}
      <div className="relative w-[250px] h-[250px] mx-auto overflow-hidden mb-2">
        {/* ALBUM COVER slide */}
        <div
          className={`
            absolute w-full h-full top-0 left-0
            transform transition-transform duration-500
            ${showChart ? "-translate-x-full" : "translate-x-0"}
          `}
        >
          <img
            src={song.album.cover_big}
            alt="Album Cover"
            className="rounded-lg w-full h-full object-cover"
          />
        </div>

        {/* CHART slide */}
        <div
          className={`
            absolute w-full h-full top-0
            transform transition-transform duration-500
            ${showChart ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {gameMode === "genre" && <GenreStatsSlide selectedGenre={selectedGenre} />}
          {gameMode === "daily" && <DailyStatsSlide/>}
          {gameMode === "artist" && <ArtistStatsSlide selectedArtistName={song.artist.name} />}

        </div>
      </div>


      {/* Small button to go back/forth */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => {
            setShowChart(!showChart);
            setHasSwitchedManually(true); 
          }}
          className="text-sm flex items-center tranisition text-gray-300 hover:text-white mb-1"
        >
        {showChart ? (  
              <>
                <ChevronLeft size={16}/>
                Album

              </>
            ) : (
              <>
              Stats
              <ChevronRight size={16}/>
              </>
            )}        
          </button>
        </div>

      {/* If not daily, show Next Song */}
      {gameMode !== "daily" && (
        <NextSongButton onNextSong={onNextSong} label={"Next Song"} />
      )}

      {/* If daily, show View Stats */}
      {gameMode === "daily" && onViewStats && (
        <button
          onClick={() => {
            onViewStats();
            onClose();
          }}
          className="bg-purple-500 text-white font-bold px-4 py-2 rounded-lg w-full hover:brightness-75 transition"
        >
          View Stats
        </button>
      )}

      {/* Mode selection buttons */}
      <div className="mt-4 space-y-4">
        <button
          className="bg-mulberry-500 text-white font-bold px-4 py-2 rounded-lg w-full hover:brightness-75 transition"
          onClick={() => {
            onSwitchToArtist();
            onClose();
          }}
        >
          Select Artist
        </button>
        <button
          className="bg-atomic_tangerine-500 text-white font-bold px-4 py-2 rounded-lg w-full hover:brightness-75 transition"
          onClick={() => {
            onSwitchToGenre();
            onClose();
          }}
        >
          Select Genre
        </button>
      </div>
    </Modal>
  );
}
