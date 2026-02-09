const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    repoUrl: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    analysis: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

searchHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
