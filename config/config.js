// This runs server-side (environment variables stay secure)
export default function handler(req, res) {
  res.json({
    apiKey: process.env.API_KEY,       // From Vercel's environment
    environment: process.env.VERCEL_ENV // "production"/"preview"/"development"
  });
}