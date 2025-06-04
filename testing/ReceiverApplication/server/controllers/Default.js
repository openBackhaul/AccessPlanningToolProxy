'use strict';

var utils = require('../utils/writer.js');
var service = require('../service/ReceiverApplicationService.js');

module.exports.provideAcceptanceDataOfLinkEndpoint = async function provideAcceptanceDataOfLinkEndpoint (req, res, next, body) {
  await service.provideAcceptanceDataOfLinkEndpoint(body)
    .then(function (response) {
      response = utils.respondWithCode(response.code, response.message);
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.provideHistoricalDataOfDevice = async function provideHistoricalDataOfDevice (req, res, next, body) {
  await service.provideHistoricalDataOfDevice(body)
    .then(function (response) {
      response = utils.respondWithCode(response.code, response.message);
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.receiveAcceptanceDataOfLinkEndpoint = async function receiveAcceptanceDataOfLinkEndpoint (req, res, next, body) {
  await service.receiveAcceptanceDataOfLinkEndpoint(body)
    .then(function (response) {
      response = utils.respondWithCode(response.code, response.message);
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.receiveHistoricalDataOfDevice = async function receiveHistoricalDataOfDevice (req, res, next, body) {
  await service.receiveHistoricalDataOfDevice(body)
    .then(function (response) {
      response = utils.respondWithCode(response.code, response.message);
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.listAllAcceptanceDataOfLinkEndpoints = async function listAllAcceptanceDataOfLinkEndpoints (req, res, next) {
  await service.listAllAcceptanceDataOfLinkEndpoints()
    .then(function (response) {
      response = utils.respondWithCode(response.code, response.message);
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.listAllHistoricalDataOfDevices = async function listAllHistoricalDataOfDevices (req, res, next) {
  await service.listAllHistoricalDataOfDevices()
    .then(function (response) {
      response = utils.respondWithCode(response.code, response.message);
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.listAllRequestidsForHistoricalData = async function listAllRequestidsForHistoricalData (req, res, next) {
  await service.listAllRequestidsForHistoricalData()
    .then(function (response) {
      response = utils.respondWithCode(response.code, response.message);
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.listRequestidsForAcceptanceData = async function listRequestidsForAcceptanceData (req, res, next) {
  await service.listRequestidsForAcceptanceData()
    .then(function (response) {
      response = utils.respondWithCode(response.code, response.message);
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
