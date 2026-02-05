const mongoose = require("mongoose");

const connectDB = async (fastify) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    fastify.log.info("MongoDB connected successfully");
  } catch (err) {
    console.log("mongodbii", err?.message)
    fastify.log.error("MongoDB connection failed:", err?.message);
    process.exit(1);
  }
};

module.exports = connectDB;
