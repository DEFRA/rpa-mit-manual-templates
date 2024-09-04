const { setGlobal } = require('../hooks/custom_hook')
const authPlugin = {
  name: 'authPlugin',
  version: '1.0.0',
  register: async function (server, options) {
    server.ext('onPreHandler', async (request, h) => {
      if (process.env.AZURE_ALLOW == 'YES') {
        const publicRoutes = ['/login', '/acquire-token', '/redirect', '/logout']
        console.log('allow yes')
        if (publicRoutes.includes(request.path)) {
          return h.continue
        }
        setGlobal('request', request)
        const isAuthenticated = request.yar.get('isAuthenticated')
        console.log('isAuthenticated')
        console.log(isAuthenticated)
        if (isAuthenticated) {
          return h.continue
        } else {
          return h.redirect('/login').takeover()
        }
      } else {
        console.log('no')
        return h.continue
      }
    })
  }
}

module.exports = authPlugin
