'use strict';

const rp = require('request-promise-native');
const STBase = require("../STBase");
const uuid = require('uuid/v4');

module.exports = class RefreshTokenResponse extends STBase {

  constructor() {
    super('refreshAccessTokens', uuid());
  }

  getCallbackToken(url, clientId, clientSecret, refreshToken) {
    const options = {
      url: url,
      method: 'POST',
      json: true,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: {
        headers: this.headers,
        callbackAuthentication: {
          grantType: "refresh_token",
          refreshToken: refreshToken,
          clientId: clientId,
          clientSecret: clientSecret
        }
      }
    };

    return rp(options);
  }
}