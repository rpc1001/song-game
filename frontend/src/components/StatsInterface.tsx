import { useEffect, useState } from "react";
import StatsManager from "../utils/StatsManager";
import Modal from "./Modal";

interface StatsInterfaceProps {
  isVisible: boolean;
  onClose: () => void;
  onBackToEndModal?: () => void;
}

export default function StatsInterface({ 
  isVisible, 
  onClose,
  onBackToEndModal,
}: StatsInterfaceProps) {
  const [stats, setStats] = useState(StatsManager.getStats());

  useEffect(() => {
    const handleStatsUpdate = (event: CustomEvent) => {
      setStats(event.detail);
    };
    window.addEventListener("statsUpdated", handleStatsUpdate as EventListener);
    return () => {
      window.removeEventListener("statsUpdated", handleStatsUpdate as EventListener);
    };
  }, []);

  if (!isVisible) return null;

  const { overall, genres, artists } = stats;

  const bestGenre = Object.entries(genres).reduce(
    (best, [genre, stats]) => {
      if (stats.gamesWon > best.wins) {
        return { genre, wins: stats.gamesWon, winRate: stats.gamesWon / stats.gamesPlayed * 100 || 0 };
      }
      return best;
    },
    { genre: "N/A", wins: 0, winRate: 0 } 
  );

  const bestArtist = Object.entries(artists).reduce(
    (best, [artistId, stats]) => {
      if (stats.gamesWon > best.wins) {
        return { artistId, wins: stats.gamesWon, winRate: stats.gamesWon / stats.gamesPlayed * 100 || 0 };
      }
      return best;
    },
    { artistId: "N/A", wins: 0, winRate: 0 }
  );

  return (
    <Modal isVisible={isVisible} onClose={onClose} dismissible={true}>
      {/* Back Arrow */}
      {onBackToEndModal && (
        <button
          className="text-gray-300 absolute top-2 left-2 hover:text-white"
          onClick={() => {
            onClose();
            onBackToEndModal();
          }}
        >
          ←
        </button>
      )}

      <h2 className="text-2xl font-bold mb-4 text-white">Overall Stats</h2>
      <div className="text-left text-gray-300 space-y-2">
        <p><strong>Games Played:</strong> {overall.gamesPlayed}</p>
        <p><strong>Win Rate:</strong> {Math.round(overall.gamesWon / overall.gamesPlayed * 100)}%</p>
        <p><strong>Average Guesses:</strong> {overall.averageGuesses.toFixed(1)}</p>
        <p><strong>Highest Streak:</strong> {overall.longestStreak}</p>
        <p><strong>Answers on First Try:</strong> {overall.firstTryGuesses}</p>
        <p><strong>Best Genre:</strong> {bestGenre.genre} ({Math.round(bestGenre.winRate)}% Win Rate)</p>
        <p><strong>Best Artist:</strong> {bestArtist.artistId} ({Math.round(bestArtist.winRate)}% Win Rate)</p>
      </div>
    </Modal>
  );
}
