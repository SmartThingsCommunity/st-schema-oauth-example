const express = require('express');
const router = express.Router();
const _ = require("underscore");
const db = require('../lib/db');
const Account = require('../lib/account');

const clientId = process.env.CLIENT_ID || "dummy-client-id";
const clientSecret = process.env.CLIENT_SECRET || "dummy-client-secret";
const permittedRedirectUrls = (process.env.PERMITTED_REDIRECT_URLS ?
  `${process.env.SERVER_URL}/redirect,${process.env.PERMITTED_REDIRECT_URLS}` :
  `${process.env.SERVER_URL}/redirect,https://c2c-us.smartthings.com/oauth/callback,https://c2c-eu.smartthings.com/oauth/callback,https://c2c-ap.smartthings.com/oauth/callback`)
  .split(',');

let redirect_uri;

/**
 * OAuth login page displayed by ST mobile app
 */
router.get('/login', authRequestHandler);


/**
 * Processes OAuth logins
 */
router.get("/login-as", async (req, res) => {
  let account = await db.getAccount(req.query.email);
  if ((account && !account.passwordMatches(req.query.password)) || (req.query.signin && !account)) {

    // Render error message for bad password or signing to non-existant account
    res.render('oauth/login', {
      query: req.query,
      errorMessage: 'Invalid username and password'
    });
  } else if (!account) {
    // New registration, need to create devices
    account = new Account().initialize(req.query.email, req.query.password)
    await db.addAccount(account);
    req.session.oauth = true;
    req.session.username = req.query.email;
    res.redirect('/devices')
  } else {
    req.session.username = req.query.email;
    req.session.expires_in = req.query.expires_in
    const devices = await db.getDevices(req.session.username)
    if (devices && devices.length > 0) {
      authRedirect(req, res)
    } else {
      req.session.oauth = true;
      res.redirect('/devices')
    }
  }


});

/**
 * Does OAuth redirect at the end of new account creation from OAuth journey
 */
router.get("/redirect", async (req, res) => {
  authRedirect(req, res)
});

/**
 * Processes redemption of OAuth codes and refresh tokens
 */
router.post('/token', async (req, res) => {
  if (validateAccessTokenRequest(req, res)) {
    let code = null;
    let token = null;
    if (req.body.grant_type === 'refresh_token') {
      token = await db.refreshToken(req.body.refresh_token)
    } else if (req.body.grant_type === 'authorization_code'){
      token = await db.redeemCode(req.body.code)
    }

    if (token) {
      res.send(token)
    }
    else {
      res.status(401).send('Invalid grant type')
    }
  }
  res.end()
});


function now() {
  return Math.round(new Date().valueOf() / 1000)
}

function errorMsg(descr, expected, actual) {
  return "expected " + descr + ": " + expected + ", actual: " + actual
}

function validateAccessTokenRequest(req, res) {
  let success = true, msg;

  if (req.body.client_secret !== clientSecret) {
    msg = `Invalid clientSecret, received ${req.body.client_secret}`;
    success = false
  }
  else if (req.body.client_id !== clientId) {
    msg = `Invalid clientId, received ${req.body.client_secret} expected ${clientId}`;
    success = false
  }

  return success
}

function validateAuthPageRequest(req, res) {
  const errorMessages = [];
  if (req.query.client_id !== clientId) {
    errorMessages.push(`Invalid client_id, received '${req.query.client_id}'`)
  }

  if (req.query.response_type !== "code") {
    errorMessages.push( `Invalid response type, received '${req.query.response_type}' expected 'code'`)
  }

  if (!(permittedRedirectUrls.includes(req.query.redirect_uri))) {
    errorMessages.push(`Invalid redirect_uri, received '${req.query.redirect_uri}' expected one of ${permittedRedirectUrls.join(', ')}`)
  }

  if (errorMessages.length > 0) {
    res.status(401);
    res.render('oauth/invalidauth', {
      errorMessages: errorMessages
    });
    return false
  }
  return true
}

function authRequestHandler(req, res) {
  if (validateAuthPageRequest(req, res)) {
    req.session.redirect_uri = req.query.redirect_uri;
    redirect_uri = req.query.redirect_uri;
    if (req.query.state) {
      req.session.client_state = req.query.state
    }
    res.render('oauth/login', {
      query: req.query,
      errorMessage: ''
    })
  }
}

async function authRedirect(req, res) {
  const code = await db.addToken(req.session.username, 84600);
  let redirectUri = req.session.redirect_uri;
  let location = `${redirectUri}${redirectUri.includes('?') ? '&' : '?'}code=${code}`;
  if (req.session.client_state) {
    location += "&state=" + req.session.client_state
  }
  res.writeHead(307, {"Location": location});
  res.end()
}

module.exports = router;
