const service = require("../services/delivery.service");
const { sendError } = require("../utils/http");

const handle = (fn) => async (req, res) => {
  try {
    res.json(await fn(req));
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = {
  listAvailable: handle(() => service.listAvailable()),
  getOrder: handle((req) => service.getOrder(req.params.id)),
  listHistory: handle((req) => service.listHistory(req.user.id)),
  accept: handle((req) => service.accept(req.user.id, req.params.id)),
  release: handle((req) => service.release(req.user.id, req.params.id)),
  deliver: handle((req) => service.deliver(req.user.id, req.params.id)),
};