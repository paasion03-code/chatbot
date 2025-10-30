const db = require("../db");
const bcrypt = require("bcrypt");

// Admin login page
exports.getLogin = (req, res) => {
  if (req.session.adminId) return res.redirect("/admin/dashboard");
  res.render("login", { error: null });
};

// Admin login submit
exports.postLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) return res.render("login", { error: "Invalid username or password" });

    const admin = rows[0];
    const ok = await bcrypt.compare(password, admin.password || "");
    if (!ok) return res.render("login", { error: "Invalid username or password" });

    req.session.adminId = admin.id;
    req.session.adminUsername = admin.username;
    res.redirect("/admin/dashboard");
  } catch (e) {
    console.error(e);
    res.render("login", { error: "Database error" });
  }
};

// Admin logout
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
};
