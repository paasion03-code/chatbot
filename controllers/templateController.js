const db = require("../db");
const path = require("path");
const multer = require("multer");

// ------------------ Multer setup ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, "uploads/images");
    else cb(null, "uploads/attachments");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
exports.upload = multer({ storage });

// ------------------ List Templates ------------------
exports.listTemplates = async (req, res) => {
  try {
    const [templates] = await db.query("SELECT * FROM templates ORDER BY created_at DESC");
    const [users] = await db.query("SELECT id, username FROM chat_users ORDER BY created_at DESC");

    res.render("templates", {
      admin: req.session.admin,
      templates,
      users,
      message: null,
    });
  } catch (err) {
    console.error("Error listing templates:", err);
    res.render("templates", {
      admin: req.session.admin,
      templates: [],
      users: [],
      message: "⚠️ Failed to load templates",
    });
  }
};

// ------------------ Add Template Page ------------------
exports.addTemplatePage = (req, res) => {
  res.render("add_template", { admin: req.session.admin, template: null, error: null });
};

// ------------------ Handle Add Template ------------------
exports.addTemplate = async (req, res) => {
  const { title, message } = req.body;
  let imagePath = null;
  let filePath = null;

  if (req.files["image"] && req.files["image"][0]) {
    imagePath = "uploads/images/" + req.files["image"][0].filename;
  }
  if (req.files["file"] && req.files["file"][0]) {
    filePath = "uploads/attachments/" + req.files["file"][0].filename;
  }

  try {
    await db.query(
      "INSERT INTO templates (title, message, image_path, file_path) VALUES (?, ?, ?, ?)",
      [title, message, imagePath, filePath]
    );
    res.redirect("/admin/templates");
  } catch (err) {
    console.error("Error adding template:", err);
    res.render("add_template", { admin: req.session.admin, template: null, error: "❌ Failed to save template" });
  }
};

// ------------------ Edit Template Page ------------------
exports.editTemplatePage = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM templates WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.redirect("/admin/templates");
    res.render("add_template", { admin: req.session.admin, template: rows[0], error: null });
  } catch (err) {
    console.error("Error loading template:", err);
    res.redirect("/admin/templates");
  }
};

// ------------------ Update Template ------------------
exports.updateTemplate = async (req, res) => {
  const { title, message } = req.body;
  let imagePath = null;
  let filePath = null;

  if (req.files["image"] && req.files["image"][0]) {
    imagePath = "uploads/images/" + req.files["image"][0].filename;
  }
  if (req.files["file"] && req.files["file"][0]) {
    filePath = "uploads/attachments/" + req.files["file"][0].filename;
  }

  try {
    await db.query(
      "UPDATE templates SET title=?, message=?, image_path=?, file_path=? WHERE id=?",
      [title, message, imagePath, filePath, req.params.id]
    );
    res.redirect("/admin/templates");
  } catch (err) {
    console.error("Error updating template:", err);
    res.redirect("/admin/templates");
  }
};

// ------------------ Delete Template ------------------
exports.deleteTemplate = async (req, res) => {
  try {
    await db.query("DELETE FROM templates WHERE id = ?", [req.params.id]);
    res.redirect("/admin/templates");
  } catch (err) {
    console.error("Error deleting template:", err);
    res.redirect("/admin/templates");
  }
};

// ------------------ Send Template ------------------
exports.sendTemplate = async (req, res) => {
  try {
    const templateId = req.params.id;
    const { recipient } = req.body; // "all" or userId

    // Get template
    const [[template]] = await db.query("SELECT * FROM templates WHERE id = ?", [templateId]);
    if (!template) return res.redirect("/admin/templates");

    let users = [];
    if (recipient === "all") {
      [users] = await db.query("SELECT username FROM chat_users");
    } else {
      const [[user]] = await db.query("SELECT username FROM chat_users WHERE id = ?", [recipient]);
      if (user) users.push(user);
    }

    for (let user of users) {
      await db.query(
        "INSERT INTO chat_history (username, user_message, bot_reply) VALUES (?, ?, ?)",
        [user.username, `[TEMPLATE] ${template.title}`, template.message]
      );
    }

    res.redirect("/admin/templates");
  } catch (err) {
    console.error("Error sending template:", err);
    res.redirect("/admin/templates");
  }
};
