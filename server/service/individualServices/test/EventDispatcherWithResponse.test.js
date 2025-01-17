'use strict';

const { dispatchEvent } = require('../EventDispatcherWithResponse');
const LogicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const HttpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const HttpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const RestRequestBuilder = require('onf-core-model-ap/applicationPattern/rest/client/RequestBuilder');
const ExecutionAndTraceService = require('onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService');

jest.mock('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
jest.mock('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
jest.mock('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
jest.mock('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
jest.mock('onf-core-model-ap/applicationPattern/rest/client/RequestBuilder');
jest.mock('onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService');

describe('dispatchEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return response data for successful request (2xx)', async () => {
    OperationClientInterface.getOperationKeyAsync.mockResolvedValue('operationKey');
    OperationClientInterface.getOperationNameAsync.mockResolvedValue('operationName');
    LogicalTerminationPoint.getServerLtpListAsync.mockResolvedValue(['httpClientUuid']);
    HttpClientInterface.getApplicationNameAsync.mockResolvedValue('serverAppName');
    HttpClientInterface.getReleaseNumberAsync.mockResolvedValue('1.0');
    HttpServerInterface.getApplicationNameAsync.mockResolvedValue('originatorApp');
    RestRequestBuilder.BuildAndTriggerRestRequest.mockResolvedValue({
      status: 200,
      data: { message: 'Success' },
    });

    const result = await dispatchEvent(
      'operationClientUuid',
      { key: 'value' },
      'user',
      'xCorrelator',
      'traceIndicator',
      'customerJourney',
      'POST',
      { param1: 'value1' }
    );

    expect(result).toEqual({ message: 'Success' });
    expect(RestRequestBuilder.BuildAndTriggerRestRequest).toHaveBeenCalledTimes(1);
  });

  test('should handle 408 response code and log error', async () => {
    OperationClientInterface.getOperationKeyAsync.mockResolvedValue('operationKey');
    OperationClientInterface.getOperationNameAsync.mockResolvedValue('operationName');
    LogicalTerminationPoint.getServerLtpListAsync.mockResolvedValue(['httpClientUuid']);
    HttpClientInterface.getApplicationNameAsync.mockResolvedValue('serverAppName');
    HttpClientInterface.getReleaseNumberAsync.mockResolvedValue('1.0');
    HttpServerInterface.getApplicationNameAsync.mockResolvedValue('originatorApp');
    RestRequestBuilder.BuildAndTriggerRestRequest.mockResolvedValue({
      status: 408,
      data: { error: 'Timeout' },
    });
    ExecutionAndTraceService.recordServiceRequestFromClient.mockRejectedValue(new Error('Service log failed'));

    const result = await dispatchEvent(
      'operationClientUuid',
      { key: 'value' },
      'user',
      'xCorrelator',
      'traceIndicator',
      'customerJourney',
      'POST',
      { param1: 'value1' }
    );

    expect(result).toEqual({});
    expect(ExecutionAndTraceService.recordServiceRequestFromClient).toHaveBeenCalledTimes(1);
  });

  test('should return empty object for non-2xx response codes (other than 408)', async () => {
    RestRequestBuilder.BuildAndTriggerRestRequest.mockResolvedValue({
      status: 500,
      data: { error: 'Internal Server Error' },
    });

    const result = await dispatchEvent(
      'operationClientUuid',
      { key: 'value' },
      'user',
      'xCorrelator',
      'traceIndicator',
      'customerJourney',
      'POST',
      {}
    );

    expect(result).toEqual({});
    expect(RestRequestBuilder.BuildAndTriggerRestRequest).toHaveBeenCalledTimes(1);
  });
});