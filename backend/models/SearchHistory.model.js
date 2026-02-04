const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    query: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for fast recent-history lookup
searchHistorySchema.index({ user: 1, createdAt: -1 });

module.exports =
  mongoose.models.SearchHistory ||
  mongoose.model("SearchHistory", searchHistorySchema);
