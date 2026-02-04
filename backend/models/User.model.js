const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // do not return password by default
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
    versionKey: false,
  },
);

// Prevent model overwrite in dev / hot-reload environments
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
