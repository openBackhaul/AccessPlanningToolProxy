'use strict';

var IndividualServices = require('../service/IndividualServicesService');
var responseCodeEnum = require('onf-core-model-ap/applicationPattern/rest/server/ResponseCode');
var restResponseHeader = require('onf-core-model-ap/applicationPattern/rest/server/ResponseHeader');
var restResponseBuilder = require('onf-core-model-ap/applicationPattern/rest/server/ResponseBuilder');
var executionAndTraceService = require('onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService');
const authorizingService = require('onf-core-model-ap/applicationPattern/services/AuthorizingService');
const RequestHeader = require('onf-core-model-ap/applicationPattern/rest/client/RequestHeader');
const httpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const operationServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationServerInterface');

module.exports.bequeathYourDataAndDie = async function bequeathYourDataAndDie (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.NO_CONTENT;
  let responseBodyToDocument = {};
  await IndividualServices.bequeathYourDataAndDie(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      restResponseBuilder.buildResponse(res, responseCode, responseBody, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
    executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument);
};

module.exports.checkRegisteredAvailabilityOfDevice = async function checkRegisteredAvailabilityOfDevice (req, res, next, body) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.OK;
  let responseBodyToDocument = {};
  /****************************************************************************************
 * generates custom request header parameters : user, originator, xCorrelator, traceIndicator, customerJourney for callbacks
 ****************************************************************************************/
  let authorizationCode = req.headers.authorization;
  let user = authorizingService.decodeAuthorizationCodeAndExtractUserName(authorizationCode);

  let originator = await httpServerInterface.getApplicationNameAsync();

  let customRequestHeaders = new RequestHeader(user, originator);

  let xCorrelator = customRequestHeaders.xCorrelator;
  let traceIndicator = customRequestHeaders.traceIndicator.toString();
  let customerJourney = customRequestHeaders.customerJourney;
  /****************************************************************************************
  * generates response header parama
  ****************************************************************************************/
  let operationServerUuid = await operationServerInterface.getOperationServerUuidAsync(req.url);
  let lifeCycleState = await operationServerInterface.getLifeCycleState(operationServerUuid);
  let responseHeader = {};
  responseHeader.lifeCycleState = lifeCycleState;
  await IndividualServices.checkRegisteredAvailabilityOfDevice(body)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      restResponseBuilder.buildResponse(res, responseCode, responseBody, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, user, req.url, responseCode, req.body, responseBodyToDocument);
};

/**
 * generates request header parameters : user, originator, xCorrelator, traceIndicator, customerJourney
 **/
module.exports.provideAcceptanceDataOfLinkEndpoint = async function provideAcceptanceDataOfLinkEndpoint (req, res, next, body) {
  let responseCode = responseCodeEnum.code.OK;
  let responseBodyToDocument = {};

  /****************************************************************************************
  * generates custom request header parameters : user, originator, xCorrelator, traceIndicator, customerJourney for callbacks
  ****************************************************************************************/
  let authorizationCode = req.headers.authorization;
  let user = authorizingService.decodeAuthorizationCodeAndExtractUserName(authorizationCode);

  let originator = await httpServerInterface.getApplicationNameAsync();

  let customRequestHeaders = new RequestHeader(user, originator);

  let xCorrelator = customRequestHeaders.xCorrelator;
  let traceIndicator = customRequestHeaders.traceIndicator.toString();
  let customerJourney = customRequestHeaders.customerJourney;
  /****************************************************************************************
  * generates response header parama
  ****************************************************************************************/
  let operationServerUuid = await operationServerInterface.getOperationServerUuidAsync(req.url);
  let lifeCycleState = await operationServerInterface.getLifeCycleState(operationServerUuid);
  let responseHeader = {};
  responseHeader.lifeCycleState = lifeCycleState;

  await IndividualServices.provideAcceptanceDataOfLinkEndpoint(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      restResponseBuilder.buildResponse(res, responseCode, responseBody, responseHeader);
    })
    .catch(async function (responseBody) {
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
    //user is sent in place of originator for the root request since it is originated from user not application
    executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, user, req.url, responseCode, req.body, responseBodyToDocument);
};

module.exports.provideEquipmentInfoForLiveNetView = async function provideEquipmentInfoForLiveNetView (req, res, next, body) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.OK;
  let responseBodyToDocument = {};
  /****************************************************************************************
   * generates custom request header parameters : user, originator, xCorrelator, traceIndicator, customerJourney for callbacks
   ****************************************************************************************/
  let authorizationCode = req.headers.authorization;
  let user = authorizingService.decodeAuthorizationCodeAndExtractUserName(authorizationCode);

  let originator = await httpServerInterface.getApplicationNameAsync();

  let customRequestHeaders = new RequestHeader(user, originator);

  let xCorrelator = customRequestHeaders.xCorrelator;
  let traceIndicator = customRequestHeaders.traceIndicator.toString();
  let customerJourney = customRequestHeaders.customerJourney;
  /****************************************************************************************
   * generates response header parama
   ****************************************************************************************/
  let operationServerUuid = await operationServerInterface.getOperationServerUuidAsync(req.url);
  let lifeCycleState = await operationServerInterface.getLifeCycleState(operationServerUuid);
  let responseHeader = {};
  responseHeader.lifeCycleState = lifeCycleState;
  await IndividualServices.provideEquipmentInfoForLiveNetView(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      restResponseBuilder.buildResponse(res, responseCode, responseBody, responseHeader);
    })
    .catch(async function (responseBody) {
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  //user is sent in place of originator for the root request since it is originated from user not application
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, user, req.url, responseCode, req.body, responseBodyToDocument);
};

module.exports.provideStatusForLiveNetView = async function provideStatusForLiveNetView (req, res, next, body) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.OK;
  let responseBodyToDocument = {};
  /****************************************************************************************
 * generates custom request header parameters : user, originator, xCorrelator, traceIndicator, customerJourney for callbacks
 ****************************************************************************************/
  let authorizationCode = req.headers.authorization;
  let user = authorizingService.decodeAuthorizationCodeAndExtractUserName(authorizationCode);

  let originator = await httpServerInterface.getApplicationNameAsync();

  let customRequestHeaders = new RequestHeader(user, originator);

  let xCorrelator = customRequestHeaders.xCorrelator;
  let traceIndicator = customRequestHeaders.traceIndicator.toString();
  let customerJourney = customRequestHeaders.customerJourney;
  /****************************************************************************************
  * generates response header parama
  ****************************************************************************************/
  let operationServerUuid = await operationServerInterface.getOperationServerUuidAsync(req.url);
  let lifeCycleState = await operationServerInterface.getLifeCycleState(operationServerUuid);
  let responseHeader = {};
  responseHeader.lifeCycleState = lifeCycleState;
  await IndividualServices.provideStatusForLiveNetView(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      restResponseBuilder.buildResponse(res, responseCode, responseBody, responseHeader);
    })
    .catch(async function (responseBody) {
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  //user is sent in place of originator for the root request since it is originated from user not application
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, user, req.url, responseCode, req.body, responseBodyToDocument);
};
