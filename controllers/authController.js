const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "my_super_secret_key_12345";

// Registrasi 
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Semua field harus diisi ya broo!!." });
  }

  const checkEmailSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkEmailSql, [email], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database error saat mengecek email.", details: err });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: "Email sudah terdaftar." });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const insertUserSql =
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(insertUserSql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Database error saat menyimpan data.", details: err });
      }

      const token = jwt.sign({ id: result.insertId }, SECRET_KEY, {
        expiresIn: "1h",
      });
      res.status(201).json({
        message: "Registrasi berhasil!",
        token,
        user: {
          id: result.insertId,
          name,
          email,
        },
      });
    });
  });
};

// Login
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password harus diisi." });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database error saat login.", details: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Email atau password salah." });
    }

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Email atau password salah bro!." });
    }

    const token = jwt.sign({ id: user.user_id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "Login berhasil!",
      token,
    });
  });
}; 
