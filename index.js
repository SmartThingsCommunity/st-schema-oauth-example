'use strict';

/**
 * AWS Lambda handler configured to host ST Schema connector
 */

const connector = require('./lib/connector');

exports.handler = async (evt, context) => {
  await connector.handleLambdaCallback(evt, context);
};
