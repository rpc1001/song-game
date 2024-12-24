import React, { useCallback, useState, useEffect, useRef } from "react";
import axios from "axios";
import stringSimilarity from "string-similarity";

import Header from "./components/Header";
import GenreSelectModal from "./components/GenreSelectModal";
import ArtistSelectModal from "./components/ArtistSelectModal";
import GuessSlots from "./components/GuessSlots";
import ProgressBar from "./components/ProgressBar";
import PlayButton from "./components/PlayButton";
import EndGameModal from "./components/EndGameModal";
import HelpModal from "./components/HelpModal";

export default function App() {
  const MAX_GUESSES = 5;
  const [song, setSong] = useState<Song | null>(null); // holds song data
  const [snippetDuration, setSnippetDuration] = useState<number>(1); // first snippet duration (1 second), need to implement setduration
  const [guess, setGuess] = useState<string>(""); // current guess
  const [remainingGuesses, setRemainingGuesses] = useState<number>(MAX_GUESSES); // max attempts allowed
  const [isCorrect, setIsCorrect] = useState<boolean>(false); // correct guess?
  const [pastGuesses, setPastGuesses] = useState<string[]>([]); // holds all guesses
  const [currentSlot, setCurrentSlot] = useState<number>(0); // Current guess slot
 
  const [progress, setProgress] = useState<number>(0); // snippet progress percentage
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // if snippet playing
 
  const [showEndGameModal, setShowEndGameModal] = useState<boolean>(false); // whether or not end game modal is visible
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false); // help modal or not
  

  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showArtistModal, setShowArtistModal] = useState(false);


  const [gameMode, setGameMode] = useState<"daily" | "artist" | "genre">("daily"); // current game mode sleected
  const [selectedGenre, setSelectedGenre] = useState<string>(""); // store genre selected
  const [artistInput, setArtistInput] = useState<string>("");

  const [isLoadingSong, setIsLoadingSong] = useState<boolean>(false); // track if game can start or not


  const inputRef = useRef<HTMLInputElement>(null); // Ref for the active input box
  const audioRef = useRef<HTMLAudioElement | null>(null); // reference to  audio element
  
  interface Song {
    title: string;
    preview: string;
    artist: string;
    album: string;
    confirmedArtist?: string;
  }

  const fetchSong = useCallback(async () => {
    setSong(null);
  
    let endpoint = "api/daily-challenge";
    if (gameMode === "genre" && selectedGenre) {
      endpoint = `api/genre?genre=${encodeURIComponent(selectedGenre)}`;
    } else if (gameMode === "artist" && artistInput) {
      endpoint = `api/artist?artist=${encodeURIComponent(artistInput)}`;
    }
  
    try {
      setIsLoadingSong(true);
      const response = await axios.get(endpoint);
      setSong(response.data);
    } catch (error) {
      console.error("Error fetching song:", error);
    } finally {
      setIsLoadingSong(false);
    }
  }, [gameMode, selectedGenre, artistInput]);
  


  useEffect(() => {
    if(gameMode === "daily"){
      fetchSong();
      return;
    }
    if (gameMode === "genre" && selectedGenre) {
      fetchSong();
      return;
    }
    if (gameMode === "artist" && artistInput) {
      fetchSong();
      return;
    }

  }, [gameMode, selectedGenre, artistInput, fetchSong]);

  useEffect(() => {
    if (song){
      resetGame();
    }
  }, [song]);

  const handleGameModeChange = (mode: "daily" | "genre" | "artist") => {
    setGameMode(mode);

    if (mode === "daily") {
      setSelectedGenre("");
      setArtistInput("");
    }

    resetGame();
  };
  const handleSelectGenre = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleConfirmArtist = (artist: string) => {
    setArtistInput(artist);
  };

  const isReadyToPlay = !!song && !isLoadingSong && (
    (gameMode === "daily") ||
    (gameMode === "genre" && !!selectedGenre) ||
    (gameMode === "artist")
  );

  // play snippet when the button clicked
  const handlePlaySnippet = () => {
    if(!song || isLoadingSong) return;
    if (audioRef.current) {
      // audio to start of snippet
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(()=>{
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
      
          // cleanup audio 
          if(audioRef.current){
            audioRef.current.onended = () => {
              clearInterval(progressInterval);
              setProgress(100);
              setIsPlaying(false);
            };
          }

      })
    }
  };
  
  

  const cleanSongTitle = (title: string): string => {
    return title
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .trim();
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
      if (similarity > 0.85) {
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
  }, [currentSlot]); 

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
    
    if(audioRef.current){
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handlePlayAgain = () => {
    setShowEndGameModal(false);
    fetchSong();
    resetGame();
  };

  const handleChangeGenre = () => {
    setShowGenreModal(true);
  };

  const handleChangeArtist = () => {
    setShowArtistModal(true);
  };


  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 text-white font-sans">
      {/* Header */}
      <Header
        gameMode={gameMode}
        setGameMode={handleGameModeChange}
        setShowHelpModal={setShowHelpModal}
        onOpenGenreModal={() => setShowGenreModal(true)}
        onOpenArtistModal={() => setShowArtistModal(true)}
      />

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center mt-20 px-4">
        { song ? (
          <div className="text-center w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6">
            {gameMode === "daily" && "Guess the Song"}
            {gameMode === "genre" && selectedGenre && `Guess the ${selectedGenre} Song`}
            {gameMode === "artist" && artistInput  && `Guess the ${song?.confirmedArtist || artistInput.trim()} Song`}
          </h1>
            <GuessSlots
              MAX_GUESSES={MAX_GUESSES}
              currentSlot={currentSlot}
              pastGuesses={pastGuesses}
              guess={guess}
              setGuess={setGuess}
              handleGuess={handleGuess}
              isReadyToPlay={isReadyToPlay}
              isCorrect={isCorrect}
              inputRef={inputRef}
            />
            <ProgressBar
              progress={progress}
              snippetDuration={snippetDuration}
              maxDuration={16}
            />
            <PlayButton
              isPlaying={isPlaying}
              isReadyToPlay={isReadyToPlay}
              handlePlaySnippet={handlePlaySnippet}
            />
            {/* Remaining Guesses */}
            <p className="mt-4 text-gray-400">
              Remaining Guesses: {remainingGuesses}
            </p>
  
            <audio ref={audioRef} src={song.preview} />
            <EndGameModal
              isVisible={showEndGameModal}
              onClose={() => {
                setShowEndGameModal(false);
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
              }}
            
              isCorrect={isCorrect}
              songTitle={song.title}
              songArtist={song.artist}
              gameMode={gameMode}
              onSwitchToGenre={() => {
                setGameMode("genre");
                setShowGenreModal(true);
                resetGame();
              }}
              onSwitchToArtist={() => {
                setGameMode("artist");
                setShowArtistModal(true);
                resetGame();
              }}
              onPlayAgain={handlePlayAgain}
              onChangeGenre={handleChangeGenre}
              onChangeArtist={handleChangeArtist}
            />

            <HelpModal isVisible={showHelpModal} onClose={() => setShowHelpModal(false)} />
          </div>
          
        ) : (
          <p className="text-lg">
            {isLoadingSong ? "Loading your song..." : "Retrieving song..."}
          </p>
        )}
      </div>
      <GenreSelectModal
        isVisible={showGenreModal}
        onClose={() => setShowGenreModal(false)}
        onSelectGenre={handleSelectGenre}
      />

      <ArtistSelectModal
        isVisible={showArtistModal}
        onClose={() => setShowArtistModal(false)}
        onConfirmArtist={handleConfirmArtist}
      />
    </div>
  );  
}