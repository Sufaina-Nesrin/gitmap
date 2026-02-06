const {analyzerepo} = require('../controllers/repoAnalyser.controller');
const { getRankedFiles } = require('../services/repoAnalyser.services');

async function repoAnalyserRoutes(fastify) {
  
  fastify.get("/rank", async (req, reply) => {
  try {
    const { topN } = req.query;

     const url = "https://github.com/menacedjava/E-commerce-go"

    if (!url) {
      return reply.code(400).send({
        success: false,
        message: "url query param is required",
      });
    }

    const ranked = await getRankedFiles(url, Number(topN) || 15);

    return reply.send({
      success: true,
      repo: ranked.repo,
      primaryLanguage: ranked.primaryLanguage,
      totalFiles: ranked.totalFiles,
      rankedFiles: ranked.rankedFiles.map((f, i) => ({
        rank: i + 1,
        path: f.path,
        score: Number(f.score.toFixed(4)),
      })),
    });
  }catch (error) {
  console.error("Ranking error:", error);

  return reply.code(500).send({
    success: false,
    message: error.message,
    stack: error.stack,
  });
}

});



  fastify.post(
    "/analyze-repo",
    {
      preHandler: fastify.authenticate, 
    },
    analyzerepo
  );
}

module.exports = repoAnalyserRoutes;
