'use strict';

const { updateAptClient } = require('../IndividualServicesService');
const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const IndividualServiceUtility = require('../individualServices/IndividualServiceUtility');
const LogicalTerminationPointC = require('../individualServices/custom/LogicalTerminationPointC');
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const createHttpError = require('http-errors');
global.counterTime;


jest.mock('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
jest.mock('../individualServices/IndividualServiceUtility');
jest.mock('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
jest.mock('../individualServices/custom/LogicalTerminationPointC');

describe('updateAptClient', () => {
  let mockBody;

  beforeEach(() => {
    mockBody = {
      "future-release-number": "1.0",
      "future-apt-protocol": "HTTP",
      "future-apt-address": "127.0.0.1",
      "future-apt-tcp-port": "8080",
      "future-acceptance-data-receive-operation": "OperationA",
      "future-performance-data-receive-operation": "OperationB"
    };
    global.counterTime=0;
  });

  afterEach(() => {
    // Reset the value of global.counterTime after each test
    global.counterTime = 0;  
  });
  it('should resolve when all operations succeed', async () => {
    // Mock the return values for dependencies
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({ uuid: 'some-uuid' });
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(1); // Assume minimum time = 1 hour
    fileOperation.readFromDatabaseAsync.mockResolvedValue({});
    LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteProtocolLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemotePortLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteAddressLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolOperationNameLtpAsync.mockResolvedValue(true);

    // Call the function
    await expect(updateAptClient(mockBody)).resolves.toEqual({});

    // Ensure the dependencies were called correctly
    expect(forwardingDomain.getForwardingConstructForTheForwardingNameAsync).toHaveBeenCalledWith("RequestForProvidingConfigurationForLivenetviewCausesReadingLtpStructure");
    expect(IndividualServiceUtility.extractProfileConfiguration).toHaveBeenCalledWith('some-uuidinteger-p-004');
    expect(fileOperation.readFromDatabaseAsync).toHaveBeenCalled();
    expect(LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync).toHaveBeenCalledWith("aptp-1-1-0-http-c-apt-24-5-0-000", "1.0");
    
  });

  it('should throw error if protocol operation fails', async () => {
    // Simulate failure in one of the async operations
    LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync.mockResolvedValue(false);

    await expect(updateAptClient(mockBody)).rejects.toThrowError(new createHttpError.InternalServerError("Internal Server Error"));
  });

  it('should throw TooEarly error if time condition fails', async () => {
    // Simulate the scenario where counterTime + minimumTime > currentTime
    global.counterTime = Date.now();
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(1); // minimum time = 1 hour
    await expect(updateAptClient(mockBody)).rejects.toThrowError(new createHttpError.TooEarly("Too early"));
  });

  it('should handle errors during coreModelJsonObject reset', async () => {
    // Mock failure during coreModelJsonObject reset
    fileOperation.readFromDatabaseAsync.mockResolvedValue({});
    LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteProtocolLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemotePortLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteAddressLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolOperationNameLtpAsync.mockResolvedValue(false);

    // Simulate error during coreModelJsonObject restoration
    IndividualServiceUtility.resetCompleteFile.mockRejectedValue(new Error('File restoration failed'));

    await expect(updateAptClient(mockBody)).rejects.toThrowError(new createHttpError.InternalServerError("Internal Server Error"));
  });
});
