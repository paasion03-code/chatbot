const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const templateController = require("../controllers/templateController"); // ✅ Import templateController
const multer = require("multer");
const path = require("path");

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "image") {
      cb(null, path.join(__dirname, "../uploads/images"));
    } else {
      cb(null, path.join(__dirname, "../uploads/attachments"));
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ✅ Check admin middleware
function checkAdmin(req, res, next) {
  if (!req.session.adminId) return res.redirect("/login");
  next();
}

// ---------------- Dashboard ----------------
router.get("/dashboard", checkAdmin, adminController.dashboard);

// ---------------- Chat History ----------------
router.get("/chats", checkAdmin, adminController.viewChats);

// ---------------- Chat Users ----------------
router.get("/manage_users", checkAdmin, adminController.manageUsers);
router.get("/add_user", checkAdmin, adminController.addUserForm);
router.post("/add_user", checkAdmin, adminController.addUser);
router.get("/edit_user/:id", checkAdmin, adminController.editUserForm);
router.post("/edit_user/:id", checkAdmin, adminController.updateUser);
router.get("/delete_user/:id", checkAdmin, adminController.deleteUser);

// ---------------- Templates ----------------
// ✅ Use templateController so `users` is passed correctly
router.get("/templates", checkAdmin, templateController.listTemplates);
router.get("/templates/add", checkAdmin, templateController.addTemplatePage);
router.post(
  "/templates/add",
  checkAdmin,
  upload.fields([{ name: "image" }, { name: "file" }]),
  templateController.addTemplate
);
router.get("/templates/edit/:id", checkAdmin, adminController.editTemplateForm);
router.post(
  "/templates/edit/:id",
  checkAdmin,
  upload.fields([{ name: "image" }, { name: "file" }]),
  adminController.updateTemplate
);
router.get("/templates/delete/:id", checkAdmin, adminController.deleteTemplate);

// ✅ Send template (user or all)
router.post("/templates/send/:id", checkAdmin, templateController.sendTemplate);

module.exports = router;
