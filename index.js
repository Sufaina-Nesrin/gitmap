// server.js
const fastify = require('fastify')({ logger: true })

fastify.get('/', async (request, reply) => {
  return { message: 'Fastify is alive 🚀' }
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()