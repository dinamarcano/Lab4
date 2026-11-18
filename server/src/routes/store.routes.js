const router = require("express").Router();
const controller = require("../controllers/store.controller");
const { verifyToken, requireRole } = require("../../middlewares/auth");

router.use(verifyToken, requireRole("store"));

router.get("/me", controller.getMyStore);
router.patch("/me/toggle", controller.toggleOpen);
router.get("/products", controller.listProducts);
router.post("/products", controller.createProduct);
router.patch("/products/:id", controller.updateProductName);
router.get("/orders", controller.listOrders);

module.exports = router;