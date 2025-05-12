import { Request, Response } from 'express';
import { generateToken } from '../middleware/authMiddleware';
import config from '../config';

export class AuthController {
  /**
   * Login endpoint to generate JWT token
   * @param req Request with login credentials
   * @param res Response with JWT token
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // For a real application, validate against a database
      // This is a simplified example for the demo
      if (username === config.auth.demoUser && password === config.auth.demoPassword) {
        const token = generateToken({
          userId: '1',
          username: username
        });

        res.json({
          token,
          expiresIn: config.jwt.expiresIn,
          user: {
            id: '1',
            username
          }
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
}