const rewire = require('rewire');
const createHttpError = require('http-errors');
const readStatusInterfaceDatarewire = rewire('../ReadLiveStatusData');
const readStatusInterfaceData = require('../ReadLiveStatusData');
const IndividualServiceUtility = require('../IndividualServiceUtility');
const {RequestForProvidingStatusForLivenetviewCausesReadingCapabilitiesFromCache} = require('../ReadLiveStatusData');
const LtpStructureUtility = require('../LtpStructureUtility');
jest.mock('../LtpStructureUtility');
jest.mock('../IndividualServiceUtility', () => ({
  getConsequentOperationClientAndFieldParams: jest.fn(),
  forwardRequest: jest.fn(),
}));
 

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    });
 
describe('RequestForProvidingStatusForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest', () => {
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
            "layer-protocol-name": "LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER"
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
 
    const result = await readStatusInterfaceData.RequestForProvidingStatusForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest(
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
            "layer-protocol-name": "LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER"
          }
        ]
      }
    ]);
 
    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      "ltp-augment-1-0:ltp-augment-pac": {
        "external-label": "NonMatchingLink"
      }
    });
 
    const result = await readStatusInterfaceData.RequestForProvidingStatusForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest(
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
            "layer-protocol-name": "LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER"
          }
        ]
      }
    ]);
 
    IndividualServiceUtility.forwardRequest.mockImplementation(() => {
      throw new Error("Mocked forwardRequest error");
    });
 
    const result = await readStatusInterfaceData.RequestForProvidingStatusForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest(
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
 
describe('RequestForProvidingStatusForLivenetviewCausesReadingCapabilitiesFromCache', () => {
  const pathParams = ["Device1", "uuid1", "localId1"];
  const requestHeaders = { 'Authorization': 'Bearer token' };
  const traceIndicatorIncrementer = 1;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
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
    const result = await RequestForProvidingStatusForLivenetviewCausesReadingCapabilitiesFromCache(
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
 
    const result = await RequestForProvidingStatusForLivenetviewCausesReadingCapabilitiesFromCache(
 
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
 
    const result = await RequestForProvidingStatusForLivenetviewCausesReadingCapabilitiesFromCache(
 
      pathParams, requestHeaders, traceIndicatorIncrementer
 
    );
 
    expect(result).toEqual({
 
      traceIndicatorIncrementer: 2
    });
  });
});
 
describe('RequestForProvidingStatusForLivenetviewCausesReadingDedicatedStatusValuesFromLive', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    })
 
    afterEach(() => {
      jest.clearAllMocks();
    });
   
    it('should return airInterfaceStatus when response is successful', async () => {
      // Mock Inputs
      const mockPathParams = ['mountName', 'uuid123', 'localId123'];
      const mockRequestHeaders = { header: 'value' };
      const mockTraceIndicatorIncrementer = 0;
      const mockConsequentOperationClientAndFieldParams = { param: 'value' };
      const mockAirInterfaceStatusResponse = {
        'air-interface-2-0:air-interface-status': {
          'tx-level-cur': 10,
          'rx-level-cur': -85,
          'transmission-mode-cur': 'QAM-256',
          'tx-frequency-cur': 5800,
          'rx-frequency-cur': 5700,
        },
      };
   
      // Set Mocks
      IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue(mockConsequentOperationClientAndFieldParams);
      IndividualServiceUtility.forwardRequest.mockResolvedValue(mockAirInterfaceStatusResponse);
   
      // Call Function
      const result = await readStatusInterfaceData.RequestForProvidingStatusForLivenetviewCausesReadingDedicatedStatusValuesFromLive(
        mockPathParams,
        mockRequestHeaders,
        mockTraceIndicatorIncrementer
      );
   
      // Assertions
      expect(result).toEqual({
        'tx-level-cur': 10,
        'rx-level-cur': -85,
        'transmission-mode-cur': 'QAM-256',
        'tx-frequency-cur': 5800,
        'rx-frequency-cur': 5700,
        traceIndicatorIncrementer: 1,
      });
   
      expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalledWith(
        'RequestForProvidingStatusForLivenetviewCausesReadingDedicatedStatusValuesFromLive',
        'RequestForProvidingStatusForLivenetviewCausesReadingDedicatedStatusValuesFromLive.DedicatedStatusValuesFromLive'
      );
   
      expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledWith(
        mockConsequentOperationClientAndFieldParams,
        mockPathParams,
        mockRequestHeaders,
        0
      );
    });
   
    it('should return an empty status object when response is empty', async () => {
      const mockPathParams = ['mountName', 'uuid123', 'localId123'];
      const mockRequestHeaders = { header: 'value' };
      const mockTraceIndicatorIncrementer = 0;
      const mockConsequentOperationClientAndFieldParams = { param: 'value' };
      const mockEmptyResponse = {};
   
      // Set mocks
      IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue(mockConsequentOperationClientAndFieldParams);
      IndividualServiceUtility.forwardRequest.mockResolvedValue(mockEmptyResponse);
   
      const result = await readStatusInterfaceData.RequestForProvidingStatusForLivenetviewCausesReadingDedicatedStatusValuesFromLive(
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
   
    it('should handle errors gracefully', async () => {
      const mockPathParams = ['mountName', 'uuid123', 'localId123'];
      const mockRequestHeaders = { header: 'value' };
      const mockTraceIndicatorIncrementer = 0;
   
      // Force an error in forwardRequest
      IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValue(new Error('Test error'));
   
      const result = await readStatusInterfaceData.RequestForProvidingStatusForLivenetviewCausesReadingDedicatedStatusValuesFromLive(
        mockPathParams,
        mockRequestHeaders,
        mockTraceIndicatorIncrementer
      );
   
      expect(result).toEqual({
        traceIndicatorIncrementer: 0,
      });
     
   
      expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalled();
    });
  });
 
describe("formulateAirInterfaceResponseBody", () => {
  let myModule;
  let formulateAirInterfaceResponseBody;
  let getConfiguredModulation;
  let consoleSpy;
 
  beforeAll(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();  
    // Access the private function
    formulateAirInterfaceResponseBody = readStatusInterfaceDatarewire.__get__("formulateAirInterfaceResponseBody");
 
    // Mock getConfiguredModulation function
    getConfiguredModulation = jest.fn();
    readStatusInterfaceDatarewire.__set__("getConfiguredModulation", getConfiguredModulation);
 
    // Spy on console.log
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });
 
  afterAll(() => {
    // Restore original console.log
    consoleSpy.mockRestore();
  });
 
  it("should formulate air interface response with valid input", async () => {
    const airInterfaceStatus = {
      "tx-level-cur": 15,
      "rx-level-cur": -10,
      "transmission-mode-cur": "modeA",
      "tx-frequency-cur": 2000,
      "rx-frequency-cur": 2100,
    };
 
    const airInterfaceCapability = {};
 
    getConfiguredModulation.mockResolvedValue({
      "modulation-scheme": 64,
      "modulation-scheme-name-at-lct": "QAM-64",
    });
 
    const result = await formulateAirInterfaceResponseBody("endpoint1", airInterfaceCapability, airInterfaceStatus);
 
    expect(result).toEqual({
      "current-tx-power": 15,
      "current-rx-level": -10,
      "current-modulation": {
        "number-of-states": 64,
        "name-at-lct": "QAM-64",
      },
      "current-tx-frequency": 2000,
      "current-rx-frequency": 2100,
    });
  });
 
  it("should handle missing fields gracefully", async () => {
    const airInterfaceStatus = {};
 
    const airInterfaceCapability = {};
 
    getConfiguredModulation.mockResolvedValue(null);
 
    const result = await formulateAirInterfaceResponseBody("endpoint1", airInterfaceCapability, airInterfaceStatus);
 
    expect(result).toEqual({});
  });
 
  it("should handle missing modulation data", async () => {
    const airInterfaceStatus = {
      "tx-level-cur": 10,
      "rx-level-cur": -5,
      "transmission-mode-cur": "modeB",
    };
 
    const airInterfaceCapability = {};
 
    getConfiguredModulation.mockResolvedValue(null);
 
    const result = await formulateAirInterfaceResponseBody("endpoint1", airInterfaceCapability, airInterfaceStatus);
 
    expect(result).toEqual({
      "current-tx-power": 10,
      "current-rx-level": -5,
    });
  });
});
 
 
//-------------------------------------------------------------------------------------------------//
 
 
describe('readStatusInterfaceData', () => {
    const rewire = require('rewire');
    const readStatusInterfaceDatarewire = rewire('../ReadLiveStatusData');
     
    // Access the exported function
    const {readStatusInterfaceData} = readStatusInterfaceDatarewire;
   
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
        readStatusInterfaceDatarewire.RequestForProvidingStatusForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest = jest.fn().mockResolvedValue({
          uuidUnderTest: "uuid1",
          pathParams: ["Device1", "uuid1", "localId1"],
          externalLabel: "Link123",
          traceIndicatorIncrementer: traceIndicatorIncrementer + 1
        });
     
        readStatusInterfaceDatarewire.RequestForProvidingStatusForLivenetviewCausesReadingDedicatedStatusValuesFromLive = jest.fn().mockResolvedValue({
          'tx-power': 10,
          traceIndicatorIncrementer: traceIndicatorIncrementer + 2
        });
     
        readStatusInterfaceDatarewire.RequestForProvidingStatusForLivenetviewCausesReadingCapabilitiesFromCache = jest.fn().mockResolvedValue({
          'supported-radio-signal-id-datatype': 'QAM',
          traceIndicatorIncrementer: traceIndicatorIncrementer + 3
        });
     
        // Mock the private function using rewire
        const mockFormulateAirInterfaceResponseBody = jest.fn().mockResolvedValue({
          "air-interface-endpoint-name": "Link123",
          "configured-tx-power": 10,
          "supported-radio-signal-id-datatype": "QAM"
        });
     
        readStatusInterfaceDatarewire.__set__('formulateAirInterfaceResponseBody', mockFormulateAirInterfaceResponseBody);
     
        const result = await readStatusInterfaceData(
          mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer
        );
     
        expect(result).toEqual({
          uuidUnderTest: "uuid1",
          airInterface: {
            "air-interface-endpoint-name": "Link123",
            "configured-tx-power": 10,
            "supported-radio-signal-id-datatype": "QAM"
          },
          traceIndicatorIncrementer:3
        });
     
        // Ensure all functions were called as expected
        expect(readStatusInterfaceDatarewire.RequestForProvidingStatusForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest).toHaveBeenCalled();
        expect(readStatusInterfaceDatarewire.RequestForProvidingStatusForLivenetviewCausesReadingDedicatedStatusValuesFromLive).toHaveBeenCalled();
        expect(readStatusInterfaceDatarewire.RequestForProvidingStatusForLivenetviewCausesReadingCapabilitiesFromCache).toHaveBeenCalled();
        expect(mockFormulateAirInterfaceResponseBody).toHaveBeenCalled();
      });
     
      it('should return empty airInterface when uuidUnderTest is not found', async () => {
        // Mock the function to return an empty object indicating no uuid found
        readStatusInterfaceDatarewire.RequestForProvidingStatusForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest = jest.fn().mockResolvedValue({});
     
        const result = await readStatusInterfaceData(
          mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer
        );
     
        expect(result).toEqual({
          uuidUnderTest: "",
          airInterface: {},
          traceIndicatorIncrementer: traceIndicatorIncrementer
        });
     
        expect(readStatusInterfaceDatarewire.RequestForProvidingStatusForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest).toHaveBeenCalled();
      });
     
      it('should handle errors gracefully', async () => {
        // Mock the first function to throw an error
        readStatusInterfaceDatarewire.RequestForProvidingStatusForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest = jest.fn().mockImplementation(() => {
          throw new Error('Mocked error');
        });
     
        const result = await readStatusInterfaceData(
          mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer
        );
     
        expect(result).toBeUndefined();  // The function catches errors and logs them but returns nothing
      });
    });
     
    describe('getConfiguredModulation', () => {
        let getConfiguredModulation;
       
        beforeEach(() => {
          jest.clearAllMocks();
          jest.resetAllMocks();
          getConfiguredModulation = readStatusInterfaceDatarewire.__get__('getConfiguredModulation');
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
    });
 