const { pool } = require("../config/db");

exports.getLiveContent = async (teacherId, subject) => {
  const query = `
    SELECT c.*, cs.duration, cs.rotation_order
    FROM content c
    JOIN content_schedule cs ON c.id = cs.content_id
    JOIN content_slots s ON cs.slot_id = s.id
    WHERE c.uploaded_by=$1
      AND s.subject=$2
      AND c.status='approved'
      AND NOW() BETWEEN c.start_time AND c.end_time
    ORDER BY cs.rotation_order, c.created_at
  `;

  const { rows } = await pool.query(query, [teacherId, subject]);

  if (!rows.length) return null;

  const total = rows.reduce((sum, r) => sum + r.duration, 0);

  const current = Math.floor(Date.now() / 60000);
  const slot = current % total;

  let cumulative = 0;

  for (let r of rows) {
    cumulative += r.duration;
    if (slot < cumulative) return r;
  }

  return rows[0];
};