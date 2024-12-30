import Modal from "./Modal";

interface EndGameModalProps {
  isVisible: boolean;
  onClose: () => void;
  isCorrect: boolean;
  song: Song;
  gameMode: "daily" | "genre" | "artist";
  onSwitchToGenre: () => void;
  onSwitchToArtist: () => void;
  onPlayAgain: () => void;
  onChangeGenre?: () => void;
  onChangeArtist?: () => void;
}

interface Song {
  title: string;
  preview: string;
  artist: string;
  album: {
    title: string;
    tracklist: string;
    cover_big: string;
  };
  confirmedArtist?: string;
  contributors: { name: string; role: string }[];
}

export default function EndGameModal({
  isVisible,
  onClose,
  isCorrect,
  song,
  gameMode,
  onSwitchToGenre,
  onSwitchToArtist,
  onPlayAgain,
  onChangeGenre,
  onChangeArtist,
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
          isCorrect ? "text-green-400" : "text-red-400"
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
      {gameMode === "daily" && (
        <>
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
        </>
      )}

      {gameMode === "genre" && (
        <>
          <button
            className="bg-violet-400 text-white px-4 py-2 rounded-lg w-full hover:bg-violet-600 transition mb-4"
            onClick={() => {
              onPlayAgain();
              onClose();
            }}
          >
            Play Again
          </button>
          <button
            className="bg-violet-500 text-white px-4 py-2 rounded-lg w-full hover:bg-violet-600 transition"
            onClick={() => {
              onChangeGenre?.();
              onClose();
            }}
          >
            Change Genre
          </button>
        </>
      )}

      {gameMode === "artist" && (
        <>
          <button
            className="bg-violet-400 text-white px-4 py-2 rounded-lg w-full hover:bg-violet-600 transition mb-4"
            onClick={() => {
              onPlayAgain();
              onClose();
            }}
          >
            Play Again
          </button>
          <button
            className="bg-violet-500 text-white px-4 py-2 rounded-lg w-full hover:bg-violet-600 transition"
            onClick={() => {
              onChangeArtist?.();
              onClose();
            }}
          >
            Change Artist
          </button>
        </>
      )}
    </Modal>
  );
}
