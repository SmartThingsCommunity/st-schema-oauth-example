(async function() {
  const db = require('../lib/db');
  const Account = require('../lib/account');
  const username = 'bob@florian.org';

  const step = 0;
  if (step < 1) {
    const account = new Account().initialize(username, 'smartthings');
    await db.addAccount(account)
  }

  const account = await db.getAccount(username);
  console.log('account = %j', account);

  const code = await db.addToken(username, 3600000);
  console.log('code = %s', code);

  const token = await db.redeemCode(code);
  console.log('%j', token);

  const id1 = await db.addDevice(username, 'c2c-switch','Switch', {switch: 'off'});
  const id2 = await db.addDevice(username, 'c2c-dimmer','Dimmer', {switch: 'off', switchLevel: 80});

  const devices = await db.getDevicesForToken(token.access_token);
  console.log('%j', devices);

  const d1 = await db.getDeviceForToken(token.access_token, id1);
  console.log('%j', d1);

  await db.updateDeviceState(username, id2, {switch: 'on', switchLevel: 30});
  const d2 = await db.getDeviceForToken(token.access_token, id2);
  console.log('%j', d2);

  await db.removeToken(token.access_token)


})();