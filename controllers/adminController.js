const db = require("../db");
const bcrypt = require("bcrypt");

// -------------------- Dashboard --------------------
exports.dashboard = (req, res) => {
  res.render("dashboard", { username: req.session.adminUsername });
};

// -------------------- Chat History --------------------
exports.viewChats = async (req, res) => {
  try {
    const [chats] = await db.query("SELECT * FROM chat_history ORDER BY created_at DESC");
    res.render("chats", { chats });
  } catch (err) {
    console.error("Chat history error:", err);
    res.render("chats", { chats: [] });
  }
};

// -------------------- Chat Users --------------------
exports.manageUsers = async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM chat_users ORDER BY created_at DESC");
    res.render("manage_users", { users });
  } catch (err) {
    console.error("Manage users error:", err);
    res.render("manage_users", { users: [] });
  }
};

exports.addUserForm = (req, res) => {
  res.render("add_user", { user: null, error: null });
};

exports.addUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    await db.query("INSERT INTO chat_users (username, password) VALUES (?, ?)", [username, password]);
    res.redirect("/admin/manage_users");
  } catch (err) {
    console.error("Add user error:", err);
    res.render("add_user", { user: null, error: "Username already exists or error occurred" });
  }
};

exports.editUserForm = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM chat_users WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.redirect("/admin/manage_users");
    res.render("add_user", { user: rows[0], error: null });
  } catch (err) {
    console.error("Edit user error:", err);
    res.redirect("/admin/manage_users");
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    await db.query("UPDATE chat_users SET username = ?, password = ? WHERE id = ?", [username, password, req.params.id]);
    res.redirect("/admin/manage_users");
  } catch (err) {
    console.error("Update user error:", err);
    res.redirect("/admin/manage_users");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await db.query("DELETE FROM chat_users WHERE id = ?", [req.params.id]);
    res.redirect("/admin/manage_users");
  } catch (err) {
    console.error("Delete user error:", err);
    res.redirect("/admin/manage_users");
  }
};

// -------------------- Templates --------------------

// View all templates
exports.viewTemplates = async (req, res) => {
  try {
    const [templates] = await db.query("SELECT * FROM templates ORDER BY created_at DESC");
    res.render("templates", { templates });
  } catch (err) {
    console.error("Error fetching templates:", err);
    res.render("templates", { templates: [] });
  }
};

// Show add template form
exports.addTemplateForm = (req, res) => {
  res.render("add_template", { template: null, error: null });
};

// Add template
exports.addTemplate = async (req, res) => {
  try {
    const { title, message, image_path, file_path } = req.body;
    await db.query(
      "INSERT INTO templates (title, message, image_path, file_path) VALUES (?, ?, ?, ?)",
      [title, message, image_path || null, file_path || null]
    );
    res.redirect("/admin/templates");
  } catch (err) {
    console.error("Error adding template:", err);
    res.render("add_template", { template: null, error: "Failed to add template" });
  }
};

// Edit template form
exports.editTemplateForm = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM templates WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.redirect("/admin/templates");
    res.render("add_template", { template: rows[0], error: null });
  } catch (err) {
    console.error("Error loading template:", err);
    res.redirect("/admin/templates");
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const { title, message, image_path, file_path } = req.body;
    await db.query(
      "UPDATE templates SET title=?, message=?, image_path=?, file_path=? WHERE id=?",
      [title, message, image_path || null, file_path || null, req.params.id]
    );
    res.redirect("/admin/templates");
  } catch (err) {
    console.error("Error updating template:", err);
    res.redirect("/admin/templates");
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    await db.query("DELETE FROM templates WHERE id = ?", [req.params.id]);
    res.redirect("/admin/templates");
  } catch (err) {
    console.error("Error deleting template:", err);
    res.redirect("/admin/templates");
  }
};
