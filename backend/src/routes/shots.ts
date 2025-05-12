import { Router } from 'express';
import { ShotController } from '../controllers/shotController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
const shotController = new ShotController();

/**
 * @route GET /api/shots/:year
 * @desc Get shot distribution data for a specific year
 * @access Private (requires JWT)
 */
router.get(
  '/:year',
  authenticateToken,
  (req, res) => shotController.getShotsByYear(req, res)
);

/**
 * @route GET /api/shots/trends
 * @desc Get shot trends across all available years
 * @access Private (requires JWT)
 */
router.get(
  '/trends',
  authenticateToken,
  (req, res) => shotController.getShotTrends(req, res)
);

export default router;