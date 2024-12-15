import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function App() {
  const [song, setSong] = useState<any>(null); // holds song data
  const [loading, setLoading] = useState<boolean>(true);
  const [snippetDuration, setSnippetDuration] = useState<number>(1); // first snippet duration (1 second), need to implement setduration
  const audioRef = useRef<HTMLAudioElement | null>(null); // reference to audio element

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

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {loading ? (
        <p>Loading -_-</p>
      ) : song ? (
        <div className="text-center">
          <h1 className="text-xl font-bold">Guess Song</h1>
          <button
            onClick={handlePlaySnippet}
            className="bg-blue-500 text-white px-6 py-2 mt-4 rounded hover:bg-blue-600"
          >
            Play
          </button>
          <p className="mt-4 text-gray-600">Duration: {snippetDuration} second(s)</p>

          {/* hide audio */}
          <audio ref={audioRef} src={song.preview} />
        </div>
      ) : (
        <p>Failed to load song :/</p>
      )}
    </div>
  );
}
