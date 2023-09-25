// @ts-check
'use strict';

const axios = require('axios');
const crypto = require('crypto');
const operationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const httpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const createHttpError = require('http-errors');

axios.defaults.headers = {};

// axios.interceptors.request.use(request => {
//   console.log(`Starting Request ${request.url} Headers: ${JSON.stringify(request.headers, null, 2)} Body: ${JSON.stringify(request.data, null, 2)}`);
//   return request;
// })
// axios.interceptors.response.use(response => {
//   console.log(`Response ${response.status} Headers: ${JSON.stringify(response.headers, null, 2)} Body: ${JSON.stringify(response.data, null, 2)}`);
//   return response;
// })

/**
 * HttpClient executes operations provided by other microservices. It automatically updates and sets headers.
 */
module.exports = class HttpClient {
  #user;
  #xCorrelator;
  #traceIndicator;
  #customerJourney;

  /**
   * Initial values which are updated before an operation is executed.
   * @param {string} user User identifier from the system starting the service call. Name of this app will be used if it is undefined.
   * @param {string} xCorrelator UUID for the service execution flow that allows to correlate requests and responses. New UUID is generated if it is undefined.
   * @param {string} traceIndicator Sequence of request numbers along the flow. Header traceIndicator of first operation will be set to "1" if it is undefined.
   * It is incremented for every executed operation. 
   * @param {string} customerJourney Holds information supporting customer’s journey to which the execution applies. "Unknown value" is set if it is undefined.
   */
  constructor(user, xCorrelator, traceIndicator, customerJourney) {
    this.#user = user;
    this.#xCorrelator = xCorrelator == undefined ? crypto.randomUUID() : xCorrelator;
    if (traceIndicator == undefined || traceIndicator === '') {
      this.#traceIndicator = '0'; // it is incremented when service execution is called
    } else {
      this.#traceIndicator = traceIndicator;
    }
    this.#customerJourney = customerJourney == undefined ? 'Unknown value' : customerJourney;
  }

  /**
   * Executes given operation by ID.
   * @param {string} operationUuid ID of the client operation
   * @param {object} body Request body used as is in HTTP POST.
   * @param {number} timeout Timeout in ms after which the operation fails with error.
   * @returns {Promise<object>} Data from HTTP response body.
   */
  async executeOperation(operationUuid, body, timeout = 120000) {
    const ipAndPort = await operationClientInterface.getTcpClientConnectionInfoAsync(operationUuid);
    if (ipAndPort == undefined) {
      throw new createHttpError.InternalServerError(`Cannot resolve IP and port for invocation of service with UUID ${operationUuid}`);
    }
    const operationName = await operationClientInterface.getOperationNameAsync(operationUuid);
    if (operationName == undefined) {
      throw new createHttpError.InternalServerError(`Cannot resolve operation name for invocation of service with UUID ${operationUuid}`);
    }

    const operationKey = await operationClientInterface.getOperationKeyAsync(operationUuid);

    const originator = await httpServerInterface.getApplicationNameAsync();
    if (this.#user == undefined) {
      this.#user = originator;
    }
    this.#traceIndicator = this.#incrementTraceIndicator();
    const headers = {
      'content-type': 'application/json',
      'accept': 'application/json',
      'user': this.#user,
      'originator': originator,
      'x-correlator': this.#xCorrelator,
      'trace-indicator': this.#traceIndicator,
      'customer-journey': this.#customerJourney,
      'operation-key': operationKey
    }
    const axiosConfig = { timeout: timeout, headers: headers }

    return axios.post(`${ipAndPort}` + `${operationName}`, body, axiosConfig).then(resp => resp.data);
  }

  #incrementTraceIndicator() {
    const indexOfDot = this.#traceIndicator.lastIndexOf(".");
    const incLastDigit = parseInt(this.#traceIndicator.substr(indexOfDot + 1)) + 1;
    return this.#traceIndicator.substr(0, indexOfDot + 1) + incLastDigit.toString();
  }
}
