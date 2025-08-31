import { MongoClient, Db } from 'mongodb';

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

export function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Missing MONGODB_URI');

    // Configure MongoDB client for production SSL/TLS
    const options = {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      retryWrites: true,
      retryReads: true,
    };

    client = new MongoClient(uri, options);
  }
  if (!clientPromise) {
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB;
  if (!dbName) throw new Error('Missing MONGODB_DB');
  const c = await getMongoClient();
  return c.db(dbName);
}
