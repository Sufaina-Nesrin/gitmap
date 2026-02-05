const fp = require("fastify-plugin");

async function jwtPlugin(fastify) {
  fastify.register(require("@fastify/cookie"));

  
  fastify.register(require("@fastify/jwt"), {
    secret: process.env.JWT_SECRET,
    cookie: {
      cookieName: "token", 
      signed: false,
    },
  });

  
  fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({
      message: "Unauthorized",
    });
  }
});

}

module.exports = fp(jwtPlugin);
