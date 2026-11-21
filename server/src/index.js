require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");  

const app = express();
app.use(cors({ origin: (process.env.CLIENT_URL || "http://localhost:3000").split(",") }));
app.use(express.json());

const authRoutes = require("../src/routes/auth.routes");
app.use("/api/auth", authRoutes);

const storeRoutes = require("../src/routes/store.routes");
app.use("/api/store", storeRoutes);

const consumerRoutes = require("../src/routes/consumer.routes");
app.use("/api/consumer", consumerRoutes);

const deliveryRoutes = require("./routes/delivery.routes");
app.use("/api/delivery", deliveryRoutes);

app.get("/api/health", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ ok: true, time: result.rows[0].now });
});

if (require.main === module) {
  app.listen(process.env.PORT, () => {
    console.log(`Servidor en http://localhost:${process.env.PORT}`);
  });
}

module.exports = app;