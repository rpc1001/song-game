import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import stringSimilarity from "string-similarity";


export default function App() {
  const MAX_GUESSES = 5;
  const [song, setSong] = useState<any>(null); // holds song data
  const [loading, setLoading] = useState<boolean>(true);
  const [snippetDuration, setSnippetDuration] = useState<number>(1); // first snippet duration (1 second), need to implement setduration
  const [guess, setGuess] = useState<string>(""); // current guess
  const [remainingGuesses, setRemainingGuesses] = useState<number>(5); // max attempts allowed
  const [isCorrect, setIsCorrect] = useState<boolean>(false); // correct guess?
  const [pastGuesses, setPastGuesses] = useState<string[]>([]); // holds all guesses
  const [currentSlot, setCurrentSlot] = useState<number>(0); // Current guess slot
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the active input box
  const audioRef = useRef<HTMLAudioElement | null>(null); // reference to  audio element
  const [progress, setProgress] = useState<number>(0); // snippet progress percentage
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // if snippet playing
  

  // fetch a random song from the backend
  useEffect(() => {
    axios
      .get("http://localhost:3000/random-song")
      .then((response) => {
        console.log("Song:", response.data); // debug
        setSong(response.data);
        setLoading(false); // turn off loading state
      })
      .catch((error) => {
        console.error("Error getting song:", error); // log error
        setLoading(false);
      });
  }, []);

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
        guess.trim() ? guess : " ",
      ]);          

      // compare guess with the song title
      if (similarity > 0.9) {
        setIsCorrect(true); // correct guess
      } else {
        setRemainingGuesses((prev) => prev - 1); // dec remaining guesses
        setSnippetDuration((prev) => prev * 2); // double snippet duration
      }

      setGuess(""); // clears field after each guess
      setProgress(0);
      setIsPlaying(false); 
      setCurrentSlot((prev) => prev + 1); // move to next slot
    }
  };
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSlot, loading]); 

  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 text-white font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full flex items-center justify-between px-6 py-4 bg-zinc-900 bg-opacity-80 shadow-md z-10">
        <div className="text-2xl font-bold text-violet-400 flex items-center gap-2">
          <span role="img" aria-label="music-note">🎵</span>
          <span>Tempo Run</span>
        </div>
  
        <nav className="flex items-center gap-6 text-gray-300">
          <span className="text-white underline underline-offset-4 decoration-violet-400">
            Daily Challenge
          </span>
          <span>Genres</span>
          <span>Playlists</span>
          <span>Artists</span>
          <button
            className="text-white bg-violet-400 px-3 py-1 rounded-full hover:bg-violet-600 transition duration-300"
            onClick={() => alert("Help modal coming soon!")}
          >
            ?
          </button>
        </nav>
      </header>
  
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
                      disabled={isCorrect || currentSlot >= MAX_GUESSES}
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
              className={`relative text-white px-6 py-2 rounded-lg transition-all duration-300 ${
                isPlaying
                  ? "bg-violet-600 cursor-default opacity-80 animate-pulse"
                  : "bg-violet-400 hover:bg-violet-500 hover:shadow-md"
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
    </div>
  );  
}