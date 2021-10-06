"use strict";

const { v4: uuid } = require('uuid');
const AWS = require('aws-sdk');
const Account = require('./account');
const dynamoDB = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const randtoken = require('rand-token');

const dynamoTableName = process.env.DYNAMODB_TABLE_NAME ? process.env.DYNAMODB_TABLE_NAME : 'sts_oauth_example';

/**
 * Methods for reading and writing of devices and access tokens to DynamoDB
 */
const db = {

	addAccount(account) {
		const params = {
			TableName: dynamoTableName,
			Item: {
				pk: {S: account.username},
				sk: {S: 'account'},
				username: {S: account.username},
				password: {S: account.password},
				salt: {S: account.salt}
			}
		};

		return dynamoDB.putItem(params).promise()
	},

	addToken(username, expiresIn) {
		const code = randtoken.generate(16);
		const params = {
			TableName: dynamoTableName,
			Item: {
				pk: {S: code},
				sk: {S: 'code'},
				username: {S: username},
				access_token: {S: randtoken.generate(24)},
				refresh_token: {S: randtoken.generate(24)},
				expires_in: {N: expiresIn.toString()}, 					// expiration of the token, not this code
				expires: {N: expirationDate(300).toString()},  // expiration of this code
				token_type: {S: 'Bearer'}
			}
		};

		return dynamoDB.putItem(params).promise().then(data => {
			return code
		})
	},

	refreshToken(refreshToken) {
		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: refreshToken,
				sk: 'refresh_token'
			},
			ProjectionExpression: "username, access_token, refresh_token, expires_in, token_type, callbackAuth, callbackUrls"
		};

		return docClient.get(params).promise().then(data => {
			const item = data.Item;
			const newAccessToken = randtoken.generate(24);
			const newRefreshToken = randtoken.generate(24);

			const newAccessItem = {
				pk: newAccessToken,
				sk: 'token',
				username: item.username,
				access_token: newAccessToken,
				refresh_token: newRefreshToken,
				expires_in: item.expires_in,
				expires: {N: expirationDate(item.expires_in).toString()},
				token_type: item.token_type,
				callbackAuth: item.callbackAuth,
				callbackUrls: item.callbackUrls
			};
			if (item.callbackAuth) {
				newAccessItem.callbackAuth = item.callbackAuth;
				newAccessItem.callbackUrls = item.callbackUrls;
			}

			const newRefreshItem = {
				pk: newRefreshToken,
				sk: 'refresh_token',
				username: item.username,
				access_token: newAccessToken,
				refresh_token: newRefreshToken,
				expires_in: item.expires_in,
				token_type: item.token_type,
				callbackAuth: item.callbackAuth,
				callbackUrls: item.callbackUrls
			};
			if (item.callbackAuth) {
				newRefreshItem.callbackAuth = item.callbackAuth;
				newRefreshItem.callbackUrls = item.callbackUrls;
			}

			const params = {
				RequestItems: {
					[dynamoTableName]: [
						{
							PutRequest: {
								Item: newAccessItem
							}
						},
						{
							PutRequest: {
								Item: newRefreshItem
							}
						},
						{
							DeleteRequest: {
								Key: {
									pk: item.access_token,
									sk: 'token'
								}
							}
						},
						{
							DeleteRequest: {
								Key: {
									pk: item.refresh_token,
									sk: 'refresh_token'
								}
							}
						}
					]
				}
			};

			return docClient.batchWrite(params).promise().then(data => {
				item.access_token = newAccessToken;
				item.refresh_token = newRefreshToken;
				return item
			})
		})
	},

	redeemCode(code) {
		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: code,
				sk: 'code'
			},
			ProjectionExpression: "username, access_token, refresh_token, expires_in, token_type"
		};

		return docClient.get(params).promise().then(data => {
			const item = data.Item

			const params = {
				RequestItems: {
					[dynamoTableName]: [
						{
							PutRequest: {
								Item: {
									pk: {S: item.access_token},
									sk: {S: 'token'},
									username: {S: item.username},
									access_token: {S: item.access_token},
									refresh_token: {S: item.refresh_token},
									expires_in: {N: item.expires_in.toString()},
									token_type: {S: item.token_type}
								}
							}
						},
						{
							PutRequest: {
								Item: {
									pk: {S: item.refresh_token},
									sk: {S: 'refresh_token'},
									username: {S: item.username},
									access_token: {S: item.access_token},
									refresh_token: {S: item.refresh_token},
									expires_in: {N: item.expires_in.toString()},
									token_type: {S: item.token_type}
								}
							}
						},
						{
							DeleteRequest: {
								Key: {
									pk: {S: code},
									sk: {S: 'code'}
								}
							}
						}
					]
				}
			};

			return dynamoDB.batchWriteItem(params).promise().then(data => {
				return item
			})
		})
	},

	getToken(accessToken) {
		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: accessToken,
				sk: 'token'
			},
			ProjectionExpression: "username, access_token, refresh_token, expires_in, token_type, callbackAuth, callbackUrls"
		}

		return docClient.get(params).promise().then(data => {
			return data.Item
		})
	},

	getCallbacks(username) {
		const params = {
			TableName: dynamoTableName,
			IndexName: "username-sk-index",
			KeyConditionExpression: "username = :username and sk = :sk",
			ExpressionAttributeValues: {
				":username": username,
				":sk": "token"
			},
			ProjectionExpression: "access_token, callbackAuth, callbackUrls, callbackError, username"
		}

		return docClient.query(params).promise().then(data => {
			return data.Items
		})
	},

	getCallbacksForToken(accessToken) {
		return this.getToken(accessToken).then(token => {
			return this.getCallbacks(token.username)
		})
	},

	removeToken(accessToken) {
		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: accessToken,
				sk: 'token'
			}
		}

		return docClient.get(params).promise().then(data => {
			const item = data.Item

			const params = {
				RequestItems: {
					[dynamoTableName]: [
						{
							DeleteRequest: {
								Key: {
									pk: {S: item.access_token},
									sk: {S: 'token'}
								}
							}
						},
						{
							DeleteRequest: {
								Key: {
									pk: {S: item.refresh_token},
									sk: {S: 'refresh_token'}
								}
							}
						}
					]
				}
			}

			return dynamoDB.batchWriteItem(params).promise()
		})
	},

	setCallbackInfo(accessToken, auth, urls) {

		if (auth.expiresIn) {
			auth.expires = expirationDate(auth.expiresIn)
		}

		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: accessToken,
				sk: 'token'
			}
		};

		return docClient.get(params).promise().then(data => {
			const item = data.Item;
			const params = {
				RequestItems: {
					[dynamoTableName]: [
						{
							PutRequest: {
								Item: {
									pk: item.access_token,
									sk: 'token',
									username: item.username,
									access_token: item.access_token,
									refresh_token: item.refresh_token,
									expires_in: item.expires_in,
									token_type: item.token_type,
									callbackAuth: auth,
									callbackUrls: urls
								}
							}
						},
						{
							PutRequest: {
								Item: {
									pk: item.refresh_token,
									sk: 'refresh_token',
									username: item.username,
									access_token: item.access_token,
									refresh_token: item.refresh_token,
									expires_in: item.expires_in,
									token_type: item.token_type,
									callbackAuth: auth,
									callbackUrls: urls
								}
							}
						}
					]
				}
			};

			return docClient.batchWrite(params).promise()
		});
	},

	refreshCallbackToken(accessToken, auth) {

		if (auth.expiresIn) {
			auth.expires = expirationDate(auth.expiresIn)
		}

		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: accessToken,
				sk: 'token'
			}
		};

		return docClient.get(params).promise().then(data => {
			const item = data.Item;
			const params = {
				RequestItems: {
					[dynamoTableName]: [
						{
							PutRequest: {
								Item: {
									pk: item.access_token,
									sk: 'token',
									username: item.username,
									access_token: item.access_token,
									refresh_token: item.refresh_token,
									expires_in: item.expires_in,
									token_type: item.token_type,
									callbackAuth: auth,
									callbackUrls: item.callbackUrls
								}
								}
							},
							{
								PutRequest: {
									Item: {
									pk: item.refresh_token,
									sk: 'refresh_token',
									username: item.username,
									access_token: item.access_token,
									refresh_token: item.refresh_token,
									expires_in: item.expires_in,
									token_type: item.token_type,
									callbackAuth: auth,
									callbackUrls: item.callbackUrls
								}
							}
						}
					]
				}
			};

			return docClient.batchWrite(params).promise()
		});
	},

	getAccount(username) {
		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: username,
				sk: 'account'
			}
		};

		return docClient.get(params).promise().then(data => {
			return data.Item ? new Account().fromDb(data.Item) : null
		})
	},

	getAccountForToken(accessToken) {
		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: {S: accessToken},
				sk: {S: 'token'}
			}
		};

		return dynamoDB.getItem(params).promise().then(data => {
			return data.Item ? this.getAccount(data.Item.username.S) : null
		})
	},

	getAccountForCode(code) {
		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: code,
				sk: 'code'
			}
		};

		return docClient.get(params).promise().then(data => {
			return this.getAccount(data.Item.username)
		})
	},

	addDevice(username, type, name, deviceStates) {
		const externalId = uuid();
		const handlerType = type;
		const displayName = name;
		const states = deviceStates;
		const params = {
			TableName: dynamoTableName,
			Item: {
				pk: username,
				sk: `device-${externalId}`,
				externalId: externalId,
				handlerType: handlerType,
				displayName: displayName,
				states: states
			}
		};

		return docClient.put(params).promise().then(data => {
			return {
				externalId,
				handlerType,
				displayName,
				states
			}
		})
	},

	getDevice(username, externalId) {
		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: username,
				sk: `device-${externalId}`
			},
			ProjectionExpression: "externalId, handlerType, displayName, states"
		};

		return docClient.get(params).promise().then(data => {
			return data.Item
		})
	},

	deleteDevice(username, externalId) {
		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: username,
				sk: `device-${externalId}`
			}
		};

		return docClient.delete(params).promise().then(data => {
			return data.Item
		})
	},

	getDeviceForToken(accessToken, externalId) {
		return this.getAccountForToken(accessToken).then(account => {
			return this.getDevice(account.username, externalId)
		})
	},

	getDevices(username) {
		const params = {
			TableName: dynamoTableName,
			KeyConditionExpression: "pk = :pk and begins_with(sk, :sk)",
			ExpressionAttributeValues: {
				":pk": username,
				":sk": "device-"
			},
			ProjectionExpression: "externalId, handlerType, displayName, states"
		};

		return docClient.query(params).promise().then(data => {
			return data.Items
		})
	},

	getDevicesForToken(accessToken) {
		return this.getAccountForToken(accessToken).then(account => {
			return account ? this.getDevices(account.username) : []
		})
	},

	updateDeviceName(username, externalId, displayName) {
		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: {S: username},
				sk: {S: `device-${externalId}`}
			},
			UpdateExpression: 'SET displayName = :displayName',
			ExpressionAttributeValues: {
				":displayName": {S: displayName}
			}
		};

		return dynamoDB.updateItem(params).promise()
	},

	updateHandlerType(username, externalId, handlerType) {
		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: {S: username},
				sk: {S: `device-${externalId}`}
			},
			UpdateExpression: 'SET handlerType = :handlerType',
			ExpressionAttributeValues: {
				":handlerType": {S: handlerType}
			}
		};

		return dynamoDB.updateItem(params).promise()
	},

	updateDeviceState(username, externalId, states) {
		const attributeNames = {};
		const attributeValues = {};
		const attributeExpressions = [];
		for (const key of Object.keys(states)) {
			attributeNames[`#${key}`] = key;
			attributeValues[`:${key}`] = states[key];
			attributeExpressions.push(`states.#${key} = :${key}`)
		}

		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: username,
				sk: `device-${externalId}`
			},
			UpdateExpression: 'SET ' + attributeExpressions.join(', '),
			ExpressionAttributeNames: attributeNames,
			ExpressionAttributeValues: attributeValues
		};

		return docClient.update(params).promise()
	},

	updateDeviceStateForToken(accessToken, externalId, states) {
		return this.getAccountForToken(accessToken).then(account => {
			return this.updateDeviceState(account.username, externalId, states)
		})
	},

	removeDeviceStates(username, externalId, stateKeys) {
		const attributeNames = {};
		const attributeValues = {};
		const attributeExpressions = [];
		for (const key of stateKeys) {
			attributeNames[`#${key}`] = key;
			attributeExpressions.push(`states.#${key}`)
		}

		const params = {
			TableName: dynamoTableName,
			Key: {
				pk: username,
				sk: `device-${externalId}`
			},
			UpdateExpression: 'REMOVE ' + attributeExpressions.join(', '),
			ExpressionAttributeNames: attributeNames
		};

		return docClient.update(params).promise()
	},

	createTableIfNecessary() {
		return dynamoDB.describeTable({"TableName": dynamoTableName}).promise().then(table => {
			console.log(`DynamoDB Table:    ${dynamoTableName} (exists)`)
		})
			.catch(err => {
				if (err.code === 'ResourceNotFoundException') {
					console.log(`DynamoDB Table:    ${dynamoTableName} (creating)`)
					return this.createTable(dynamoTableName)
				}
				else {
					console.log(`UNEXPECTED ERROR ${JSON.stringify(err, null, 2)}`)
				}
			})
	},

	createTable(name) {
		const params = {
			"AttributeDefinitions": [
				{
					"AttributeName": "pk",
					"AttributeType": "S"
				},
				{
					"AttributeName": "sk",
					"AttributeType": "S"
				},
				{
					"AttributeName": "username",
					"AttributeType": "S"
				}
			],
			"GlobalSecondaryIndexes": [
				{
					"IndexName": "username-sk-index",
					"Projection": {
						"ProjectionType": "ALL"
					},
					"ProvisionedThroughput": {
						"WriteCapacityUnits": 5,
						"ReadCapacityUnits": 5
					},
					"KeySchema": [
						{
							"KeyType": "HASH",
							"AttributeName": "username"
						},
						{
							"KeyType": "RANGE",
							"AttributeName": "sk"
						}
					]
				}
			],
			"ProvisionedThroughput": {
				"WriteCapacityUnits": 5,
				"ReadCapacityUnits": 5
			},
			"TableName": name,
			"KeySchema": [
				{
					"KeyType": "HASH",
					"AttributeName": "pk"
				},
				{
					"KeyType": "RANGE",
					"AttributeName": "sk"
				}
			]
		}

		return dynamoDB.createTable(params).promise()
	}
};

function expirationDate(expiresIn) {
	return Math.round(new Date().getTime() / 1000) + expiresIn
}

db.createTableIfNecessary(dynamoTableName);

module.exports =  db;
