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

  onChangeGenre?: () => void;
  onChangeArtist?: () => void;
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
  onChangeGenre,
  onChangeArtist,
}: EndGameModalProps) {
  if (!isVisible) return null;

  return (
    <Modal isVisible={isVisible} onClose={onClose} dismissible={true}>
    <h2
      className={`text-2xl font-bold mb-4 ${
        isCorrect ? "text-green-400" : "text-red-400"
      }`}
    >
      {isCorrect ? "You Guessed It!" : "Game Over"}
    </h2>
      <p className="text-gray-300 mb-4">
        The song was <span className="text-white font-bold">{songTitle}</span> by{" "}
        <span className="text-white font-bold">{songArtist}</span>.
      </p>

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
