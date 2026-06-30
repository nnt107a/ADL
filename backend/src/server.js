import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = Number(process.env.PORT || 4000);

async function start() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`ADL API listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error.message);

  if (error.cause) {
    console.error('Cause:', error.cause.message);
  }

  process.exit(1);
});
