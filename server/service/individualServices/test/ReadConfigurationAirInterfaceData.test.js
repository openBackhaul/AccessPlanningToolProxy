const rewire = require('rewire');
const createHttpError = require('http-errors');
const readConfigurationAirInterfaceDatarewire = rewire('../ReadConfigurationAirInterfaceData'); 
const readConfigurationAirInterfaceData = require('../ReadConfigurationAirInterfaceData');
const IndividualServiceUtility = require('../IndividualServiceUtility');
const {RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache} = require('../ReadConfigurationAirInterfaceData');
const LtpStructureUtility = require('../LtpStructureUtility');
jest.mock('../LtpStructureUtility');
jest.mock('../IndividualServiceUtility', () => ({
  getConsequentOperationClientAndFieldParams: jest.fn(),
  forwardRequest: jest.fn(),
}));

describe('RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest', () => {
  const mountName = "Device1";
  const linkId = "Link123";
  const ltpStructure = {};
  const requestHeaders = {};
  const traceIndicatorIncrementer = 1;
 
  beforeEach(() => {
    jest.clearAllMocks();
  });
 
  it('should return uuidUnderTest when external-label matches linkId', async () => {
    // Mocking getLtpsOfLayerProtocolNameFromLtpStructure with actual data format
    LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([
      {
        "uuid": "uuid1",
        "client-ltp": ["mockClient1", "mockClient2"],
        "layer-protocol": [
          {
            "local-id": "localid",
            "layer-protocol-name": "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER"
          }
        ]
      }
    ]);
 
    // Mocking getConsequentOperationClientAndFieldParams
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
 
    // Mocking forwardRequest to return a matching external-label
    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      "ltp-augment-1-0:ltp-augment-pac": {
        "external-label": "Link123"
      }
    });
 
    const result = await readConfigurationAirInterfaceData.RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest(
      ltpStructure, mountName, linkId, requestHeaders, traceIndicatorIncrementer
    );
 
    expect(LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure).toHaveBeenCalled();
    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalled();
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalled();
 
    expect(result).toEqual({
      uuidUnderTest: "uuid1",
      pathParams: ["Device1", "uuid1", "localid"],
      externalLabel: "Link123",
      traceIndicatorIncrementer: traceIndicatorIncrementer + 1
    });
  });
 
  it('should return empty result when no external-label matches linkId', async () => {
    LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([
      {
        "uuid": "uuid1",
        "client-ltp": ["mockClient1", "mockClient2"],
        "layer-protocol": [
          {
            "local-id": "localid",
            "layer-protocol-name": "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER"
          }
        ]
      }
    ]);
 
    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      "ltp-augment-1-0:ltp-augment-pac": {
        "external-label": "NonMatchingLink"
      }
    });
 
    const result = await readConfigurationAirInterfaceData.RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest(
      ltpStructure, mountName, linkId, requestHeaders, traceIndicatorIncrementer
    );
 
    expect(result).toEqual({
      uuidUnderTest: "",
      pathParams: [],
      externalLabel: "",
      traceIndicatorIncrementer: traceIndicatorIncrementer + 1
    });
  });
 
  it('should handle errors from forwardRequest gracefully', async () => {
    LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([
      {
        "uuid": "uuid1",
        "client-ltp": ["mockClient1", "mockClient2"],
        "layer-protocol": [
          {
            "local-id": "localid",
            "layer-protocol-name": "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER"
          }
        ]
      }
    ]);
 
    IndividualServiceUtility.forwardRequest.mockImplementation(() => {
      throw new Error("Mocked forwardRequest error");
    });
 
    const result = await readConfigurationAirInterfaceData.RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest(
      ltpStructure, mountName, linkId, requestHeaders, traceIndicatorIncrementer
    );
 
    expect(result).toEqual({
      uuidUnderTest: "",
      pathParams: [],
      externalLabel: "",
      traceIndicatorIncrementer: traceIndicatorIncrementer + 1
    });
  });
});

describe('RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return airInterfaceConfiguration when response is successful', async () => {
    const mockPathParams = ['mountName', 'uuid123', 'localId123'];
    const mockRequestHeaders = { header: 'value' };
    const mockTraceIndicatorIncrementer = 0;
    const mockConsequentOperationClientAndFieldParams = { param: 'value' };
    const mockAirInterfaceConfigurationResponse = {
      'air-interface-2-0:air-interface-configuration': { configKey: 'configValue' },
    };

    // Set mocks
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue(mockConsequentOperationClientAndFieldParams);
    IndividualServiceUtility.forwardRequest.mockResolvedValue(mockAirInterfaceConfigurationResponse);

    const result = await readConfigurationAirInterfaceData.RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(
      mockPathParams,      
      mockRequestHeaders,
      mockTraceIndicatorIncrementer
    );

    expect(result).toEqual({
      configKey: 'configValue',
      traceIndicatorIncrementer: 1,
    });
    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalledWith(
      'RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache',
      'RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache.ConfigurationFromCache'
    );
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledWith(
      mockConsequentOperationClientAndFieldParams,
      mockPathParams,
      mockRequestHeaders,
      mockTraceIndicatorIncrementer
    );
  });

  it('should return an empty configuration object when response is empty', async () => {
    const mockPathParams = ['mountName', 'uuid123', 'localId123'];
    const mockRequestHeaders = { header: 'value' };
    const mockTraceIndicatorIncrementer = 0;
    const mockConsequentOperationClientAndFieldParams = { param: 'value' };
    const mockEmptyResponse = {};

    // Set mocks
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue(mockConsequentOperationClientAndFieldParams);
    IndividualServiceUtility.forwardRequest.mockResolvedValue(mockEmptyResponse);

    const result = await readConfigurationAirInterfaceData.RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(
      mockPathParams,
      mockRequestHeaders,
      mockTraceIndicatorIncrementer
    );

    expect(result).toEqual({
      traceIndicatorIncrementer: 1,
    });
    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalled();
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalled();
  });

  it('should handle errors gracefully in getConsequentOperationClientAndFieldParams', async () => {
    const mockPathParams = ['mountName', 'uuid123', 'localId123'];
    const mockRequestHeaders = { header: 'value' };
    const mockTraceIndicatorIncrementer = 0;

    // Force an error in forwardRequest
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValue(new Error('Test error'));

    const result = await readConfigurationAirInterfaceData.RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(
      mockPathParams,
      mockRequestHeaders,
      mockTraceIndicatorIncrementer
    );

    expect(result).toEqual({
      traceIndicatorIncrementer: 0,
    });
    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalled();
  });

  it('should handle errors gracefully in forwardRequest', async () => {
    const mockPathParams = ['mountName', 'uuid123', 'localId123'];
    const mockRequestHeaders = { header: 'value' };
    const mockTraceIndicatorIncrementer = 0;
    const mockConsequentOperationClientAndFieldParams = { param: 'value' };


    // Force an error in forwardRequest
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue(mockConsequentOperationClientAndFieldParams);

    IndividualServiceUtility.forwardRequest.mockRejectedValue(new Error('Test error'));

    const result = await readConfigurationAirInterfaceData.RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(
      mockPathParams,
      mockRequestHeaders,
      mockTraceIndicatorIncrementer
    );

    expect(result).toEqual({
      traceIndicatorIncrementer: 1,
    });
    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalled();
  });
});

describe('RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache', () => {

  const pathParams = ["Device1", "uuid1", "localId1"];

  const requestHeaders = { 'Authorization': 'Bearer token' };

  const traceIndicatorIncrementer = 1;
  beforeEach(() => {

    jest.clearAllMocks();

  });
 
  it('should return airInterfaceCapability when data is found', async () => {

    // Mocking the necessary methods

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});

    IndividualServiceUtility.forwardRequest.mockResolvedValue({

      "air-interface-2-0:air-interface-capability": {

        "supported-radio-signal-id-datatype": "signalType",

        "supported-radio-signal-id-length": 16

      }

    });
 
    const result = await RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(
      pathParams, requestHeaders, traceIndicatorIncrementer);

    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalled();

    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledWith({}, pathParams, requestHeaders, traceIndicatorIncrementer);
 
    expect(result).toEqual({
      "supported-radio-signal-id-datatype": "signalType",
      "supported-radio-signal-id-length": 16,
      traceIndicatorIncrementer: 2
    });

  });
 
  it('should return empty object if no capability data is found', async () => {
    // Mocking the necessary methods to return empty response
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});

    IndividualServiceUtility.forwardRequest.mockResolvedValue({});
 
    const result = await RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(

      pathParams, requestHeaders, traceIndicatorIncrementer

    );
 
    expect(result).toEqual({

      traceIndicatorIncrementer: 2

    });

  });
 
  it('should handle errors gracefully', async () => {

    // Mocking to throw an error

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});

    IndividualServiceUtility.forwardRequest.mockImplementation(() => {

      throw new Error("Mocked forwardRequest error");

    });
 
    const result = await RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(

      pathParams, requestHeaders, traceIndicatorIncrementer

    );
 
    expect(result).toEqual({

      traceIndicatorIncrementer: 2

    });

  });

  it('should handle errors gracefully', async () => {

    // Mocking to throw an error

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockImplementation(() => {

        throw new Error("Mocked forwardRequest error");
  
      });
    // IndividualServiceUtility.forwardRequest.mockImplementation(() => {

    //   throw new Error("Mocked forwardRequest error");

    // });
 
    const result = await RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(

      pathParams, requestHeaders, traceIndicatorIncrementer

    );
 
    expect(result).toEqual({

      traceIndicatorIncrementer: 1

    });

  });


});

const readConfigurationAirInterfaceDataRewire = rewire('../ReadConfigurationAirInterfaceData');
 
describe('formulateAirInterfaceResponseBody', () => {
  let formulateAirInterfaceResponseBody;
 
  beforeEach(() => {
    jest.clearAllMocks();
    // Access the private function using rewire
    formulateAirInterfaceResponseBody = readConfigurationAirInterfaceDataRewire.__get__('formulateAirInterfaceResponseBody');
  });
 
  it('should return a properly formatted airInterface object when all properties are provided', async () => {
    const mockgetConfiguredModulation = jest.fn()
      .mockResolvedValueOnce({
        "modulation-scheme": 64,
        "modulation-scheme-name-at-lct": "QAM-64",
        "channel-bandwidth": "20MHz"
      })
      .mockResolvedValueOnce({
        "modulation-scheme": 256,
        "modulation-scheme-name-at-lct": "QAM-256",
        "channel-bandwidth": "40MHz"
      });
 
    // Use rewire to mock the internal function
    readConfigurationAirInterfaceDataRewire.__set__('getConfiguredModulation', mockgetConfiguredModulation);
 
    const airInterfaceEndPointName = "TestEndpoint";
    const airInterfaceConfiguration = {
      "tx-power": -10,
      "transmitted-radio-signal-id": "signal123",
      "expected-radio-signal-id": "expected123",
      "atpc-is-on": true,
      "atpc-thresh-upper": 5,
      "atpc-thresh-lower": -5,
      "atpc-tx-power-min": -15,
      "adaptive-modulation-is-on": true,
      "transmission-mode-min": "mode1",
      "transmission-mode-max": "mode2",
      "xpic-is-on": false
    };
 
    const airInterfaceCapability = {
      "supported-radio-signal-id-datatype": "hex",
      "supported-radio-signal-id-length": 32
    };
 
    const result = await formulateAirInterfaceResponseBody(airInterfaceEndPointName, airInterfaceConfiguration, airInterfaceCapability);
 
    expect(result).toEqual({
      "air-interface-endpoint-name": "TestEndpoint",
      "configured-tx-power": -10,
      "supported-radio-signal-id-datatype": "hex",
      "supported-radio-signal-id-length": 32,
      "configured-transmitted-radio-signal-id": "signal123",
      "configured-expected-radio-signal-id": "expected123",
      "configured-atpc-is-on": true,
      "configured-atpc-threshold-upper": 5,
      "configured-atpc-threshold-lower": -5,
      "configured-atpc-tx-power-min": -15,
      "configured-adaptive-modulation-is-on": true,
      "configured-modulation-minimum": {
        "number-of-states": 64,
        "name-at-lct": "QAM-64"
      },
      "configured-modulation-maximum": {
        "number-of-states": 256,
        "name-at-lct": "QAM-256"
      },
      "configured-channel-bandwidth-min": "20MHz",
      "configured-channel-bandwidth-max": "40MHz",
      "configured-xpic-is-on": false
    });
  });
 
  it('should handle errors inside the function gracefully', async () => {
    const mockgetConfiguredModulation = jest.fn().mockImplementation(() => {
      throw new Error("Mocked error in getConfiguredModulation");
    });
 
    readConfigurationAirInterfaceDataRewire.__set__('getConfiguredModulation', mockgetConfiguredModulation);
 
    const airInterfaceEndPointName = "TestEndpoint";
    const airInterfaceConfiguration = {
      "transmission-mode-min": "mode1",
      "transmission-mode-max": "mode2"
    };
    const airInterfaceCapability = {};
 
    const result = await formulateAirInterfaceResponseBody(airInterfaceEndPointName, airInterfaceConfiguration, airInterfaceCapability);
 
    expect(result).toEqual({ "air-interface-endpoint-name": "TestEndpoint" });
  });
 
  it('should handle partial configuration and capability data correctly', async () => {
    const mockgetConfiguredModulation = jest.fn()
      .mockResolvedValueOnce({
        "modulation-scheme": 64,
        "modulation-scheme-name-at-lct": "QAM-64",
        "channel-bandwidth": "20MHz"
      })
      .mockResolvedValueOnce(null); 
 
    readConfigurationAirInterfaceDataRewire.__set__('getConfiguredModulation', mockgetConfiguredModulation);
 
    const airInterfaceEndPointName = "TestEndpoint";
    const airInterfaceConfiguration = {
      "tx-power": -5,
      "transmitted-radio-signal-id": "partialSignal",
      "atpc-is-on": true,
    };
 
    const airInterfaceCapability = {
      "supported-radio-signal-id-datatype": "hex",
    };
 
    const result = await formulateAirInterfaceResponseBody(airInterfaceEndPointName, airInterfaceConfiguration, airInterfaceCapability);
 
    expect(result).toEqual({
      "air-interface-endpoint-name": "TestEndpoint",
      "configured-tx-power": -5,
      "supported-radio-signal-id-datatype": "hex",
      "configured-transmitted-radio-signal-id": "partialSignal",
      "configured-atpc-is-on": true,
      "configured-modulation-minimum": {
        "number-of-states": 64,
        "name-at-lct": "QAM-64"
      },
      "configured-modulation-maximum": undefined, // Max modulation is missing, so it should be undefined
      "configured-channel-bandwidth-min": "20MHz",
      "configured-channel-bandwidth-max": undefined
    });
  });
});

describe('getConfiguredModulation', () => {
  let getConfiguredModulation;


  beforeEach(() => {
    // Access the private function
    getConfiguredModulation = readConfigurationAirInterfaceDatarewire.__get__('getConfiguredModulation');
  });

  it('should return the correct transmission mode when present in the list', async () => {
    const airInterfaceCapability = {
      "transmission-mode-list": [
        { "transmission-mode-name": "ModeA", "modulation": "QAM16" },
        { "transmission-mode-name": "ModeB", "modulation": "QAM64" }
      ]
    };
    const transmissioModeType = "ModeA";

    const result = await getConfiguredModulation(airInterfaceCapability, transmissioModeType);

    expect(result).toEqual({ "transmission-mode-name": "ModeA", "modulation": "QAM16" });
  });

  it('should return an empty object if the transmission mode is not found', async () => {
    const airInterfaceCapability = {
      "transmission-mode-list": [
        { "transmission-mode-name": "ModeA", "modulation": "QAM16" }
      ]
    };
    const transmissioModeType = "ModeC";

    const result = await getConfiguredModulation(airInterfaceCapability, transmissioModeType);

    expect(result).toBeUnDefined;
  });

  it('should return an empty object if transmission-mode-list is undefined', async () => {
    const airInterfaceCapability = {};
    const transmissioModeType = "ModeA";

    const result = await getConfiguredModulation(airInterfaceCapability, transmissioModeType);

    expect(result).toEqual({});
  });

  it('should return an empty object if airInterfaceCapability is undefined', async () => {
    const transmissioModeType = "ModeA";

    const result = await getConfiguredModulation(undefined, transmissioModeType);

    expect(result).toEqual({});
  });

  it('should return an empty object if transmissioModeType is undefined', async () => {
    const airInterfaceCapability = {
      "transmission-mode-list": [
        { "transmission-mode-name": "ModeA", "modulation": "QAM16" }
      ]
    };

    const result = await getConfiguredModulation(airInterfaceCapability, undefined);

    expect(result).toEqual({});
  });

  it('should return an empty object if transmission-mode-list is an empty array', async () => {
    const airInterfaceCapability = {
      "transmission-mode-list": []
    };
    const transmissioModeType = "ModeA";

    const result = await getConfiguredModulation(airInterfaceCapability, transmissioModeType);

    expect(result).toBeUnDefined;
  });
});
//-------------------------------------------------------------------------------------------------//


describe('readConfigurationAirInterfaceData', () => {
const rewire = require('rewire');
const readConfigurationAirInterfaceDatarewire = rewire('../ReadConfigurationAirInterfaceData');
 
// Access the exported function
const { readConfigurationAirInterfaceData } = readConfigurationAirInterfaceDatarewire;

describe('readConfigurationAirInterfaceData', () => {
  const mountName = "Device1";
  const linkId = "Link123";
  const ltpStructure = {};
  const requestHeaders = { 'X-Correlator': 'test-correlation-id' };
  const traceIndicatorIncrementer = 1;
 
  beforeEach(() => {
    jest.clearAllMocks();
  });
 
  it('should return airInterface data when all dependencies return valid data', async () => {
    // Mock the exported functions
    readConfigurationAirInterfaceDatarewire.RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest = jest.fn().mockResolvedValue({
      uuidUnderTest: "uuid1",
      pathParams: ["Device1", "uuid1", "localId1"],
      externalLabel: "Link123",
      traceIndicatorIncrementer: traceIndicatorIncrementer + 1
    });
 
    readConfigurationAirInterfaceDatarewire.RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache = jest.fn().mockResolvedValue({
      'tx-power': 10,
      traceIndicatorIncrementer: traceIndicatorIncrementer + 2
    });
 
    readConfigurationAirInterfaceDatarewire.RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache = jest.fn().mockResolvedValue({
      'supported-radio-signal-id-datatype': 'QAM',
      traceIndicatorIncrementer: traceIndicatorIncrementer + 3
    });
 
    // Mock the private function using rewire
    const mockFormulateAirInterfaceResponseBody = jest.fn().mockResolvedValue({
      "air-interface-endpoint-name": "Link123",
      "configured-tx-power": 10,
      "supported-radio-signal-id-datatype": "QAM"
    });
 
    readConfigurationAirInterfaceDatarewire.__set__('formulateAirInterfaceResponseBody', mockFormulateAirInterfaceResponseBody);
 
    const result = await readConfigurationAirInterfaceData(
      mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer
    );
 
    expect(result).toEqual({
      uuidUnderTest: "uuid1",
      airInterface: {
        "air-interface-endpoint-name": "Link123",
        "configured-tx-power": 10,
        "supported-radio-signal-id-datatype": "QAM"
      },
      traceIndicatorIncrementer: traceIndicatorIncrementer + 3
    });
 
    // Ensure all functions were called as expected
    expect(readConfigurationAirInterfaceDatarewire.RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest).toHaveBeenCalled();
    expect(readConfigurationAirInterfaceDatarewire.RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache).toHaveBeenCalled();
    expect(readConfigurationAirInterfaceDatarewire.RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache).toHaveBeenCalled();
    expect(mockFormulateAirInterfaceResponseBody).toHaveBeenCalled();
  });
 
  it('should return empty airInterface when uuidUnderTest is not found', async () => {
    // Mock the function to return an empty object indicating no uuid found
    readConfigurationAirInterfaceDatarewire.RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest = jest.fn().mockResolvedValue({});
 
    const result = await readConfigurationAirInterfaceData(
      mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer
    );
 
    expect(result).toEqual({
      uuidUnderTest: "",
      airInterface: {},
      traceIndicatorIncrementer: traceIndicatorIncrementer
    });
 
    expect(readConfigurationAirInterfaceDatarewire.RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest).toHaveBeenCalled();
  });
 
  it('should handle errors gracefully', async () => {
    // Mock the first function to throw an error
    readConfigurationAirInterfaceDatarewire.RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest = jest.fn().mockImplementation(() => {
      throw new Error('Mocked error');
    });
 
    const result = await readConfigurationAirInterfaceData(
      mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer
    );
 
    expect(result).toBeUndefined();  // The function catches errors and logs them but returns nothing
  });
});
 
});