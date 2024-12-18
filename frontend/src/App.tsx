import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import stringSimilarity from "string-similarity";
import Header from "./components/Header";


export default function App() {
  const MAX_GUESSES = 5;
  const [song, setSong] = useState<any>(null); // holds song data
  const [loading, setLoading] = useState<boolean>(true);
  const [snippetDuration, setSnippetDuration] = useState<number>(1); // first snippet duration (1 second), need to implement setduration
  const [guess, setGuess] = useState<string>(""); // current guess
  const [remainingGuesses, setRemainingGuesses] = useState<number>(MAX_GUESSES); // max attempts allowed
  const [isCorrect, setIsCorrect] = useState<boolean>(false); // correct guess?
  const [pastGuesses, setPastGuesses] = useState<string[]>([]); // holds all guesses
  const [currentSlot, setCurrentSlot] = useState<number>(0); // Current guess slot
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the active input box
  const audioRef = useRef<HTMLAudioElement | null>(null); // reference to  audio element
  const [progress, setProgress] = useState<number>(0); // snippet progress percentage
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // if snippet playing
  const [showEndGameModal, setShowEndGameModal] = useState<boolean>(false); // whether or not end game modal is visible
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false); // help modal or not
  const [gameMode, setGameMode] = useState<"daily" | "artist" | "genre">("daily"); // current game mode sleected
  const [selectedGenre, setSelectedGenre] = useState<string>(""); // store genre selected
  const [artistQuery, setArtistQuery] = useState<string>(""); // store artist
  const [isReadyToPlay, setIsReadyToPlay] = useState<boolean>(false); // track if game can start or not


  // fetch a random song from the backend
  const fetchSong = async () => {
    try {
      if (gameMode === "genre" && !selectedGenre) return;


      let endpoint = "http://localhost:3000/daily-challenge";
  
      if (gameMode === "genre") {
        endpoint = `http://localhost:3000/genre?genre=${encodeURIComponent(selectedGenre)}`;
        console.log("selected");
      } else if (gameMode === "artist") {
        endpoint = `http://localhost:3000/artist=${encodeURIComponent(artistQuery)}`;
      }
  
      const response = await axios.get(endpoint);
      setSong(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching song:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSong();
  }, [gameMode, selectedGenre]);
  

  // play snippet when the button clicked
  const handlePlaySnippet = () => {
    if (audioRef.current) {
      // audio to start of snippet
      audioRef.current.currentTime = 0;
      audioRef.current.play();
  
      setIsPlaying(true);
      setProgress(0);
  
      const interval = 50; // update progress every 50ms
      const totalSnippetTime = snippetDuration; // current snippet duration in seconds
      
      const progressInterval = setInterval(() => {
        if (audioRef.current) {
          const currentTime = audioRef.current.currentTime;
          
          // progress as a percentage of the snippet duration
          const newProgress = Math.min((currentTime / totalSnippetTime) * 100, 100);
          setProgress(newProgress);
  
          // stop playing and clear interval
          if (currentTime >= totalSnippetTime) {
            audioRef.current.pause();
            clearInterval(progressInterval);
            setProgress(100);
            setIsPlaying(false);
          }
        }
      }, interval);
  
      // cleanup audio stuff
      audioRef.current.onended = () => {
        clearInterval(progressInterval);
        setProgress(100);
        setIsPlaying(false);
      };
    }
  };
  
  

  const cleanSongTitle = (title: string): string => {
    return title.replace(/\(.*?\)|\[.*?\]/g, "").trim(); // Remove text in parentheses or brackets
  };

  const handleGuess = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === "Enter"){
      if (!song) return;
      const cleanedTitle = cleanSongTitle(song.title.toLowerCase());
      const cleanedGuess = cleanSongTitle(guess.toLowerCase());
      const similarity = stringSimilarity.compareTwoStrings(cleanedTitle,cleanedGuess,
      );

      setPastGuesses((prev) => [
        ...prev.slice(0, MAX_GUESSES - 1),
        guess.trim() ? guess : "Skipped Guess",
      ]);          

      // compare guess with the song title
      if (similarity > 0.9) {
        setIsCorrect(true); // correct guess
        setShowEndGameModal(true);
      } else {
        setRemainingGuesses((prev) => {
          if(prev - 1 <= 0){
            setShowEndGameModal(true);
          }
          return prev -1;
        }); // dec remaining guesses
        setSnippetDuration((prev) => prev * 2); // double snippet duration
      }

      setGuess(""); // clears field after each guess
      setProgress(0);
      setIsPlaying(false); 
      setCurrentSlot((prev) => prev + 1); // move to next slot
    }
  };

  useEffect(() => { // set input to the current guess box
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSlot, loading]); 

  // play the entire snippet with end game modal is shown
  useEffect(()=>{
    if(showEndGameModal && audioRef.current){
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }, [showEndGameModal]);

  useEffect(() => { // reset game  if genre switch or game
    if (gameMode === "genre" && selectedGenre) {
      resetGame(); 
    } else if (gameMode !== "genre") {
      resetGame(); 
    }
  }, [selectedGenre, gameMode]);

  const resetGame = () => {
    setIsCorrect(false);
    setRemainingGuesses(MAX_GUESSES);
    setSnippetDuration(1);
    setPastGuesses([]);
    setCurrentSlot(0);
    setGuess("");
    setProgress(0);
    setIsPlaying(false);
    setLoading(true);
    fetchSong();
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 text-white font-sans">
      {/* Header */}
      <Header
      gameMode={gameMode}
      setGameMode={setGameMode}
      selectedGenre={selectedGenre}
      setSelectedGenre={setSelectedGenre}
      artistInput={artistQuery}
      setArtistInput={setArtistQuery} 
      setIsReadyToPlay={setIsReadyToPlay}
      />
      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center mt-20 px-4">
        {loading ? (
          <p>Loading -_-</p>
        ) : song ? (
          <div className="text-center w-full max-w-md">
            <h1 className="text-3xl font-bold mb-6">Guess the Song</h1>
  
            {/* Guess Slots */}
            <div className="space-y-2 mb-6 w-full flex flex-col items-center">
              {Array.from({ length: MAX_GUESSES }, (_, index) => (
                <div
                  key={index}
                  className={`h-12 flex items-center justify-center w-full rounded-lg text-center text-lg font-bold ${
                    index === currentSlot
                      ? "border-2 border-violet-400 bg-transparent"
                      : pastGuesses[index]
                      ? "bg-zinc-700 text-gray-300"
                      : "bg-zinc-600"
                  }`}
                >
                  {index === currentSlot ? (
                    <input
                      ref={index === currentSlot ? inputRef : null} // ref active input
                      type="text"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      onKeyDown={(e) => handleGuess(e)}
                      className="w-full bg-transparent text-center text-white border-0 focus:outline-none placeholder-gray-400"
                      placeholder="Enter your guess..."
                      disabled={!isReadyToPlay || isCorrect || currentSlot >= MAX_GUESSES}
                      />
                  ) : (
                    <span className="truncate">{pastGuesses[index] || ""}</span>
                  )}
                </div>
              ))}
            </div>
            {/* Progress Bar */}
            <div className="relative w-full mt-4 h-2 bg-zinc-700 rounded-full overflow-hidden">
              {/* Snippet Duration Segment*/}
              <div
                className="absolute top-0 left-0 h-full bg-gray-500"
                style={{ width: `${(snippetDuration / 16) * 100}%` }}
              >
                {/* Playback Progress */}
                <div
                  className="h-full bg-violet-500 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            {/* Play Button */}
            <button
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
            {/* Remaining Guesses */}
            <p className="mt-4 text-gray-400">
              Remaining Guesses: {remainingGuesses}
            </p>
  
            {remainingGuesses <= 0 && (
              <p className="text-red-400 mt-4">
                Game Over. The correct answer was "{song.title}".
              </p>
            )}
  
            {isCorrect && (
              <p className="text-green-400 mt-6">
                Correct :D The song was "{song.title}" by {song.artist}.
              </p>
            )}
  
            <audio ref={audioRef} src={song.preview} />
          </div>
        ) : (
          <p>Failed to load song. Try refreshing :/</p>
        )}
      </div>
      {showEndGameModal && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg w-80 text-center relative">
          <button
            className="absolute top-2 right-2 text-gray-300 hover:text-gray-500"
            onClick={() => setShowEndGameModal(false)}
          >
            ✖
          </button>

          <h2 className="text-2xl font-bold mb-4 text-violet-400">
            {isCorrect ? "You Guessed It!" : "Game Over"}
          </h2>
          <p className="text-gray-300 mb-4">
            The song was <span className="text-white font-bold">{song.title}</span> by{" "}
            <span className="text-white font-bold">{song.artist}</span>.
          </p>

          {/* Mode-Specific Buttons */}
          {gameMode === "daily" ? (
            <div className="flex justify-between gap-4 mb-4">
              <button
                className="flex-1 bg-violet-400 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition"
                onClick={() => {
                  setGameMode("genre");
                  resetGame();
                  setShowEndGameModal(false);
                }}
              >
                Genres
              </button>

              <button
                className="flex-1 bg-violet-400 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition"
                onClick={() => {
                  setGameMode("artist");
                  resetGame();
                  setShowEndGameModal(false);
                }}
              >
                Artists
              </button>
            </div>
          ) : (
            <button
              className="bg-violet-600 text-white px-4 py-2 rounded-lg w-full hover:bg-violet-400 transition mb-4"
              onClick={() => {
                setShowEndGameModal(false);
                resetGame();
              }}
            >
              Play Again
            </button>
          )}

          {/* Share Button */}
          <button
            className="bg-violet-400 text-white px-4 py-2 rounded-lg w-full hover:bg-violet-600 transition"
            onClick={() => alert("Share functionality coming soon!")}
          >
            Share
          </button>
        </div>
      </div>
    )}

      {/* Help Modal */}
      {showHelpModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setShowHelpModal(false)} // closes modal when clicking outside
        >
          <div
            className="bg-zinc-800 p-6 rounded-lg shadow-lg w-80 text-center relative"
            onClick={(e) => e.stopPropagation()} // avoid closing when clicking inside
          >
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-300 hover:text-gray-500"
              onClick={() => setShowHelpModal(false)}
            >
              ✖
            </button>

            {/* Help Content */}
            <h2 className="text-2xl font-bold mb-4 text-violet-400">How to Play</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              - Press <b>Play</b> to listen to a snippet of a song. <br />
              - Type your guess in the input box and press <b>Enter</b>. <br />
              - Each incorrect guess <b>doubles</b> the snippet length. <br />
              - You have <b>5 chances</b> to guess the song correctly.
            </p>
          </div>
        </div>
      )}

    </div>
  );  
}