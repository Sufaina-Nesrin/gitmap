const { success } = require("zod");
const SearchHistory = require("../models/SearchHistory.model");

const addSearchHistory = async (request, reply) => {
  try {
    const userId = request.user.userId; 
    const {repoUrl, analysis } = request.body;

    if (!repoUrl) {
      return reply.code(400).send({ message: "Query is required" });
    }


    await SearchHistory.create({
      user: userId,
      repoUrl,
      analysis,
    });


    const latestIds = await SearchHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .distinct("_id");

    await SearchHistory.deleteMany({
      user: userId,
      _id: { $nin: latestIds },
    });


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
    const userId = request.user.userId; 

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
