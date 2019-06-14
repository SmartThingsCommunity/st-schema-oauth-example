'use strict';

const rp = require('request-promise-native');
const db = require('./db');
const mapping = require('./mapping');
const SSE = require('express-sse');
const uuid = require('uuid/v4');
const SchemaConnector = require("../sdk/SchemaConnector")
const RefreshTokenRequest = require("../sdk/callbacks/RefreshTokenRequest")

module.exports = {

  async updateProactiveState(username, externalDeviceId, externalStates) {
    const deviceState = [
      {
        externalDeviceId: externalDeviceId,
        states: mapping.stStatesFor(externalStates)
      }
    ];

    const callbacks = await db.getCallbacks(username);
    for (const it of callbacks) {
      if (it.callbackAuth && it.callbackUrls) {

        this.sse.send(deviceState);

        try {
          await updateState(it.callbackAuth.accessToken, it.callbackUrls.stateCallback, deviceState);
        }
        catch (err) {
          if (err.statusCode === 401) {
            console.log("PROACTIVE TOKEN EXPIRED")
            const refreshResponse = await (new RefreshTokenRequest().getCallbackToken(
              it.callbackUrls.oauthToken,
              process.env.ST_CLIENT_ID,
              process.env.ST_CLIENT_SECRET,
              it.callbackAuth.refreshToken));

            db.refreshCallbackToken(it.access_token, refreshResponse.callbackAuthentication)

            console.log('RETRYING...')
            updateState(refreshResponse.callbackAuthentication.accessToken, it.callbackUrls.stateCallback, deviceState)
          }
          else {
            console.log(err)
          }
        }
      }
    }
    //return Promise.all(ops.filter(it => {return it != null}))
  },

  sse:  new SSE()
};

function updateState(accessToken, callbackUrl, deviceState) {
  const callbackRequest = {
    "headers": {
      "schema": "st-schema",
      "version": "1.0",
      "interactionType": "callback",
      "requestId": uuid()
    },
    "authentication": {
      "tokenType": "Bearer",
      "token": accessToken
    },
    "deviceState": deviceState
  };

  const options = {
    url: callbackUrl,
    method: 'POST',
    json: true,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: callbackRequest
  };

  return rp(options)
}