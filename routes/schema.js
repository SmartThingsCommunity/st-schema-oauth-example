const express = require('express');
const rp = require('request-promise-native');
const router = express.Router();
const _ = require("lodash");
const db = require('../lib/db');
const deviceService = require('../lib/devices');
const mapping = require('../lib/mapping');
const SchemaConnector = require("../lib/schema-connector")

const { partnerHelper, CommandResponse } = require("st-schema");
const stPartnerHelper = new partnerHelper({}, {});

const connector = new SchemaConnector()
  .clientId(process.env.ST_CLIENT_ID)
  .clientSecret(process.env.ST_CLIENT_SECRET)
  .discoveryHandler(async data => {
    const devices = (await db.getDevicesForToken(data.authentication.token)).map(device => {
      return {
        "externalDeviceId": device.externalId,
        "friendlyName": device.displayName,
        "deviceHandlerType": device.handlerType,
        "manufacturerInfo": {
          "manufacturerName": "SmartThings",
          "modelName": "Virtual Viper device",
          "hwVersion": "v1",
          "swVersion": "23.123.231"
        }
      }
    });
    return {
      "headers": {
        "schema": "st-schema",
        "version": "1.0",
        "interactionType": "discoveryResponse",
        "requestId": data.headers.requestId
      },
      "devices": devices
    };
  })
  .stateRefreshHandler(async data => {
    // TODO Check against devices in request ?
    const deviceState = (await db.getDevicesForToken(data.authentication.token)).map(device => {
      return {
        "externalDeviceId": device.externalId,
        "states": mapping.stRefreshStatesFor(device.states)
      }
    });

    return {
      "headers": {
        "schema": "st-schema",
        "version": "1.0",
        "interactionType": "stateRefreshResponse",
        "requestId": data.headers.requestId
      },
      "deviceState": deviceState
    }
  })
  .commandHandler(async data => {
    const ops = [];
    const response = new CommandResponse(data.headers.requestId);
    const account = await db.getAccountForToken(data.authentication.token);
    data.devices.map(async ({ externalDeviceId, deviceCookie, commands }) => {

      const device = response.addDevice(externalDeviceId, deviceCookie);
      stPartnerHelper.mapSTCommandsToState(device, commands);

      const states = mapping.externalStatesFor(commands);
      if (states) {
        ops.push(db.updateDeviceState(account.username, externalDeviceId, states));
        deviceService.updateProactiveState(account.username, externalDeviceId, states)
      }
    });

    await Promise.all(ops);

    return response;
  })
  .grantCallbackAccessHandler(async data => {
    const auth  = data.callbackAuthentication;
    if (auth.clientId === process.env.ST_CLIENT_ID ) {
      const options = {
        url: data.callbackUrls.oauthToken,
        method: 'POST',
        json: true,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: {
          "headers": {
            "schema": "st-schema",
            "version": "1.0",
            "interactionType": "accessTokenRequest",
            "requestId": data.headers.requestId
          },
          "callbackAuthentication": {
            "grantType": "authorization_code",
            "code": auth.code,
            "clientId": process.env.ST_CLIENT_ID,
            "clientSecret": process.env.ST_CLIENT_SECRET
          }
        }
      };

      const data = await rp(options);
      console.log('AUTH RESPONSE: ' + JSON.stringify(data, null, 2));

      db.setCallbackInfo(data.authentication.token, data.callbackAuthentication, data.callbackUrls)
    }
  })
  .integrationDeletedHandler(data => {
    db.removeToken(data.authentication.token);
    return {};
  })


router.post('/', async function (req, res) {
  console.log("REQUEST: %s", JSON.stringify(req.body, null, 2));
  connector.handleHttpCallback(req, res)
});

module.exports = router;
