require('./insights').setup()
const Hapi = require('@hapi/hapi')
const Yar = require('@hapi/yar');

async function createServer () {
  const server = Hapi.server({
    port: 54280
  })
  
  await server.register({
    plugin: Yar,
    options: {
        storeBlank: false,
        cookieOptions: {
            password: 'the-password-must-be-at-least-32-characters-long',
            isSecure: false
        }
    }
  });
  await server.register(require('@hapi/inert'))
  await server.register(require('./plugins/views'))
  await server.register(require('./plugins/router'))

  return server
}
module.exports = createServer
