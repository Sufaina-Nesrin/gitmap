const { addSearchHistory, getAllSearchHistory } = require("../controllers/searchHistory.controller");

async function searchHistoryRoutes(fastify) {
  fastify.post(
    "/history",
    {
      preHandler: [fastify.authenticate], // JWT middleware
    },
    addSearchHistory
  );
  fastify.get(
  "/history",
  { preHandler: [fastify.authenticate] },
  getAllSearchHistory
);
}

module.exports = searchHistoryRoutes;
