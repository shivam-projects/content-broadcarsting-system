const { pool } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }

    // Password strength
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    // Role validation
    if (!["TEACHER", "PRINCIPAL"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    // Duplicate email check
    const existing = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hash, role]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Required fields
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    // User check
    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ msg: "Invalid credentials" }); // safer
    }

    const user = result.rows[0];

    // Password check
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Token with expiry (IMPORTANT)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({success: true, token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Login failed" });
  }
};