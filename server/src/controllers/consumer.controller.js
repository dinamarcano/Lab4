const service = require("../services/consumer.service");
const { sendError } = require("../utils/http");

const handle = (fn, status = 200) => async (req, res) => {
  try {
    res.status(status).json(await fn(req));
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = {
  listOpenStores: handle(() => service.listOpenStores()),
  getStoreWithProducts: handle((req) => service.getStoreWithProducts(req.params.id)),
  createOrder: handle((req) => service.createOrder(req.user.id, req.body), 201),
  listMyOrders: handle((req) => service.listMyOrders(req.user.id)),
};