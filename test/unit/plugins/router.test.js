const appRoutes = require('../../../app/routes/app_routes')
const staticRoutes = require('../../../app/routes/static')

const router = require('../../../app/plugins/router')


describe('router plugin', () => {
  test('should register routes when register is called', () => {
    const mockServer = {
      route: jest.fn()
    }

    router.plugin.register(mockServer)

    expect(mockServer.route).toHaveBeenCalledWith(
      [].concat(appRoutes, staticRoutes)
    )
  })
})
