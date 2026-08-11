import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = Number(process.env.PORT || 4000);

function start() {
  app.listen(port, '0.0.0.0', () => {
    console.log(`ADL API listening on http://127.0.0.1:${port}`);
  });

  connectDatabase().catch((error) => {
    console.error('Database connection warning:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
  });
}

start();

