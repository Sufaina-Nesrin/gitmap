const {
  analyzeRepository,
  fetchGitHubFile,
  getRankedFiles,
} = require("../services");
const { getExecutionFlow } = require("./signal");
const { bucketFiles } = require("./utils");

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

  fastify.get("/analyze", async (req, reply) => {
  
    const { url } = request.query

    if (!url) return reply.code(400).send({ error: "url is required" });
    const ranked = await getRankedFiles(url, 300);

    const { whatToReadFirst, readNext, skipForNow } = bucketFiles(
      ranked.rankedFiles,
    );

    if (!whatToReadFirst.some((p) => p.toLowerCase().endsWith("readme.md"))) {
      const readme = ranked.rankedFiles.find((f) =>
        f.path.toLowerCase().endsWith("readme.md"),
      );
      if (readme) whatToReadFirst.unshift(readme.path);
    }
    return {
      repo: ranked.repo,
      primaryLanguage: ranked.primaryLanguage,
      framework: ranked.framework,
      whatToReadFirst,
      readNext,
      skipForNow,
      executionFlow: getExecutionFlow(ranked.framework),
    };
  });
}

module.exports = gitRoutes;
