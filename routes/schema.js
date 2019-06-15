const express = require('express');
const router = express.Router();
const connector = require('../lib/connector');

/**
 * ST Schema web-hook endpoint
 */
router.post('/', async function (req, res) {
  console.log("REQUEST: %s", JSON.stringify(req.body, null, 2));
  connector.handleHttpCallback(req, res)
});

module.exports = router;
