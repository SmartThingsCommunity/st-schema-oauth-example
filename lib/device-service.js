'use strict';

const rp = require('request-promise-native');
const db = require('./db');
const mapping = require('./mapping');
const SSE = require('express-sse');
const StateUpdateRequest = require("../sdk/callbacks/StateUpdateRequest");

module.exports = {

  updateProactiveState(username, externalDeviceId, externalStates, skipThisToken) {
    const stateUpdateRequest = new StateUpdateRequest();

    const deviceState = [
      {
        externalDeviceId: externalDeviceId,
        states: mapping.stStatesFor(externalStates)
      }
    ];

    this.sse.send(deviceState);

    db.getCallbacks(username).then(callbacks => {
      for (const it of callbacks) {
        if (it.access_token !== skipThisToken && it.callbackAuth && it.callbackUrls) {
          stateUpdateRequest.updateState(it.callbackUrls, it.callbackAuth, deviceState, refreshedAuth => {
            db.refreshCallbackToken(it.access_token, refreshedAuth);
          });
        }
      }
    })
  },

  sse:  new SSE()
};
