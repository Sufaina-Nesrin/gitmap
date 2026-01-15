const { analyzeRepository } = require("../services");

async function gitRoutes(fastify, options) {
  fastify.get("/", async (request, reply) => {
    const { url } = request.query;

    if (!url) {
      return reply.code(400).send({ error: "url query param is required" });
    }

    const result = await analyzeRepository(url);
    return result;
  });
}

module.exports = gitRoutes;
