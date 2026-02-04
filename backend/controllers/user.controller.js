const User = require("../models/User.model");
const { z } = require("zod");
const bcrypt = require("bcrypt");

/* -------------------- Zod Schemas -------------------- */

const createUserSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/* -------------------- Controllers -------------------- */

const createUser = async (request, reply) => {
  try {
    // Validate request body
    const validatedData = createUserSchema.parse(request.body);

    const { email, password, username } = validatedData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return reply.code(409).send({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    // Generate JWT
    const token = await reply.jwtSign(
      { userId: user._id },
      { expiresIn: "7d" },
    );

    reply
      .setCookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      })

      .send({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
        },
      });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ errors: error.errors });
    }
    reply.code(500).send({ message: "Internal Server Error" });
  }
};

const signInUser = async (request, reply) => {
  try {
    // Validate request body
    const validatedData = signInSchema.parse(request.body);
    const { email, password } = validatedData;

    // Find user with password explicitly selected
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = await reply.jwtSign(
      { userId: user._id },
      { expiresIn: "7d" },
    );

    reply
      .setCookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      })

      .send({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
        },
      });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ errors: error.errors });
    }
    reply.code(500).send({ message: "Internal Server Error" });
  }
};

module.exports = { createUser, signInUser };
