//@ts-check
'use strict';

var ActionProfile = require('../service/ActionProfileService');
var ResponseBuilder = require('onf-core-model-ap/applicationPattern/rest/server/ResponseBuilder');
var ResponseCode = require('onf-core-model-ap/applicationPattern/rest/server/ResponseCode');
var OamLogService = require('onf-core-model-ap/applicationPattern/services/OamLogService');

module.exports.getActionProfileConsequentOperationReference = async function getActionProfileConsequentOperationReference (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await ActionProfile.getActionProfileConsequentOperationReference(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getActionProfileDisplayInNewBrowserWindow = async function getActionProfileDisplayInNewBrowserWindow (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await ActionProfile.getActionProfileDisplayInNewBrowserWindow(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getActionProfileInputValueListt = async function getActionProfileInputValueListt (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await ActionProfile.getActionProfileInputValueListt(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getActionProfileLabel = async function getActionProfileLabel (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await ActionProfile.getActionProfileLabel(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getActionProfileOperationName = async function getActionProfileOperationName (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await ActionProfile.getActionProfileOperationName(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.putActionProfileConsequentOperationReference = async function putActionProfileConsequentOperationReference (req, res, next, body, uuid) {
  let responseCode = ResponseCode.code.NO_CONTENT;
  await ActionProfile.putActionProfileConsequentOperationReference(body, req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};
