const express = require('express');
const rp = require('request-promise-native');
const router = express.Router();
const _ = require("lodash");
const db = require('../lib/db');
const deviceService = require('../lib/devices');
const mapping = require('../lib/mapping');
const SchemaConnector = require("../sdk/SchemaConnector")

const { partnerHelper } = require("st-schema");
const stPartnerHelper = new partnerHelper({}, {});

const connector = new SchemaConnector()
  .clientId(process.env.ST_CLIENT_ID)
  .clientSecret(process.env.ST_CLIENT_SECRET)

  .discoveryHandler(async (accessToken, response) => {
    for (const device of (await db.getDevicesForToken(accessToken))) {
      response.addDevice(device.externalId, device.displayName, device.handlerType)
    }
  })

  .stateRefreshHandler(async (accessToken, response) => {
    for (const device of (await db.getDevicesForToken(accessToken))) {
      response.addDevice(device.externalId, mapping.stRefreshStatesFor(device.states))
    }
  })

  .commandHandler(async (accessToken, response, devices) => {
    const account = await db.getAccountForToken(accessToken);
    const ops = devices.map(async ({ externalDeviceId, deviceCookie, commands }) => {
      const device = response.addDevice(externalDeviceId, null, deviceCookie);
      stPartnerHelper.mapSTCommandsToState(device, commands);
      const states = mapping.externalStatesFor(commands);
      deviceService.updateProactiveState(account.username, externalDeviceId, states)
      return db.updateDeviceState(account.username, externalDeviceId, states)
    });

    await Promise.all(ops);
  })

  .callbackAccessHandler(async (accessToken, callbackAuthentication, callbackUrls) => {
    db.setCallbackInfo(accessToken, callbackAuthentication, callbackUrls)
  })

  .integrationDeletedHandler(accessToken => {
    db.removeToken(accessToken)
  });


router.post('/', async function (req, res) {
  console.log("REQUEST: %s", JSON.stringify(req.body, null, 2));
  connector.handleHttpCallback(req, res)
});

module.exports = router;
