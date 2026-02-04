// server.js
require("dotenv").config();
const fastify = require("fastify")({ logger: true });
const connectDB = require("./db");

fastify.register(require("./plugins/jwt"));

fastify.register(require("@fastify/cors"), {
  origin: "http://localhost:5173",
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

    await fastify.listen({ port: 3000, host: "localhost" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
