const routes = [].concat(
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/app_routes'),
  require('../routes/static')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
