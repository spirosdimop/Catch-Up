import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the pool with connection retry settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10,               // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Clients timeout after 30 seconds of inactivity
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if a connection cannot be established
  maxUses: 7500         // Close and replace a connection after it has been used 7500 times
});

// Configure Drizzle with our schema
export const db = drizzle({ client: pool, schema });

// Log connection success once
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Database connection established successfully');
  release();
});
