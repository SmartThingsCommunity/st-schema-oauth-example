'use strict';

const rp = require('request-promise-native');
const
  STBase = require("../STBase");
module.exports = class AccessTokenResponse extends STBase {

  constructor(requestId) {
    super('accessTokenRequest', requestId);
  }

  getCallbackToken(url, clientId, clientSecret, code) {
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
          grantType: "authorization_code",
          code: code,
          clientId: clientId,
          clientSecret: clientSecret
        }
      }
    };

    return rp(options);
  }
};