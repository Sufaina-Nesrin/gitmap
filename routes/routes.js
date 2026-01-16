const { analyzeRepository, fetchGitHubFile } = require("../services");

async function gitRoutes(fastify, options) {
  fastify.get("/hello", async (request, reply) => {
    const { url } = request.query;

    if (!url) {
      return reply.code(400).send({ error: "url query param is required" });
    }

    // const result = await analyzeRepository(url);
    const result = await fetchGitHubFile(url);
    return result;
  });
}

module.exports = gitRoutes;
