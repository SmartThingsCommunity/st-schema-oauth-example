'use strict';

const fetch = require('node-fetch');
const STBase = require("../STBase");
const uuid = require('uuid/v4');
const RefreshTokenRequest = require('./RefreshTokenRequest');
const doUpdateState = Symbol("private");

module.exports = class StateUpdateRequest extends STBase {

  constructor(clientId, clientSecret) {
    super('callback', uuid());
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  updateState0(callbackUrls, callbackAuth, deviceState, refreshedCallback) {
    return this[doUpdateState] (this, callbackUrls.stateCallback, callbackAuth.accessToken, deviceState).catch(async err => {
      if (refreshedCallback && err.statusCode === 401) {
        return new RefreshTokenRequest(this.clientId, this.clientSecret).getCallbackToken(
          callbackUrls.oauthToken,
          callbackAuth.refreshToken
        ).then(refreshResponse => {
          if (refreshedCallback) {
            refreshedCallback(refreshResponse.callbackAuthentication)
          }
          return this[doUpdateState] (this, callbackUrls.stateCallback, refreshResponse.callbackAuthentication.accessToken, deviceState)
        }).catch(err => {
          console.log(`${err.message} refreshing callback access token`)
        })
      } else {
        return new Promise((resolve, reject) => {
          reject(err)
        })
      }
    })
  }

  async updateState(callbackUrls, callbackAuth, deviceState, refreshedCallback) {
    try {
      await this[doUpdateState](this, callbackUrls.stateCallback, callbackAuth.accessToken, deviceState)
    }
    catch (err) {
      if (refreshedCallback && err.statusCode === 401) {
        const refreshResponse = await new RefreshTokenRequest(this.clientId, this.clientSecret).getCallbackToken(
          callbackUrls.oauthToken,
          callbackAuth.refreshToken
        );

        refreshedCallback(refreshResponse.callbackAuthentication);

        await this[doUpdateState](this, callbackUrls.stateCallback, refreshResponse.callbackAuthentication.accessToken, deviceState)
      }
      else {
        throw err;
      }
    }
  }

  [doUpdateState](self, callbackUrl, callbackAccessToken, deviceState) {
    const body = {
      headers: self.headers,
      authentication: {
        "tokenType": "Bearer",
        "token": callbackAccessToken
      },
      deviceState: deviceState
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(body)
    };

    return fetch(callbackUrl, options);
  }

};
