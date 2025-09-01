import { MongoClient } from 'mongodb';

let clientPromise: Promise<MongoClient> | undefined;

export function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Missing MONGODB_URI');
    }

    // Optimized connection options for better performance
    const connectionOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 2000, // Very fast timeout
      socketTimeoutMS: 3000,
      connectTimeoutMS: 2000,
      ssl: true,
      tls: true,
      retryWrites: true,
      retryReads: true,
      maxIdleTimeMS: 60000, // Keep connections alive for 1 minute
      heartbeatFrequencyMS: 10000, // Check connection health every 10 seconds
    };

    clientPromise = new Promise(async (resolve, reject) => {
      try {
        const client = new MongoClient(uri, connectionOptions);
        await client.connect();
        resolve(client);
      } catch {
        // If SSL fails, try without SSL
        try {
          const fallbackOptions = {
            ...connectionOptions,
            ssl: false,
            tls: false,
          };
          const client = new MongoClient(uri, fallbackOptions);
          await client.connect();
          resolve(client);
        } catch (fallbackError) {
          reject(fallbackError);
        }
      }
    });
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB;
  if (!dbName) {
    throw new Error('Missing MONGODB_DB');
  }
  const c = await getMongoClient();
  return c.db(dbName);
}
