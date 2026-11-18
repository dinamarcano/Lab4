const authService = require("../services/auth.service");

function sendError(res, error) {
  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(error);
  res.status(500).json({ message: "Error del servidor" });
}

async function register(req, res) {
  try {
    const data = await authService.register(req.body);
    res.status(201).json(data);
  } catch (error) {
    sendError(res, error);
  }
}

async function login(req, res) {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (error) {
    sendError(res, error);
  }
}

async function me(req, res) {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ user });
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = { register, login, me };