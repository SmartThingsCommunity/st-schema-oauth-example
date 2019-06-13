(async function() {
  const db = require('../lib/db');
  const Account = require('../lib/account');
  const username = 'bob@smartthings.com';

  const step = 0
  if (step < 1) {
    const account = new Account().initialize(username, 'smartthings');
    await db.addAccount(account)
  }

  const id1 = await db.addDevice(username, 'c2c-switch','Switch', {switch: 'off', online: true});
  const id2 = await db.addDevice(username, 'c2c-dimmer','Dimmer', {switch: 'off', brightness: 80, online: true})

})();