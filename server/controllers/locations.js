import { pool } from "../config/database.js";
export async function getLocations(req, res) {
  const { rows } = await pool.query(
    "SELECT l.*, COUNT(e.id)::integer AS event_count FROM locations l LEFT JOIN events e ON e.location_id=l.id GROUP BY l.id ORDER BY l.id",
  );
  res.json(rows);
}
export async function getLocation(req, res) {
  const { rows } = await pool.query("SELECT * FROM locations WHERE slug=$1", [
    req.params.slug,
  ]);
  if (!rows.length)
    return res.status(404).json({ error: "Location not found." });
  res.json(rows[0]);
}
