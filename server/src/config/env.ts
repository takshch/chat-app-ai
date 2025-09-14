import { EnvType, load } from 'ts-dotenv';

const schema = {
  // Server Configuration
  PORT: {
    type: Number,
    default: 3001,
  },
  NODE_ENV: {
    type: String,
    default: 'development',
  },

  // Database Configuration
  MONGODB_URI: {
    type: String,
    optional: false,
  },

  // JWT Configuration
  JWT_SECRET: {
    type: String,
    default: 'your-super-secret-jwt-key-here',
  },
  JWT_EXPIRES_IN: {
    type: String,
    default: '7d',
  },

  // CORS Configuration
  CLIENT_URL: {
    type: String,
    default: 'http://localhost:3000',
  },

  // Cookie Configuration
  COOKIE_DOMAIN: {
    type: String,
    default: 'localhost',
  },
  COOKIE_SECURE: {
    type: Boolean,
    default: false,
  },
  COOKIE_SAME_SITE: {
    type: String,
    default: 'lax',
  },
  // OpenRouter Configuration
  OPENROUTER_API_KEY: {
    type: String,
    optional: false,
  },
  OPENROUTER_MODEL: {
    type: String,
    default: 'meta-llama/llama-3.2-3b-instruct:free',
  },
};

export type Env = EnvType<typeof schema>;

export let env: Env;

export function loadEnv(): void {
  env = load(schema);
}
