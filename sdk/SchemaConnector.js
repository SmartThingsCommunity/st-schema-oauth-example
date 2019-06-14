'use strict';

const DiscoveryResponse = require("./discovery/DiscoveryResponse");
const StateRefreshResponse = require("./state/StateRefreshResponse");
const CommandResponse = require("./state/CommandResponse");
const AccessTokenRequest = require("./callbacks/AccessTokenRequest");

module.exports = class SchemaConnector {

  constructor(options = {}) {
    this._clientId = options.clientId;
    this._clientSecret = options.clientId;

    this._discoveryHandler = ((response, data) => {
      console.log('discoverDevices not defined')
    });

    this._stateRefreshHandler = ((response, data) => {
      console.log('stateRefreshHandler not defined')
    });

    this._commandHandler = ((response, data) => {
      console.log('commandHandler not defined')
    });

    this._callbackAccessHandler = (data => {
      console.log('callbackAccessHandler not defined')
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
  callbackAccessHandler(callback) {
    this._callbackAccessHandler = callback
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

  manufacturerName(value) {
    this._manufacturerName = value
    return this
  }

  async updateState(callbackUrls, callbackAuth, deviceState) {
    try {
      await new StateUpdateRequest().updateState(callbackUrls.stateCallback, callbackAuth.accessToken, deviceState);
    }
    catch (err) {
      if (err.statusCode === 401) {
        const refreshResponse = await (new RefreshTokenRequest().getCallbackToken(
          it.callbackUrls.oauthToken,
          this.clientId,
          this.clientSecret,
          it.callbackAuth.refreshToken));

        db.refreshCallbackToken(it.access_token, refreshResponse.callbackAuthentication);
        updateState(refreshResponse.callbackAuthentication.accessToken, it.callbackUrls.stateCallback, deviceState)
        await new StateUpdateRequest().updateState(callbackUrls.stateCallback, callbackAuth.accessToken, deviceState)
      }
      else {
        console.log(err)
      }
    }
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
    const reply = await this._handleCallback(request.body);
    response.send(reply)
  }

  async handleMockCallback(body) {
    return await this._handleCallback(body)
  }

  async _handleCallback(body) {
    let response = {};
    try {
      switch (body.headers.interactionType) {
        case "discoveryRequest":
          response = new DiscoveryResponse(body.headers.requestId);
          await this._discoveryHandler(body.authentication.token, response, body);
          break;

        case "commandRequest":
          response = new CommandResponse(body.headers.requestId);
          await this._commandHandler(body.authentication.token, response, body.devices, body);
          break;

        case "stateRefreshRequest":
          response = new StateRefreshResponse(body.headers.requestId);
          await this._stateRefreshHandler(body.authentication.token, response, body);
          break;

        case "grantCallbackAccess":
          if (body.callbackAuthentication.clientId === this._clientId ) {

            const grantResponse = await (
              new AccessTokenRequest(
                body.headers.requestId
              ).getCallbackToken(
                body.callbackUrls.oauthToken,
                this._clientId,
                this._clientSecret,
                body.callbackAuthentication.code
              )
            );

            console.log(`GRANT RESPONSE: ${JSON.stringify(grantResponse, null, 2)}`)
            this._callbackAccessHandler(body.authentication.token, grantResponse.callbackAuthentication, body.callbackUrls, body)
          }
          break;

        case "integrationDeleted":
          this._integrationDeletedHandler(body.authentication.token, body);
          break;

        default:
          response = {error: `Unsupported interactionType: ${body.headers.interactionType}`};
          break;
      }

      console.log(`RESPONSE: ${JSON.stringify(response, null, 2)}`);
      return response;
    }
    catch (err) {
      console.error(err)
    }
  }
}