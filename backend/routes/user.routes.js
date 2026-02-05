const {createUser, signInUser, logout} = require('../controllers/user.controller')

async function userRoutes(fastify) {
  fastify.post("/signup", createUser);
  fastify.post("/signin", signInUser);
  fastify.post("/logout", logout)
  fastify.get(
  "/me",
  { preHandler: fastify.authenticate },
  async (req, reply) => {
    console.log(req)
    reply.send({ user: req.user });
  }
);

}

module.exports = userRoutes;
