import { MongoClient, Db } from 'mongodb';

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

async function createClientWithFallback(uri: string): Promise<MongoClient> {
  const connectionOptions = [
    // Option 1: Strict SSL (default)
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
      tlsInsecure: false,
    },
    // Option 2: More lenient SSL
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
      tlsInsecure: true,
    },
    // Option 3: Minimal SSL
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
      console.log(`Trying MongoDB connection option ${i + 1}`);
      const client = new MongoClient(uri, connectionOptions[i]);
      await client.connect();
      console.log(`MongoDB connection successful with option ${i + 1}`);
      return client;
    } catch (error) {
      console.error(`MongoDB connection option ${i + 1} failed:`, error);
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
    if (!uri) throw new Error('Missing MONGODB_URI');

    // Use fallback connection strategy
    client = new MongoClient(uri, {
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
      tlsInsecure: false,
    });
  }
  if (!clientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Missing MONGODB_URI');
    clientPromise = createClientWithFallback(uri);
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB;
  if (!dbName) throw new Error('Missing MONGODB_DB');
  const c = await getMongoClient();
  return c.db(dbName);
}
