import { songObject, artistObject } from "../types/interfaces";

class StatsManager {
  private static localStatsKey = "songGameStats";

  //  default stats structure
  private static initializeStats(): UserStats {
    const defaultStats: UserStats = {
      overall: this.createAggregatedStats(),
      dailyChallenge: this.createAggregatedStats(),
      genres: {},
      artists: {},
      songs: {},
      sessionLogs: [],
    };
    localStorage.setItem(this.localStatsKey, JSON.stringify(defaultStats));
    return defaultStats;
  }

  static clearStats(): void {
    localStorage.removeItem(this.localStatsKey);
    this.notifyStatsChange(this.initializeStats());
  }
  
  private static createAggregatedStats(): AggregatedStats {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      averageGuesses: 0,
      firstTryGuesses: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }
  

  // get stats from localStorage or initialize them
  static getStats(): UserStats {
    const stats = localStorage.getItem(this.localStatsKey);
    return stats ? JSON.parse(stats) : this.initializeStats();
  }

  // save stats back to localStorage
  static saveStats(stats: UserStats): void {
    localStorage.setItem(this.localStatsKey, JSON.stringify(stats));
    this.notifyStatsChange(stats);
  }

  // notify listeners of stat updates
  private static notifyStatsChange(stats: UserStats): void {
    const event = new CustomEvent("statsUpdated", { detail: stats });
    window.dispatchEvent(event);
  }

  // update stats after a game session
  static updateStats({
    isCorrect,
    guesses,
    song,
    genre, // artist that they are playing (for artist mode)
    artist,
    mode,
  }: GameSession): void {
    const stats = this.getStats();

    // update overall stats
    this.updateAggregatedStats(stats.overall, isCorrect, guesses);

    // update mode-specific stats
    if (mode === "daily") {
      this.updateAggregatedStats(stats.dailyChallenge, isCorrect, guesses);
    } else if (mode === "genre" && genre) {
      if (!stats.genres[genre]) stats.genres[genre] = this.createAggregatedStats();
      this.updateAggregatedStats(stats.genres[genre], isCorrect, guesses);
    }  else if (mode === "artist" && artist) {
      if (!stats.artists[artist.name]) {
        // create a new aggregator + store the image
        stats.artists[artist.name] = {
          ...this.createAggregatedStats(),
          image: artist.picture_big, // use 'picture_big' from the artist object
        };
      } else {
        // if we already have this artist, we might update the image just in case
        if (!stats.artists[artist.name].image && artist.picture_big) {
          stats.artists[artist.name].image = artist.picture_big;
        }
      }
    
      this.updateAggregatedStats(stats.artists[artist.name], isCorrect, guesses);
    }

    // update song-specific stats
    if (!stats.songs[song.id]) stats.songs[song.id] = this.createAggregatedStats();
    this.updateAggregatedStats(stats.songs[song.id], isCorrect, guesses);

    // log the session for future stat views (might delete  sessions later)
    stats.sessionLogs.push({
      date: new Date().toISOString(),
      mode,
      genre: genre || null,
      artist: artist || null,
      song,
      guesses,
      isCorrect,
      firstTry: guesses === 1,
    });

    // save updated stats
    this.saveStats(stats);
  }

  // update an AggregatedStats object
  private static updateAggregatedStats(
    stats: AggregatedStats,
    isCorrect: boolean,
    guesses: number
  ): void {
    stats.gamesPlayed += 1;
    if (isCorrect) {
      stats.gamesWon += 1;
      stats.currentStreak += 1;
      stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
      if (guesses === 1) stats.firstTryGuesses += 1;
    } else {
      stats.currentStreak = 0;
    }
    stats.averageGuesses = this.calculateNewAverage(
      stats.averageGuesses,
      stats.gamesPlayed,
      guesses
    );
  }

  // calculate a new average value
  private static calculateNewAverage(
    currentAverage: number,
    totalGames: number,
    newGuesses: number
  ): number {
    return ((currentAverage * (totalGames - 1)) + newGuesses) / totalGames;
  }
}

interface UserStats {
  overall: AggregatedStats;
  dailyChallenge: AggregatedStats;
  genres: Record<string, AggregatedStats>;
  artists: Record<string, ArtistAggregatedStats>;
  songs: Record<string, AggregatedStats>;
  sessionLogs: SessionLog[];
}

interface AggregatedStats {
  gamesPlayed: number;
  gamesWon: number;
  averageGuesses: number;
  firstTryGuesses: number;
  currentStreak: number;
  longestStreak: number;
}

interface ArtistAggregatedStats extends AggregatedStats {
  image?: string;
}

interface GameSession {
  isCorrect: boolean;
  guesses: number;
  song: songObject;
  genre?: string;
  artist?: artistObject;
  mode: "daily" | "genre" | "artist";
}

interface SessionLog {
  date: string; // ISO timestamp
  mode: "daily" | "genre" | "artist";
  genre: string | null;
  artist: artistObject | null;
  song: songObject;
  guesses: number;
  isCorrect: boolean;
  firstTry: boolean;
}

export default StatsManager;
