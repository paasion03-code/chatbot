const express = require("express");
const router = express.Router();
const templateController = require("../controllers/templateController");

// ✅ Protect admin routes
function checkAdmin(req, res, next) {
  if (!req.session.adminId) return res.redirect("/login");
  next();
}

// ---------------- Templates ----------------

// List templates
router.get("/", checkAdmin, templateController.listTemplates);

// Add template
router.get("/add", checkAdmin, templateController.addTemplatePage);
router.post(
  "/add",
  checkAdmin,
  templateController.upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  templateController.addTemplate
);

// Send template to single user
router.get("/send/:id/user/:userId", checkAdmin, templateController.sendToUser);

// Send template to all users
router.get("/send/:id/all", checkAdmin, templateController.sendToAll);

module.exports = router;
