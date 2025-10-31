const express = require("express");
const path = require("path");
const db = require("./db");
require("dotenv").config();
const session = require("express-session");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretkey",
    resave: false,
    saveUninitialized: true,
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve uploads (for both admin & user)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/uploads",
  express.static("C:/app-bot/admin/public/uploads") // fallback for your existing admin uploader
);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

app.use("/", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

// -------------------- Chat API --------------------

// Handle user message
app.post("/api/chat", async (req, res) => {
  const userMessage = (req.body.message || "").toLowerCase().trim();
  const username = req.session.username || "guest";

  try {
    const [rows] = await db.query(
      "SELECT reply_text, reply_image, attachment_file FROM keywords WHERE LOWER(keyword) = ?",
      [userMessage]
    );

    let reply = "❌ ENTER CORRECT WORDS.";
    let image = null;
    let file = null;

    if (rows.length > 0) {
      reply = rows[0].reply_text || reply;
      if (rows[0].reply_image) {
        image = `/uploads/images/${path.basename(rows[0].reply_image)}`;
      }
      if (rows[0].attachment_file) {
        file = `/uploads/attachments/${path.basename(rows[0].attachment_file)}`;
      }
    }

    // Save chat history
    await db.query(
      "INSERT INTO chat_history (username, user_message, bot_reply) VALUES (?, ?, ?)",
      [username, userMessage, reply]
    );

    res.json({ reply, image, file });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ reply: "⚠️ Database connection issue." });
  }
});

// ✅ Chat history API (for user chat page)
app.get("/api/chat/history", async (req, res) => {
  if (!req.session.username) return res.json([]);
  try {
    const [rows] = await db.query(
      "SELECT user_message, bot_reply, created_at FROM chat_history WHERE username = ? ORDER BY created_at ASC",
      [req.session.username]
    );
    res.json(rows);
  } catch (err) {
    console.error("History fetch error:", err);
    res.json([]);
  }
});

// Root → user login
app.get("/", (req, res) => res.redirect("/user/login"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
