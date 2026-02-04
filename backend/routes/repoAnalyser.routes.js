const {analyzerepo} = require('../controllers/repoAnalyser.controller')
async function repoAnalyserRoutes(fastify) {
  fastify.post(
    "/analyze-repo",
    {
      preHandler: fastify.authenticate, 
    },
    analyzerepo
  );
}

module.exports = repoAnalyserRoutes;
