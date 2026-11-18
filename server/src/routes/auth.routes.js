
const router = require("express").Router();
const controller = require("../controllers/auth.controller");
const { verifyToken } = require("../../middlewares/auth");
router.post("/login", controller.login);
router.get("/me", verifyToken, controller.me);
router.post("/register", controller.register);
module.exports = router;

