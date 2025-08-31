import { MongoClient, Db } from 'mongodb';

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

export function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Missing MONGODB_URI');
    client = new MongoClient(uri, { maxPoolSize: 5 });
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
