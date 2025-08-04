'use strict';

const createHttpError = require('http-errors');

let acceptanceDataMap = new Map();
let historicalDataMap = new Map();


/**
 *
 * body Body_2  (optional)
 * no response value expected for this operation
 **/
exports.provideAcceptanceDataOfLinkEndpoint = function (body) {
  return new Promise(function (resolve, reject) {
    try {
      let response = {};
      let requestId = body["request-id"];
      if(acceptanceDataMap.has(requestId)) {
        response.message = acceptanceDataMap.get(requestId);
      } else {
        response.message = {}; 
      }
      resolve(response);
    } catch (error) {
      reject(createHttpError.InternalServerError);
    }
  });
}


/**
 *
 * body Body_3  (optional)
 * no response value expected for this operation
 **/
exports.provideHistoricalDataOfDevice = function (body) {
  return new Promise(function (resolve, reject) {
    try {
      let response = {};
      let requestId = body["request-id"];
      if(historicalDataMap.has(requestId)) {
        response.message = historicalDataMap.get(requestId);
      } else {
        response.message = {}; 
      }
      resolve(response);
    } catch (error) {
      reject(createHttpError.InternalServerError);
    }
  });
}


/**
 *
 * body Body  (optional)
 * no response value expected for this operation
 **/
exports.receiveAcceptanceDataOfLinkEndpoint = function (body) {
  return new Promise(function (resolve, reject) {
    try {
      let response = {};
      if(body.hasOwnProperty("request-id")) {
        let requestId = body["request-id"];
        acceptanceDataMap.set(requestId, body);
        response.code = 204;
      } else {
        response.code = 400;
        response.message = {
          code: 400,
          message: "request-id missing in request-body"
        };
      }
      resolve(response);
    } catch (error) {
      console.log(error);
      reject(createHttpError.InternalServerError);
    }
  });
}


/**
 *
 * body Body_1  (optional)
 * no response value expected for this operation
 **/
exports.receiveHistoricalDataOfDevice = function (body) {
  return new Promise(function (resolve, reject) {
    try {
      let response = {};
      if(body.hasOwnProperty("request-id")) {
        let requestId = body["request-id"];
        historicalDataMap.set(requestId, body);
        response.code = 204;
      } else {
        response.code = 400;
        response.message = {
          code: 400,
          message: "request-id missing in request-body"
        };
      }
      resolve(response);
    } catch (error) {
      console.log(error);
      reject(createHttpError.InternalServerError);
    }
  });
}

/**
 *
 * returns inline_response_200_2
 **/
exports.listAllAcceptanceDataOfLinkEndpoints = function() {
  return new Promise(function(resolve, reject) {
    try {
      let response = {};
      let acceptanceDataList = Array.from(acceptanceDataMap.values());
      response.message = acceptanceDataList;
      resolve(response);
    } catch (error) {
      console.log(error);
      reject(createHttpError.InternalServerError);
    }
  });
}


/**
 *
 * returns inline_response_200_3
 **/
exports.listAllHistoricalDataOfDevices = function() {
  return new Promise(function(resolve, reject) {
    try {
      let response = {};
      let historicalDataList = Array.from(historicalDataMap.values());
      response.message = historicalDataList;
      resolve(response);
    } catch (error) {
      console.log(error);
      reject(createHttpError.InternalServerError);
    }
  });
}

/**
 *
 * returns inline_response_200_5
 **/
exports.listAllRequestidsForHistoricalData = function() {
  return new Promise(function(resolve, reject) {
    try {
      let response = {};
      let requestIdsForHistoricalData = Array.from(historicalDataMap.keys());
      response.message = {
        "request-id-list": requestIdsForHistoricalData
      };
      resolve(response);
    } catch (error) {
      console.log(error);
      reject(createHttpError.InternalServerError);
    }
  });
}


/**
 *
 * returns inline_response_200_4
 **/
exports.listRequestidsForAcceptanceData = function() {
  return new Promise(function(resolve, reject) {
   try {
      let response = {};
      let requestIdsForAcceptanceData = Array.from(acceptanceDataMap.keys());
      response.message = {
        "request-id-list": requestIdsForAcceptanceData
      };
      resolve(response);
    } catch (error) {
      console.log(error);
      reject(createHttpError.InternalServerError);
    }
  });
}
