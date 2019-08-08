'use strict';

/**
 * AWS Lambda handler configured to host ST Schema connector.
 * Not currently used.
 */

const connector = require('./lib/connector');

exports.handler = async (evt, context) => {
  await connector.handleLambdaCallback(evt, context);
};
