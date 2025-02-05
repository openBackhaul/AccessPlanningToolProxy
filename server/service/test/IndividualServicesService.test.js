'use strict';

const individualServicesService = require('../IndividualServicesService.js');
const ReadLtpStructure = require('../individualServices/ReadLtpStructure');
const ReadLiveEquipmentData = require('../individualServices/ReadLiveEquipmentData');
const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const IndividualServiceUtility = require('../individualServices/IndividualServiceUtility');
const LogicalTerminationPointC = require('../individualServices/custom/LogicalTerminationPointC');
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const createHttpError = require('http-errors');
const checkRegisteredAvailabilityOfDevice = require('../IndividualServicesService'); // Replace with actual path

global.counterTime;


const ReadConfigurationAirInterfaceData = require('../individualServices/ReadConfigurationAirInterfaceData'); // Replace with actual path
const onfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const provideConfigurationForLiveNetView = require('../IndividualServicesService');

// Mocking dependencies used in the individual services
jest.mock('../individualServices/ReadLtpStructure');
jest.mock('../individualServices/ReadLiveEquipmentData');
jest.mock('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
jest.mock('../individualServices/IndividualServiceUtility');
jest.mock('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
jest.mock('../individualServices/custom/LogicalTerminationPointC');
jest.mock('../individualServices/ReadConfigurationAirInterfaceData');
jest.mock('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');


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
    ).rejects.toThrow(createHttpError.InternalServerError);

    // Verify that the second function is not called when the first fails
    expect(ReadLiveEquipmentData.readLiveEquipmentData).not.toHaveBeenCalled();
  });

  it('should log an error and reject when ReadLiveEquipmentData throws an error', async () => {
    // Arrange: Mock the second function to throw an error and spy on console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    ReadLtpStructure.readLtpStructure.mockResolvedValue({
      ltpStructure: { someKey: 'someValue' },
      traceIndicatorIncrementer: 2,
    });
    ReadLiveEquipmentData.readLiveEquipmentData.mockRejectedValue(new Error('Empty Equiment not found'));

    const body = { 'mount-name': 'Device1', 'link-id': 'Link1' };

    // Act and Assert: Ensure that the error is logged and propagated
    await expect(
      individualServicesService.provideEquipmentInfoForLiveNetView(
        body,
        'user1',
        'originator1',
        'xCorrelator1',
        'traceIndicator1',
        'customerJourney1'
      )
    ).rejects.toThrow('Empty Equiment not found');

    expect(consoleSpy).toHaveBeenCalledWith(' Error: Empty Equiment not found');
    consoleSpy.mockRestore();
  });
});

describe('updateAptClient', () => {
  let mockBody;

  // Prepare mock data before each test
  beforeEach(() => {
    mockBody = {
      "future-release-number": "1.0",
      "future-apt-protocol": "HTTP",
      "future-apt-address": "127.0.0.1",
      "future-apt-tcp-port": "8080",
      "future-acceptance-data-receive-operation": "OperationA",
      "future-performance-data-receive-operation": "OperationB"
    };
    global.counterTime = 0; // Reset the global counter time
  });

  // Clean up after each test
  afterEach(() => {
    global.counterTime = 0;
  });

  it('should resolve when all operations succeed', async () => {
    // Arrange: Mocking dependencies to simulate successful behavior
    forwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({ uuid: 'aptp-1-1-0-' });
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(1); // Assume minimum time = 1 hour
    fileOperation.readFromDatabaseAsync.mockResolvedValue({});
    LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteProtocolLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemotePortLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteAddressLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolOperationNameLtpAsync.mockResolvedValue(true);

    // Act: Call the updateAptClient function
    await expect(individualServicesService.updateAptClient(mockBody)).resolves.toEqual({});

    // Assert: Verify all mocked dependencies were called with the expected parameters
    expect(forwardingDomain.getForwardingConstructForTheForwardingNameAsync).toHaveBeenCalledWith("RequestForProvidingConfigurationForLivenetviewCausesReadingLtpStructure");
    expect(IndividualServiceUtility.extractProfileConfiguration).toHaveBeenCalledWith('aptp-1-1-0-integer-p-004');
    expect(fileOperation.readFromDatabaseAsync).toHaveBeenCalled();
    expect(LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync).toHaveBeenCalledWith("aptp-1-1-0-http-c-apt-24-5-0-000", "1.0");
  });

  it('should throw error if protocol operation fails', async () => {
    // Arrange: Simulate failure in one of the async operations
    LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync.mockResolvedValue(false);

    // Act and Assert: Expect an Internal Server Error to be thrown
    await expect(individualServicesService.updateAptClient(mockBody)).rejects.toThrowError(
      new createHttpError.InternalServerError("Internal Server Error")
    );
  });

  it('should throw TooEarly error if time condition fails', async () => {
    // Arrange: Simulate the scenario where counterTime + minimumTime > currentTime
    global.counterTime = Date.now(); // Set the current global counter time
    IndividualServiceUtility.extractProfileConfiguration.mockResolvedValue(1); // minimum time = 1 hour

    // Act and Assert: Expect a TooEarly error to be thrown
    await expect(individualServicesService.updateAptClient(mockBody)).rejects.toThrowError(
      new createHttpError.TooEarly("Too early")
    );
  });

  it('should handle errors during coreModelJsonObject reset', async () => {
    // Arrange: Mock successful responses for operations leading up to the reset
    fileOperation.readFromDatabaseAsync.mockResolvedValue({});
    LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteProtocolLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemotePortLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolRemoteAddressLtpAsync.mockResolvedValue(true);
    LogicalTerminationPointC.setLayerProtolOperationNameLtpAsync.mockResolvedValue(false);

    // Simulate error during coreModelJsonObject restoration
    IndividualServiceUtility.resetCompleteFile.mockRejectedValue(new Error('File restoration failed'));

    // Act and Assert: Expect an Internal Server Error to be thrown
    await expect(individualServicesService.updateAptClient(mockBody)).rejects.toThrowError(
      new createHttpError.InternalServerError("Internal Server Error")
    );
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
    ).rejects.toThrow(createHttpError.InternalServerError);

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

  it('should log an error if ReadConfigurationAirInterfaceData fails and return an empty object', async () => {
    const mockLtpStructureResult = {
      ltpStructure: { key: 'value' },
      traceIndicatorIncrementer: 2,
    };
    ReadLtpStructure.readLtpStructure.mockResolvedValue(mockLtpStructureResult);

    const error = new Error('Service unavailable');
    ReadConfigurationAirInterfaceData.readConfigurationAirInterfaceData.mockRejectedValue(error);

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
});
