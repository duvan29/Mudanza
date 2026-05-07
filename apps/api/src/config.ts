import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  mongodbUri: process.env['MONGODB_URI'] ?? '',
  jwt: {
    secret: process.env['JWT_SECRET'] ?? 'dev-secret-change-me',
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '30d',
  },
  seed: {
    user1Email: process.env['SEED_USER_1_EMAIL'] ?? 'duvan@mudanza.app',
    user1Password: process.env['SEED_USER_1_PASSWORD'] ?? 'password123',
    user2Email: process.env['SEED_USER_2_EMAIL'] ?? 'kata@mudanza.app',
    user2Password: process.env['SEED_USER_2_PASSWORD'] ?? 'password123',
  },
} as const;
