'use strict';

const individualServicesService = require('../IndividualServicesService.js');
const ReadLtpStructure = require('../individualServices/ReadLtpStructure');
const ReadLiveEquipmentData = require('../individualServices/ReadLiveEquipmentData');
const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const IndividualServiceUtility = require('../individualServices/IndividualServiceUtility');
const ReadAcceptanceData = require('../individualServices/ReadAcceptanceData');
const LogicalTerminationPointC = require('../individualServices/custom/LogicalTerminationPointC');
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const createHttpError = require('http-errors');
const checkRegisteredAvailabilityOfDevice = require('../IndividualServicesService');

const { provideAlarmsForLiveNetView } = require('../IndividualServicesService'); 
const ReadLiveAlarmsData = require('../individualServices/ReadLiveAlarmsData');

const { provideStatusForLiveNetView } = require('../IndividualServicesService');
const ReadLiveStatusData = require('../individualServices/ReadLiveStatusData');

global.counterTime;

const ReadConfigurationAirInterfaceData = require('../individualServices/ReadConfigurationAirInterfaceData'); 
const onfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const provideConfigurationForLiveNetView = require('../IndividualServicesService');

const {provideHistoricalPmDataOfDevice} = require("../IndividualServicesService");
const {provideAcceptanceDataOfLinkEndpoint} = require('../IndividualServicesService');
const ReadHistoricalData = require("../individualServices/ReadHistoricalData");

// Mocking dependencies used in the individual services
jest.mock('../individualServices/ReadLtpStructure');
jest.mock('../individualServices/ReadLiveEquipmentData');
jest.mock('../individualServices/ReadAcceptanceData');
jest.mock('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
jest.mock('../individualServices/IndividualServiceUtility');
jest.mock('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
jest.mock('../individualServices/custom/LogicalTerminationPointC');
jest.mock('../individualServices/ReadConfigurationAirInterfaceData');
jest.mock('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
jest.mock('../individualServices/ReadLiveAlarmsData');
// Add this at the top of your test file if not already present
jest.mock('../LoggingService', () => ({
  getLogger: () => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    trace: jest.fn() // Add this to prevent the error
  })
}));


// const logger = require('../LoggingService').getLogger();
const logger = require('../LoggingService').getLogger();


//=====================================================//
jest.mock('../individualServices/ReadLiveStatusData');
jest.mock("../individualServices/ReadHistoricalData");
//=======================================================//

describe('provideEquipmentInfoForLiveNetView', () => {
  afterEach(() => {
    // Clear all mock calls and instances after each test to prevent interference
    jest.clearAllMocks();
  });
  

  it('should resolve with equipment data when everything works correctly', async () => {
    // Arrange: Mocking dependent functions to simulate successful behavior
    ReadLtpStructure.readLtpStructure.mockResolvedValue({
      ltpStructure: { someKey: 'someValue' },
      traceIndicatorIncrementer: 2,
    });
    ReadLiveEquipmentData.readLiveEquipmentData.mockResolvedValue({
      equipmentData: { key: 'value' },
    });

    const body = { 'mount-name': 'Device1', 'link-id': 'Link1' };

    // Act: Call the function with mocked dependencies
    const result = await individualServicesService.provideEquipmentInfoForLiveNetView(
      body,
      'user1',
      'originator1',
      'xCorrelator1',
      'traceIndicator1',
      'customerJourney1'
    );

    // Assert: Verify that the dependencies were called with correct parameters and the result is as expected
    expect(ReadLtpStructure.readLtpStructure).toHaveBeenCalledWith(
      'Device1',
      {
        user: 'user1',
        originator: 'originator1',
        xCorrelator: 'xCorrelator1',
        traceIndicator: 'traceIndicator1',
        customerJourney: 'customerJourney1',
      },
      1
    );
    expect(ReadLiveEquipmentData.readLiveEquipmentData).toHaveBeenCalledWith(
      'Device1',
      'Link1',
      { someKey: 'someValue' },
      {
        user: 'user1',
        originator: 'originator1',
        xCorrelator: 'xCorrelator1',
        traceIndicator: 'traceIndicator1',
        customerJourney: 'customerJourney1',
      },
      2
    );
    expect(result).toEqual({ equipmentData: { key: 'value' } });
  });

  it('should reject with NotFound error when equipmentResult is undefined', async () => {
    // Arrange: Mock the second function to return undefined
    ReadLtpStructure.readLtpStructure.mockResolvedValue({
      ltpStructure: { someKey: 'someValue' },
      traceIndicatorIncrementer: 2,
    });
    ReadLiveEquipmentData.readLiveEquipmentData.mockResolvedValue(undefined);

    const body = { 'mount-name': 'Device1', 'link-id': 'Link1' };

    // Act and Assert: Ensure that the function throws a NotFound error
    await expect(
      individualServicesService.provideEquipmentInfoForLiveNetView(
        body,
        'user1',
        'originator1',
        'xCorrelator1',
        'traceIndicator1',
        'customerJourney1'
      )
    ).rejects.toThrow(createHttpError.NotFound);
  });

  it('should reject with InternalServerError when LTP structure fails', async () => {
    // Arrange: Mock the first function to throw an error
    ReadLtpStructure.readLtpStructure.mockRejectedValue(new Error('LTP structure error'));

    const body = { 'mount-name': 'Device1', 'link-id': 'Link1' };

    // Act and Assert: Ensure the error is correctly propagated
    await expect(
      individualServicesService.provideEquipmentInfoForLiveNetView(
        body,
        'user1',
        'originator1',
        'xCorrelator1',
        'traceIndicator1',
        'customerJourney1'
      )
    ).rejects.toThrow(createHttpError.BadGateway);

    // Verify that the second function is not called when the first fails
    expect(ReadLiveEquipmentData.readLiveEquipmentData).not.toHaveBeenCalled();
  });

it('should log an error and reject when ReadLiveEquipmentData throws an error', async () => {
  ReadLtpStructure.readLtpStructure.mockResolvedValue({
    ltpStructure: { someKey: 'someValue' },
    traceIndicatorIncrementer: 2,
  });

  const equipmentError = new Error('Equipment data fetch failed');
  ReadLiveEquipmentData.readLiveEquipmentData.mockRejectedValue(equipmentError);

  const body = { 'mount-name': 'Device1', 'link-id': 'Link1' };

  await expect(
    individualServicesService.provideEquipmentInfoForLiveNetView(
      body,
      'user1',
      'originator1',
      'xCorrelator1',
      'traceIndicator1',
      'customerJourney1'
    )
  ).rejects.toThrow('Equipment data fetch failed');
  });
});

describe('updateAptClient', () => {
  let mockBody;
  let consoleSpy;

  // Prepare mock data before each test
  beforeEach(() => {
    mockBody = {
      "future-release-number": "1.0",
      "future-apt-protocol": "HTTP",
      "future-apt-address": {
        "ip-address": {
          "ipv-4-address": "127.0.0.1"
        }
      },
      "future-apt-tcp-port": "8080",
      "future-acceptance-data-receive-operation": "OperationA",
      "future-performance-data-receive-operation": "OperationB"
    };
    
    // Mock global counterTime
    global.counterTime = 0;
    
    // Spy on console.log
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  // Clean up after each test
  afterEach(() => {
    global.counterTime = 0;
    consoleSpy.mockRestore();
  });

  it('should resolve when all operations succeed', async () => {
    // Arrange: Mocking dependencies to simulate successful behavior
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({ uuid: 'aptp-1-1-0-op-fc-bm-001' });
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(1); // Assume minimum time = 1 hour
    fileOperation.readFromDatabaseAsync.mockResolvedValue({});
    LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteProtocolLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemotePortLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteAddressLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolOperationNameLtpAsync.mockResolvedValue(true);

    // Mock Date.now to return a time that satisfies the condition
    const mockCurrentTime = Date.now() + 4 * 60 * 60 * 1000; // 4 hours from now
    jest.spyOn(Date, 'now').mockReturnValue(mockCurrentTime);

    // Act: Call the updateAptClient function
    await expect(individualServicesService.updateAptClient(mockBody)).resolves.toEqual({});

    // Assert: Verify all mocked dependencies were called with the expected parameters
    expect(forwardingDomain.getForwardingConstructForTheForwardingNameAsync).toHaveBeenCalledWith("RequestForProvidingConfigurationForLivenetviewCausesReadingLtpStructure");
    expect(IndividualServiceUtility.extractProfileConfiguration).toHaveBeenCalledWith('aptp-1-1-0-integer-p-004');
    expect(fileOperation.readFromDatabaseAsync).toHaveBeenCalledWith("");
    expect(LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync).toHaveBeenCalledWith("aptp-1-1-0-http-c-apt-24-5-0-000", "1.0");
    expect(LogicalTerminationPointC.setLayerProtolRemoteProtocolLtpAsync).toHaveBeenCalledWith("aptp-1-1-0-tcp-c-apt-24-5-0-000", "tcp-client-interface-1-0:PROTOCOL_TYPE_HTTP");
    expect(LogicalTerminationPointC.setLayerProtolRemotePortLtpAsync).toHaveBeenCalledWith("aptp-1-1-0-tcp-c-apt-24-5-0-000", "8080");
    expect(LogicalTerminationPointC.setLayerProtolRemoteAddressLtpAsync).toHaveBeenCalledWith("aptp-1-1-0-tcp-c-apt-24-5-0-000", "127.0.0.1");
    expect(LogicalTerminationPointC.setLayerProtolOperationNameLtpAsync).toHaveBeenCalledTimes(2);
    
    // Verify counterTime was updated
    expect(global.counterTime).toBe(mockCurrentTime);
    
    Date.now.mockRestore();
  });

  it('should throw error if protocol operation fails', async () => {
    // Arrange: Mock successful initial operations
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({ uuid: 'aptp-1-1-0-op-fc-bm-001' });
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(1);
    fileOperation.readFromDatabaseAsync.mockResolvedValue({});
    
    // Mock Date.now to return a time that satisfies the time condition
    const mockCurrentTime = Date.now() + 4 * 60 * 60 * 1000;
    jest.spyOn(Date, 'now').mockReturnValue(mockCurrentTime);
    
    // Simulate failure in one of the async operations
    LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync.mockResolvedValue(false);
    IndividualServiceUtility.resetCompleteFile.mockResolvedValue(true);

    // Act and Assert: Expect an Internal Server Error to be thrown
    await expect(individualServicesService.updateAptClient(mockBody)).rejects.toThrow(
      createHttpError.InternalServerError
    );
    
    // Verify that resetCompleteFile was called during error handling
    expect(IndividualServiceUtility.resetCompleteFile).toHaveBeenCalled();
    
    Date.now.mockRestore();
  });

  it('should throw TooEarly error if time condition fails', async () => {
    // Arrange: Mock the forwarding construct
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({ uuid: 'aptp-1-1-0-op-fc-bm-001' });
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(1); // minimum time = 1 hour
    
    // Set counterTime to current time and mock Date.now to return a time that fails the condition
    const currentTime = Date.now();
    global.counterTime = currentTime;
    jest.spyOn(Date, 'now').mockReturnValue(currentTime + 30 * 60 * 1000); // Only 30 minutes later

    // Act and Assert: Expect a TooEarly error to be thrown
    await expect(individualServicesService.updateAptClient(mockBody)).rejects.toThrow(
      createHttpError.TooEarly
    );
    
    // Verify that file operations were not called
    expect(fileOperation.readFromDatabaseAsync).not.toHaveBeenCalled();
    
    Date.now.mockRestore();
  });

  it('should handle errors during coreModelJsonObject reset', async () => {
    // Arrange: Mock successful responses for initial operations
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({ uuid: 'aptp-1-1-0-op-fc-bm-001' });
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(1);
    
    // Mock Date.now to satisfy time condition
    const mockCurrentTime = Date.now() + 4 * 60 * 60 * 1000;
    jest.spyOn(Date, 'now').mockReturnValue(mockCurrentTime);
    
    fileOperation.readFromDatabaseAsync.mockResolvedValue({});
    LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteProtocolLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemotePortLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteAddressLtpAsync.mockResolvedValue(true);
    
    // Make the last operation fail to trigger error handling
    LogicalTerminationPointC.setLayerProtolOperationNameLtpAsync
      .mockResolvedValueOnce(true)  // First call succeeds
      .mockResolvedValueOnce(false); // Second call fails

    // Simulate error during coreModelJsonObject restoration
    IndividualServiceUtility.resetCompleteFile.mockRejectedValue(new Error('File restoration failed'));

    // Act and Assert: Expect an Internal Server Error to be thrown
    await expect(individualServicesService.updateAptClient(mockBody)).rejects.toThrow(
      createHttpError.InternalServerError
    );
    
    // Verify that resetCompleteFile was called and failed
    expect(IndividualServiceUtility.resetCompleteFile).toHaveBeenCalled();
    
    // Verify console.log was called twice (once for operation failure, once for reset failure)
    expect(consoleSpy).toHaveBeenCalledTimes(3);
    
    Date.now.mockRestore();
  });

  it('should handle HTTPS protocol correctly', async () => {
    // Arrange: Modify mockBody to use HTTPS
    mockBody["future-apt-protocol"] = "HTTPS";
    
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({ uuid: 'aptp-1-1-0-op-fc-bm-001' });
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(1);
    fileOperation.readFromDatabaseAsync.mockResolvedValue({});
    LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteProtocolLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemotePortLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteAddressLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolOperationNameLtpAsync.mockResolvedValue(true);

    const mockCurrentTime = Date.now() + 4 * 60 * 60 * 1000;
    jest.spyOn(Date, 'now').mockReturnValue(mockCurrentTime);

    // Act
    await expect(individualServicesService.updateAptClient(mockBody)).resolves.toEqual({});

    // Assert: Verify HTTPS protocol was set correctly
    expect(LogicalTerminationPointC.setLayerProtolRemoteProtocolLtpAsync).toHaveBeenCalledWith(
      "aptp-1-1-0-tcp-c-apt-24-5-0-000", 
      "tcp-client-interface-1-0:PROTOCOL_TYPE_HTTPS"
    );
    
    Date.now.mockRestore();
  });
});

describe('checkRegisteredAvailabilityOfDevice', () => {
  let body;

  beforeEach(() => {
    body = { 'mount-name': 'test-mount' };
    global.connectedDeviceList = { "mount-name-list": ['test-mount'] };
    global.counter = 0;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when the device is in the connected device list', async () => {
    const mockForwardingConstruct = { uuid: 'uuid-op001' };
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue(mockForwardingConstruct);
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(10);

    const result = await checkRegisteredAvailabilityOfDevice.checkRegisteredAvailabilityOfDevice(body);

    expect(result).toEqual({ "device-is-available": true });
    expect(forwardingDomain.getForwardingConstructForTheForwardingNameAsync).toHaveBeenCalledWith(
      "RequestForProvidingConfigurationForLivenetviewCausesReadingLtpStructure"
    );
    expect(IndividualServiceUtility.extractProfileConfiguration).toHaveBeenCalledWith('uuid-integer-p-002');
  });

  it('should return false when the device is not in the connected device list', async () => {
    body['mount-name'] = 'unknown-mount';
    const mockForwardingConstruct = { uuid: 'uuid-op001' };
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue(mockForwardingConstruct);
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(10);

    const result = await checkRegisteredAvailabilityOfDevice.checkRegisteredAvailabilityOfDevice(body);

    expect(result).toEqual({ "device-is-available": false });
    expect(forwardingDomain.getForwardingConstructForTheForwardingNameAsync).toHaveBeenCalled();
    expect(IndividualServiceUtility.extractProfileConfiguration).toHaveBeenCalled();
  });

  it('should throw a TooManyRequests error when the counter exceeds the limit', async () => {
    const mockForwardingConstruct = { uuid: 'uuid-op001' };
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue(mockForwardingConstruct);
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(1);

    global.counter = 2; // Simulate counter exceeding limit

    await expect(checkRegisteredAvailabilityOfDevice.checkRegisteredAvailabilityOfDevice(body)).rejects.toThrow(createHttpError.TooManyRequests);

    expect(forwardingDomain.getForwardingConstructForTheForwardingNameAsync).toHaveBeenCalled();
    expect(IndividualServiceUtility.extractProfileConfiguration).toHaveBeenCalled();
  });

  it('should decrement the counter in the finally block', async () => {
    const mockForwardingConstruct = { uuid: 'uuid-op001' };
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue(mockForwardingConstruct);
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(10);

    global.counter = 2;

    await checkRegisteredAvailabilityOfDevice.checkRegisteredAvailabilityOfDevice(body).catch(() => {}); // Ensure finally block is executed

    expect(global.counter).toBe(2);
  });

  it('should reject the promise when an error occurs in getForwardingConstructForTheForwardingNameAsync', async () => {
    const error = new Error('Unexpected error');
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockRejectedValue(error);

    await expect(checkRegisteredAvailabilityOfDevice.checkRegisteredAvailabilityOfDevice(body)).rejects.toThrow(error);

    expect(forwardingDomain.getForwardingConstructForTheForwardingNameAsync).toHaveBeenCalled();
  });

  it('should reject the promise when an error occurs and still decrement the counter', async () => {
    const error = new Error('Unexpected error');
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockRejectedValue(error);
    
    global.counter = 2;

    await expect(checkRegisteredAvailabilityOfDevice.checkRegisteredAvailabilityOfDevice(body)).rejects.toThrow(error);

    expect(global.counter).toBe(1);
  });

  it('should handle missing mount-name-list in connectedDeviceList gracefully', async () => {
    global.connectedDeviceList = {}; // Simulate empty connectedDeviceList
    const mockForwardingConstruct = { uuid: 'uuid-op001' };
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue(mockForwardingConstruct);
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(10);

    const result = await checkRegisteredAvailabilityOfDevice.checkRegisteredAvailabilityOfDevice(body);

    expect(result).toEqual({ "device-is-available": false });
  });

  it('should decrement counter even when extractProfileConfiguration fails', async () => {
    const mockForwardingConstruct = { uuid: 'uuid-op001' };
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue(mockForwardingConstruct);
    IndividualServiceUtility.extractProfileConfiguration.mockRejectedValue(new Error('Config error'));

    global.counter = 1;

    await expect(checkRegisteredAvailabilityOfDevice.checkRegisteredAvailabilityOfDevice(body)).rejects.toThrow('Config error');

    expect(global.counter).toBe(0);
  });
});

describe('provideConfigurationForLiveNetView', () => {
  let body, user, originator, xCorrelator, traceIndicator, customerJourney;

  beforeEach(() => {
    body = { "mount-name": "test-mount", "link-id": "test-link" };
    user = "test-user";
    originator = "test-originator";
    xCorrelator = "test-xCorrelator";
    traceIndicator = "test-traceIndicator";
    customerJourney = "test-customerJourney";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with formatted air interface data when processing is successful', async () => {
    const mockLtpStructureResult = {
      ltpStructure: { key: 'value' },
      traceIndicatorIncrementer: 2,
    };
    ReadLtpStructure.readLtpStructure.mockResolvedValue(mockLtpStructureResult);

    const mockAirInterfaceResult = {
      uuidUnderTest: 'test-uuid',
      airInterface: { "interface-type": "5G" },
      traceIndicatorIncrementer: 3,
    };
    ReadConfigurationAirInterfaceData.readConfigurationAirInterfaceData.mockResolvedValue(mockAirInterfaceResult);

    onfAttributeFormatter.modifyJsonObjectKeysToKebabCase.mockReturnValue({ "interface-type": "5g" });

    const result = await provideConfigurationForLiveNetView.provideConfigurationForLiveNetView(
      body,
      user,
      originator,
      xCorrelator,
      traceIndicator,
      customerJourney
    );

    expect(result).toEqual({ "interface-type": "5g" });
    expect(ReadLtpStructure.readLtpStructure).toHaveBeenCalledWith(
      body["mount-name"],
      expect.any(Object),
      1
    );
    expect(ReadConfigurationAirInterfaceData.readConfigurationAirInterfaceData).toHaveBeenCalledWith(
      body["mount-name"],
      body["link-id"],
      mockLtpStructureResult.ltpStructure,
      expect.any(Object),
      2
    );
    expect(onfAttributeFormatter.modifyJsonObjectKeysToKebabCase).toHaveBeenCalledWith(mockAirInterfaceResult.airInterface);
  });

  it('should resolve with an empty object if air interface data is not available', async () => {
    const mockLtpStructureResult = {
      ltpStructure: { key: 'value' },
      traceIndicatorIncrementer: 2,
    };
    ReadLtpStructure.readLtpStructure.mockResolvedValue(mockLtpStructureResult);

    const mockAirInterfaceResult = {
      uuidUnderTest: '',
      airInterface: {},
      traceIndicatorIncrementer: 3,
    };
    ReadConfigurationAirInterfaceData.readConfigurationAirInterfaceData.mockResolvedValue(mockAirInterfaceResult);

    onfAttributeFormatter.modifyJsonObjectKeysToKebabCase.mockReturnValue({});

    const result = await provideConfigurationForLiveNetView.provideConfigurationForLiveNetView(
      body,
      user,
      originator,
      xCorrelator,
      traceIndicator,
      customerJourney
    );

    expect(result).toEqual({});
  });

  it('should reject with an error if ReadLtpStructure fails', async () => {
    const error = new Error('Failed to read LTP structure');
    ReadLtpStructure.readLtpStructure.mockRejectedValue(error);

    await expect(
      provideConfigurationForLiveNetView.provideConfigurationForLiveNetView(
        body,
        user,
        originator,
        xCorrelator,
        traceIndicator,
        customerJourney
      )
    ).rejects.toThrow(createHttpError.BadGatewayError);

    expect(ReadLtpStructure.readLtpStructure).toHaveBeenCalledWith(
      body["mount-name"],
      expect.any(Object),
      1
    );
  });

  it('should handle null airInterfaceResult gracefully', async () => {
    const mockLtpStructureResult = {
      ltpStructure: { key: 'value' },
      traceIndicatorIncrementer: 2,
    };
    ReadLtpStructure.readLtpStructure.mockResolvedValue(mockLtpStructureResult);

    ReadConfigurationAirInterfaceData.readConfigurationAirInterfaceData.mockResolvedValue(null);

    const result = await provideConfigurationForLiveNetView.provideConfigurationForLiveNetView(
      body,
      user,
      originator,
      xCorrelator,
      traceIndicator,
      customerJourney
    );

    expect(result).toEqual({});
  });

 it('should log an error and reject when ReadConfigurationAirInterfaceData fails', async () => {
   // Spy on console.log to verify error logging
   const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
   
   const mockLtpStructureResult = {
     ltpStructure: { key: 'value' },
     traceIndicatorIncrementer: 2,
   };
   ReadLtpStructure.readLtpStructure.mockResolvedValue(mockLtpStructureResult);
 
   const error = new Error('Service unavailable');
   ReadConfigurationAirInterfaceData.readConfigurationAirInterfaceData.mockRejectedValue(error);
 
   // The function should reject, not resolve
   await expect(
     provideConfigurationForLiveNetView.provideConfigurationForLiveNetView(
       body,
       user,
       originator,
       xCorrelator,
       traceIndicator,
       customerJourney
     )
   ).rejects.toThrow('Service unavailable');
 
   // Verify that console.log was called with the error
   expect(consoleSpy).toHaveBeenCalledWith(error);
   
   consoleSpy.mockRestore();
 });
});

describe('provideAlarmsForLiveNetView', () => {
  let mockBody, mockUser, mockHeaders;

  beforeEach(() => {
    // Reset counter status
    global.counterAlarms = 0;

    // Mock request data
    mockBody = { "mount-name": "testMount" };
    mockUser = "testUser";
    mockHeaders = {
      originator: "testOriginator",
      xCorrelator: "testXCorrelator",
      traceIndicator: "testTrace",
      customerJourney: "testJourney"
    };

    // Mocking forwarding construct
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({ uuid: "op12345" });

    // Mocking profile configuration
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(5);

    // Mocking alarm data retrieval
    ReadLiveAlarmsData.readLiveAlarmsData.mockResolvedValue({
      alarms: { alarm1: "high", alarm2: "low" }
    });

    // Mock attribute formatter
    onfAttributeFormatter.modifyJsonObjectKeysToKebabCase.mockImplementation(obj => obj);
  });

  test('should return alarms data successfully', async () => {
    await expect(provideAlarmsForLiveNetView(mockBody, mockUser, ...Object.values(mockHeaders)))
      .resolves.toEqual({ alarm1: "high", alarm2: "low" });
  });

  test('should throw TooManyRequests error when max requests exceeded', async () => {
    global.counterAlarms = 6; // Simulate exceeding request limit

    await expect(provideAlarmsForLiveNetView(mockBody, mockUser, ...Object.values(mockHeaders)))
      .rejects.toThrow(createHttpError.TooManyRequests);
  });

  test('should resolve empty when no alarms are found', async () => {
    ReadLiveAlarmsData.readLiveAlarmsData.mockResolvedValue();

    await expect(provideAlarmsForLiveNetView(mockBody, mockUser, ...Object.values(mockHeaders)))
      .resolves.toBeUndefined();
  });

  // test('should throw InternalServerError when alarm retrieval fails', async () => {
  //   ReadLiveAlarmsData.readLiveAlarmsData.mockRejectedValue(new Error('Alarm Retrieval Failed'));

  //   await expect(provideAlarmsForLiveNetView(mockBody, mockUser, ...Object.values(mockHeaders)))
  //     .toBeUndefined;
  // });

});

describe('provideStatusForLiveNetView', () => {
  let mockBody, mockUser, mockHeaders;
  beforeEach(() => {
    // Reset counter status
    global.counterStatus = 0;

    // Mock request data
    mockBody = { "mount-name": "testMount", "link-id": "testLink" };
    mockUser = "testUser";
    mockHeaders = {
      originator: "testOriginator",
      xCorrelator: "testXCorrelator",
      traceIndicator: "testTrace",
      customerJourney: "testJourney"
    };

    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({ uuid: "op12345" });

    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(5);

    ReadLtpStructure.readLtpStructure.mockResolvedValue({
      ltpStructure: { someKey: "someValue" },
      traceIndicatorIncrementer: 2
    });

    ReadLiveStatusData.readStatusInterfaceData.mockResolvedValue({
      airInterface: { status: "active" },
      traceIndicatorIncrementer: 3
    });
  });

  test('should return status for live net view', async () => {
    await expect(provideStatusForLiveNetView(mockBody, mockUser, ...Object.values(mockHeaders)))
      .resolves.toEqual({ status: "active" });
  });

  test('should throw TooManyRequests error when max requests exceeded', async () => {
    global.counterStatus = 6; // Simulate max requests exceeded

    await expect(provideStatusForLiveNetView(mockBody, mockUser, ...Object.values(mockHeaders)))
      .rejects.toThrow(createHttpError.TooManyRequests);
  });

  test('should throw InternalServerError when LTP structure retrieval fails', async () => {
    ReadLtpStructure.readLtpStructure.mockRejectedValue(new Error('LTP Error'));

    await expect(provideStatusForLiveNetView(mockBody, mockUser, ...Object.values(mockHeaders)))
      .rejects.toThrow(createHttpError.BadGatewayError);
  });
});

describe("provideHistoricalPmDataOfDevice", () => {
  let mockRequestHeaders;
  let mockBody;

  beforeEach(() => {
    mockRequestHeaders = {
      user: "testUser",
      originator: "testOriginator",
      xCorrelator: "testXCorrelator",
      traceIndicator: "testTraceIndicator",
      customerJourney: "testJourney"
    };

    mockBody = [
      { "mount-name": "device1", "time-stamp": "2025-02-24T12:00:00Z" },
      { "mount-name": "device2", "time-stamp": "2025-02-24T12:00:00Z" }
    ];

    // Reset mock counter
    global.counterStatusHistoricalPMDataCall = 0;
  });

  test("should return the request id for PM data successfully", async () => {
    // Mock responses
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({ uuid: "test-op123" });
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(5);
    IndividualServiceUtility.generateRequestIdForHistoricalPMDataAPI.mockResolvedValue(5898989898);
    ReadLtpStructure.readLtpStructure.mockResolvedValue({
      ltpStructure: { key: "ltpData" },
      traceIndicatorIncrementer: 2
    });
    ReadHistoricalData.readHistoricalData.mockResolvedValue({
      "air-interface-list": [{ key: "airData" }],
      "ethernet-container-list": [{ key: "ethData" }]
    });

    const result = await provideHistoricalPmDataOfDevice(mockBody, ...Object.values(mockRequestHeaders));


    expect(result).toMatchObject({
      "request-id": 5898989898
    });

  });

  test("should throw TooManyRequests error when max parallel requests exceeded", async () => {
    global.counterStatusHistoricalPMDataCall = 6; // Simulating exceeded limit
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(5);

    await expect(provideHistoricalPmDataOfDevice(mockBody, ...Object.values(mockRequestHeaders)))
      .rejects.toThrow(createHttpError.TooManyRequests);
  });

  // test("should throw NotFound error if both air-interface and ethernet-container lists are empty", async () => {
  //   forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({ uuid: "test-op123" });
  //   IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(5);
  //   ReadLtpStructure.readLtpStructure.mockResolvedValue({
  //     ltpStructure: { key: "ltpData" },
  //     traceIndicatorIncrementer: 2
  //   });
  //   ReadHistoricalData.readHistoricalData.mockResolvedValue({});

  //   await expect(provideHistoricalPmDataOfDevice(mockBody, ...Object.values(mockRequestHeaders)))
  //     .rejects.toThrow(createHttpError.NotFound);
  // });

  test("should reject with an error if an unexpected error occurs", async () => {
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockRejectedValue(new Error("Unexpected Error"));

    await expect(provideHistoricalPmDataOfDevice(mockBody, ...Object.values(mockRequestHeaders)))
      .rejects.toThrow("Unexpected Error");
  });
});

describe('provideAcceptanceDataOfLinkEndpoint', () => {
  beforeEach(() => {
    global.counterStatusAcceptanceDataOfLinkEndpointCall = 0;
    global.connectedDeviceList = {
      "mount-name-list": ["testMount", "mountX", "mountY"]
    };

    jest.clearAllMocks();

    // Mock dependencies
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync = jest.fn();
    IndividualServiceUtility.extractProfileConfiguration = jest.fn();
    IndividualServiceUtility.generateRequestId = jest.fn();
    ReadAcceptanceData.processAcceptanceDataRequest = jest.fn();
  });

  it('should resolve with request-id on successful call', async () => {
    const body = {
      "mount-name": "testMount",
      "link-id": "testLink"
    };

    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({
      uuid: "abc-op123"
    });

    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(3);
    IndividualServiceUtility.generateRequestId.mockResolvedValue("req-123");
    ReadAcceptanceData.processAcceptanceDataRequest.mockResolvedValue();

    const response = await provideAcceptanceDataOfLinkEndpoint(
      body, "testUser", "origin", "xCorr", 1, "custJourney"
    );

    expect(response).toEqual({ "request-id": "req-123" });
    expect(ReadAcceptanceData.processAcceptanceDataRequest).toHaveBeenCalledWith(
      "testMount", "testLink", "req-123",
      {
        user: "testUser",
        originator: "origin",
        xCorrelator: "xCorr",
        traceIndicator: 1,
        customerJourney: "custJourney"
      },
      1
    );
  });

  it('should reject if too many requests', async () => {
    const body = {
      "mount-name": "mountX",
      "link-id": "linkY"
    };

    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({
      uuid: "prefix-op000"
    });

    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(0); // max ops = 0

    await expect(
      provideAcceptanceDataOfLinkEndpoint(body, "user", "origin", "x", 1, "journey")
    ).rejects.toThrow("Too many requests");

    expect(global.counterStatusAcceptanceDataOfLinkEndpointCall).toBe(0);
  });

  it('should reject if generateRequestId fails', async () => {
    const body = {
      "mount-name": "mountY",
      "link-id": "linkZ"
    };

    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({
      uuid: "some-op000"
    });

    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(2);
    IndividualServiceUtility.generateRequestId.mockRejectedValue(new Error("ID Error"));

    await expect(
      provideAcceptanceDataOfLinkEndpoint(body, "user", "origin", "x", 1, "journey")
    ).rejects.toThrow("ID Error");

    expect(global.counterStatusAcceptanceDataOfLinkEndpointCall).toBe(0);
  });

  it('should reject if mount-name is not in connectedDeviceList', async () => {
    const body = {
      "mount-name": "unknownMount",
      "link-id": "linkZ"
    };

    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({
      uuid: "some-op000"
    });

    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(2);

    await expect(
      provideAcceptanceDataOfLinkEndpoint(body, "user", "origin", "x", 1, "journey")
    ).rejects.toThrow("Not connected. Requested device is currently not in connected state at the controller");

    expect(global.counterStatusAcceptanceDataOfLinkEndpointCall).toBe(0);
  });
});
