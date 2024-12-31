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
      type="button"
      onClick={handlePlaySnippet}
      disabled={!isReadyToPlay}
      className={`relative text-white font-bold px-6 py-2 rounded-lg transition-all duration-300 ${
        !isReadyToPlay
          ? "bg-gray-600 cursor-not-allowed opacity-50"
          : isPlaying
          ? "bg-purple-500 cursor-default animate-pulse"
          : "bg-purple-500 hover:brightness-75 hover:shadow-md"
      }`}
      style={{ marginTop: "1rem", zIndex: 1 }}
    >
      {isPlaying ? "Playing..." : "Play"}
    </button>
  );
}
