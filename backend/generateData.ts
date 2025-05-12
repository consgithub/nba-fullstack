/**
 * Script to generate sample shot data for the NBA visualization project
 * Run with: npx ts-node generateData.ts
 */
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Shot } from './src/types/shots';

// Shot zones
const SHOT_ZONES = [
  'Restricted Area',
  'Paint',
  'Mid-Range',
  'Corner 3',
  'Above Break 3',
  'Backcourt'
];

// Team data
const TEAMS = [
  { id: '1610612737', name: 'Atlanta Hawks' },
  { id: '1610612738', name: 'Boston Celtics' },
  { id: '1610612739', name: 'Cleveland Cavaliers' },
  { id: '1610612740', name: 'New Orleans Pelicans' },
  { id: '1610612741', name: 'Chicago Bulls' },
  { id: '1610612742', name: 'Dallas Mavericks' },
  { id: '1610612743', name: 'Denver Nuggets' },
  { id: '1610612744', name: 'Golden State Warriors' },
  { id: '1610612745', name: 'Houston Rockets' },
  { id: '1610612746', name: 'Los Angeles Clippers' },
  { id: '1610612747', name: 'Los Angeles Lakers' },
  { id: '1610612748', name: 'Miami Heat' },
  { id: '1610612749', name: 'Milwaukee Bucks' },
  { id: '1610612750', name: 'Minnesota Timberwolves' },
  { id: '1610612751', name: 'Brooklyn Nets' },
  { id: '1610612752', name: 'New York Knicks' },
  { id: '1610612753', name: 'Orlando Magic' },
  { id: '1610612754', name: 'Indiana Pacers' },
  { id: '1610612755', name: 'Philadelphia 76ers' },
  { id: '1610612756', name: 'Phoenix Suns' },
  { id: '1610612757', name: 'Portland Trail Blazers' },
  { id: '1610612758', name: 'Sacramento Kings' },
  { id: '1610612759', name: 'San Antonio Spurs' },
  { id: '1610612760', name: 'Oklahoma City Thunder' },
  { id: '1610612761', name: 'Toronto Raptors' },
  { id: '1610612762', name: 'Utah Jazz' },
  { id: '1610612763', name: 'Memphis Grizzlies' },
  { id: '1610612764', name: 'Washington Wizards' },
  { id: '1610612765', name: 'Detroit Pistons' },
  { id: '1610612766', name: 'Charlotte Hornets' },
];

// Player name generator
const FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 
  'Joseph', 'Thomas', 'Chris', 'Kevin', 'Anthony', 'Mark', 'Daniel',
  'Jason', 'Matthew', 'Ryan', 'Brandon', 'Justin', 'Tyler'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

// Generate a random player name
const generatePlayerName = () => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
};

// Generate random player ID
const generatePlayerId = () => {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

// Generate random game date for a season
const generateGameDate = (year: number): string => {
  // NBA season runs from October to June of the next year
  const month = Math.floor(Math.random() * 9);
  const actualMonth = month < 3 ? month + 10 : month;
  const actualYear = month < 3 ? year - 1 : year;
  
  const day = Math.floor(Math.random() * 28) + 1;
  
  return `${actualYear}-${actualMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

// Determine shot zone based on court coordinates
const determineShotZone = (x: number, y: number): string => {
  const distanceFromBasket = Math.sqrt(x * x + y * y);
  
  if (distanceFromBasket <= 4) {
    return 'Restricted Area';
  } else if (distanceFromBasket <= 14 && Math.abs(x) < 10) {
    return 'Paint';
  } else if (distanceFromBasket > 23.75) {
    // Check for backcourt shots (rare)
    if (distanceFromBasket > 47) {
      return 'Backcourt';
    }
    
    // Check for corner 3
    if (Math.abs(x) > 22 && y < 14) {
      return 'Corner 3';
    }
    
    return 'Above Break 3';
  } else {
    return 'Mid-Range';
  }
};

// Determine shot success probability based on zone and year
// Simulate the trend of decreased mid-range efficiency and increased 3pt shooting over time
const getShotSuccessProbability = (zone: string, year: number): number => {
  // Base percentages
  const basePercentages: Record<string, number> = {
    'Restricted Area': 0.65,
    'Paint': 0.42,
    'Mid-Range': 0.40,
    'Corner 3': 0.38,
    'Above Break 3': 0.35,
    'Backcourt': 0.01
  };
  
  // Yearly adjustments to simulate trends
  const yearFactor = (year - 2017) / 8; // Normalize years (2017-2025)
  
  switch (zone) {
    case 'Restricted Area':
      // Slight increase in restricted area efficiency
      return basePercentages[zone] + 0.05 * yearFactor;
    case 'Paint':
      // Slight increase in paint efficiency
      return basePercentages[zone] + 0.03 * yearFactor;
    case 'Mid-Range':
      // Decrease in mid-range frequency (represented by lower success rate)
      return basePercentages[zone] - 0.03 * yearFactor;
    case 'Corner 3':
      // Increase in corner 3 efficiency
      return basePercentages[zone] + 0.08 * yearFactor;
    case 'Above Break 3':
      // Increase in above break 3 efficiency
      return basePercentages[zone] + 0.07 * yearFactor;
    default:
      return basePercentages[zone];
  }
};

// Generate shot coordinates based on zone and year
// Simulate the trend of shot distribution changes over years
const generateShotCoordinates = (zone: string, year: number): { x: number, y: number } => {
  // Year factor to adjust probabilities
  const yearFactor = (year - 2017) / 8; // Normalize years
  
  switch (zone) {
    case 'Restricted Area': {
      // Close to basket
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 4;
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      };
    }
    case 'Paint': {
      // In the paint but outside restricted area
      const angle = Math.random() * 2 * Math.PI;
      const distance = 4 + Math.random() * 10;
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      };
    }
    case 'Mid-Range': {
      // Mid-range area
      const angle = Math.random() * 2 * Math.PI;
      const distance = 14 + Math.random() * 9.75;
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      };
    }
    case 'Corner 3': {
      // Corner 3-pointers
      const side = Math.random() > 0.5 ? 1 : -1;
      return {
        x: side * (22 + Math.random() * 2),
        y: Math.random() * 10
      };
    }
    case 'Above Break 3': {
      // Above the break 3-pointers
      let angle = Math.random() * Math.PI;
      if (Math.random() > 0.5) {
        angle = 2 * Math.PI - angle;
      }
      const distance = 23.75 + Math.random() * 2;
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      };
    }
    case 'Backcourt': {
      // Backcourt (rare)
      return {
        x: (Math.random() - 0.5) * 94,
        y: Math.random() * 25 + 25
      };
    }
    default:
      return { x: 0, y: 0 };
  }
};

// Generate distribution of shot zones based on year
// This simulates the trend of more 3s and fewer mid-range shots over time
const getZoneDistribution = (year: number): Record<string, number> => {
  // Base distribution for 2017
  const baseDistribution: Record<string, number> = {
    'Restricted Area': 0.28,
    'Paint': 0.15,
    'Mid-Range': 0.30,
    'Corner 3': 0.08,
    'Above Break 3': 0.18,
    'Backcourt': 0.01
  };
  
  // Yearly adjustment factor
  const yearFactor = (year - 2017) / 8;
  
  // Adjust distribution based on year to simulate trends
  const adjustedDistribution: Record<string, number> = {
    'Restricted Area': baseDistribution['Restricted Area'] + 0.05 * yearFactor,
    'Paint': baseDistribution['Paint'] - 0.02 * yearFactor,
    'Mid-Range': baseDistribution['Mid-Range'] - 0.15 * yearFactor,
    'Corner 3': baseDistribution['Corner 3'] + 0.04 * yearFactor,
    'Above Break 3': baseDistribution['Above Break 3'] + 0.08 * yearFactor,
    'Backcourt': baseDistribution['Backcourt']
  };
  
  // Normalize to ensure total is 1
  const total = Object.values(adjustedDistribution).reduce((sum, value) => sum + value, 0);
  
  Object.keys(adjustedDistribution).forEach(zone => {
    adjustedDistribution[zone] /= total;
  });
  
  return adjustedDistribution;
};

// Generate a single shot
const generateShot = (year: number): Shot => {
  // Select team
  const team = TEAMS[Math.floor(Math.random() * TEAMS.length)];
  
  // Generate player
  const playerName = generatePlayerName();
  const playerId = generatePlayerId();
  
  // Generate game
  const gameId = `00${Math.floor(2000000 + Math.random() * 1000000)}`;
  const gameDate = generateGameDate(year);
  
  // Select shot zone based on year distribution
  const zoneDistribution = getZoneDistribution(year);
  const zoneProbabilities = Object.entries(zoneDistribution).map(([zone, prob]) => ({ zone, prob }));
  
  let selectedZone = 'Mid-Range';
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const { zone, prob } of zoneProbabilities) {
    cumulativeProbability += prob;
    if (random <= cumulativeProbability) {
      selectedZone = zone;
      break;
    }
  }
  
  // Generate coordinates based on zone
  const { x, y } = generateShotCoordinates(selectedZone, year);
  
  // Calculate shot distance
  const shotDistance = Math.sqrt(x * x + y * y);
  
  // Determine shot value
  const shotValue = (selectedZone === 'Corner 3' || selectedZone === 'Above Break 3' || 
                     (selectedZone === 'Backcourt' && shotDistance > 23.75)) ? 3 : 2;
  
  // Determine shot success
  const successProbability = getShotSuccessProbability(selectedZone, year);
  const shotResult = Math.random() < successProbability ? 'made' : 'missed';
  
  return {
    id: uuidv4(),
    gameId,
    playerId,
    playerName,
    teamId: team.id,
    teamName: team.name,
    season: year,
    x,
    y,
    shotZone: selectedZone,
    shotDistance,
    shotResult,
    shotValue,
    gameDate
  };
};

// Generate shot data for a specific year
const generateYearData = async (year: number, numShots: number): Promise<void> => {
  const shots: Shot[] = [];
  
  for (let i = 0; i < numShots; i++) {
    shots.push(generateShot(year));
  }
  
  const dataDir = path.join(__dirname, 'data');
  
  // Create data directory if it doesn't exist
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {}
  
  const filePath = path.join(dataDir, `shots_${year}.json`);
  await fs.writeFile(filePath, JSON.stringify(shots, null, 2), 'utf-8');
  
  console.log(`Generated ${numShots} shots for year ${year}`);
};

// Generate data for all years
const generateAllData = async (): Promise<void> => {
  // Generate more shots for more recent years to simulate data volume increase
  const shotsPerYear = {
    2017: 10000,
    2018: 12000,
    2019: 15000,
    2020: 18000,
    2021: 20000,
    2022: 22000,
    2023: 25000,
    2024: 28000,
    2025: 30000
  };
  
  const years = Object.keys(shotsPerYear).map(Number);
  
  for (const year of years) {
    await generateYearData(year, shotsPerYear[year as keyof typeof shotsPerYear]);
  }
  
  console.log('Data generation complete!');
};

// Run the generator
generateAllData().catch(console.error);