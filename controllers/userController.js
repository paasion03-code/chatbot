const db = require("../db");

// Chat user login page
exports.getLogin = (req, res) => {
  if (req.session.userId) return res.redirect("/user/chat");
  res.render("login_user", { error: null });
};

// Chat user login submit
exports.postLogin = async (req, res) => {
  const username = (req.body.username || "").trim();
  const password = (req.body.password || "").trim();

  if (!username || !password) {
    return res.render("login_user", { error: "All fields are required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM chat_users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length === 0) {
      return res.render("login_user", { error: "Invalid username or password" });
    }

    const user = rows[0];
    req.session.userId = user.id;
    req.session.username = user.username;
    res.redirect("/user/chat");
  } catch (err) {
    console.error(err);
    res.render("login_user", { error: "Database error" });
  }
};

// Chat page
exports.chatPage = (req, res) => {
  if (!req.session.userId) return res.redirect("/user/login");
  res.render("chat_user", { username: req.session.username });
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/user/login"));
};
