const msalConfig = {
  auth: {
    clientId: '80a2f40d-5361-4c67-9940-98ffb1230111',
    authority: 'https://login.microsoftonline.com/6f504113-6b64-43f2-ade9-242e05780007',
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
