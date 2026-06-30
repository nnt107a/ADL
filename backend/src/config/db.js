import mongoose from 'mongoose';

function createConnectionError(uri, error) {
  const isLocalUri = /mongodb:\/\/(127\.0\.0\.1|localhost):27017/i.test(uri);
  const hint = isLocalUri
    ? 'MongoDB is not reachable on localhost:27017. Start MongoDB locally or run the Docker MongoDB service before seeding.'
    : 'Check your MONGODB_URI value and make sure the database server is reachable.';

  const wrapped = new Error(`${hint} Original error: ${error.message}`);
  wrapped.cause = error;
  return wrapped;
}

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/adl';

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  } catch (error) {
    throw createConnectionError(uri, error);
  }

  return mongoose.connection;
}
