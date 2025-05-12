import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /api/auth/login
 * @desc Login to get JWT token
 * @access Public
 */
router.post(
  '/login',
  (req, res) => authController.login(req, res)
);

export default router;