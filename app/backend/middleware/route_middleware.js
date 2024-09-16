const { setGlobal } = require('../hooks/customHooks')
const authPlugin = {
  name: 'authPlugin',
  version: '1.0.0',
  register: async function (server, options) {
    server.ext('onPreHandler', async (request, h) => {
      if (process.env.EXPRESS_SESSION_SECRET === 'YES') {
        const publicRoutes = ['/login', '/acquire-token', '/redirect', '/logout']
        if (publicRoutes.includes(request.path)) {
          return h.continue
        }
        setGlobal('request', request)
        const isAuthenticated = request.yar.get('isAuthenticated')
        if (isAuthenticated) {
          return h.continue
        } else {
          return h.redirect('/login').takeover()
        }
      } else {
        return h.continue
      }
    })
  }
}

module.exports = authPlugin
