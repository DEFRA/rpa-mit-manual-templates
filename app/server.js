require('./insights').setup()
const Hapi = require('@hapi/hapi')
const Yar = require('@hapi/yar')
const authPlugin = require('./backend/middleware/route_middleware')
async function createServer () {
  const server = Hapi.server({
    port: 3000,
    host: '0.0.0.0'
  })

  await server.register({
    plugin: Yar,
    options: {
      storeBlank: false,
      cookieOptions: {
        password: 'the-password-must-be-at-least-32-characters-long',
        isSecure: false,
        isSameSite: false
      }
    }
  })
  await server.register(require('@hapi/inert'))
  await server.register(require('./plugins/views'))
  await server.register(require('./plugins/router'))
  await server.register(authPlugin)
  return server
}
module.exports = createServer
