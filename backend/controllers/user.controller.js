const User = require("../models/User.model");
const { z } = require("zod");
const bcrypt = require("bcrypt");



const createUserSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});


const createUser = async (request, reply) => {
  try {
    const validatedData = createUserSchema.parse(request.body);

    const { email, password, username } = validatedData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return reply.code(409).send({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = await reply.jwtSign(
      {
        userId: user._id,
        username: user.username,
      },
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
    const validatedData = signInSchema.parse(request.body);
    const { email, password } = validatedData;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

   
    const token = await reply.jwtSign(
      {
        userId: user._id,
        username: user.username,
      },
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

const logout = async (request, reply) => {
  reply
    .clearCookie("token", {
      path: "/",         
      httpOnly: true,
      sameSite: "none",   
      secure: true,       
    })
    .send({
      success: true,
      message: "Logged out successfully",
    });
};

module.exports = { createUser, signInUser, logout };
