'use strict';

const rp = require('request-promise-native');
const db = require('./db');
const mapping = require('./mapping');
const SSE = require('express-sse');
const StateUpdateRequest = require("../sdk/callbacks/StateUpdateRequest");

module.exports = {

  /**
   * Queries for installations of connectors for the specified username and sends state updates to each of them
   *
   * @param username Username of account to send updates to
   * @param externalDeviceId Third-party ID of the device being updated
   * @param externalStates States being updated
   * @param skipThisToken Options access token to skip. Specifed when udates are from a command in that account, to
   * avoid race conditions updating the same account
   */
  updateProactiveState(username, externalDeviceId, externalStates, skipThisToken) {
    const stateUpdateRequest = new StateUpdateRequest(
      process.env.ST_CLIENT_ID,
      process.env.ST_CLIENT_SECRET
    );

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
