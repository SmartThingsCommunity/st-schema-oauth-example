(async function() {
  const db = require('../lib/db');
  const Account = require('../lib/account');
  const username = 'bob@florian.org';

  const code = await db.addToken(username, 3600000);
  console.log('code = %s', code);

  let token = await db.redeemCode(code);
  console.log('%j', token);

  await db.setCallbackInfo(token.access_token, {accessToken: 'xxxx'}, {stateCallback: 'zzzz'});

  token = await db.refreshToken(token.refresh_token);
  console.log('%j', token);

  await db.removeToken(token.access_token)

})();