import React, { useCallback, useState, useEffect, useRef } from "react";
import axios from "axios";
import stringSimilarity from "string-similarity";

import Header from "./components/Header";
import GenreSelectModal from "./components/GenreSelectModal";
import ArtistSelectModal from "./components/ArtistSelectModal";
import GuessSlots from "./components/GuessSlots";
import ProgressBar from "./components/ProgressBar";
import PlayButton from "./components/PlayButton";
import NextSongButton from "./components/NextSongButton";
import EndGameModal from "./components/EndGameModal";
import HelpModal from "./components/HelpModal";

export default function App() {
  const MAX_GUESSES = 5;
  const [song, setSong] = useState<Song | null>(null); // holds song data
  const [albumTracks, setAlbumTracks] = useState<string[]>([]); // album tracks of song


  const [snippetDuration, setSnippetDuration] = useState<number>(1); // first snippet duration (1 second), need to implement setduration
  const [guess, setGuess] = useState<string>(""); // current guess
  const [remainingGuesses, setRemainingGuesses] = useState<number>(MAX_GUESSES); // max attempts allowed
  const [isCorrect, setIsCorrect] = useState<boolean>(false); // correct guess?
  const [pastGuesses, setPastGuesses] = useState<string[]>([]); // holds all guesses
  const [currentSlot, setCurrentSlot] = useState<number>(0); // current guess slot

  const [artistMatches, setArtistMatches] = useState<boolean[]>(Array(MAX_GUESSES).fill(false));
  const [albumMatches, setAlbumMatches] = useState<boolean[]>(Array(MAX_GUESSES).fill(false));
  const [titleMatches, setTitleMatches] = useState<boolean[]>(Array(MAX_GUESSES).fill(false));

  const [progress, setProgress] = useState<number>(0); // snippet progress percentage
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // if snippet playing
 
  const [showEndGameModal, setShowEndGameModal] = useState<boolean>(false); // whether or not end game modal is visible
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false); // help modal or not
  

  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showArtistModal, setShowArtistModal] = useState(false);

  const [showNextSongButton, setShowNextSongButton] = useState(false); // Controls which button to show


  const [gameMode, setGameMode] = useState<"daily" | "artist" | "genre">("daily"); // current game mode sleected
  const [selectedGenre, setSelectedGenre] = useState<string>(""); // store genre selected
  const [artistInput, setArtistInput] = useState<string>("");

  const [isLoadingSong, setIsLoadingSong] = useState<boolean>(false); // track if game can start or not
  const [imageSrc, setImageSrc] = useState<string | null>(null);


  const inputRef = useRef<HTMLInputElement>(null); // Ref for the active input box
  const audioRef = useRef<HTMLAudioElement | null>(null); // reference to  audio element
  
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

  interface Track {
    title: string;
  }
  
  const fetchSong = useCallback(async () => {
    setSong(null);
    setAlbumTracks([]);
  
    let endpoint = "http://localhost:3000/daily-challenge";
    if (gameMode === "genre" && selectedGenre) {
      endpoint = `http://localhost:3000/genre?genre=${encodeURIComponent(selectedGenre)}`;
    } else if (gameMode === "artist" && artistInput) {
      endpoint = `http://localhost:3000/artist?artist=${encodeURIComponent(artistInput)}`;
    }

    try {
      setIsLoadingSong(true);
      const response = await axios.get(endpoint);
      const songData = response.data;
      console.log(songData);
      setSong(songData);
      if (songData.album?.tracklist) {
        const tracklistResponse = await axios.get(
          `http://localhost:3000/album-tracks?albumTracklistUrl=${encodeURIComponent(songData.album.tracklist)}`
        );
        const tracks = tracklistResponse.data.map((track: Track) =>
          cleanSongTitle(track.title.toLowerCase())
        );
        setAlbumTracks(tracks);
      }
    } catch (error) {
      console.error("Error fetching song or album tracks:", error);
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

  useEffect(() => {
    if (song?.album?.cover_big) {
      const img = new Image();
      img.src = song.album.cover_big;
      img.onload = () => setImageSrc(song.album.cover_big); // set the preloaded image source
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
    .normalize("NFD") // turn text into base + diacratics
    .replace(/[\u0300-\u036f]/g, "") // remove diactrics
    .replace(/\(.*?\)|\[.*?\]/g, "") // remove text in brackets or parantheses
    .replace(/[^\w\s]/g, "") // remove all punctuation
    .trim();
  };
  
  const handleGuess = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && song) {
      const cleanedGuess = cleanSongTitle(guess.toLowerCase());
      const isSkipped = !(guess.trim().replace(/[^\w\s]/g, "")
    );
      if (isSkipped) {  
        setPastGuesses((prev) => {
          const updated = [...prev];
          updated[currentSlot] = "Skipped Guess";
          return updated;
        });
        setRemainingGuesses((prev) => prev - 1);
      } else {
        const cleanedTitle = cleanSongTitle(song.title.toLowerCase());
  
        let isTitleCorrect = false;
        let isArtistCorrect = false;
        const similarityScore = stringSimilarity.compareTwoStrings(cleanedTitle, cleanedGuess)
        if (similarityScore > 0.85) {
          isTitleCorrect = true;
        } else {
          console.log("entering")
          // perform backend search for validation
          const response = await axios.get(
            `http://localhost:3000/validate-song?song=${encodeURIComponent(cleanedGuess)}`
          );      
            console.log(cleanedTitle);
            console.log(cleanSongTitle(response.data.title));
          if (response.data.match) {
            const { title, artist } = response.data;
            isTitleCorrect = cleanSongTitle(title) === cleanedTitle && (similarityScore > 0.5);
            isArtistCorrect = artist === song.artist.toLowerCase().trim() && (similarityScore> 0.5) ;
          }
        }    
        const isAlbumCorrect = albumTracks.includes(cleanedGuess);  
        // update past guesses
        setPastGuesses((prev) => {
          const updated = [...prev];
          updated[currentSlot] = guess.trim() || "Skipped Guess";
          return updated;
        });
    
        // update match states
        setTitleMatches((prev) => {
          const updated = [...prev];
          updated[currentSlot] = isTitleCorrect;
          return updated;
        });
    
        setArtistMatches((prev) => {
          const updated = [...prev];
          updated[currentSlot] = isArtistCorrect;
          return updated;
        });
    
        setAlbumMatches((prev) => {
          const updated = [...prev];
          updated[currentSlot] = isAlbumCorrect;
          return updated;
        });
    
        if (isTitleCorrect) {
          setIsCorrect(true);
          setTimeout(() => {
            setShowEndGameModal(true);
          }, 100); // show end game modal with delay
        } else {
          setRemainingGuesses((prev) => prev - 1);
    
      }
      }
      // end game if out of guesses
      if (remainingGuesses - 1 <= 0) {
        setTimeout(() => {
          setShowEndGameModal(true);
        }, 100); // show end game modal with delay
      }
      setSnippetDuration((prev) => prev * 2);
      setGuess("");
      setProgress(0);
      setIsPlaying(false);
      setCurrentSlot((prev) => prev + 1);
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
    setShowNextSongButton(false);
    setTitleMatches(Array(MAX_GUESSES).fill(false));
    setArtistMatches(Array(MAX_GUESSES).fill(false));
    setAlbumMatches(Array(MAX_GUESSES).fill(false));

    if(audioRef.current){
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleNextSong = () => {
    if(gameMode === "daily"){
      setShowEndGameModal(true);
    } else {
      setShowEndGameModal(false);
      fetchSong();
      resetGame();
    }

  };

  const handleChangeGenre = () => {
    setShowGenreModal(true);
  };

  const handleChangeArtist = () => {
    setShowArtistModal(true);
  };
  
  useEffect(() => {
    // Ensure Media Session API is supported
    if ('mediaSession' in navigator) {
      console.log("DEBUG: Disabling Media Session global controls.");
  
      // remove media player meda data
      navigator.mediaSession.metadata = null;
  
      // disable all actions by setting no-op handlers
      navigator.mediaSession.setActionHandler('play', () => {});
      navigator.mediaSession.setActionHandler('pause', () => {});
      navigator.mediaSession.setActionHandler('seekbackward', () => {});
      navigator.mediaSession.setActionHandler('seekforward', () => {});
      navigator.mediaSession.setActionHandler('previoustrack', () => {});
      navigator.mediaSession.setActionHandler('nexttrack', () => {});
      navigator.mediaSession.setActionHandler('stop', () => {});
    }
  }, []);

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
            titleMatches={titleMatches} 
            artistMatches={artistMatches}
            albumMatches={albumMatches}
          />
            <ProgressBar
              progress={progress}
              snippetDuration={snippetDuration}
              maxDuration={16}
            />
            {showNextSongButton ? (
              <NextSongButton
                onNextSong={handleNextSong}
                label={gameMode === "daily" ? "Next Game" : "Next Song"}
              />
            ) : (
              <PlayButton
                isPlaying={isPlaying}
                isReadyToPlay={!!song && !isLoadingSong}
                handlePlaySnippet={handlePlaySnippet}
              />
            )}


            <audio ref={audioRef} src={song.preview} controls = {false}/>
            <EndGameModal
              isVisible={showEndGameModal}
              onClose={() => {
                setShowEndGameModal(false);
                setShowNextSongButton(true);
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
              }}
              isCorrect={isCorrect}
              song={{ ...song, album: { ...song.album, cover_big: imageSrc || song.album.cover_big } }}
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
              onNextSong={handleNextSong}
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