const { analyzerepo } = require("../controllers/repoAnalyser.controller");
const { getRankedFiles } = require("../services/repoAnalyser.services");

async function repoAnalyserRoutes(fastify) {
  fastify.post(
    "/analyze-repo",
    {
      preHandler: fastify.authenticate,
    },
    analyzerepo,
  );
}

module.exports = repoAnalyserRoutes;
