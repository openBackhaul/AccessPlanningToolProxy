const rewire = require('rewire');
const readHistoricalDataRewire = rewire('../ReadHistoricalData');
const readHistoricalData = require('../ReadHistoricalData');
const ltpStructureUtility = require('../LtpStructureUtility');
const IndividualServiceUtility = require('../IndividualServiceUtility');
const createHttpError = require('http-errors');
const { RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache } = require("../ReadHistoricalData");

const onfAttributes = {
  GLOBAL_CLASS: { UUID: 'uuid' },
  LOGICAL_TERMINATION_POINT: {
    LAYER_PROTOCOL: 'layer-protocol',
    CLIENT_LTP: 'client-ltp',
    SERVER_LTP: 'server-ltp',
    LAYER_PROTOCOL_NAME: 'layer-protocol-name'
  },
  LOCAL_CLASS: { LOCAL_ID: 'local-id' }
};

jest.mock("../LtpStructureUtility");
jest.mock("../IndividualServiceUtility");

// jest.mock('../LtpStructureUtility', () => ({
//   getLtpsOfLayerProtocolNameFromLtpStructure: jest.fn(),
// }));

// jest.mock('../IndividualServiceUtility', () => ({
//   getConsequentOperationClientAndFieldParams: jest.fn(),
//   forwardRequest: jest.fn(),
// }));

describe('RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces', () => {
  let mockLtpStructure;
  let mountName;
  let requestHeaders;
  let traceIndicatorIncrementer;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLtpStructure = {};
    mountName = 'Device1';
    requestHeaders = {};
    traceIndicatorIncrementer = 1;
  });

  it('should process valid responses for both air and ethernet interfaces', async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure
      .mockResolvedValueOnce([
        { uuid: 'uuid1', 'layer-protocol': [{ 'local-id': 'localId1', 'layer-protocol-name': 'LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER' }] },
      ])
      .mockResolvedValueOnce([
        { uuid: 'uuid2', 'layer-protocol': [{ 'local-id': 'localId2', 'layer-protocol-name': 'LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER' }] },
      ]);

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest
      .mockResolvedValueOnce({
        'ltp-augment-1-0:ltp-augment-pac': {
          'original-ltp-name': 'Eth1',
          'external-label': 'AirLink1',
        },
      })
      .mockResolvedValueOnce({
        'ltp-augment-1-0:ltp-augment-pac': {
          'original-ltp-name': 'Eth2',
          'external-label': 'AirLink2',
        },
      });

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces(
      mockLtpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual([
      { uuid: 'uuid1', localId: 'localId1', mountName: 'Device1', layerProtocolName: 'LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER', 'link-endpoint-id': 'AirLink1' },
      { uuid: 'uuid2', localId: 'localId2', mountName: 'Device1', layerProtocolName: 'LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER', 'interface-name': 'Eth2' },
    ]);
  });

  it('should return an empty array if no LTPs are found', async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([]);

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces(
      mockLtpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual([]);
  });

  it('should handle errors in getLtpsOfLayerProtocolNameFromLtpStructure and return an empty array', async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValue(new Error('Mocked error'));

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces(
      mockLtpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual([]);
  });

  it('should handle errors in forwardRequest and return an empty array', async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([
      { uuid: 'uuid1', 'layer-protocol': [{ 'local-id': 'localId1', 'layer-protocol-name': 'AIR_LAYER' }] },
    ]);

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockRejectedValue(new Error('Mocked error'));

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces(
      mockLtpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual([]);
  });

  it('should handle an empty response from forwardRequest and return an empty array', async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([
      { uuid: 'uuid1', 'layer-protocol': [{ 'local-id': 'localId1', 'layer-protocol-name': 'AIR_LAYER' }] },
    ]);

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue({});

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces(
      mockLtpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual([]);
  });
});


describe("RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache", () => {
  let ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer;
 
  beforeEach(() => {
    ltpStructure = {};
    mountName = "testMount";
    requestHeaders = { Authorization: "Bearer test-token" };
    traceIndicatorIncrementer = 1;
  });
 
  test("should return air interface configurations when responses are valid", async () => {
    const mockLtpList = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
            [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME]: "AIR_LAYER",
          },
        ],
      },
    ];
 
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockLtpList);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
 
    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      "air-interface-2-0:air-container-pac": {
        "air-interface-configuration": { configKey: "configValue" },
      },
    });
 
    const result = await RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
      ltpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          mountName: "testMount",
          uuid: "uuid1",
          localId: "localId1",
          airInterfaceConfiguration: { configKey: "configValue" },
        }),
      ])
    );
  });
 
  test("should return empty array when no LTPs are found", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([]);
 
    const result = await RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
      ltpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(result).toEqual([]);
  });
 
  test("should handle empty response from forwardRequest", async () => {
    const mockLtpList = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
            [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME]: "AIR_LAYER",
          },
        ],
      },
    ];
 
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockLtpList);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue({});
 
    const result = await RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
      ltpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(result).toEqual([]);
  });
 
  test("should handle errors gracefully", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValue(new Error("LTP Fetch Failed"));
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
 
    const result = await RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
      ltpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache is not success")
    );
    expect(result).toEqual([]);
 
    consoleSpy.mockRestore();
  });
 
  test("should handle multiple LTPs correctly", async () => {
    const mockLtpList = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
            [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME]: "AIR_LAYER",
          },
        ],
      },
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid2",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId2",
            [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME]: "AIR_LAYER",
          },
        ],
      },
    ];
 
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockLtpList);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
 
    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      "air-interface-2-0:air-container-pac": {
        "air-interface-configuration": { configKey: "configValue" },
      },
    });
 
    const result = await RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
      ltpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          mountName: "testMount",
          uuid: "uuid1",
          localId: "localId1",
          airInterfaceConfiguration: { configKey: "configValue" },
        }),
        expect.objectContaining({
          mountName: "testMount",
          uuid: "uuid2",
          localId: "localId2",
          airInterfaceConfiguration: { configKey: "configValue" },
        }),
      ])
    );
  });
 
  test("should handle when forwardRequest throws an error", async () => {
    const mockLtpList = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
            [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME]: "AIR_LAYER",
          },
        ],
      },
    ];
 
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockLtpList);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockRejectedValue(new Error("Forward request failed"));
 
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const result = await RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
      ltpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache is not success")
    );
    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });
});
 