const { analyzeRepository, fetchGitHubFile, getRankedFiles } = require("../services");

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

  fastify.get("/getRankFiles", async (request, reply) => {
    try {
      const { url, topN } = request.query;
      // const url = "https://github.com/shuup/shuup";
      // const topN = 10

      if (!url) {
        return reply.code(400).send({ error: "url query param is required" });
      }

      const result = await getRankedFiles(url, Number(topN) || 10);
      return reply.send(result);
    } catch (error) {
      return reply.code(500).send({
        error: "Failed to rank files",
        message: error.message,
      });
    }
  });
  
}

module.exports = gitRoutes;
