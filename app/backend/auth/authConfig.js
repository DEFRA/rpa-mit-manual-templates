const msalConfig = {
  auth: {
    clientId: '80a2f40d-5361-4c67-9940-98ffb1230111',
    authority: process.env.CLOUD_INSTANCE + process.env.TENANT_ID,
    clientSecret: process.env.CLIENT_SECRET
  },
  system: {
    loggerOptions: {
      loggerCallback (loglevel, message, containsPii) {
      },
      piiLoggingEnabled: false,
      logLevel: 3
    }
  }
}

const REDIRECT_URI = process.env.REDIRECT_URI
const POST_LOGOUT_REDIRECT_URI = process.env.POST_LOGOUT_REDIRECT_URI
const GRAPH_ME_ENDPOINT = process.env.GRAPH_API_ENDPOINT + 'v1.0/me'

module.exports = {
  msalConfig,
  REDIRECT_URI,
  POST_LOGOUT_REDIRECT_URI,
  GRAPH_ME_ENDPOINT
}
