const { pool } = require("../config/db");

exports.createContent = async (data) => {
  const query = `
    INSERT INTO content
    (title, subject, file_path, uploaded_by, start_time, end_time)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *`;

  const result = await pool.query(query, [
    data.title,
    data.subject,
    data.file_path,
    data.userId,
    data.start_time,
    data.end_time
  ]);

  return result.rows[0];
};