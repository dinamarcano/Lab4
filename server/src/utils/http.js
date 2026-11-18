function sendError(res, error) {
  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }
  if (error.code === "22P02") {
    return res.status(400).json({ message: "Identificador inválido" });
  }
  console.error(error);
  res.status(500).json({ message: "Error del servidor" });
}

module.exports = { sendError };