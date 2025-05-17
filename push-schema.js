import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

// Create a custom migration function since drizzle-kit push requires interactive input
async function pushSchema() {
  try {
    console.log('Creating bookings table in the database...');
    
    // Connect to the database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Create bookings table directly with SQL
    await pool.query(`
      DO $$ 
      BEGIN
        -- Create booking_status enum if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
          CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'declined', 'rescheduled');
        END IF;
        
        -- Create bookings table if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bookings') THEN
          CREATE TABLE bookings (
            id SERIAL PRIMARY KEY,
            external_id TEXT NOT NULL,
            client_name TEXT NOT NULL,
            client_phone TEXT NOT NULL,
            service_name TEXT,
            service_price TEXT,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            notes TEXT,
            status booking_status NOT NULL DEFAULT 'pending',
            professional_id TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        ELSE
          -- Add columns if they don't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'external_id') THEN
            ALTER TABLE bookings ADD COLUMN external_id TEXT NOT NULL DEFAULT '';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'client_name') THEN
            ALTER TABLE bookings ADD COLUMN client_name TEXT NOT NULL DEFAULT '';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'client_phone') THEN
            ALTER TABLE bookings ADD COLUMN client_phone TEXT NOT NULL DEFAULT '';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'service_name') THEN
            ALTER TABLE bookings ADD COLUMN service_name TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'service_price') THEN
            ALTER TABLE bookings ADD COLUMN service_price TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'date') THEN
            ALTER TABLE bookings ADD COLUMN date TEXT NOT NULL DEFAULT '';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'time') THEN
            ALTER TABLE bookings ADD COLUMN time TEXT NOT NULL DEFAULT '';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'notes') THEN
            ALTER TABLE bookings ADD COLUMN notes TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'status') THEN
            ALTER TABLE bookings ADD COLUMN status booking_status NOT NULL DEFAULT 'pending';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'professional_id') THEN
            ALTER TABLE bookings ADD COLUMN professional_id TEXT NOT NULL DEFAULT '';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'created_at') THEN
            ALTER TABLE bookings ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
          END IF;
        END IF;
      END $$;
    `);
    
    console.log('Database schema updated successfully!');
    await pool.end();
  } catch (error) {
    console.error('Failed to update schema:', error);
    process.exit(1);
  }
}

pushSchema();