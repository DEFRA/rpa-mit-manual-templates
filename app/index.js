require('dotenv').config()
const createServer = require('./server')
const init = async () => {
  const server = await createServer()
  await server.start()
}

process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})

init()
