const bcrypt = require("bcrypt");

async function generateHash() {
  const password = "admin123"; // 🔹 your first admin password
  const hash = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hash);
}
generateHash();
