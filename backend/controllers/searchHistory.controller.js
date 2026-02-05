const { success } = require("zod");
const SearchHistory = require("../models/SearchHistory.model");

const addSearchHistory = async (request, reply) => {
  try {
    const userId = request.user.userId; // coming from JWT middleware
    const {repoUrl, analysis } = request.body;

    if (!repoUrl) {
      return reply.code(400).send({ message: "Query is required" });
    }

    // 1️⃣ Insert new search
    await SearchHistory.create({
      user: userId,
      repoUrl,
      analysis,
    });

    // 2️⃣ Keep only latest 10 searches
    const latestIds = await SearchHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .distinct("_id");

    await SearchHistory.deleteMany({
      user: userId,
      _id: { $nin: latestIds },
    });

    // 3️⃣ Return updated history
    const history = await SearchHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    reply.code(201).send({
      message: "Search history updated",
      history,
    });
  } catch (error) {
    reply.code(500).send({ message: "Internal Server Error" });
  }
};

const getAllSearchHistory = async (request, reply) => {
  try {
    const userId = request.user.userId; // from JWT middleware

    const history = await SearchHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    reply.send({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    reply.code(500).send({ message: "Internal Server Error" });
  }
};

module.exports = { addSearchHistory, getAllSearchHistory };
