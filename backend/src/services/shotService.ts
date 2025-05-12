import fs from 'fs/promises';
import path from 'path';
import { Shot, ShotDistribution, ShotTrend } from '../types/shots';
import { Worker } from 'worker_threads';

export class ShotService {
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
  }

  /**
   * Get shot distribution data for a specific year
   * @param year Year to get data for (2017-2025)
   * @returns Promise with shot distribution data
   */
  public async getShotsByYear(year: number): Promise<ShotDistribution> {
    try {
      // Check if data is cached
      const cachedData = await this.getCachedData(year);
      if (cachedData) {
        return cachedData;
      }

      const filePath = path.join(this.dataDir, `shots_${year}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const rawShots: Shot[] = JSON.parse(fileContent);

      // Use worker thread for CPU-intensive processing
      return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, '../utils/shotWorker.js'), {
          workerData: { shots: rawShots, year }
        });

        worker.on('message', (distribution: ShotDistribution) => {
          // Cache result for future use
          this.cacheData(year, distribution)
            .catch(err => console.error('Failed to cache shot data:', err));
          
          resolve(distribution);
        });

        worker.on('error', reject);
        worker.on('exit', code => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      });
    } catch (error) {
      console.error(`Error loading shot data for year ${year}:`, error);
      throw new Error(`Failed to load shot data for year ${year}`);
    }
  }

  /**
   * Get shot trend data across all available years
   * @returns Promise with shot trend data
   */
  public async getShotTrends(): Promise<ShotTrend[]> {
    try {
      // Get all years with available data
      const files = await fs.readdir(this.dataDir);
      const shotYears = files
        .filter(file => file.startsWith('shots_') && file.endsWith('.json'))
        .map(file => parseInt(file.replace('shots_', '').replace('.json', '')))
        .filter(year => !isNaN(year) && year >= 2017 && year <= 2025)
        .sort();

      // Process data for each year using multiple workers
      const trendPromises = shotYears.map(year => this.getShotsByYear(year));
      const distributions = await Promise.all(trendPromises);

      // Calculate trends
      const trends: ShotTrend[] = [];
      
      // Group by shot zones
      const zones = ['Restricted Area', 'Paint', 'Mid-Range', 'Corner 3', 'Above Break 3', 'Backcourt'];
      
      for (const zone of zones) {
        const yearData = distributions.map((dist, index) => ({
          year: shotYears[index],
          frequency: dist.zoneFrequency[zone] || 0,
          percentage: dist.zonePercentage[zone] || 0
        }));
        
        trends.push({
          zone,
          trend: yearData
        });
      }

      return trends;
    } catch (error) {
      console.error('Error calculating shot trends:', error);
      throw new Error('Failed to calculate shot trends');
    }
  }

  /**
   * Get cached data if available
   * @param year Year to get cached data for
   * @returns Cached shot distribution or null if not cached
   */
  private async getCachedData(year: number): Promise<ShotDistribution | null> {
    try {
      const cachePath = path.join(this.dataDir, 'cache', `distribution_${year}.json`);
      const cacheContent = await fs.readFile(cachePath, 'utf-8');
      return JSON.parse(cacheContent);
    } catch {
      return null;
    }
  }

  /**
   * Cache shot distribution data
   * @param year Year to cache data for
   * @param distribution Shot distribution data to cache
   */
  private async cacheData(year: number, distribution: ShotDistribution): Promise<void> {
    try {
      const cacheDir = path.join(this.dataDir, 'cache');
      
      // Create cache directory if it doesn't exist
      try {
        await fs.mkdir(cacheDir, { recursive: true });
      } catch {}
      
      const cachePath = path.join(cacheDir, `distribution_${year}.json`);
      await fs.writeFile(cachePath, JSON.stringify(distribution), 'utf-8');
    } catch (error) {
      console.error(`Failed to cache data for year ${year}:`, error);
    }
  }
}