import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  JWT_SECRET: process.env.JWT_SECRET || "supersecret",
  
  // S3 / R2 Configuration (Optional, fallbacks to local storage if not provided)
  S3_ENDPOINT: process.env.S3_ENDPOINT || "",
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || "",
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || "",
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "",
  S3_PUBLIC_URL: process.env.S3_PUBLIC_URL || "",
};

// Simple validation
const requiredEnvs: (keyof typeof env)[] = ["DATABASE_URL", "REDIS_URL", "GEMINI_API_KEY", "JWT_SECRET"];

for (const key of requiredEnvs) {
  if (!env[key]) {
    console.warn(`[ Warning ]: Environment variable ${key} is missing.`);
  }
}
