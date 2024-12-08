import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';


export default function App() {
  const [song, setSong] = useState<any>(null);

  useEffect(() => {
      axios.get('http://localhost:3000/songs')
          .then(response => {
              setSong(response.data);
          })
          .catch(error => {
              console.error('Error fetching song:', error);
          });
  }, []);
  return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
          {song ? (
              <div className="text-center">
                  <h1 className="text-2xl font-bold">{song.name}</h1>
                  <p className="text-gray-600">By {song.artists.map((artist: any) => artist.name).join(', ')}</p>
                  <img src={song.album.images[0].url} alt={song.name} className="mx-auto mt-4 w-1/2 rounded-lg" />
                  
                  {/* Audio Preview */}
                  {song.preview_url ? (
                      <audio controls className="mt-4">
                          <source src={song.preview_url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                      </audio>
                  ) : (
                      <p className="text-red-500 mt-4">No preview available for this song.</p>
                  )}
              </div>
          ) : (
              <p>Loading...</p>
          )}
      </div>
  );
}
