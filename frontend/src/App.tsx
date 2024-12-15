import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import stringSimilarity from 'string-similarity'; // Import the string-similarity library

export default function App() {
  const [song, setSong] = useState<any>(null); // holds song data
  const [loading, setLoading] = useState<boolean>(true);
  const [snippetDuration, setSnippetDuration] = useState<number>(1); // first snippet duration (1 second), need to implement setduration
  const [guess, setGuess] = useState<string>(''); // current guess
  const [remainingGuesses, setRemainingGuesses] = useState<number>(3); // max attempts allowed
  const [isCorrect, setIsCorrect] = useState<boolean>(false); // correct guess?
  const audioRef = useRef<HTMLAudioElement | null>(null); // reference to  audio element

  // fetch a random song from the backend
  useEffect(() => {
    axios.get('http://localhost:3000/random-song')
      .then((response) => {
        console.log('Song:', response.data); // debug
        setSong(response.data);
        setLoading(false); // turn off loading state
      })
      .catch((error) => {
        console.error('Error getting song:', error); // log error
        setLoading(false);
      });
  }, []);

  // play snippet when the button clicked
  const handlePlaySnippet = () => {
    if (audioRef.current) { // if there is an audio element
      audioRef.current.currentTime = 0; // play snippet from start
      audioRef.current.play();
      setTimeout(() => {
        audioRef.current?.pause(); // pause playback
      }, snippetDuration * 1000); // duration to milliseconds for setTimeout
    }
  };

  const cleanSongTitle = (title:string): string => {
    return title.replace(/\(.*?\)|\[.*?\]/g, '').trim(); // Remove text in parentheses or brackets
  };

  const handleGuess = () => {
    if (!song) return;
    const cleanedTitle = cleanSongTitle(song.title.toLowerCase());
    const cleanedGuess = cleanSongTitle(guess.toLowerCase());
  
  
    const similarity = stringSimilarity.compareTwoStrings(cleanedTitle, cleanedGuess);
    // compare guess with the song title
    if (similarity>0.9) {
      setIsCorrect(true); // correct guess
    } else {
      setRemainingGuesses((prev) => prev - 1); // dec remaining guesses
      setSnippetDuration((prev) => prev * 2); // double snippet duration
    }

    setGuess(''); // clears field after each guess
  };

 
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {loading ? (
        <p>Loading...</p>
      ) : song ? (
        <div className="text-center">
          <h1 className="text-xl font-bold">Guess the Song!</h1>

          {!isCorrect ? (
            <>
              {/* play button */}
              <button
                onClick={handlePlaySnippet}
                className="bg-blue-500 text-white px-6 py-2 mt-4 rounded hover:bg-blue-600"
              >
                Play
              </button>
              <p className="mt-4 text-gray-600">
                Current Snippet Duration: {snippetDuration} second(s)
              </p>

              {/* Guess Input */}
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)} // update guess state
                className="border rounded px-4 py-2 w-full max-w-md mt-4"
                placeholder="Enter your guess"
              />
              <button
                onClick={handleGuess}
                className="bg-green-500 text-white px-6 py-2 mt-4 rounded hover:bg-green-600 disabled:bg-gray-400"
                disabled={!guess} // disable button if input is empty
              >
                Submit Guess
              </button>

              {/* Remaining Guesses */}
              <p className="mt-2 text-gray-600">Remaining Guesses: {remainingGuesses}</p>

              {/* Game Over */}
              {remainingGuesses <= 0 && (
                <p className="text-red-500 mt-4">
                  Game Over! The correct answer was "{song.title}".
                </p>
              )}
            </>
          ) : (
            <div className="text-green-500">
              <h2 className="text-2xl font-bold">Correct!</h2>
              <p>The song was "{song.title}" by {song.artist}.</p>
            </div>
          )}

          {/* Hidden audio element */}
          <audio ref={audioRef} src={song.preview} />
        </div>
      ) : (
        <p>Failed to load song. Try refreshing!</p>
      )}
    </div>
  );
}