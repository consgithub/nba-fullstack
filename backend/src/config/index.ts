import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  env: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  auth: {
    demoUser: string;
    demoPassword: string;
  };
  cors: {
    origin: string;
  };
}

// Default configuration
const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  env: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'PLACEHOLDER-REPLACE-IN-PRODUCTION',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  auth: {
    demoUser: process.env.DEMO_USER || 'demo',
    demoPassword: process.env.DEMO_PASSWORD || 'DEMO-PASSWORD-NOT-FOR-PRODUCTION'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  }
};

export default config;