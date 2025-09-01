import { MongoClient, Db } from 'mongodb';

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

async function createClientWithFallback(uri: string): Promise<MongoClient> {
  const connectionOptions = [
    // Option 1: Standard SSL with validation
    {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      ssl: true,
      tls: true,
      retryWrites: true,
      retryReads: true,
    },
    // Option 2: SSL with invalid certificates allowed
    {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      retryWrites: true,
      retryReads: true,
    },
    // Option 3: No SSL/TLS (fallback)
    {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      ssl: false,
      tls: false,
      retryWrites: true,
      retryReads: true,
    },
  ];

  for (let i = 0; i < connectionOptions.length; i++) {
    try {
      const client = new MongoClient(uri, connectionOptions[i]);
      await client.connect();
      return client;
    } catch (error) {
      if (i === connectionOptions.length - 1) {
        throw error; // Re-throw if all options fail
      }
    }
  }

  throw new Error('All MongoDB connection options failed');
}

export function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Missing MONGODB_URI');
    }

    // Use fallback connection strategy
    client = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      ssl: true,
      tls: true,
      retryWrites: true,
      retryReads: true,
    });
  }
  if (!clientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Missing MONGODB_URI');
    }
    clientPromise = createClientWithFallback(uri);
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
