import { Request, Response } from 'express';
import { ShotService } from '../services/shotService';

export class ShotController {
  private shotService: ShotService;

  constructor() {
    this.shotService = new ShotService();
  }

  /**
   * Get shot distribution data for a specific year
   * @param req Request with year parameter
   * @param res Response object
   */
  public async getShotsByYear(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.params.year);
      
      // Validate year range
      if (isNaN(year) || year < 2017 || year > 2025) {
        res.status(400).json({ error: 'Invalid year. Must be between 2017 and 2025.' });
        return;
      }

      const shots = await this.shotService.getShotsByYear(year);
      res.json(shots);
    } catch (error) {
      console.error('Error fetching shots:', error);
      res.status(500).json({ error: 'Failed to fetch shot data' });
    }
  }

  /**
   * Get shot trend data across all available years
   * @param req Request object
   * @param res Response object
   */
  public async getShotTrends(req: Request, res: Response): Promise<void> {
    try {
      const trends = await this.shotService.getShotTrends();
      res.json(trends);
    } catch (error) {
      console.error('Error fetching shot trends:', error);
      res.status(500).json({ error: 'Failed to fetch shot trend data' });
    }
  }
}