'use strict';

const db = require('./db');
const mapping = require('./mapping');
const SSE = require('express-sse');
const {DiscoveryRequest, StateUpdateRequest} = require("st-schema");
const clientId = process.env.ST_CLIENT_ID;
const clientSecret = process.env.ST_CLIENT_SECRET;

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
  async updateProactiveState(username, externalDeviceId, externalStates, skipThisToken) {

    // Construct update message
    const externalDevice = await db.getDevice(username, externalDeviceId)
    const deviceState = [
      {
        externalDeviceId: externalDeviceId,
        states: mapping.stStatesFor(externalStates, externalDevice.states)
      }
    ];

    // Update web page
    this.sse.send(deviceState);

    // Update connector instances
    const stateUpdateRequest = new StateUpdateRequest(
      process.env.ST_CLIENT_ID,
      process.env.ST_CLIENT_SECRET
    );

    const callbacks = await db.getCallbacks(username);
    console.log(`${callbacks.length} CALLBACKS FOUND`);
    for (const it of callbacks) {
      if (it.access_token !== skipThisToken && it.callbackAuth && it.callbackUrls) {
        try {
          await stateUpdateRequest.updateState(it.callbackUrls, it.callbackAuth, deviceState, refreshedAuth => {
            db.refreshCallbackToken(it.access_token, refreshedAuth);
          });
        }
        catch(error) {
          console.log(`Error updating state: "${error}" ${it.callbackUrls.stateCallback} clientId: ${it.clientId} ${it.access_token} ${it.username}`)
        }
      }
    }
  },

  /**
   * Calls connectors when a new device has been added
   * @param username
   * @param device
   * @returns {Promise<void>}
   */
  async addDevice(username, device) {
    const deviceHandlerType = mapping.handlerType(device.deviceHandlerType);
    const callbacks = await db.getCallbacks(username);
    console.log(`${callbacks.length} CALLBACKS FOUND`);
    for (const it of callbacks) {
      if (it.callbackAuth && it.callbackUrls) {
        try {
          const discoveryRequest = new DiscoveryRequest(clientId, clientSecret);
          discoveryRequest.addDevice(device)

          await discoveryRequest.sendDiscovery(it.callbackUrls, it.callbackAuth, refreshedAuth => {
            db.refreshCallbackToken(it.access_token, refreshedAuth);
          });
          console.log(`Device added successfully ${it.callbackUrls.stateCallback} clientId: ${it.clientId}`)
        }
        catch(err) {
          console.log(`Error adding device: "${err}" ${it.callbackUrls.stateCallback} ${it.access_token}`)
        }
      }
    }
  },

  sse:  new SSE()
};
