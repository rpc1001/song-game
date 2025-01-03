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
      className={`flex items-center justify-center bg-purple-500 text-white font-bold px-4 py-2 rounded-lg w-full hover:bg-purple-600 transition ${
        !isReadyToPlay
          ? "bg-gray-600 cursor-not-allowed opacity-50"
          : isPlaying
          ? "bg-purple-500 default"
          : "bg-purple-500 hover:brightness-75"
      }`}      
      style={{
        marginTop: "1rem",
        maxWidth: "300px",
        width: "100%",
      }}
          >
                  <div className="flex items-center justify-center" style={{ width: "24px", height: "24px" }}>
      {isPlaying ? (
        <div className="flex items-center gap-1">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="w-1 h-3.5 bg-white rounded-full animate-audio-line"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          Play
          </div>
      )}
            </div>

    </button>
  );
}
