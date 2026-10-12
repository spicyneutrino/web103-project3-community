import { app } from './app.js';
import { pool } from './config/database.js';
const server=app.listen(process.env.PORT || 3003,()=>console.log(`After Hours API on port ${process.env.PORT || 3003}`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(async()=>{ await pool.end(); process.exit(0); }));
