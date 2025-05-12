import { parentPort, workerData } from 'worker_threads';
import { Shot, ShotDistribution } from '../types/shots';

// Process shot data in a separate thread
const processShots = (shots: Shot[], year: number): ShotDistribution => {
  // Count shots by zone
  const zoneStats: {
    [zone: string]: {
      made: number;
      missed: number;
      total: number;
    }
  } = {};

  // Track shot coordinates for visualization
  const coordinateMap = new Map<string, {
    x: number;
    y: number;
    count: number;
    made: number;
    zone: string;
  }>();

  // Group the shots by zone and count made/missed
  for (const shot of shots) {
    // Initialize zone stats if not exist
    if (!zoneStats[shot.shotZone]) {
      zoneStats[shot.shotZone] = {
        made: 0,
        missed: 0,
        total: 0
      };
    }

    // Update zone stats
    zoneStats[shot.shotZone].total += 1;
    if (shot.shotResult === 'made') {
      zoneStats[shot.shotZone].made += 1;
    } else {
      zoneStats[shot.shotZone].missed += 1;
    }

    // Bin coordinates (round to nearest foot)
    const binX = Math.round(shot.x);
    const binY = Math.round(shot.y);
    const binKey = `${binX},${binY}`;

    if (!coordinateMap.has(binKey)) {
      coordinateMap.set(binKey, {
        x: binX,
        y: binY,
        count: 0,
        made: 0,
        zone: shot.shotZone
      });
    }

    const bin = coordinateMap.get(binKey)!;
    bin.count += 1;
    if (shot.shotResult === 'made') {
      bin.made += 1;
    }
  }

  // Calculate zone frequencies and percentages
  const totalShots = shots.length;
  const zoneFrequency: { [zone: string]: number } = {};
  const zonePercentage: { [zone: string]: number } = {};

  for (const [zone, stats] of Object.entries(zoneStats)) {
    zoneFrequency[zone] = parseFloat((stats.total / totalShots * 100).toFixed(1));
    zonePercentage[zone] = parseFloat((stats.made / stats.total * 100).toFixed(1));
  }

  // Convert coordinate map to array
  const coordinates = Array.from(coordinateMap.values());

  return {
    year,
    totalShots,
    shotZones: zoneStats,
    zoneFrequency,
    zonePercentage,
    coordinates
  };
};

// Process data and send back to main thread
if (parentPort) {
  const result = processShots(workerData.shots, workerData.year);
  parentPort.postMessage(result);
}