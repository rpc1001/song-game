import { useEffect, useState, useMemo } from "react";
import StatsManager from "../../utils/StatsManager";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

export default function DailyStatsSlide() {
  const [stats, setStats] = useState(StatsManager.getStats());

  useEffect(() => {
    const handleStatsUpdate = (e: CustomEvent) => setStats(e.detail);
    window.addEventListener("statsUpdated", handleStatsUpdate as EventListener);
    return () => {
      window.removeEventListener("statsUpdated", handleStatsUpdate as EventListener);
    };
  }, []);

  const daily = useMemo(() => stats.dailyChallenge || {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    longestStreak: 0,
  }, [stats.dailyChallenge]);

  const dailyWinRate = useMemo(() => {
    const { gamesPlayed, gamesWon } = daily;
    if (!gamesPlayed) return "0";
    const rate = (gamesWon / gamesPlayed) * 100;
    return rate.toFixed(1);
  }, [daily]);
  const sessionLogs = useMemo(() => stats.sessionLogs || [], [stats.sessionLogs]);
  const guessDistributionData = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];

    sessionLogs
      .filter((log) => log.mode === "daily" && log.isCorrect)
      .forEach((log) => {
        if (log.guesses >= 1 && log.guesses <= 5) {
          dist[log.guesses - 1]++;
        }
      });

    return [1, 2, 3, 4, 5].map((g) => ({
      guess: g.toString(),
      value: dist[g - 1],
    }));
  }, [sessionLogs]);

  return (
    <div className="flex flex-col items-center text-white">
      {/* Compact Stats Row */}
      <div className="flex justify-around w-[250px]">
        {/* Games Played */}
        <div className="flex flex-col items-center">
          <p className="text-base font-bold">{daily.gamesPlayed}</p>
          <p className="text-[10px] text-gray-400">Played</p>
        </div>

        {/* Daily Win Rate */}
        <div className="flex flex-col items-center">
          <p className="text-base font-bold">{dailyWinRate}%</p>
          <p className="text-[10px] text-gray-400">Win Rate</p>
        </div>

        {/* Current Streak */}
        <div className="flex flex-col items-center">
          <p className="text-base font-bold">{daily.currentStreak}</p>
          <p className="text-[10px] text-gray-400">Streak</p>
        </div>

        {/* Max Streak */}
        <div className="flex flex-col items-center">
          <p className="text-base font-bold">{daily.longestStreak}</p>
          <p className="text-[10px] text-gray-400">Max</p>
        </div>
      </div>

      {/* Vertical Bar Chart */}
      <div className="w-[250px] h-[250px] mt-2">
      <p className="absolute left-4 text-sm font-bold  text-white-100">
        Guess Distribution
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={guessDistributionData}
            layout="vertical"
            margin={{ left: 5, right: 15, top: 20, bottom: 15 }}
            barCategoryGap="15%"
            barSize={20}
          >
            {/* XAxis */}
            <XAxis
              type="number"
              domain={[0, "dataMax"]}
              axisLine={false}
              tickLine={false}
              tick={false}
            />
            {/* YAxis  */}
            <YAxis
              dataKey="guess"
              type="category"
              axisLine={false}
              tickLine={false}
              stroke="#fff"
              width={25}
              tick={{
                fontSize: 11,
                fontWeight: "bold",
              }}
            />
            {/* Bars */}
            <Bar
              dataKey="value"
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
