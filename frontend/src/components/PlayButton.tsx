interface PlayButtonProps {
  isPlaying: boolean;
  isReadyToPlay: boolean;
  handlePlaySnippet: () => void;
}

export default function PlayButton({
  isPlaying,
  isReadyToPlay,
  handlePlaySnippet,
}: PlayButtonProps) {
  return (
    <button
      type = "button"
      onClick={handlePlaySnippet}
      disabled={!isReadyToPlay}
      className={`relative text-white px-6 py-2 rounded-lg transition-all duration-300 ${
        !isReadyToPlay
          ? "bg-gray-600 cursor-not-allowed opacity-50"
          : isPlaying
            ? "bg-violet-600 cursor-default opacity-80 animate-pulse"
            : "bg-violet-400 hover:bg-violet-600 hover:shadow-md"
      }`}
      style={{ marginTop: "1rem", zIndex: 1 }}
    >
      {isPlaying ? "Playing..." : "Play"}
    </button>
  );
}
