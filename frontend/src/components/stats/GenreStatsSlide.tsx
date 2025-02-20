import { useEffect, useState, useMemo } from "react";
import StatsManager from "../../utils/StatsManager";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

interface GenreStatsSlideProps {
  selectedGenre?: string;
}

export default function GenreStatsSlide({ selectedGenre }: GenreStatsSlideProps) {
  const [stats, setStats] = useState(StatsManager.getStats());

  useEffect(() => {
    const onStatsUpdate = (e: CustomEvent) => setStats(e.detail);
    window.addEventListener("statsUpdated", onStatsUpdate as EventListener);
    return () => {
      window.removeEventListener("statsUpdated", onStatsUpdate as EventListener);
    };
  }, []);

const sessionLogs = useMemo(() => stats.sessionLogs || [], [stats.sessionLogs])

const { currentStreak, maxStreak } = useMemo(() => {
  const sortedLogs = sessionLogs
    .filter((log) => log.mode === "genre" || log.mode === "artist")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let cur = 0, maxS = 0;
  for (const log of sortedLogs) {
    if (log.isCorrect) {
      cur++;
      maxS = Math.max(maxS, cur);
    } else {
      cur = 0;
    }
  }
  return { currentStreak: cur, maxStreak: maxS };
}, [sessionLogs]);

const overallWinRate = useMemo(() => {
  let totalPlayed = 0, totalWon = 0;

  Object.values(stats.genres || {}).forEach((g) => {
    totalPlayed += g.gamesPlayed;
    totalWon += g.gamesWon;
  });

  Object.values(stats.artists || {}).forEach((a) => {
    totalPlayed += a.gamesPlayed;
    totalWon += a.gamesWon;
  });

  return totalPlayed > 0 ? ((totalWon / totalPlayed) * 100).toFixed(1) : "0";
}, [stats]);

  const selectedGenreRate = useMemo(() => {
    if (!selectedGenre) return "0";
    const g = stats.genres[selectedGenre];
    if (!g || g.gamesPlayed === 0) return "0";
    return ((g.gamesWon / g.gamesPlayed) * 100).toFixed(1);
  }, [stats.genres, selectedGenre]);

  const topFiveGenres = useMemo(() => {
    const arr = Object.entries(stats.genres).map(([genreName, gStats]) => ({
      name: genreName,
      avgGuesses: +gStats.averageGuesses.toFixed(2),
      gamesPlayed: gStats.gamesPlayed,
    }));
    arr.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
    return arr.slice(0, 5);
  }, [stats.genres]);

  return (
    <div className="flex flex-col items-center text-white">
      {/*  Compact Stats Row */}
      <div className="flex justify-around w-[250px]">
        {/* Overall Win Rate */}
        <div className="flex flex-col items-center">
          <p className="text-base font-bold">{overallWinRate}%</p>
          <p className="text-[10px] text-gray-400">Win Rate</p>
        </div>

        {/* Selected Genre Win Rate */}
        <div className="flex flex-col items-center">
          <p className="text-base font-bold">{selectedGenreRate}%</p>
          <p className="text-[10px] text-gray-400">
            {selectedGenre || "Genre"} Rate
          </p>
        </div>

        {/* Current Streak */}
        <div className="flex flex-col items-center">
          <p className="text-base font-bold">{currentStreak}</p>
          <p className="text-[10px] text-gray-400">Streak</p>
        </div>

        {/* Max Streak */}
        <div className="flex flex-col items-center">
          <p className="text-base font-bold">{maxStreak}</p>
          <p className="text-[10px] text-gray-400">Max</p>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="w-[250px] h-[250px] mt-2">
      <p className="absolute left-4 text-sm font-bold text-white-100">
          Average Guesses Per Genre
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topFiveGenres}
            layout="vertical"
            barCategoryGap="15%"
            barSize={20}
            margin={{ left: -15, right: 15, top: 20, bottom: 15 }}
          >
            {/* X axis */}
            <XAxis
              type="number"
              domain={[0, 5]}
              axisLine={false}
              tickLine={false}
              tick={false}
            />
            {/* Y axis */}
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              width={60}
              stroke="#fff"
              tick={{
                fontSize: 11,
                fontWeight: "bold"
              }}
            />
            <Bar
              dataKey="avgGuesses"
              fill="#8884d8"
              label={{
                position: "right",
                fill: "#fff",
                fontSize: 10,
              }}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
