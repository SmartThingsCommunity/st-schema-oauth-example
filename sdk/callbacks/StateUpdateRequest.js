'use strict';

const rp = require('request-promise-native');
const STBase = require("../STBase");
const uuid = require('uuid/v4');

module.exports = class StateUpdateRequest extends STBase {

  constructor() {
    super('callback', uuid());
  }

  updateState(callbackUrl, callbackAccessToken, deviceState) {
    const options = {
      url: callbackUrl,
      method: 'POST',
      json: true,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: {
        headers: this.headers,
        authentication: {
          "tokenType": "Bearer",
          "token": callbackAccessToken
        },
        deviceState: deviceState
      }
    };

    return rp(options);
  }
}