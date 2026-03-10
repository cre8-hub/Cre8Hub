import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", client => {
  client
    .query("select current_database()")
    .then(res => {
      console.log("Connected to DB:", res.rows[0].current_database);
    });
});
