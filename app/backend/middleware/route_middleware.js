const { setGlobal } = require('../hooks/customHooks')
const authPlugin = {
  name: 'authPlugin',
  version: '1.0.0',
  register: async function (server, options) {
    server.ext('onPreHandler', async (request, h) => {
      const publicRoutes = ['/login', '/acquire-token', '/redirect', '/logout', '/healthz', '/healthy']
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
    })
  }
}

module.exports = authPlugin
