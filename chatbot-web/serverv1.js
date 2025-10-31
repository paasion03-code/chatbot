const express = require("express");
const path = require("path");
const db = require("./db");
require("dotenv").config();

const app = express();
app.use(express.json());

// Serve chatbot static files
app.use(express.static(path.join(__dirname, "public")));

// Serve uploads from admin panel
app.use("/uploads", express.static("C:/app-bot/admin/public/uploads"));

// Chat API
app.post("/api/chat", async (req, res) => {
    const userMessage = req.body.message.toLowerCase().trim();

    try {
        const [rows] = await db.query(
            "SELECT reply_text, reply_image, attachment_file FROM keywords WHERE LOWER(keyword) = ?",
            [userMessage]
        );

        if (rows.length > 0) {
            res.json({
                reply: rows[0].reply_text,
                image: rows[0].reply_image,
                file: rows[0].attachment_file
            });
        } else {
            res.json({ reply: "❌ ENTER CORRECT WORDS." });
        }
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ reply: "⚠️ Database connection issue." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`🚀 Chatbot running at http://localhost:${PORT}`)
);
