'use strict';

module.exports = class SchemaConnector {

  constructor(options = {}) {
    this._clientId = options.clientId;
    this._clientSecret = options.clientId;

    this._discoveryHandler = (data => {
      console.log('discoveryHandler not defined')
    });

    this._stateRefreshHandler = (data => {
      console.log('stateRefreshHandler not defined')
    });

    this._commandHandler = (data => {
      console.log('commandHandler not defined')
    });

    this._grantCallbackAccessHandler = (data => {
      console.log('grantCallbackAccessHandler not defined')
    });

    this._integrationDeletedHandler = (data => {
      console.log('integrationDeletedHandler not defined')
    })
  }

  /**
   * Set your smartapp automation's client id. Cannot be
   * acquired until your app has been created through the
   * Developer Workspace.
   * @param {String} id
   * @returns {SchemaConnector} SchemaConnector instance
   */
  clientId(id) {
    this._clientId = id
    return this
  }

  /**
   * Set your smartapp automation's client secret. Cannot be
   * acquired until your app has been created through the
   * Developer Workspace. This secret should never be shared
   * or committed into a public repository.
   * @param {String} secret
   * @returns {SchemaConnector} SmartApp instance
   */
  clientSecret(secret) {
    this._clientSecret = secret
    return this
  }

  /**
   * Sets the discovery request handler
   */
  discoveryHandler(callback) {
    this._discoveryHandler = callback
    return this
  }

  /**
   * Sets the state refresh request handler
   */
  stateRefreshHandler(callback) {
    this._stateRefreshHandler = callback
    return this
  }

  /**
   * Sets the command request handler
   */
  commandHandler(callback) {
    this._commandHandler = callback
    return this
  }

  /**
   * Sets the grant callback access handler
   */
  grantCallbackAccessHandler(callback) {
    this._grantCallbackAccessHandler = callback
    return this
  }

  /**
   * Sets integration deleted handler
   */
  integrationDeletedHandler(callback) {
    this._integrationDeletedHandler = callback
    return this
  }

  /**
   * Provide a custom context store used for storing in-flight credentials
   * for each installed instance of the app.
   *
   * @param {*} value
   * @example Use the AWS DynamoDB plugin
   * smartapp.contextStore(new DynamoDBSchemaCallbackStore('aws-region', 'app-table-name'))
   * @example
   * // Use Firebase Cloud Firestore
   * smartapp.contextStore(new FirestoreDBContextStore(firebaseServiceAccount, 'app-table-name'))
   * @returns {SchemaConnector} SmartApp instance
   */
  callbackStore(value) {
    this._contextStore = value
    return this
  }

  /**
   * Use with an AWS Lambda function. No signature verification is required.
   *
   * @param {*} event
   * @param {*} context
   * @param {*} callback
   */
  async handleLambdaCallback(event, context, callback) {
    const reply = await this._handleCallback(event);
    callback(reply)
  }

  /**
   * Use with a standard HTTP webhook endpoint app. Signature verification is required.
   *
   * @param {*} request
   * @param {*} response
   */
  async handleHttpCallback(request, response) {
    const reply = await this._handleCallback(request.body)
    response.send(reply)
  }

  async handleMockCallback(body) {
    return await this._handleCallback(body)
  }

  async _handleCallback(data) {
    let response;
    try {
      switch (data.headers.interactionType) {
        case "discoveryRequest":
          response = await this._discoveryHandler(data);
          break;
        case "commandRequest":
          response = await this._commandHandler(data);
          break;
        case "stateRefreshRequest":
          response = await this._stateRefreshHandler(data);
          break;
        case "grantCallbackAccess":
          response = await this._grantCallbackAccessHandler(data);
          break;
        case "integrationDeleted":
          response = await this._integrationDeletedHandler(data);
          break;
        default:
          response = {error: `Unsupported interactionType: ${data.headers.interactionType}`};
          console.log(response);
          break;
      }

      console.log(`RESPONSE: ${JSON.stringify(response, null, 2)}`)
      return response;
    }
    catch (err) {
      console.error(err)
    }
  }
}