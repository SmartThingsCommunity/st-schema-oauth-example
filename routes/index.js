var express = require('express');
var router = express.Router();
const db = require('../lib/db');
const Account = require('../lib/account');

/**
 * Home page
 */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'ST Schema Example with OAuth',
    targetURL: `${process.env.SERVER_URL}/schema`,
    authorizationUri: `${process.env.SERVER_URL}/oauth/login`,
    refreshTokenUrl: `${process.env.SERVER_URL}/oauth/token`,
    clientId: process.env.CLIENT_ID,
    clientSecret: 'xxxx',

  });
});

/**
 * Page for testing OAuth redirects
 */
router.get('/redirect', function(req, res, next) {
  res.render('redirect', {
    headers: JSON.stringify(req.headers, null, 2),
    query: JSON.stringify(req.query, null, 2)
  });
});

/**
 * Website login page
 */
router.get('/login', function(req, res, next) {
  res.render('login', {
    errorMessage: '',
    infoMessage: ''
  });
});

/**
 * Website logout page
 */
router.get('/logout', function(req, res, next) {
  req.session.destroy(err => {
    res.redirect('/login')
  })
});

/**
 * Processes website logins
 */
router.post("/login-as", async (req, res) => {

  if (!req.body.email) {
    res.render('login', {
      infoMessage: 'Enter email address and password and click "Create New Account"',
      errorMessage: ''
    });
  }
  else {
    let account = await db.getAccount(req.body.email)
    if ((account && !account.passwordMatches(req.body.password)) || (req.body.signin && !account)) {

      // Render error message for bad password or signing to non-existant account
      res.render('login', {
        errorMessage: 'Invalid username and password',
        infoMessage: ''
      });
      return;

    } else if (!account) {

      // New registration
      account = new Account().initialize(req.body.email, req.body.password)
      await db.addAccount(account)
    }

    req.session.username = req.body.email

    res.redirect('/devices')
  }
});

module.exports = router;
