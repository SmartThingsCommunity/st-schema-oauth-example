(async function() {
  const db = require('../../lib/db');
  const deviceService = require('../../lib/device-service');
  const username = 'bob@florian.org';

  const externalId = '0bc738ac-e2a4-4984-9d45-0ca556579370'
  const state = {switch: 'off'}
  await deviceService.updateProactiveState(username, externalId, state)

})();