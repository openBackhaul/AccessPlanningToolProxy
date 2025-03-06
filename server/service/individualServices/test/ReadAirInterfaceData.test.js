const rewire = require('rewire');
const ReadAirInterfaceDataRewire = rewire('../ReadAirInterfaceData'); 
const IndividualServiceUtility = require("../IndividualServiceUtility");
const getConfiguredModulation = ReadAirInterfaceDataRewire.__get__('getConfiguredModulation');
const formulateAirInterfaceResponseBody = ReadAirInterfaceDataRewire.__get__('formulateAirInterfaceResponseBody');
const {RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache} = require("../ReadAirInterfaceData");
  
  jest.mock("../IndividualServiceUtility", () => ({
    forwardRequest: jest.fn(),
    getConsequentOperationClientAndFieldParams: jest.fn(),
  }));

describe('getConfiguredModulation', () => {
  test('should return the correct transmission mode when a matching type is found', async () => {
    const airInterfaceCapability = {
      "transmission-mode-list": [
        { "transmission-mode-name": "mode1", "value": 10 },
        { "transmission-mode-name": "mode2", "value": 20 }
      ]
    };
    const transmissioModeType = "mode1";
    
    const result = await getConfiguredModulation(airInterfaceCapability, transmissioModeType);
    expect(result).toEqual({ "transmission-mode-name": "mode1", "value": 10 });
  });

  test('should return an empty object if no matching transmission mode is found', async () => {
    const airInterfaceCapability = {
      "transmission-mode-list": [
        { "transmission-mode-name": "mode1", "value": 10 }
      ]
    };
    const transmissioModeType = "mode3";
    
    const result = await getConfiguredModulation(airInterfaceCapability, transmissioModeType);
    expect(result).undefined;
  });

  test('should return an empty object if airInterfaceCapability is undefined', async () => {
    const result = await getConfiguredModulation(undefined, "mode1");
    expect(result).toEqual({});
  });

  test('should return an empty object if airInterfaceCapability does not contain transmission-mode-list', async () => {
    const airInterfaceCapability = { "some-other-key": [] };
    const result = await getConfiguredModulation(airInterfaceCapability, "mode1");
    expect(result).toEqual({});
  });

  test('should return an empty object if transmission-mode-list is undefined', async () => {
    const airInterfaceCapability = { "transmission-mode-list": undefined };
    const result = await getConfiguredModulation(airInterfaceCapability, "mode1");
    expect(result).toEqual({});
  });

  test('should return an empty object if transmissioModeType is undefined', async () => {
    const airInterfaceCapability = {
      "transmission-mode-list": [
        { "transmission-mode-name": "mode1", "value": 10 }
      ]
    };
    const result = await getConfiguredModulation(airInterfaceCapability, undefined);
    expect(result).toEqual({});
  });
});

describe('formulateAirInterfaceResponseBody', () => {
    test('should return correctly mapped response body', async () => {
        const getConfiguredModulationMock = jest.fn().mockResolvedValue({
            "modulation-scheme": 16,
            "modulation-scheme-name-at-lct": "QAM16"
        });
    
        ReadAirInterfaceDataRewire.__set__('getConfiguredModulation', getConfiguredModulationMock);
    
        const airInterfaceEndPointName = "endpoint1";
        const airInterfaceConfiguration = { "tx-power": 10, "tx-frequency": 2000 };
        const airInterfaceStatus = { "tx-level-cur": 15, "rx-level-cur": -50 };
        const airInterfaceCapability = {};
    
        const result = await formulateAirInterfaceResponseBody(
          airInterfaceEndPointName,
          airInterfaceConfiguration,
          airInterfaceCapability,
          airInterfaceStatus
        );
    
        expect(result).toEqual({
          "air-interface-endpoint-name": "endpoint1",
          "configured-tx-power": 10,
          "configured-tx-frequency": 2000,
          "current-tx-power": 15,
          "current-rx-level": -50,
          "configured-modulation-minimum": {
            "number-of-states": 16,
            "name-at-lct": "QAM16"
          },
          "configured-modulation-maximum": {
            "number-of-states": 16,
            "name-at-lct": "QAM16"
          },
          "current-modulation": {
            "number-of-states": 16,
            "name-at-lct": "QAM16"
          }
        });
    
        expect(getConfiguredModulationMock).toHaveBeenCalledTimes(3);
    });
    
  test('should handle empty input values gracefully', async () => {
    const result = await formulateAirInterfaceResponseBody(null, {}, {}, {});
    expect(result).undefined;
  });

  test('should call getConfiguredModulation correctly', async () => {
    const getConfiguredModulationMock = jest.fn().mockResolvedValue({
      "modulation-scheme": 16,
      "modulation-scheme-name-at-lct": "QAM16"
    });
    ReadAirInterfaceDataRewire.__set__('getConfiguredModulation', getConfiguredModulationMock);

    const airInterfaceConfiguration = { "transmission-mode-min": "mode1" };
    const airInterfaceStatus = {};
    const airInterfaceCapability = {};

    const result = await formulateAirInterfaceResponseBody("endpoint1", airInterfaceConfiguration, airInterfaceCapability, airInterfaceStatus);

    expect(getConfiguredModulationMock).toHaveBeenCalledWith(airInterfaceCapability, "mode1");
    expect(result).toHaveProperty("configured-modulation-minimum");
  });
});

describe("RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return valid air interface configuration when response is not empty", async () => {
    const pathParams = ["mountName", "uuid", "localId"];
    const requestHeaders = { Authorization: "Bearer token" };
    const traceIndicatorIncrementer = 5;

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue("mockedParams");

    const mockResponse = {
      "air-interface-2-0:air-interface-configuration": {
        frequency: "10GHz",
        bandwidth: "100MHz",
      },
    };
    IndividualServiceUtility.forwardRequest.mockResolvedValue(mockResponse);

    const result = await RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(
      pathParams,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      frequency: "10GHz",
      bandwidth: "100MHz",
      traceIndicatorIncrementer: 6,
    });

    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalledWith(
      "RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache",
      "RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache.ConfigurationFromCache"
    );

    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledWith(
      "mockedParams",
      pathParams,
      requestHeaders,
      traceIndicatorIncrementer
    );
  });

  test("should return an empty object when response is empty", async () => {
    const pathParams = ["mountName", "uuid", "localId"];
    const requestHeaders = { Authorization: "Bearer token" };
    const traceIndicatorIncrementer = 2;

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue("mockedParams");
    IndividualServiceUtility.forwardRequest.mockResolvedValue({}); // Empty response

    const result = await RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(
      pathParams,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      traceIndicatorIncrementer: 3,
    });

    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(1);
  });

  test("should handle errors and return an empty object", async () => {
    const pathParams = ["mountName", "uuid", "localId"];
    const requestHeaders = { Authorization: "Bearer token" };
    const traceIndicatorIncrementer = 3;

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue("mockedParams");
    IndividualServiceUtility.forwardRequest.mockRejectedValue(new Error("Network error"));

    const result = await RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(
      pathParams,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      traceIndicatorIncrementer: 4,
    });

    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(1);
  });


});




