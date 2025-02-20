import { useEffect, useState, useMemo } from "react";
import StatsManager from "../../utils/StatsManager";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface ArtistStatsSlideProps {
  selectedArtistName?: string;
}

export default function ArtistStatsSlide({ selectedArtistName }: ArtistStatsSlideProps) {
  const [stats, setStats] = useState(StatsManager.getStats());

  useEffect(() => {
    const handleStatsUpdate = (e: CustomEvent) => setStats(e.detail);
    window.addEventListener("statsUpdated", handleStatsUpdate as EventListener);
    return () => {
      window.removeEventListener("statsUpdated", handleStatsUpdate as EventListener);
    };
  }, []);

  const sessionLogs = useMemo(() => stats.sessionLogs || [], [stats.sessionLogs]);

  const { currentStreak, maxStreak } = useMemo(() => {
    const sortedLogs = sessionLogs
      .filter((log) => log.mode === "artist")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let cur = 0,
      maxS = 0;
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
    let totalPlayed = 0,
      totalWon = 0;
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


  const selectedArtistRate = useMemo(() => {
    if (!selectedArtistName) return "0";
    const a = stats.artists[selectedArtistName];
    if (!a || a.gamesPlayed === 0) return "0";
    return ((a.gamesWon / a.gamesPlayed) * 100).toFixed(1);
  }, [stats.artists, selectedArtistName]);

  interface ArtistStats {
    image?: string;
    averageGuesses: number;
    gamesPlayed: number;
  }

  const topFiveArtists = useMemo(() => {
    return Object.entries(stats.artists || {})
      .map(([artistName, aStats]) => ({
        name: artistName,
        image: (aStats as ArtistStats).image || "", 
        avgGuesses: +aStats.averageGuesses.toFixed(2),
        gamesPlayed: aStats.gamesPlayed,
      }))
      .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
      .slice(0, 3);
  }, [stats.artists]);

  return (
    <div className="flex flex-col items-center text-white">
      {/*Compact Stats Row*/}
      <div className="flex justify-around w-[250px]">
        {/* Overall Win Rate */}
        <div className="flex flex-col items-center">
          <p className="text-base font-bold">{overallWinRate}%</p>
          <p className="text-[10px] text-gray-400">Win Rate</p>
        </div>

        {/* Selected Artist Win Rate */}
        <div className="flex flex-col items-center">
          <p className="text-base font-bold">{selectedArtistRate}%</p>
          <p className="text-[10px] text-gray-400">
            {selectedArtistName ? "Artist Rate" : "?"}
          </p>
        </div>

        {/* Current Streak (Any Artist) */}
        <div className="flex flex-col items-center">
          <p className="text-base font-bold">{currentStreak}</p>
          <p className="text-[10px] text-gray-400">Streak</p>
        </div>

        {/* Max Streak (Any Artist) */}
        <div className="flex flex-col items-center">
          <p className="text-base font-bold">{maxStreak}</p>
          <p className="text-[10px] text-gray-400">Max</p>
        </div>
      </div>

      {/*Title for the Chart */}
      <p className="text-sm font-bold text-gray-300 mt-2 mb-1 self-start">
        Average Guesses Per Artist
      </p>

      {/*Horizontal Bar Chart w/ Artist Images*/}
      <div className="w-[250px] h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topFiveArtists}
            layout="vertical"
            margin={{ left: 0, right: 10, top: 10, bottom: 10 }}
            barCategoryGap="10%"
            barSize={50} // 20px tall bars
          >
            {/* XAxis */}
            <XAxis
              type="number"
              domain={[0, 5]}
              axisLine={false}
              tickLine={false}
              tick={false}
            />
            {/* YAxis */}
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              stroke="#fff"
              width={60}
              tick={({ x, y, payload }) => {
                const foundArtist = topFiveArtists.find(a => a.name === payload.value);

                if (foundArtist && foundArtist.image) {
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <image
                        href={foundArtist.image}
                        width={50}
                        height={50}
                        x={-50} 
                        y={-50} 
                      />
                    </g>
                  );
                }

                // artist name if no image
                return (
                  <text
                    x={x - 5}
                    y={y}
                    dy={4}
                    fill="#fff"
                    fontSize={11}
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    {payload.value}
                  </text>
                );
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
