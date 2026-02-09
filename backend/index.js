// server.js
require("dotenv").config();
const fastify = require("fastify")({ logger: true });
const connectDB = require("./db");

fastify.register(require("./plugins/jwt"));

fastify.register(require("@fastify/cors"), {
  origin: ["http://localhost:5173", process.env.FRONTEND_URL],
  credentials: true,
});

fastify.register(require("./routes/searchHistory.routes"), {
  prefix: "/api",
});
fastify.register(require("./routes/user.routes"), {
  prefix: "/api/auth",
});
fastify.register(require("./routes/repoAnalyser.routes"), {
  prefix: "/api",
});

const start = async () => {
  try {
    await connectDB(fastify);

    const PORT = process.env.PORT || 3000;

    await fastify.listen({
      port: PORT,
      host: "0.0.0.0",
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
