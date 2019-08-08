# ST Schema OAuth Example

Reference application that includes a cloud-based virtual device application
with web UI for controlling devices, and OAuth2 server for authenticating
with that cloud using ST Schema and the SmartThings mobile app, and an
ST Schema connector.

The app allows users to create a number of virtual devices including switches,
dimmers, tunable white bulbs, color bulbs, motions sensors, open/close 
sensors, and thermostats.

## File Structure

* lib -- Example third party app classes
  * Account.js -- Account domain object and password management
  * connector -- The ST Schema connector
  * db.js -- Reading and writing of devices and access tokens to DynamoDB
  * device-service.js -- Proactive state callbacks
  * mapping.js -- Mappings between ST Schema and the external representation of devices
* public -- Static web server files
  * images
  * javascript
  * stylesheets
* routes -- Web application controllers
  * devices.js -- Handles web-based device CRUD and control operations
  * index.js -- Home page and web UI login
  * oauth -- Handles login and OAuth authorization for ST mobile app
  * schema -- ST Schema endpoint
* views

## Setup

Create the `.example_env` file to a `.env` in the root directory of the project containing the following information, changing values and filling in
missing data (shown inside `{...}`) with your information
```$
# Publically accessible URL for accessing this server. You can use ngrok to tunnel to your local server for development
SERVER_URL=https://{{SOMETHING}}.ngrok.io

# Client ID and secret of this OAuth app. These can be anything you want
CLIENT_ID="{{SOMETHING}}"
CLIENT_SECRET="{{SOMETHING}}"

# Client ID and secret of your ST Schema connector, from the SmartThings dev workspace
ST_CLIENT_ID="{{CLIENT_ID}}"
ST_CLIENT_SECRET="{{CLIENT_SECRET}}"

# Credentials, region, and DynamoDB table names for this application
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="{{YOUR_ACCESS_KEY}}"
AWS_SECRET_ACCESS_KEY="{{YOUR_SECRET_KEY}}"

# DynamoDB tables. You don't have to change these. They will be created if they don't already exist when you start the app
DYNAMODB_TABLE_NAME="sts_oauth_example_local"
DYNAMODB_SESSION_TABLE_NAME="sts_oauth_example_local_sessions"
```

## Install NPM modules
```
npm install
```

## Running Server
Run the following command in the root directory to start the server. If the DynamoDB tables specified in the `.env` file
don't exist they will be created
```
node server.js
```

## Creating an Account and Adding Devices

Once the server is running you can create an account back access it in a browser at:

`https://${SERVER_URL}/login`

Enter an email address and password and click _Create New Account_. Once you are signed in click the
_Create your first device_ link to create a device. You can create more devices, delete devices, and log
out using the [...] menu at the top of the page.
