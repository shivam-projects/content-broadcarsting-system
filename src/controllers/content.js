const { pool } = require("../config/db");
const { createContent } = require("../services/content");
const { getLiveContent } = require("../services/scheduling");

exports.uploadContent = async (req, res) => {
  try {
    const {
      title,
      subject,
      start_time,
      end_time,
      rotation_order,
      duration = 5
    } = req.body;

    // 🔹 Basic validation
    if (!title || !subject || !start_time || !end_time) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 🔹 File required check only (validation multer karega)
    if (!req.file) {
      return res.status(400).json({ msg: "File is required" });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);

    if (start >= end) {
      return res.status(400).json({ msg: "Invalid time range" });
    }

    // 🔹 Duplicate check
    const duplicate = await pool.query(
      `SELECT * FROM content 
       WHERE LOWER(title)=LOWER($1) 
       AND LOWER(subject)=LOWER($2)
       AND uploaded_by=$3`,
      [title, subject, req.user.id]
    );

    if (duplicate.rows.length > 0) {
      return res.status(400).json({ msg: "Duplicate content not allowed" });
    }

    // 🔹 Clean file path (Windows fix)
    const cleanPath = req.file.path.replace(/\\/g, "/");

    // 🔹 Insert content
    const content = await createContent({
      title,
      subject,
      file_path: cleanPath,
      userId: req.user.id,
      start_time: start,
      end_time: end
    });

    // 🔹 Slot handling
    let slotRes = await pool.query(
      "SELECT * FROM content_slots WHERE LOWER(subject)=LOWER($1)",
      [subject]
    );

    let slotId;

    if (slotRes.rows.length === 0) {
      const newSlot = await pool.query(
        "INSERT INTO content_slots (subject) VALUES ($1) RETURNING id",
        [subject]
      );
      slotId = newSlot.rows[0].id;
    } else {
      slotId = slotRes.rows[0].id;
    }

    // 🔹 Rotation order
    let orderRes = await pool.query(
      "SELECT MAX(rotation_order) as max FROM content_schedule WHERE slot_id=$1",
      [slotId]
    );

    const finalOrder = rotation_order || (orderRes.rows[0].max || 0) + 1;

    if (duration <= 0) {
      return res.status(400).json({ msg: "Duration must be > 0" });
    }

    // 🔹 Insert schedule
    await pool.query(
      `INSERT INTO content_schedule 
       (content_id, slot_id, rotation_order, duration)
       VALUES ($1, $2, $3, $4)`,
      [content.id, slotId, finalOrder, duration]
    );

    return res.status(201).json({
      msg: "Content uploaded & scheduled, pending approval",
      content
    });

  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

exports.getLive = async (req, res) => {
  const { teacherId } = req.params;
  const { subject } = req.query;

  if (!subject) {
    return res.json({ msg: "No content available" });
  }

  const content = await getLiveContent(teacherId, subject);

  if (!content) {
    return res.json({ msg: "No content available" });
  }

  // ADD THIS PART
  const cleanPath = content.file_path.replace(/\\/g, "/");

  const fileUrl = `${req.protocol}://${req.get("host")}/${cleanPath}`;

  res.json({
    ...content,
    file_url: fileUrl
  });
};