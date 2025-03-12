// @ts-check
'use strict';

var path = require('path');
var http = require('http');
var oas3Tools = require('openbackhaul-oas3-tools');
var appCommons = require('onf-core-model-ap/applicationPattern/commons/AppCommons');
var serverPort = 4009;

// uncomment if you do not want to validate security e.g. operation-key, basic auth, etc
// TODO: check if is working fine
//appCommons.openApiValidatorOptions.validateSecurity = false;
//appCommons.openApiValidatorOptions.validateRequests = false;

// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
    openApiValidator: appCommons.openApiValidatorOptions
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var app = expressAppConfig.getApp();
appCommons.setupExpressApp(app);

// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});

//setting the path to the database 
global.databasePath = './database/config.json'
// Limits
global.counter = 0;
global.counterStatus = 0;
global.counterAlarms = 0;
global.counterTime   = 0;
global.counterStatusHistoricalPMDataCall = 0;
//creating connected device list obj
global.connectedDeviceList = "";
appCommons.performApplicationRegistration();

