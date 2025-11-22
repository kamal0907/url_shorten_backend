import pool from "./db.js";

(async () => {
  try {
    const r = await pool.query("SELECT 1 AS ok");
    console.log("DB OK:", r.rows);
    process.exit(0);
  } catch (e) {
    console.error("DB ERROR:", e);
    process.exit(1);
  }
})();
