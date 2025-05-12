// Type definitions for shot data

export interface Shot {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  season: number;
  x: number;  // X-coordinate on court
  y: number;  // Y-coordinate on court
  shotZone: string;
  shotDistance: number;
  shotResult: 'made' | 'missed';
  shotValue: 2 | 3;
  gameDate: string;
}

export interface ShotDistribution {
  year: number;
  totalShots: number;
  shotZones: {
    [zone: string]: {
      made: number;
      missed: number;
      total: number;
    }
  };
  zoneFrequency: {
    [zone: string]: number;
  };
  zonePercentage: {
    [zone: string]: number;
  };
  coordinates: {
    x: number;
    y: number;
    count: number;
    made: number;
    zone: string;
  }[];
}

export interface ShotTrend {
  zone: string;
  trend: {
    year: number;
    frequency: number;
    percentage: number;
  }[];
}

// Express auth extension
export interface AuthPayload {
  userId: string;
  username: string;
}