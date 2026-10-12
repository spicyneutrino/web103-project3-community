import { pool } from './database.js';
import { locations, events } from './data.js';
export async function seedDatabase(db) {
 const client = await db.connect();
 try {
  await client.query('BEGIN');
  await client.query(`CREATE TABLE IF NOT EXISTS locations (
   id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
   category TEXT NOT NULL, description TEXT NOT NULL, address TEXT NOT NULL,
   icon TEXT NOT NULL, color TEXT NOT NULL, x INTEGER NOT NULL, y INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS events (
   id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
   location_id INTEGER NOT NULL REFERENCES locations(id), starts_at TIMESTAMPTZ NOT NULL,
   ends_at TIMESTAMPTZ NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL,
   price TEXT NOT NULL, CHECK (ends_at > starts_at)
  ); CREATE INDEX IF NOT EXISTS events_location_start_idx ON events(location_id, starts_at);`);
  for (const l of locations) await client.query(`INSERT INTO locations (slug,name,category,description,address,icon,color,x,y)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, description=EXCLUDED.description, address=EXCLUDED.address, icon=EXCLUDED.icon, color=EXCLUDED.color, x=EXCLUDED.x, y=EXCLUDED.y`, Object.values(l));
  for (const [slug,title,location,start,end,description,category,price] of events) await client.query(`INSERT INTO events (slug,title,location_id,starts_at,ends_at,description,category,price)
   VALUES ($1,$2,(SELECT id FROM locations WHERE slug=$3),$4,$5,$6,$7,$8)
   ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, location_id=EXCLUDED.location_id, starts_at=EXCLUDED.starts_at, ends_at=EXCLUDED.ends_at, description=EXCLUDED.description, category=EXCLUDED.category, price=EXCLUDED.price`, [slug,title,location,start,end,description,category,price]);
  await client.query('COMMIT');
 } catch (error) { await client.query('ROLLBACK'); throw error; }
 finally { client.release(); }
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
 try { await seedDatabase(pool); console.log('Seeded 4 locations and 12 events.'); }
 catch (error) { console.error('Seed failed:', error.message); process.exitCode=1; }
 finally { await pool.end(); }
}
