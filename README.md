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
  * Account.js -- Account abstraction and password management
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

Create a `.env` in the root directory of the project containing the following information, changing values and filling in
missing data (shown inside `<...>`) with your information
```$
# Public base URL for accessing this server
SERVER_URL=<publically accessible https url of your server>

# Client ID and secret of this OAuth app. These can be anything you want
#
CLIENT_ID="15245388-2660-4a3e-a1be-1e276dba1377"
CLIENT_SECRET="90459b40-cc1a-4f4e-8a50-f4de19242345"

# Client ID and secret of your ST Schema connector, from the SmartThings dev workspace 
#
ST_CLIENT_ID="<copy value from dev workspace>"
ST_CLIENT_SECRET="<copy value from dev workspace>"

# Credentials, region, and DynamoDB table names for this application
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="<your access key ID>"
AWS_SECRET_ACCESS_KEY="<your secret key>"
DYNAMODB_TABLE_NAME="sts_oauth_example"
DYNAMODB_SESSION_TABLE_NAME="sts_oauth_example_sessions"
```

## Install NPM modules
```
npm install
```

## Running Server
Run the following command in the root directory to start the server. If the DynamoDB tables specified in the `.env` file
don't exist they will be created
```
node index.js
```

## Creating an Account and Adding Devices

Once the server is running you can create an account back access it in a browser at:

`https://${SERVER_URL}/login`

Enter an email address and password and click _Create New Account_. Once you are signed in click the
_Create your first device_ link to create a device. You can create more devices, delete devices, and log
out using the [...] menu at the top of the page.