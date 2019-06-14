'use strict';

const rp = require('request-promise-native');
const STBase = require("../STBase");
const uuid = require('uuid/v4');

module.exports = class StateUpdateRequest extends STBase {

  constructor(clientId, clientSecret) {
    super('callback', uuid());
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  updateState(callbackUrls, callbackAuth, deviceState, refreshedCallback) {
    return updateState(this, callbackUrls.stateCallback, callbackAuth.accessToken, deviceState).catch (err => {
      if (err.statusCode === 401) {
        const refreshResponse = await (new RefreshTokenRequest().getCallbackToken(
          callbackUrls.oauthToken,
          this.clientId,
          this.clientSecret,
          callbackAuth.refreshToken));

        if (refreshedCallback) {
           refreshedCallback(callbackAuthentication)
        }

        return updateState(this, refreshResponse.callbackAuthentication.accessToken, it.callbackUrls.stateCallback, deviceState)
      }
      else {
        return new Promise((resolve, reject) => {
          reject(err)
        })
      }
    })
  }
};

function updateState(self, callbackUrl, callbackAccessToken, deviceState) {
  const options = {
    url: callbackUrl,
    method: 'POST',
    json: true,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: {
      headers: self.headers,
      authentication: {
        "tokenType": "Bearer",
        "token": callbackAccessToken
      },
      deviceState: deviceState
    }
  };

  return rp(options);
}