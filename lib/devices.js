'use strict';

const rp = require('request-promise-native');
const db = require('./db');
const mapping = require('./mapping');
const SSE = require('express-sse');
const connector = require('./connector');

module.exports = {

  async updateProactiveState(username, externalDeviceId, externalStates) {
    const deviceState = [
      {
        externalDeviceId: externalDeviceId,
        states: mapping.stStatesFor(externalStates)
      }
    ];

    this.sse.send(deviceState);

    const callbacks = await db.getCallbacks(username);
    for (const it of callbacks) {
      if (it.callbackAuth && it.callbackUrls) {
        connector.updateState(it.callbackUrls, it.callbackAuth, deviceState)
      }
    }
  },

  sse:  new SSE()
};
