const service = require("../services/store.service");
const { sendError } = require("../utils/http");

const handle = (fn) => async (req, res) => {
  try {
    res.json(await fn(req));
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = {
  getMyStore: handle((req) => service.getMyStore(req.user.id)),
  toggleOpen: handle((req) => service.toggleOpen(req.user.id)),
  listProducts: handle((req) => service.listProducts(req.user.id)),
  createProduct: handle((req) => service.createProduct(req.user.id, req.body)),
  updateProductName: handle((req) =>
    service.updateProductName(req.user.id, req.params.id, req.body)
  ),
  listOrders: handle((req) => service.listOrders(req.user.id)),
};