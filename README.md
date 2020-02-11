# ST Schema OAuth Example

Reference application that includes a cloud-based virtual device application
with web UI for controlling devices, and OAuth2 server for authenticating
with that cloud using ST Schema and the SmartThings mobile app, and an
ST Schema connector. The app uses the [st-schema SDK](https://www.npmjs.com/package/st-schema),
the [express](https://www.npmjs.com/package/express) web server, 
[EJS](https://ejs.co/), 
and the [Knockout](https://knockoutjs.com/documentation/introduction.html) UI library.

The app allows users to create a number of virtual devices including switches,
dimmers, tunable white bulbs, color bulbs, motions sensors, open/close 
sensors, and thermostats.

#### Prerequisites

- An [Amazon Web Services account](https://aws.amazon.com/)
- [Ngrok](https://ngrok.com/) or similar technology for creating an SSL tunnel (or you can host this 
connector on something like [Glitch](https://glitch.com/)) 
- A [SmartThings Developer Workspace account](https://smartthings.developer.samsung.com/workspace/)
- The SmartThings mobile app (available from the [iOS App Store](https://apps.apple.com/us/app/smartthings/id1222822904)
or [Google Play Store](https://play.google.com/store/apps/details?id=com.samsung.android.oneconnect))


## File Structure

* lib -- Example third party app classes
  * Account.js -- Account domain object and password management
  * connector.js -- The ST Schema connector
  * db.js -- Reading and writing of devices and access tokens to DynamoDB
  * device-service.js -- Proactive state callbacks
  * mapping.js -- Mappings between ST Schema and the external representation of devices
* public -- Static web server files
  * images -- images for use in web pages
  * javascript
    * devices.js -- View model object for a device
    * devices.js -- Initializes the devices page and view model
    * devicesviewmodel.js -- Top level view model for the page
    * oauth.js -- Initializes the OAuth page
    * property.js -- View model object for a device property
  * stylesheets
* routes -- Web application controllers
  * devices.js -- Handles web-based device CRUD and control operations
  * index.js -- Home page and web UI login
  * oauth -- Handles login and OAuth authorization for ST mobile app
  * schema -- ST Schema endpoint
* views
  * devices
    * index.ejs -- The devices page
  * oauth
    * invalidauth.js -- Invalid authorization error page
    * login.js -- The OAuth login page rendered in the SmartThings app
  * error.ejs -- Web app error page
  * index.ejs -- Web app landing page with a link to the devices web page
  * login.ejs -- Web app login page
  * redirect.ejs -- Test page that renders redirect parameters
* .example_env -- Example enviromnent variables file
* server.js -- The express web server

## Setup

Create the `.example_env` file to a `.env` in the root directory of the project containing the following information, changing values and filling in
missing data (shown inside `{...}`) with your information. Note that you won't yet have `ST_CLIENT_ID`
and `ST_CLIENT_SECRET` fields so just leave them as they are for now.

```$
# Publically accessible URL for accessing this server. You can use ngrok to tunnel to your local server for development
SERVER_URL=https://{{SOMETHING}}.ngrok.io

# Client ID and secret of this OAuth app. These can be anything you want
CLIENT_ID="{{SOMETHING}}"
CLIENT_SECRET="{{SOMETHING}}"

# Permitted redirect URLs. You shouldn't have to change this
PERMITTED_REDIRECT_URLS="https://c2c-us.smartthings.com/oauth/callback,https://c2c-eu.smartthings.com/oauth/callback,https://c2c-ap.smartthings.com/oauth/callback"

# Client ID and secret of your ST Schema connector, from the SmartThings dev workspace
ST_CLIENT_ID="{{CLIENT_ID}}"
ST_CLIENT_SECRET="{{CLIENT_SECRET}}"

# Credentials, region, and DynamoDB table names for this application. You can delete these if you are setting your
# AWS credentials in some other way
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="{{YOUR_ACCESS_KEY}}"
AWS_SECRET_ACCESS_KEY="{{YOUR_SECRET_KEY}}"

# DynamoDB tables. You don't have to change these. They will be created if they don't already exist when you start the app
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
node server.js
```

When the server starts it will print out information you will use later to log in and create devices and
configure your ST-Schema connector. For example:
```
Home:              https://yourserver.ngrok.io
Login:             https://yourserver.ngrok.io/login
Devices:           https://yourserver.ngrok.io/devices
OAuth Test:        https://yourserver.ngrok.io/oauth/login?client_id=my-client-id-xyzabc123&response_type=code&redirect_uri=https://yourserver.ngrok.io/redirect&state=xxxyyyzzz

ST Connector Hosting:
Target URL:        https://yourserver.ngrok.io/schema

ST Connector Device Cloud Credentials:
Client ID:         your-client-id
Client Secret:     your-client-secret
Authorization URI: https://yourserver.ngrok.io/oauth/login
Refresh Token URL: https://yourserver.ngrok.io/oauth/token
```

## Creating an Account and Adding Devices

Once the server is running you can create an account back access it in a browser at:

`https://${SERVER_URL}/login`

Enter an email address and password and click _Create New Account_. Once you are signed in click the
_Create your first device_ link to create a device. You can create more devices, delete devices, and log
out using the [...] menu at the top of the page.

## Creating an ST Schema Connector

Go to [SmartThings Developer Workspace account](https://smartthings.developer.samsung.com/workspace/) and
create a new ST-Schema device integration.

Fill in the fields on the _Hosting_ and _Device Cloud Credentials_ tabs using the information printed
out when you started your server.

After you create your connector in the Developer Workspace, copy the client ID and client secret values
it shows you into the `ST_CLIENT_ID` and `ST_CLIENT_SECRET` entries in the `.env. file and restart the server.

## Installing your ST Schema Connector

Install the SmartThings mobile app from the [iOS App Store](https://apps.apple.com/us/app/smartthings/id1222822904)
or [Google Play Store](https://play.google.com/store/apps/details?id=com.samsung.android.oneconnect),
log in with the same email address and password used for your developer workspace account, and 
create a location (if you have not already done so)

Put the SmartThings mobile app in [developer mode](https://smartthings.developer.samsung.com/docs/guides/testing/developer-mode.html) and tap the "+" button at the top to
add a device. Scroll down to _My Testing Devices_ tap on it, and select your connector. Complete
the OAuth login process and return to the Devices page. You should see all of the devices you created 
in you web application.
