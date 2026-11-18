const router = require("express").Router();
const controller = require("../controllers/consumer.controller");
const { verifyToken, requireRole } = require("../../middlewares/auth");

router.use(verifyToken, requireRole("consumer"));

router.get("/stores", controller.listOpenStores);
router.get("/stores/:id/products", controller.getStoreWithProducts);
router.post("/orders", controller.createOrder);
router.get("/orders", controller.listMyOrders);

module.exports = router;