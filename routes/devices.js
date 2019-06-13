const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const devices = require('../lib/devices');
const mapping = require('../lib/mapping');

/* GET home page. */
router.get('/', async (req, res) => {
  res.render('devices/index');
});

router.get('/viewData', async (req, res) => {
  const devices = req.session.username ? (await db.getDevices(req.session.username)) : [];
  res.send({
    username: req.session.username,
    devices: devices
  })
});

router.post('/command', async(req, res) => {
  const params = req.body;
  const externalStates = params.states;
  await db.updateDeviceState(params.username, params.externalId, externalStates);
  devices.updateProactiveState(params.username, params.externalId, externalStates);
  res.send({})
});

router.post('/create', async(req, res) => {
  await db.addDevice(req.session.username, req.body.deviceType, req.body.displayName, mapping.statesForDeviceType(req.body.deviceType));

  res.redirect('/devices')
});

router.post('/delete', async(req, res) => {
  const deviceIds = Array.isArray(req.body.deviceIds) ? req.body.deviceIds : [req.body.deviceIds]
  const ops = deviceIds.map(id => {
    return db.deleteDevice(req.session.username, id)
  });

  await Promise.all(ops);
  res.redirect('/devices')
});

router.get('/stream', devices.sse.init);

module.exports = router;