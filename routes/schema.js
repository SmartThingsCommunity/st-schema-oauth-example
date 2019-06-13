const express = require('express');
const rp = require('request-promise-native');
const router = express.Router();
const _ = require("lodash");
const db = require('../lib/db');
const deviceService = require('../lib/devices');
const mapping = require('../lib/mapping');

const { partnerHelper, CommandResponse } = require("st-schema");
const stPartnerHelper = new partnerHelper({}, {});

router.post('/', async function (req, res) {
  console.log("REQUEST: %s", JSON.stringify(req.body, null, 2));

  let response;
  const {headers, authentication, devices} = req;
  const {interactionType1, requestId} = headers;
  const interactionType = req.body.headers.interactionType;

  try {
    switch (interactionType) {
      case "discoveryRequest":
        response = await discoveryRequest(req);
        break;
      case "commandRequest":
        response = await commandRequest(req);
        break;
      case "stateRefreshRequest":
        response = await stateRefreshRequest(req);
        break;
      case "grantCallbackAccess":
        response = await grantCallbackAccess(req);
        break;
      case "integrationDeleted":
        response = await integrationDeletedRequest(req);
        break;
      default:
        response = "ERROR. Unsupported interactionType: " + interactionType;
        console.log(response);
        break;
    }
  } catch (ex) {
    console.log("failed with ex", ex)
  }

  console.log("RESPONSE: %s", JSON.stringify(response, null, 2));
  res.send(response);
});

async function discoveryRequest(request) {
  const devices = (await db.getDevicesForToken(request.body.authentication.token)).map(device => {
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
  const resp = {
    "headers": {
      "schema": "st-schema",
      "version": "1.0",
      "interactionType": "discoveryResponse",
      "requestId": request.body.headers.requestId
    },
    "devices": devices
  };
  return resp
}

function integrationDeletedRequest(request) {
  db.removeToken(request.body.authentication.token);
  return {};
}

async function commandRequest(request) {
  const ops = [];
  const response = new CommandResponse(request.body.headers.requestId);
  const account = await db.getAccountForToken(request.body.authentication.token);
  request.body.devices.map(async ({ externalDeviceId, deviceCookie, commands }) => {

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
}

async function stateRefreshRequest(request) {
  // TODO Check against devices in request ?
  const deviceState = (await db.getDevicesForToken(request.body.authentication.token)).map(device => {
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
      "requestId": request.body.headers.requestId
    },
    "deviceState": deviceState
  }
}

async function grantCallbackAccess(request) {
  const auth  = request.body.callbackAuthentication;
  if (auth.clientId === process.env.ST_CLIENT_ID ) {
    const options = {
      url: request.body.callbackUrls.oauthToken,
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
          "requestId": request.body.headers.requestId
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

    db.setCallbackInfo(request.body.authentication.token, data.callbackAuthentication, request.body.callbackUrls)
  }
  return {};
}

module.exports = router;
