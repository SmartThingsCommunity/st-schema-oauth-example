'use strict';

const db = require('./db');
const mapping = require('./mapping');
const {SchemaConnector} = require('st-schema');

/**
 * ST Schema Connector
 */
const apiEndpoint = `${process.env.SERVER_URL}/devices/command`
const clientId = process.env.ST_CLIENT_ID
const clientSecret = process.env.ST_CLIENT_SECRET
const connector = new SchemaConnector()
  .clientId(clientId)
  .clientSecret(clientSecret)
  .enableEventLogging(2)

  .discoveryHandler(async (accessToken, response) => {
    for (const device of (await db.getDevicesForToken(accessToken))) {
      const d = response.addDevice(device.externalId, device.displayName, mapping.handlerType(device.handlerType, clientId));
      d.manufacturerName('STS');
      d.modelName(device.handlerType);
    }
  })

  .stateRefreshHandler(async (accessToken, response, data) => {
    const externalDeviceIds = data.devices.map(it => {return it.externalDeviceId})
    for (const device of (await db.getDevicesForToken(accessToken))) {
      if (externalDeviceIds.includes(device.externalId)) {
        response.addDevice(device.externalId, mapping.stStatesFor(device.states))
      }
    }
  })

  .commandHandler(async (accessToken, response, devices) => {
    const account = await db.getAccountForToken(accessToken);
    const ops = devices.map(async ({ externalDeviceId, deviceCookie, commands }) => {

      const externalDevice = await db.getDevice(account.username, externalDeviceId)
      const externalStates = mapping.externalStatesFor(commands);
      const stStates = mapping.stStatesFor(externalStates, externalDevice.states);
      response.addDevice(externalDeviceId, stStates, deviceCookie);

      deviceService.updateProactiveState(account.username, externalDeviceId, externalStates, accessToken);
      return db.updateDeviceState(account.username, externalDeviceId, externalStates)
    });

    await Promise.all(ops);
  })

  .callbackAccessHandler(async (accessToken, callbackAuthentication, callbackUrls) => {
    await db.setCallbackInfo(accessToken, callbackAuthentication, callbackUrls);
    console.log('CALLBACK ACCESS GRANTED')
  })

  .integrationDeletedHandler(async accessToken => {
    await db.removeToken(accessToken)
  });

module.exports = connector;
