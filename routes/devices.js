const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const deviceService = require('../lib/device-service');
const mapping = require('../lib/mapping');
const {DiscoveryDevice} = require("st-schema");
/**
 * Primary devices page
 */
router.get('/', async (req, res) => {
  if (req.session.username) {
    res.render('devices/index', {
      redirectButton: req.session.oauth
    });
  }
  else {
    res.redirect('/login')
  }
});

/**
 * Returns view model data for the devices page
 */
router.get('/viewData', async (req, res) => {
  const devices = req.session.username ? (await db.getDevices(req.session.username)) : [];
  res.send({
    username: req.session.username,
    devices: devices,
    deviceTypes: mapping.deviceTypeNames()
  })
});

/**
 * Handles device commands from devices page
 */
router.post('/command', async(req, res) => {
  const params = req.body;
  const externalStates = params.states;
  if ('temperatureScale' in externalStates) {
    const allStates = (await db.getDevice(params.username, params.externalId)).states;
    if (allStates.temperatureScale !== externalStates.temperatureScale) {
      const newStates = {temperatureScale: externalStates.temperatureScale}
      for (const name of Object.keys(allStates)) {
        if (mapping.isTemperatureAttribute(name)) {
          newStates[name] = convertTemperature(allStates[name], allStates.temperatureScale || 'F', externalStates.temperatureScale)
        }
      }
      await db.updateDeviceState(params.username, params.externalId, newStates);
      await deviceService.updateProactiveState(params.username, params.externalId, newStates);
    } else {
      await db.updateDeviceState(params.username, params.externalId, externalStates);
    }
  } else {
    await db.updateDeviceState(params.username, params.externalId, externalStates);
    await deviceService.updateProactiveState(params.username, params.externalId, externalStates);
  }
  res.send({})
});

/**
 * Handles device creation requests from devices page
 */
router.post('/create', async(req, res) => {
  const deviceType = mapping.deviceTypeForName(req.body.deviceType);
  const device = await db.addDevice(req.session.username, deviceType.type, req.body.displayName, deviceType.states);
  const discoveryDevice = new DiscoveryDevice(device.externalId, device.displayName, device.handlerType)
    .manufacturerName('Example ST Schema Connector')
    .modelName(device.handlerType);
  deviceService.addDevice(req.session.username, discoveryDevice)
  res.send(device)
});

/**
 * Handles device deletion requests from devices page
 */
router.post('/delete', async(req, res) => {
  const deviceIds = req.body.deviceIds;
  const ops = deviceIds.map(id => {
    return db.deleteDevice(req.session.username, id)
  });
  await Promise.all(ops);
  res.send({count: deviceIds.length, items: deviceIds})
});

/**
 * Opens SSE stream to devices page
 */
router.get('/stream', deviceService.sse.init);

module.exports = router;

function convertTemperature(temperature, fromUnit, toUnit) {
  if (fromUnit === toUnit) {
    return temperature;
  }
  if (toUnit === 'C') {
    // Convert F to C, in half degrees
    return Math.round(10 * (temperature - 32) / 9) / 2
  }
  // Convert C to F, in full degrees
  return Math.round((9 * temperature / 5) + 32)
}

function injectTemperatureScale(devices) {
  for (const device of devices) {
    if (mapping.missingTemperatureScale(device.states)) {
      device.states.temperatureScale = 'F';
    }
  }
  return devices;
}
