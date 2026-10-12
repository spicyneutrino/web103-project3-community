import { pool } from '../config/database.js';
export async function getEvents(req,res) {
 const values=[];
 let where='';
 if (req.query.location !== undefined) {
  if (typeof req.query.location !== 'string' || !/^[a-z0-9-]{1,80}$/.test(req.query.location)) return res.status(400).json({error:'Invalid location filter.'});
  values.push(req.query.location); where='WHERE l.slug=$1';
 }
 const { rows }=await pool.query(`SELECT e.*, l.name AS location_name, l.slug AS location_slug, l.icon, l.color FROM events e JOIN locations l ON l.id=e.location_id ${where} ORDER BY e.starts_at ASC, e.id ASC`,values);
 res.json(rows);
}
