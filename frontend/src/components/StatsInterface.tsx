import { useState , useEffect} from "react";
import StatsManager from "../utils/StatsManager.ts";

export default function StatsTester() {
  const [stats, setStats] = useState(StatsManager.getStats());

  const simulateGame = () => {
    StatsManager.updateStats({
      isCorrect: true,
      guesses: Math.floor(Math.random() * 5) + 1,
      song: {
        "id": 497467062,
        "title": "R.I.P.",
        "artist": {
            "id":123,
            "name": "Playboi Carti",
            "picture_big":"carti carti",
        },
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/2/e/d/0/2ed8a088a9466932dc6caa5135b6035c.mp3?hdnea=exp=1735630319~acl=/api/1/1/2/e/d/0/2ed8a088a9466932dc6caa5135b6035c.mp3*~data=user_id=0,application_id=42~hmac=ef16251272e31386b8db8a68b1ca48d77ed48eb1fd579d04373e2166c7c51339",
        "album": {
            "id": 63158242,
            "title": "Die Lit",
            "cover_big": "https://cdn-images.dzcdn.net/images/cover/f2d66b587ca8d3f0fa222c3501d23564/500x500-000000-80-0-0.jpg",
            "tracklist": "https://api.deezer.com/album/63158242/tracks",
        },
        "contributors": [
            {
                "name": "Playboi Carti",
                "role": "Main"
            }
        ]
    },
      genre: "Pop",
      artist: undefined,
      mode: "genre",
    });
  };

  // clear all stats
  const clearStats = () => {
    localStorage.removeItem("songGameStats");
    setStats(StatsManager.getStats());
  };

  useEffect(() => {
    const handleStatsUpdate = (event: CustomEvent) => {
      console.log("Received statsUpdated event:", event.detail);
      setStats(event.detail);
    };

    // add event listener for status updates
    window.addEventListener("statsUpdated", handleStatsUpdate as EventListener);

    // cleanup on unmount
    return () => {
      window.removeEventListener("statsUpdated", handleStatsUpdate as EventListener);
    };
  }, []);



  return (
    <div className="bg-gray-800 text-white p-4 rounded">
      <h2 className="text-xl font-bold mb-4">Stats Manager Tester</h2>

      <pre className="bg-gray-900 p-3 rounded mb-4">
        {JSON.stringify(stats, null, 2)}
      </pre>

      <button
        className="bg-green-500 px-4 py-2 rounded mb-2"
        onClick={simulateGame}
      >
        Simulate Game
      </button>
      <button
        className="bg-red-500 px-4 py-2 rounded"
        onClick={clearStats}
      >
        Clear Stats
      </button>
    </div>
  );
}
