//@ts-check
'use strict';

var GenericResponseProfile = require('../service/GenericResponseProfileService');
var ResponseBuilder = require('onf-core-model-ap/applicationPattern/rest/server/ResponseBuilder');
var ResponseCode = require('onf-core-model-ap/applicationPattern/rest/server/ResponseCode');
var OamLogService = require('onf-core-model-ap/applicationPattern/services/OamLogService');

module.exports.getGenericResponseProfileDatatype = async function getGenericResponseProfileDatatype (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await GenericResponseProfile.getGenericResponseProfileDatatype(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getGenericResponseProfileDescription = async function getGenericResponseProfileDescription (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await GenericResponseProfile.getGenericResponseProfileDescription(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getGenericResponseProfileFieldName = async function getGenericResponseProfileFieldName (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await GenericResponseProfile.getGenericResponseProfileFieldName(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getGenericResponseProfileOperationName = async function getGenericResponseProfileOperationName (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await GenericResponseProfile.getGenericResponseProfileOperationName(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getGenericResponseProfileValue = async function getGenericResponseProfileValue (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await GenericResponseProfile.getGenericResponseProfileValue(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.putGenericResponseProfileValue = async function putGenericResponseProfileValue (req, res, next, body, uuid) {
  let responseCode = ResponseCode.code.NO_CONTENT;
  await GenericResponseProfile.putGenericResponseProfileValue(body, req.url, uuid)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};
