import { createApp } from './app.js';

const port = Number(process.env.PORT) || 3001;
const corsOrigins = (process.env.CORS_ORIGINS || '*')
  .split(/[,;]/).map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);

createApp({ corsOrigins }).listen(port, () => {
  console.log(`[api] http://localhost:${port}  (CORS: ${corsOrigins.join(', ')})`);
});
