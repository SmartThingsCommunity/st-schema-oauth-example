const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const deviceService = require('../lib/device-service');
const mapping = require('../lib/mapping');

/**
 * Primary devices page
 */
router.get('/', async (req, res) => {
  if (req.session.username) {
    res.render('devices/index');
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
    devices: devices
  })
});


/**
 * Handles device commands from devices page
 */
router.post('/command', async(req, res) => {
  const params = req.body;
  const externalStates = params.states;
  await db.updateDeviceState(params.username, params.externalId, externalStates);
  deviceService.updateProactiveState(params.username, params.externalId, externalStates);
  res.send({})
});


/**
 * Handles device creation requests from devices page
 */
router.post('/create', async(req, res) => {
  await db.addDevice(req.session.username, req.body.deviceType, req.body.displayName, mapping.statesForDeviceType(req.body.deviceType));

  res.redirect('/devices')
});


/**
 * Handles device deletion requests from devices page
 */
router.post('/delete', async(req, res) => {
  const deviceIds = Array.isArray(req.body.deviceIds) ? req.body.deviceIds : [req.body.deviceIds]
  const ops = deviceIds.map(id => {
    return db.deleteDevice(req.session.username, id)
  });

  await Promise.all(ops);
  res.redirect('/devices')
});


/**
 * Opens SSE stream to devices page
 */
router.get('/stream', deviceService.sse.init);

module.exports = router;