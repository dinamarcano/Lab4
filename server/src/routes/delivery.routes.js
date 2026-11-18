const router = require("express").Router();
const controller = require("../controllers/delivery.controller");
const { verifyToken, requireRole } = require("../../middlewares/auth");

router.use(verifyToken, requireRole("delivery"));

// "available" va antes que ":id", si no Express lo tomaría como un id
router.get("/orders/available", controller.listAvailable);
router.get("/orders/:id", controller.getOrder);
router.post("/orders/:id/accept", controller.accept);
router.post("/orders/:id/release", controller.release);
router.post("/orders/:id/deliver", controller.deliver);
router.get("/history", controller.listHistory);

module.exports = router;