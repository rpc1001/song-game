import React from 'react';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-zinc-900 shadow-md">
      {/* Logo */}
      <div className="text-xl font-bold text-purple-400 flex items-center gap-2">
        <span role="img" aria-label="music-note">🎵</span>
        <span>Tempo Run</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex items-center gap-6 text-gray-300">
        <span className="text-white underline underline-offset-4 decoration-purple-500">
          Daily Challenge
        </span>
        <span>Genres</span>
        <span>Playlists</span>
        <span>Artists</span>
        <button
          className="text-white bg-purple-600 px-3 py-1 rounded-full hover:bg-purple-700 transition duration-300"
          onClick={() => alert('Help menu coming soon')}
        >
          ?
        </button>
      </nav>
    </header>
  );
}
