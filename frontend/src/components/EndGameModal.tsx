import Modal from "./Modal";
import NextSongButton from "./NextSongButton"; 
import { songObject } from "../types/interfaces";


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
}: EndGameModalProps) {
  if (!isVisible) return null;

  const formatContributors = (contributors: string[]): JSX.Element => {
    if (contributors.length === 1) return <strong style={{ color: '#f0f0f0' }}>{contributors[0]}</strong>;
    const last = contributors.pop();
    return (
      <>
        {contributors.map((contributor, index) => (
          <span key={index}>
            <strong style={{ color: '#f0f0f0' }}>{contributor}</strong>
            {index < contributors.length - 1 ? ", " : ""}
          </span>
        ))}
        , and <strong style={{ color: '#f0f0f0' }}>{last}</strong>
      </>
    );
  };

  const mainContributors = song.contributors
    .filter((contributor) => contributor.role.toLowerCase() === "main")
    .map((contributor) => contributor.name);

  const featuredArtists = song.contributors
    .filter((contributor) => contributor.role.toLowerCase() === "featured")
    .map((contributor) => contributor.name);

  const description = (
    <>
      The song was <strong style={{ color: '#f0f0f0' }}>{song.title}</strong> by{" "}
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
    <Modal isVisible={isVisible} onClose={onClose} dismissible={true}>
      <h2
        className={`text-2xl font-bold mb-4 ${
          isCorrect ? "text-green-500" : "text-bright_pink_(crayola)-500"
        }`}
      >
        {isCorrect ? "You Guessed It!" : "Game Over"}
      </h2>

      {/* Description */}
      <p className="text-gray-300 mb-4">{description}</p>

      {/* Album Cover */}
      <img
        src={song.album.cover_big}
        alt="Album Cover"
        className="rounded-lg shadow-lg mx-auto mb-4"
      />

    {/* Next Song Button */}
      {gameMode !== "daily" && (
        <NextSongButton
          onNextSong={onNextSong}
          label={"Next Song"}
        />
      )}

      {/* Game Mode Selection Buttons */}
      <div className="mt-4 space-y-4">

        <button
          className="bg-mulberry-500 text-white  font-bold px-4 py-2 rounded-lg w-full hover:brightness-75 transition"
          onClick={() => {
            onSwitchToArtist();
            onClose();
          }}
        >
          Select Artist
        </button>
        <button
          className="bg-atomic_tangerine-500 text-white font-bold  px-4 py-2 rounded-lg w-full hover:brightness-75 transition"
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