'use strict';

const rp = require('request-promise-native');
const db = require('./db');
const mapping = require('./mapping');
const SSE = require('express-sse');
const uuid = require('uuid/v4');

module.exports = {

  async updateProactiveState(username, externalDeviceId, externalStates) {
    const deviceState = [
      {
        externalDeviceId: externalDeviceId,
        states: mapping.stStatesFor(externalStates)
      }
    ];

    const callbacks = await db.getCallbacks(username);
    const ops = callbacks.map(async it => {

      const callbackResponse = {
        "headers": {
          "schema": "st-schema",
          "version": "1.0",
          "interactionType": "callback",
          "requestId": uuid()
        },
        "authentication": {
          "tokenType": "Bearer",
          "token": it.callbackAuth.accessToken
        },
        "deviceState": deviceState
      };

      const options = {
        url: it.callbackUrls.stateCallback,
        method: 'POST',
        json: true,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: callbackResponse
      };

      this.sse.send(deviceState);

      return rp(options)
    });
    return Promise.all(ops)
  },

  sse:  new SSE()
};