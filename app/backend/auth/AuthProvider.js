const msal = require('@azure/msal-node');
const axios = require('axios');
const { msalConfig,REDIRECT_URI,POST_LOGOUT_REDIRECT_URI} = require('./authConfig');

class AuthProvider {
    constructor(msalConfig) {
        this.msalConfig = msalConfig;
        this.cryptoProvider = new msal.CryptoProvider();
    }

    getMsalInstance() {
        return new msal.ConfidentialClientApplication(this.msalConfig);
    }

    async login(request, h) {
        const state = this.cryptoProvider.base64Encode(
            JSON.stringify({
                successRedirect: '/',
            })
        );

        const authCodeUrlRequestParams = {
            state: state,
            scopes: [],
            redirectUri: REDIRECT_URI,
        };

        if (!this.msalConfig.auth.cloudDiscoveryMetadata || !this.msalConfig.auth.authorityMetadata) {
            const [cloudDiscoveryMetadata, authorityMetadata] = await Promise.all([
                this.getCloudDiscoveryMetadata(this.msalConfig.auth.authority),
                this.getAuthorityMetadata(this.msalConfig.auth.authority),
            ]);

            this.msalConfig.auth.cloudDiscoveryMetadata = JSON.stringify(cloudDiscoveryMetadata);
            this.msalConfig.auth.authorityMetadata = JSON.stringify(authorityMetadata);
        }

        const msalInstance = this.getMsalInstance();

        const { verifier, challenge } = await this.cryptoProvider.generatePkceCodes();

        request.yar.set({
            pkceCodes: {
                challengeMethod: 'S256',
                verifier: verifier,
                challenge: challenge,
            },
            authCodeUrlRequest: {
                ...authCodeUrlRequestParams,
                responseMode: msal.ResponseMode.FORM_POST,
                codeChallenge: challenge,
                codeChallengeMethod: 'S256',
            },
            authCodeRequest: {
                ...authCodeUrlRequestParams,
                code: '',
            },
        });

        try {
            const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(request.yar.get('authCodeUrlRequest'));
            return h.redirect(authCodeUrlResponse);
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    async acquireToken(request, h) {
        try {
            const msalInstance = this.getMsalInstance();

            if (request.yar.get('tokenCache')) {
                msalInstance.getTokenCache().deserialize(request.yar.get('tokenCache'));
            }

            const tokenResponse = await msalInstance.acquireTokenSilent({
                account: request.yar.get('account'),
                scopes: ['User.Read'],
            });

            request.yar.set({
                tokenCache: msalInstance.getTokenCache().serialize(),
                accessToken: tokenResponse.accessToken,
                idToken: tokenResponse.idToken,
                account: tokenResponse.account,
            });

            return h.redirect('/');
        } catch (error) {
            if (error instanceof msal.InteractionRequiredAuthError) {
                return this.login(request, h);
            }
            throw error;
        }
    }

    async handleRedirect(request, h) {
        if (!request.payload || !request.payload.state) {
            throw new Error('Error: response not found');
        }

        const authCodeRequest = {
            ...request.yar.get('authCodeRequest'),
            code: request.payload.code,
            codeVerifier: request.yar.get('pkceCodes').verifier,
        };

        try {
            const msalInstance = this.getMsalInstance();

            if (request.yar.get('tokenCache')) {
                msalInstance.getTokenCache().deserialize(request.yar.get('tokenCache'));
            }

            const tokenResponse = await msalInstance.acquireTokenByCode(authCodeRequest);

            request.yar.set({
                accessToken: tokenResponse.accessToken,
                tokenCache: msalInstance.getTokenCache().serialize(),
                idToken: tokenResponse.idToken,
                account: tokenResponse.account,
                isAuthenticated: true,
            });

            const state = JSON.parse(this.cryptoProvider.base64Decode(request.payload.state));
            return h.redirect(state.successRedirect);
        } catch (error) {
            throw error;
        }
    }

    async logout(request, h) {
        let logoutUri = `${this.msalConfig.auth.authority}/oauth2/v2.0/`;

        if (POST_LOGOUT_REDIRECT_URI) {
            logoutUri += `logout?post_logout_redirect_uri=${POST_LOGOUT_REDIRECT_URI}`;
        }

        request.yar.clear();
        return h.redirect(logoutUri);
    }

    async getCloudDiscoveryMetadata(authority) {
        const endpoint = 'https://login.microsoftonline.com/common/discovery/instance';

        try {
            const response = await axios.get(endpoint, {
                params: {
                    'api-version': '1.1',
                    'authorization_endpoint': `${authority}/oauth2/v2.0/authorize`,
                },
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getAuthorityMetadata(authority) {
        const endpoint = `${authority}/v2.0/.well-known/openid-configuration`;

        try {
            const response = await axios.get(endpoint);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

const authProvider = new AuthProvider(msalConfig);

module.exports = authProvider;
