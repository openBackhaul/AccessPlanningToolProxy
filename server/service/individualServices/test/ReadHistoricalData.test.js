const rewire = require('rewire');
const readHistoricalDataRewire = rewire('../ReadHistoricalData');
const readHistoricalData = require('../ReadHistoricalData');
const ltpStructureUtility = require('../LtpStructureUtility');
const IndividualServiceUtility = require('../IndividualServiceUtility');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');

jest.mock("../LtpStructureUtility");
jest.mock("../IndividualServiceUtility");

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
        { uuid: 'uuid1', 'layer-protocol': [{ 'local-id': 'localId1', 'layer-protocol-name': 'air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER' }] },
      ])
      .mockResolvedValueOnce([
        { uuid: 'uuid2', 'layer-protocol': [{ 'local-id': 'localId2', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER' }] },
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

    expect(result).toEqual({
      processedLtpResponses: [
        {
          uuid: 'uuid1',
          localId: 'localId1',
          mountName: 'Device1',
          layerProtocolName: 'air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER',
          'link-endpoint-id': 'AirLink1'
        },
        {
          uuid: 'uuid2',
          localId: 'localId2',
          mountName: 'Device1',
          layerProtocolName: 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER',     
          'interface-name': 'Eth2'
        }],
      traceIndicatorIncrementer: 3
    }
 );
  });

  it('should return an empty array if no LTPs are found', async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([]);

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces(
      mockLtpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({"processedLtpResponses": [], "traceIndicatorIncrementer": 1});
  });

  it('should handle errors in getLtpsOfLayerProtocolNameFromLtpStructure and return an empty array', async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValue(new Error('Mocked error'));

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces(
      mockLtpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({"processedLtpResponses": [], "traceIndicatorIncrementer": 1});
  });

  it('should handle errors in forwardRequest and return an empty array', async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([
      { uuid: 'uuid1', 'layer-protocol': [{ 'local-id': 'localId1', 'layer-protocol-name': 'air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER' }] },
    ]);

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockRejectedValue(new Error('Mocked error'));

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces(
      mockLtpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({"processedLtpResponses": [], "traceIndicatorIncrementer": 2});
  });

  it('should handle an empty response from forwardRequest and return an empty array', async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([
      { uuid: 'uuid1', 'layer-protocol': [{ 'local-id': 'localId1', 'layer-protocol-name': 'air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER' }] },
    ]);

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue({});

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces(
      mockLtpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual( {"processedLtpResponses": [], "traceIndicatorIncrementer": 2});
  });
});

describe('RequestForProvidingHistoricalPmDataCausesIdentifyingPhysicalLinkAggregations', () => {
  let mockLtpStructure, mountName, requestHeaders, traceIndicatorIncrementer;

  beforeEach(() => {
    jest.clearAllMocks(); // Reset mock functions before each test case

    mountName = "mock-mount-name";
    requestHeaders = { user: "test-user", xCorrelator: "test-correlation-id" };
    traceIndicatorIncrementer = 1;

    mockLtpStructure = {
      [onfAttributes.GLOBAL_CLASS.UUID]: "mock-uuid",
      [onfAttributes.LOGICAL_TERMINATION_POINT.CLIENT_LTP]: ["mock-client-ltp-uuid"],
    };
  });

  it('should return aggregated results for valid LTP structure', async () => {
    const mockAirInterfaceLtp = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "air-ltp-uuid",
        [onfAttributes.LOGICAL_TERMINATION_POINT.CLIENT_LTP]: ["client-ltp-uuid"],
      }
    ];
    
    const mockClientLtp = {
      [onfAttributes.GLOBAL_CLASS.UUID]: "client-ltp-uuid",
      [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
        { [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER" }
      ],
      [onfAttributes.LOGICAL_TERMINATION_POINT.CLIENT_LTP]: ["ethernet-container-ltp-uuid"], // ✅ Added this to link to Ethernet Container
      [onfAttributes.LOGICAL_TERMINATION_POINT.SERVER_LTP]: ["server-ltp-uuid"],
    };

    const mockServerLtp = {
      [onfAttributes.GLOBAL_CLASS.UUID]: "server-ltp-uuid",
      [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
        { 
          [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER" 
        }
      ],
      [onfAttributes.LOGICAL_TERMINATION_POINT.SERVER_LTP]: ["final-server-ltp-uuid"], // ✅ Ensure this exists
    };
    
    
    const mockEthernetContainerLtp = {
      [onfAttributes.GLOBAL_CLASS.UUID]: "ethernet-container-ltp-uuid",
      [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
        { [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER" }
      ],
      [onfAttributes.LOGICAL_TERMINATION_POINT.SERVER_LTP]: ["mock-server-ltp-uuid-1", "mock-server-ltp-uuid-2"], // ✅ Add Server LTP
    };
    

    const mockLtpDesignationResponse = {
      "ltp-augment-1-0:ltp-augment-pac": {
        "original-ltp-name": "mock-original-ltp",
        "external-label": "mock-external-label"
      }
    };

    // Mock utility function responses
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockAirInterfaceLtp);
    
    // Update mock for getLtpForUuidFromLtpStructure
    ltpStructureUtility.getLtpForUuidFromLtpStructure
    .mockResolvedValueOnce(mockClientLtp)  // First call: Client LTP
    .mockResolvedValueOnce(mockEthernetContainerLtp) // Second call: Ethernet Container LTP ✅
    .mockResolvedValueOnce(mockServerLtp)  // Third call: Server LTP ✅
    .mockResolvedValueOnce(mockServerLtp); // Fourth call: Ensuring `serverLtpStructure` returns correctly ✅  

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({ param: "mock-param" });
    IndividualServiceUtility.forwardRequest.mockResolvedValue(mockLtpDesignationResponse);

    // Call function
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesIdentifyingPhysicalLinkAggregations(
      mockLtpStructure, mountName, requestHeaders, traceIndicatorIncrementer
    );

    // Assertions
    expect(result.aggregatedResults).toHaveLength(1);
    expect(result.aggregatedResults[0]).toHaveProperty('uuid', "air-ltp-uuid");

    // Ensure `subResultsList` is correctly populated
    expect(result.aggregatedResults[0].list).toEqual([
      { "link-id": "mock-exte" } // external-label substring (0-9 characters)
    ]);
    
    expect(result.traceIndicatorIncrementer).toBeGreaterThan(1);
  });

  it('should return an empty array if no AIR_LAYER LTPs are found', async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([]);

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesIdentifyingPhysicalLinkAggregations(
      mockLtpStructure, mountName, requestHeaders, traceIndicatorIncrementer
    );

    expect(result.aggregatedResults).toEqual([]);
    expect(result.traceIndicatorIncrementer).toBe(traceIndicatorIncrementer);
  });

  it('should log an error and return an empty response if an error occurs', async () => {
    console.error = jest.fn(); // Mock console error

    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValue(new Error("Mock error"));

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesIdentifyingPhysicalLinkAggregations(
      mockLtpStructure, mountName, requestHeaders, traceIndicatorIncrementer
    );

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("is not success with Error: Mock error"));
    expect(result.aggregatedResults).toEqual([]);
    expect(result.traceIndicatorIncrementer).toBe(traceIndicatorIncrementer);
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
            [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
          },
        ],
      },
    ];
 
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockLtpList);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
 
    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      "air-interface-2-0:air-interface-configuration": { configKey: "configValue" },
    });
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
      ltpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(result).toEqual({"airInterfaceConfigurations": [{"airInterfaceConfiguration": {"configKey": "configValue"}, "localId": "localId1", "mountName": "testMount", "uuid": "uuid1"}], "traceIndicatorIncrementer": 2}
    );
  });
 
  test("should return empty array when no LTPs are found", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([]);
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
      ltpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(result).toEqual({"airInterfaceConfigurations": [], "traceIndicatorIncrementer": 1});
  });
 
  test("should handle empty response from forwardRequest", async () => {
    const mockLtpList = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
            [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
          },
        ],
      },
    ];
 
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockLtpList);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue({});
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
      ltpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(result).toEqual({"airInterfaceConfigurations": [], "traceIndicatorIncrementer": 2});
  });
 
  test("should handle errors gracefully", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValue(new Error("LTP Fetch Failed"));
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
      ltpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache is not success")
    );
    expect(result).toEqual({"airInterfaceConfigurations": [], "traceIndicatorIncrementer": 1});
 
    consoleSpy.mockRestore();
  });
 
  test("should handle multiple LTPs correctly", async () => {
    const mockLtpList = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
            [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
          },
        ],
      },
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid2",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId2",
            [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
          },
        ],
      },
    ];
 
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockLtpList);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
 
    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      "air-interface-2-0:air-interface-configuration": {configKey: "configValue" },
    });
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
      ltpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(result).toEqual(
      {"airInterfaceConfigurations": [{"airInterfaceConfiguration": {"configKey": "configValue"}, "localId": "localId1", "mountName": "testMount", "uuid": "uuid1"}, {"airInterfaceConfiguration": {"configKey": "configValue"}, "localId": "localId2", "mountName": "testMount", "uuid": "uuid2"}], "traceIndicatorIncrementer": 3}
    );
  });
 
  test("should handle when forwardRequest throws an error", async () => {
    const mockLtpList = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
            [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
          },
        ],
      },
    ];
 
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockLtpList);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockRejectedValue(new Error("Forward request failed"));
 
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
      ltpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache is not success")
    );
    expect(result).toEqual({"airInterfaceConfigurations": [], "traceIndicatorIncrementer": 2});
    consoleSpy.mockRestore();
  });
});

describe("RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache", () => {
  let ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer;

  beforeEach(() => {
    jest.clearAllMocks();
    ltpStructure = {};
    mountName = "testMount";
    requestHeaders = { Authorization: "Bearer test-token" };
    traceIndicatorIncrementer = 1;
  });

  test("should return air interface capabilities when responses are valid", async () => {
    const mockLtpList = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          { [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1" }
        ]
      }
    ];

    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockLtpList);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});

    const mockCapabilitiesResponse = {
      ["air-interface-2-0:air-interface-capability"]: {capabilityKey: "capabilityValue" }
    };

    IndividualServiceUtility.forwardRequest.mockResolvedValue(mockCapabilitiesResponse);

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache(
      ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer
    );

    expect(result).toEqual({"airInterfaceCapabilities": [{"airInterfaceCapabilities": {"capabilityKey": "capabilityValue"}, "localId": "localId1", "mountName": "testMount", "uuid": "uuid1"}], "traceIndicatorIncrementer": 2});
  });

  test("should return an empty array when no LTPs are found", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([]);
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache(
      ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer
    );
    expect(result).toEqual({"airInterfaceCapabilities": [], "traceIndicatorIncrementer": 1});
  });

  test("should return an empty array when response is empty", async () => {
    const mockLtpList = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          { [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1" }
        ]
      }
    ];

    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockLtpList);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue({});

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache(
      ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer
    );

    expect(result).toEqual({"airInterfaceCapabilities": [], "traceIndicatorIncrementer": 2});
  });

  test("should handle errors gracefully", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValue(new Error("Mock Error"));
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache(
      ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer
    );

    expect(result).toEqual({"airInterfaceCapabilities": [], "traceIndicatorIncrementer": 1});
    expect(consoleSpy).toHaveBeenCalledWith(
      "RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache is not success with Error: Mock Error"
    );

    consoleSpy.mockRestore();
  });
});

describe("RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache", () => {
  let ltpStructure, mountName, timeStamp, requestHeaders, traceIndicatorIncrementer;

  beforeEach(() => {
    ltpStructure = [];
    mountName = "testMount";
    timeStamp = "2023-03-11T09:45:00.0+00:00";
    requestHeaders = { Authorization: "Bearer test-token" };
    traceIndicatorIncrementer = 1;

    jest.clearAllMocks();
  });

  it("should return historical air interface performance when valid responses are received", async () => {
    const mockLtpStructure = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
            [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
          },
        ],
      },
    ];
    let mockPeriod_end_time=new Date(Date.now() + 1000).toISOString();
    const mockResponse = {
      "air-interface-2-0:air-interface-historical-performances": {
          "historical-performance-data-list": [
            {
              "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
              "period-end-time": "2024-03-11T09:45:00.0+00:00",
              "suspect-interval-flag": true,
              "history-data-id": "PM_RADIO_15M_02",
              "performance-data": {
                "defect-blocks-sum": 0,
                "cses": 0,
                "es": 0,
                "xpd-max": -99,
                "tx-level-max": 5,
                "ses": 0,
                "rx-level-max": -51,
                "rf-temp-max": -99,
                "snir-min": -99,
                "snir-avg": -99,
                "rx-level-avg": -51,
                "unavailability": 0,
                "time-xstates-list": [
                  {
                    "time-xstate-sequence-number": 8,
                    "time": 0,
                    "transmission-mode": "56008"
                  },
                  {
                    "time-xstate-sequence-number": 6,
                    "time": 0,
                    "transmission-mode": "56006"
                  },
                  {
                    "time-xstate-sequence-number": 7,
                    "time": 0,
                    "transmission-mode": "56007"
                  },
                  {
                    "time-xstate-sequence-number": 4,
                    "time": 29362160,
                    "transmission-mode": "56004"
                  },
                  {
                    "time-xstate-sequence-number": 5,
                    "time": 0,
                    "transmission-mode": "56005"
                  },
                  {
                    "time-xstate-sequence-number": 2,
                    "time": 0,
                    "transmission-mode": "56002"
                  },
                  {
                    "time-xstate-sequence-number": 3,
                    "time": 0,
                    "transmission-mode": "56003"
                  },
                  {
                    "time-xstate-sequence-number": 1,
                    "time": 0,
                    "transmission-mode": "56001"
                  }
                ],
                "rx-level-min": -51,
                "xpd-min": -99,
                "xpd-avg": -99,
                "tx-level-min": 5,
                "tx-level-avg": 5,
                "rf-temp-min": -99,
                "rf-temp-avg": -99,
                "snir-max": -99,
                "time-period": 900
              }
            },
            {
              "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
              "period-end-time": "2024-03-11T09:30:00.0+00:00",
              "suspect-interval-flag": true,
              "history-data-id": "PM_RADIO_15M_03",
              "performance-data": {
                "defect-blocks-sum": 0,
                "cses": 0,
                "es": 0,
                "xpd-max": -99,
                "tx-level-max": 5,
                "ses": 0,
                "rx-level-max": -51,
                "rf-temp-max": -99,
                "snir-min": -99,
                "snir-avg": -99,
                "rx-level-avg": -51,
                "unavailability": 0,
                "time-xstates-list": [
                  {
                    "time-xstate-sequence-number": 8,
                    "time": 0,
                    "transmission-mode": "56008"
                  },
                  {
                    "time-xstate-sequence-number": 6,
                    "time": 0,
                    "transmission-mode": "56006"
                  },
                  {
                    "time-xstate-sequence-number": 7,
                    "time": 0,
                    "transmission-mode": "56007"
                  },
                  {
                    "time-xstate-sequence-number": 4,
                    "time": 0,
                    "transmission-mode": "56004"
                  },
                  {
                    "time-xstate-sequence-number": 5,
                    "time": 0,
                    "transmission-mode": "56005"
                  },
                  {
                    "time-xstate-sequence-number": 2,
                    "time": 0,
                    "transmission-mode": "56002"
                  },
                  {
                    "time-xstate-sequence-number": 3,
                    "time": 0,
                    "transmission-mode": "56003"
                  },
                  {
                    "time-xstate-sequence-number": 1,
                    "time": 0,
                    "transmission-mode": "56001"
                  }
                ],
                "rx-level-min": -51,
                "xpd-min": -99,
                "xpd-avg": -99,
                "tx-level-min": 5,
                "tx-level-avg": 5,
                "rf-temp-min": -99,
                "rf-temp-avg": -99,
                "snir-max": -99,
                "time-period": 900
              }
            }
          ]
        }
    };

    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockLtpStructure);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue(mockResponse);

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache(
      ltpStructure,
      mountName,
      timeStamp,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      "processedResponses": [{"hpdList": [
        {
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
          "period-end-time": "2024-03-11T09:45:00.0+00:00",
          "suspect-interval-flag": true,
          "history-data-id": "PM_RADIO_15M_02",
          "performance-data": {
            "defect-blocks-sum": 0,
            "cses": 0,
            "es": 0,
            "xpd-max": -99,
            "tx-level-max": 5,
            "ses": 0,
            "rx-level-max": -51,
            "rf-temp-max": -99,
            "snir-min": -99,
            "snir-avg": -99,
            "rx-level-avg": -51,
            "unavailability": 0,
            "time-xstates-list": [
              {
                "time-xstate-sequence-number": 8,
                "time": 0,
                "transmission-mode": "56008"
              },
              {
                "time-xstate-sequence-number": 6,
                "time": 0,
                "transmission-mode": "56006"
              },
              {
                "time-xstate-sequence-number": 7,
                "time": 0,
                "transmission-mode": "56007"
              },
              {
                "time-xstate-sequence-number": 4,
                "time": 29362160,
                "transmission-mode": "56004"
              },
              {
                "time-xstate-sequence-number": 5,
                "time": 0,
                "transmission-mode": "56005"
              },
              {
                "time-xstate-sequence-number": 2,
                "time": 0,
                "transmission-mode": "56002"
              },
              {
                "time-xstate-sequence-number": 3,
                "time": 0,
                "transmission-mode": "56003"
              },
              {
                "time-xstate-sequence-number": 1,
                "time": 0,
                "transmission-mode": "56001"
              }
            ],
            "rx-level-min": -51,
            "xpd-min": -99,
            "xpd-avg": -99,
            "tx-level-min": 5,
            "tx-level-avg": 5,
            "rf-temp-min": -99,
            "rf-temp-avg": -99,
            "snir-max": -99,
            "time-period": 900
          }
        },
        {
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
          "period-end-time": "2024-03-11T09:30:00.0+00:00",
          "suspect-interval-flag": true,
          "history-data-id": "PM_RADIO_15M_03",
          "performance-data": {
            "defect-blocks-sum": 0,
            "cses": 0,
            "es": 0,
            "xpd-max": -99,
            "tx-level-max": 5,
            "ses": 0,
            "rx-level-max": -51,
            "rf-temp-max": -99,
            "snir-min": -99,
            "snir-avg": -99,
            "rx-level-avg": -51,
            "unavailability": 0,
            "time-xstates-list": [
              {
                "time-xstate-sequence-number": 8,
                "time": 0,
                "transmission-mode": "56008"
              },
              {
                "time-xstate-sequence-number": 6,
                "time": 0,
                "transmission-mode": "56006"
              },
              {
                "time-xstate-sequence-number": 7,
                "time": 0,
                "transmission-mode": "56007"
              },
              {
                "time-xstate-sequence-number": 4,
                "time": 0,
                "transmission-mode": "56004"
              },
              {
                "time-xstate-sequence-number": 5,
                "time": 0,
                "transmission-mode": "56005"
              },
              {
                "time-xstate-sequence-number": 2,
                "time": 0,
                "transmission-mode": "56002"
              },
              {
                "time-xstate-sequence-number": 3,
                "time": 0,
                "transmission-mode": "56003"
              },
              {
                "time-xstate-sequence-number": 1,
                "time": 0,
                "transmission-mode": "56001"
              }
            ],
            "rx-level-min": -51,
            "xpd-min": -99,
            "xpd-avg": -99,
            "tx-level-min": 5,
            "tx-level-avg": 5,
            "rf-temp-min": -99,
            "rf-temp-avg": -99,
            "snir-max": -99,
            "time-period": 900
          }
        }],
         "localId": "localId1", 
         "mountName": "testMount", 
         "uuid": "uuid1"}], 
         "traceIndicatorIncrementer": 2});
  });

  it("should return an empty array when no LTPs exist", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([]);

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache(
      ltpStructure,
      mountName,
      timeStamp,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({"processedResponses": [], "traceIndicatorIncrementer": 1});
  });

  it("should return an empty array when forwardRequest returns an empty response", async () => {
    const mockLtpStructure = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
            [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
          },
        ],
      },
    ];

    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockLtpStructure);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue({});

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache(
      ltpStructure,
      mountName,
      timeStamp,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({"processedResponses": [], "traceIndicatorIncrementer": 2});
  });

  it("should handle errors gracefully and return an empty array", async () => {
      const mockLtpStructure = [
        {
          [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
          [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
            {
              [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
              [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
            },
          ],
        },
      ];
    
      ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValue(new Error("Mocked Error"));
      
      const consoleSpyLog = jest.spyOn(console, "log").mockImplementation(() => {});
    
      const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache(
        mockLtpStructure,
        mountName,
        timeStamp,
        requestHeaders,
        traceIndicatorIncrementer
      );
    
      expect(consoleSpyLog).toHaveBeenCalledWith(
        expect.stringContaining("RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache is not success")
      );
            
      expect(result).toEqual({"processedResponses": [], "traceIndicatorIncrementer": 1});
      consoleSpyLog.mockRestore();
    });
    

  
});
 
describe("RequestForProvidingHistoricalPmDataCausesReadingHistoricalEthernetContainerPerformanceFromCache", () => {
  let ltpStructure, mountName, timeStamp, requestHeaders, traceIndicatorIncrementer;
 
  beforeEach(() => {
    ltpStructure = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
            [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
          },
        ],
      },
    ];
 
    mountName = "testMount";
    timeStamp = "2021-06-06T10:45:00.0+00:00"; 
    requestHeaders = { Authorization: "Bearer test-token" };
    traceIndicatorIncrementer = 1;
 
    jest.clearAllMocks();
  });
 
  it("should return filtered historical Ethernet container performance data", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(ltpStructure);
 
    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      "ethernet-container-2-0:ethernet-container-historical-performances": {
        "historical-performance-data-list": [
          {
            "granularity-period": "ethernet-container-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "period-end-time": "2022-06-06T10:45:00.0+00:00",
            "suspect-interval-flag": false,
            "performance-data": {
              "broadcast-frames-output": 0,
              "jabber-frames-ingress": 0,
              "total-frames-input": "0",
              "multicast-frames-output": 0,
              "total-bytes-input": "0",
              "total-bytes-output": "0",
              "oversized-frames-ingress": 0,
              "unicast-frames-input": "-1",
              "unicast-frames-output": "-1",
              "total-frames-output": "0",
              "errored-frames-input": 0,
              "multicast-frames-input": 0,
              "fragmented-frames-input": 0,
              "dropped-frames-input": 0,
              "dropped-frames-output": -1,
              "queue-utilization-list": [
                {
                  "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE3",
                  "max-queue-length": -1,
                  "avg-queue-length": -1
                },
                {
                  "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE2",
                  "max-queue-length": -1,
                  "avg-queue-length": -1
                },
                {
                  "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE1",
                  "max-queue-length": -1,
                  "avg-queue-length": -1
                },
                {
                  "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_BEST_EFFORT_QUEUE",
                  "max-queue-length": -1,
                  "avg-queue-length": -1
                }
              ],
              "unknown-protocol-frames-input": -1,
              "max-bytes-per-second-output": -1,
              "forwarded-frames-output": "-1",
              "broadcast-frames-input": 0,
              "errored-frames-output": -1,
              "forwarded-frames-input": "-1",
              "time-period": 900,
              "undersized-frames-ingress": 0
            },
            "history-data-id": "PM_ETH_CONTAINER_RADIO_15M"
          },
          {
            "granularity-period": "ethernet-container-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "period-end-time": "2022-06-06T11:15:00.0+00:00",
            "suspect-interval-flag": false,
            "performance-data": {
              "broadcast-frames-output": 0,
              "jabber-frames-ingress": 0,
              "total-frames-input": "0",
              "multicast-frames-output": 0,
              "total-bytes-input": "0",
              "total-bytes-output": "0",
              "oversized-frames-ingress": 0,
              "unicast-frames-input": "-1",
              "unicast-frames-output": "-1",
              "total-frames-output": "0",
              "errored-frames-input": 0,
              "multicast-frames-input": 0,
              "fragmented-frames-input": 0,
              "dropped-frames-input": 0,
              "dropped-frames-output": -1,
              "queue-utilization-list": [
                {
                  "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE3",
                  "max-queue-length": -1,
                  "avg-queue-length": -1
                },
                {
                  "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE2",
                  "max-queue-length": -1,
                  "avg-queue-length": -1
                },
                {
                  "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE1",
                  "max-queue-length": -1,
                  "avg-queue-length": -1
                },
                {
                  "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_BEST_EFFORT_QUEUE",
                  "max-queue-length": -1,
                  "avg-queue-length": -1
                }
              ],
              "unknown-protocol-frames-input": -1,
              "max-bytes-per-second-output": -1,
              "forwarded-frames-output": "-1",
              "broadcast-frames-input": 0,
              "errored-frames-output": -1,
              "forwarded-frames-input": "-1",
              "time-period": 900,
              "undersized-frames-ingress": 0
            },
            "history-data-id": "PM_ETH_CONTAINER_RADIO_15M"
          }
        ]
      }
    });
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingHistoricalEthernetContainerPerformanceFromCache(
      ltpStructure,
      mountName,
      timeStamp,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(result).toEqual({
        processedResponses: [
          {
            uuid: "uuid1",
            mountName: "testMount",
            localId: "localId1",
            filteredEntries: expect.arrayContaining([
              {
                "granularity-period": "ethernet-container-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
                "period-end-time": "2022-06-06T10:45:00.0+00:00",
                "suspect-interval-flag": false,
                "performance-data": {
                  "broadcast-frames-output": 0,
                  "jabber-frames-ingress": 0,
                  "total-frames-input": "0",
                  "multicast-frames-output": 0,
                  "total-bytes-input": "0",
                  "total-bytes-output": "0",
                  "oversized-frames-ingress": 0,
                  "unicast-frames-input": "-1",
                  "unicast-frames-output": "-1",
                  "total-frames-output": "0",
                  "errored-frames-input": 0,
                  "multicast-frames-input": 0,
                  "fragmented-frames-input": 0,
                  "dropped-frames-input": 0,
                  "dropped-frames-output": -1,
                  "queue-utilization-list": [
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE3",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE2",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE1",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_BEST_EFFORT_QUEUE",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    }
                  ],
                  "unknown-protocol-frames-input": -1,
                  "max-bytes-per-second-output": -1,
                  "forwarded-frames-output": "-1",
                  "broadcast-frames-input": 0,
                  "errored-frames-output": -1,
                  "forwarded-frames-input": "-1",
                  "time-period": 900,
                  "undersized-frames-ingress": 0
                },
                "history-data-id": "PM_ETH_CONTAINER_RADIO_15M"
              },
              {
                "granularity-period": "ethernet-container-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
                "period-end-time": "2022-06-06T11:15:00.0+00:00",
                "suspect-interval-flag": false,
                "performance-data": {
                  "broadcast-frames-output": 0,
                  "jabber-frames-ingress": 0,
                  "total-frames-input": "0",
                  "multicast-frames-output": 0,
                  "total-bytes-input": "0",
                  "total-bytes-output": "0",
                  "oversized-frames-ingress": 0,
                  "unicast-frames-input": "-1",
                  "unicast-frames-output": "-1",
                  "total-frames-output": "0",
                  "errored-frames-input": 0,
                  "multicast-frames-input": 0,
                  "fragmented-frames-input": 0,
                  "dropped-frames-input": 0,
                  "dropped-frames-output": -1,
                  "queue-utilization-list": [
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE3",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE2",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE1",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_BEST_EFFORT_QUEUE",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    }
                  ],
                  "unknown-protocol-frames-input": -1,
                  "max-bytes-per-second-output": -1,
                  "forwarded-frames-output": "-1",
                  "broadcast-frames-input": 0,
                  "errored-frames-output": -1,
                  "forwarded-frames-input": "-1",
                  "time-period": 900,
                  "undersized-frames-ingress": 0
                },
                "history-data-id": "PM_ETH_CONTAINER_RADIO_15M"
              }
            ])
          }],
          traceIndicatorIncrementer: 2
      });
     
  });
 
  it("should return an empty array if no historical Ethernet container performance data is found", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(ltpStructure);
    IndividualServiceUtility.forwardRequest.mockResolvedValue({});
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingHistoricalEthernetContainerPerformanceFromCache(
      ltpStructure,
      mountName,
      timeStamp,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(result).toEqual({"processedResponses": [], "traceIndicatorIncrementer": 2});
  });
 
  it("should return an empty array if historical data does not match the timestamp filter", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(ltpStructure);
 
    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      "ethernet-container-2-0:ethernet-container-pac": [
        {
          "ethernet-container-historical-performances": [
            {
              "granularity-period": "ethernet-container-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
              "period-end-time": new Date(Date.now() - 1000000).toISOString(), // Very old date
            },
          ],
        },
      ],
    });
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingHistoricalEthernetContainerPerformanceFromCache(
      ltpStructure,
      mountName,
      timeStamp,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(result).toEqual({"processedResponses": [], "traceIndicatorIncrementer": 2});
  });
 
  it("should handle errors gracefully and return an empty array", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValue(new Error("Mocked Error"));
 
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingHistoricalEthernetContainerPerformanceFromCache(
      ltpStructure,
      mountName,
      timeStamp,
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("RequestForProvidingHistoricalPmDataCausesReadingHistoricalEthernetContainerPerformanceFromCache is not success")
    );
 
    expect(result).toEqual({"processedResponses": [], "traceIndicatorIncrementer": 1});
 
    consoleSpy.mockRestore();
  });
});
 

describe("formulateHistoricalPmData", () => {
  let mountName, mockLtpStructure, mockAirAndEthernetInterfacesResponse, mockPhysicalLinkAggregations;
  let mockAirInterfaceConfiguration, mockAirInterfaceCapabilities, mockAirInterfacePerformance, mockEthernetPerformance;
 
  beforeEach(() => {
    mountName = "testMount";
 
    mockLtpStructure = {
      "core-model-1-4:control-construct": [
        {
          "logical-termination-point": [
            { uuid: "LTP-1" },
            { uuid: "LTP-2" }
          ]
        }
      ]
    };
 
    mockAirAndEthernetInterfacesResponse = {
      processedLtpResponses: [
        {
          uuid: "LTP-1",
          "link-endpoint-id": "exampleLinkEndpointId",
          "link-id": "exampleLinkId",
          "logical-termination-point-id": "ltp-123",
          "mount-name": "exampleMountName",
          "link-aggregation-identifiers": [
            {
              uuid: "ltp-aggregated-1",
              layerProtocolName: "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER"
            }
          ]
        },
        {
          uuid: "LTP-2",
          "interface-name": "eth0",
          "logical-termination-point-id": "ltp-eth-001",
          "mount-name": "exampleMountName"
        }
      ]
    };    
   
    mockPhysicalLinkAggregations = {
      aggregatedResults: [
        {
          uuid: "LTP-1",
          list: [
            {
              uuid: "ltp-aggregated-1",
              layerProtocolName: "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER"
            }
          ]
        }
      ]
    };
 
    mockAirInterfaceConfiguration = {
      airInterfaceConfigurations: [
        {
          uuid: "LTP-1",
          "atpc-is-on": true,
          "atpc-threshold-upper": 10,
          "atpc-threshold-lower": 5,
          "tx-power": 3,
          "transmission-mode-min": "Mode-1",
          "transmission-mode-max": "Mode-2"
        }
      ]
    };    
 
    mockAirInterfaceCapabilities = {
      airInterfaceCapabilities: [
        {
          uuid: "LTP-1",
          "transmission-mode-list": [
            {
              "transmission-mode-name": "Mode-1",
              "modulation-scheme": "16-QAM",  
              "modulation-scheme-name-at-lct": "16QAM",
              "channel-bandwidth": 50,  
              "code-rate": "5/6",  
              "symbol-rate-reduction-factor": 0.8  
            },
            {
              "transmission-mode-name": "Mode-2",
              "modulation-scheme": "64-QAM",
              "modulation-scheme-name-at-lct": "64QAM",
              "channel-bandwidth": 100,  
              "code-rate": "3/4",  
              "symbol-rate-reduction-factor": 0.7  
            }
          ]
        }
      ]
    };
   
    mockAirInterfacePerformance = {
        processedResponses: [
            { "uuid": "LTP-1",
                "mountName": "exampleMountName",
                "localId": "localId",
      "hpdList": 
           [
            {
              "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
              "period-end-time": "2024-03-11T09:45:00.0+00:00",
              "suspect-interval-flag": true,
              "history-data-id": "PM_RADIO_15M_02",
              "performance-data": {
                "defect-blocks-sum": 0,
                "cses": 0,
                "es": 0,
                "xpd-max": -99,
                "tx-level-max": 5,
                "ses": 0,
                "rx-level-max": -51,
                "rf-temp-max": -99,
                "snir-min": -99,
                "snir-avg": -99,
                "rx-level-avg": -51,
                "unavailability": 0,
                "time-xstates-list": [
                  {
                    "time-xstate-sequence-number": 8,
                    "time": 0,
                    "transmission-mode": "56008"
                  },
                  {
                    "time-xstate-sequence-number": 6,
                    "time": 0,
                    "transmission-mode": "56006"
                  },
                  {
                    "time-xstate-sequence-number": 7,
                    "time": 0,
                    "transmission-mode": "56007"
                  },
                  {
                    "time-xstate-sequence-number": 4,
                    "time": 29362160,
                    "transmission-mode": "56004"
                  },
                  {
                    "time-xstate-sequence-number": 5,
                    "time": 0,
                    "transmission-mode": "56005"
                  },
                  {
                    "time-xstate-sequence-number": 2,
                    "time": 0,
                    "transmission-mode": "56002"
                  },
                  {
                    "time-xstate-sequence-number": 3,
                    "time": 0,
                    "transmission-mode": "56003"
                  },
                  {
                    "time-xstate-sequence-number": 1,
                    "time": 0,
                    "transmission-mode": "56001"
                  }
                ],
                "rx-level-min": -51,
                "xpd-min": -99,
                "xpd-avg": -99,
                "tx-level-min": 5,
                "tx-level-avg": 5,
                "rf-temp-min": -99,
                "rf-temp-avg": -99,
                "snir-max": -99,
                "time-period": 900
              }
            },
            {
              "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
              "period-end-time": "2024-03-11T09:30:00.0+00:00",
              "suspect-interval-flag": true,
              "history-data-id": "PM_RADIO_15M_03",
              "performance-data": {
                "defect-blocks-sum": 0,
                "cses": 0,
                "es": 0,
                "xpd-max": -99,
                "tx-level-max": 5,
                "ses": 0,
                "rx-level-max": -51,
                "rf-temp-max": -99,
                "snir-min": -99,
                "snir-avg": -99,
                "rx-level-avg": -51,
                "unavailability": 0,
                "time-xstates-list": [
                  {
                    "time-xstate-sequence-number": 8,
                    "time": 0,
                    "transmission-mode": "56008"
                  },
                  {
                    "time-xstate-sequence-number": 6,
                    "time": 0,
                    "transmission-mode": "56006"
                  },
                  {
                    "time-xstate-sequence-number": 7,
                    "time": 0,
                    "transmission-mode": "56007"
                  },
                  {
                    "time-xstate-sequence-number": 4,
                    "time": 0,
                    "transmission-mode": "56004"
                  },
                  {
                    "time-xstate-sequence-number": 5,
                    "time": 0,
                    "transmission-mode": "56005"
                  },
                  {
                    "time-xstate-sequence-number": 2,
                    "time": 0,
                    "transmission-mode": "56002"
                  },
                  {
                    "time-xstate-sequence-number": 3,
                    "time": 0,
                    "transmission-mode": "56003"
                  },
                  {
                    "time-xstate-sequence-number": 1,
                    "time": 0,
                    "transmission-mode": "56001"
                  }
                ],
                "rx-level-min": -51,
                "xpd-min": -99,
                "xpd-avg": -99,
                "tx-level-min": 5,
                "tx-level-avg": 5,
                "rf-temp-min": -99,
                "rf-temp-avg": -99,
                "snir-max": -99,
                "time-period": 900
              }
            }
          ]
        }
             
    ]
};      
    

    mockEthernetPerformance = {
        processedResponses: [
            { "uuid": "LTP-2",
                "mountName": "exampleMountName",
                "localId": "localId",
      "filteredEntries": 
           [
            {
                "granularity-period": "ethernet-container-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
                "period-end-time": "2022-06-06T10:45:00.0+00:00",
                "suspect-interval-flag": false,
                "performance-data": {
                  "broadcast-frames-output": 0,
                  "jabber-frames-ingress": 0,
                  "total-frames-input": "0",
                  "multicast-frames-output": 0,
                  "total-bytes-input": "0",
                  "total-bytes-output": "0",
                  "oversized-frames-ingress": 0,
                  "unicast-frames-input": "-1",
                  "unicast-frames-output": "-1",
                  "total-frames-output": "0",
                  "errored-frames-input": 0,
                  "multicast-frames-input": 0,
                  "fragmented-frames-input": 0,
                  "dropped-frames-input": 0,
                  "dropped-frames-output": -1,
                  "queue-utilization-list": [
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE3",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE2",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE1",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_BEST_EFFORT_QUEUE",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    }
                  ],
                  "unknown-protocol-frames-input": -1,
                  "max-bytes-per-second-output": -1,
                  "forwarded-frames-output": "-1",
                  "broadcast-frames-input": 0,
                  "errored-frames-output": -1,
                  "forwarded-frames-input": "-1",
                  "time-period": 900,
                  "undersized-frames-ingress": 0
                },
                "history-data-id": "PM_ETH_CONTAINER_RADIO_15M"
              },
              {
                "granularity-period": "ethernet-container-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
                "period-end-time": "2022-06-06T11:15:00.0+00:00",
                "suspect-interval-flag": false,
                "performance-data": {
                  "broadcast-frames-output": 0,
                  "jabber-frames-ingress": 0,
                  "total-frames-input": "0",
                  "multicast-frames-output": 0,
                  "total-bytes-input": "0",
                  "total-bytes-output": "0",
                  "oversized-frames-ingress": 0,
                  "unicast-frames-input": "-1",
                  "unicast-frames-output": "-1",
                  "total-frames-output": "0",
                  "errored-frames-input": 0,
                  "multicast-frames-input": 0,
                  "fragmented-frames-input": 0,
                  "dropped-frames-input": 0,
                  "dropped-frames-output": -1,
                  "queue-utilization-list": [
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE3",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE2",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE1",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_BEST_EFFORT_QUEUE",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    }
                  ],
                  "unknown-protocol-frames-input": -1,
                  "max-bytes-per-second-output": -1,
                  "forwarded-frames-output": "-1",
                  "broadcast-frames-input": 0,
                  "errored-frames-output": -1,
                  "forwarded-frames-input": "-1",
                  "time-period": 900,
                  "undersized-frames-ingress": 0
                },
                "history-data-id": "PM_ETH_CONTAINER_RADIO_15M"
              },
              {
                "granularity-period": "ethernet-container-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
                "period-end-time": "2022-06-06T11:00:00.0+00:00",
                "suspect-interval-flag": false,
                "performance-data": {
                  "broadcast-frames-output": 0,
                  "jabber-frames-ingress": 0,
                  "total-frames-input": "0",
                  "multicast-frames-output": 0,
                  "total-bytes-input": "0",
                  "total-bytes-output": "0",
                  "oversized-frames-ingress": 0,
                  "unicast-frames-input": "-1",
                  "unicast-frames-output": "-1",
                  "total-frames-output": "0",
                  "errored-frames-input": 0,
                  "multicast-frames-input": 0,
                  "fragmented-frames-input": 0,
                  "dropped-frames-input": 0,
                  "dropped-frames-output": -1,
                  "queue-utilization-list": [
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE3",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE2",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_ASSURED_FORWARDING_QUEUE1",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    },
                    {
                      "queue-name": "ethernet-container-2-0:QUEUE_NAME_TYPE_BEST_EFFORT_QUEUE",
                      "max-queue-length": -1,
                      "avg-queue-length": -1
                    }
                  ],
                  "unknown-protocol-frames-input": -1,
                  "max-bytes-per-second-output": -1,
                  "forwarded-frames-output": "-1",
                  "broadcast-frames-input": 0,
                  "errored-frames-output": -1,
                  "forwarded-frames-input": "-1",
                  "time-period": 900,
                  "undersized-frames-ingress": 0
                },
                "history-data-id": "PM_ETH_CONTAINER_RADIO_15M"
              }
          ]
        }
             
    ]
};      
 
    jest.clearAllMocks();
  });
 
  it("should return aggregated PM data successfully", async () => {
      const result = await readHistoricalData.formulateHistoricalPmData(
        mountName,
        mockLtpStructure,
        mockAirAndEthernetInterfacesResponse,
        mockPhysicalLinkAggregations,
        mockAirInterfaceConfiguration,
        mockAirInterfaceCapabilities,
        mockAirInterfacePerformance,
        mockEthernetPerformance
      );
 
    // Print debug info
  console.dir(result["air-interface-list"], { depth: null });
  console.dir(result["ethernet-container-list"], { depth: null });
 
  // Assertions
    expect(result).toHaveProperty("air-interface-list");
    expect(result).toHaveProperty("ethernet-container-list");
 
    expect(result["air-interface-list"][0]["air-interface-identifiers"]).toBeDefined();
    expect(Object.keys(result["air-interface-list"][0]["air-interface-identifiers"]).length).toBeGreaterThan(0);
 
    expect(result["air-interface-list"][0]["air-interface-performance-measurements-list"]).toBeDefined();
    expect(result["air-interface-list"][0]["air-interface-performance-measurements-list"].length).toBeGreaterThan(0);
 
    expect(result["air-interface-list"][0]["transmission-mode-list"]).toBeDefined();
    expect(result["air-interface-list"][0]["transmission-mode-list"].length).toBeGreaterThan(0);
 
    expect(result["ethernet-container-list"][0]["ethernet-container-identifiers"]).toBeDefined();
    expect(Object.keys(result["ethernet-container-list"][0]["ethernet-container-identifiers"]).length).toBeGreaterThan(0);
 
    expect(result["ethernet-container-list"][0]["ethernet-container-performance-measurements-list"]).toBeDefined();
    expect(result["ethernet-container-list"][0]["ethernet-container-performance-measurements-list"].length).toBeGreaterThan(0);
 
    // Use toMatchObject for flexible matching
    expect(result).toMatchObject({
      "air-interface-list": expect.any(Array),
      "ethernet-container-list": expect.any(Array),
    });
  });
 
  // it("should return empty lists when no LTPs exist", async () => {
  //   const emptyLtpStructure = {
  //       "core-model-1-4:control-construct": [
  //           { "logical-termination-point": [] } // Ensures it does not break
  //       ]
  //   };
 
  //   const result = await readHistoricalData.formulateHistoricalPmData(
  //       mountName,
  //       emptyLtpStructure,
  //       mockAirAndEthernetInterfacesResponse,
  //       mockPhysicalLinkAggregations,
  //       mockAirInterfaceConfiguration,
  //       mockAirInterfaceCapabilities,
  //       mockAirInterfacePerformance,
  //       mockEthernetPerformance
  //   );
 
  //   expect(result["air-interface-list"]).toEqual([]);
  //   expect(result["ethernet-container-list"]).toEqual([]);
  // });
 
  // it("should handle corrupted Air and Ethernet Interface Data", async () => {
  //   const result = await readHistoricalData.formulateHistoricalPmData(
  //       mountName,
  //       mockLtpStructure,
  //       null, // Corrupted Air & Ethernet Interfaces Response
  //       mockPhysicalLinkAggregations,
  //       null, // Corrupted Air Interface Configuration
  //       null, // Corrupted Air Interface Capabilities
  //       mockAirInterfacePerformance,
  //       mockEthernetPerformance
  //   );
 
  //   expect(result["air-interface-list"]).toEqual([]);
  //   expect(result["ethernet-container-list"]).toEqual([]);
  // });
});
 

describe('getConfiguredModulation', () => {
    let getConfiguredModulation;
   
    beforeEach(() => {
      // Access the private function
      getConfiguredModulation = readHistoricalDataRewire.__get__('getConfiguredModulation');
    });
   
    it('should return the correct transmission mode when present in the list', async () => {
      const airInterfaceCapabilities = {
        "transmission-mode-list": [
          { "transmission-mode-name": "ModeA", "modulation": "QAM16" },
          { "transmission-mode-name": "ModeB", "modulation": "QAM64" }
        ]
      };
      const transmissioModeType = "ModeA";
      const result = await getConfiguredModulation(airInterfaceCapabilities, transmissioModeType);
      expect(result).toEqual({ "transmission-mode-name": "ModeA", "modulation": "QAM16" });
    });
   
    it('should return an empty object if the transmission mode is not found', async () => {
      const airInterfaceCapabilities = {
        "transmission-mode-list": [
          { "transmission-mode-name": "ModeA", "modulation": "QAM16" }
        ]
      };
      const transmissioModeType = "ModeC";
      const result = await getConfiguredModulation(airInterfaceCapabilities, transmissioModeType);
      expect(result).toBeUndefined;
    });
   
    it('should return an empty object if transmission-mode-list is undefined', async () => {
      const airInterfaceCapabilities = {};
      const transmissioModeType = "ModeA";
      const result = await getConfiguredModulation(airInterfaceCapabilities, transmissioModeType);
      expect(result).toEqual({});
    });
   
    it('should return an empty object if airInterfaceCapabilities is undefined', async () => {
      const transmissioModeType = "ModeA";
      const result = await getConfiguredModulation(undefined, transmissioModeType);
      expect(result).toEqual({});
    });
   
    it('should return an empty object if transmissioModeType is undefined', async () => {
      const airInterfaceCapabilities = {
        "transmission-mode-list": [
          { "transmission-mode-name": "ModeA", "modulation": "QAM16" }
        ]
      };
      const result = await getConfiguredModulation(airInterfaceCapabilities, undefined);
      expect(result).toEqual({});
    });
   
    it('should return an empty object if transmission-mode-list is an empty array', async () => {
      const airInterfaceCapabilities = {
        "transmission-mode-list": []
      };
      const transmissioModeType = "ModeA";
      const result = await getConfiguredModulation(airInterfaceCapabilities, transmissioModeType);
      expect(result).toBeUndefined;
    });
}); 



describe('ReadHistoricalData', () => {
  let mockRequestHeaders;
  let mockLtpStructure;
  let mountName;
  let timeStamp;
  let traceIndicatorIncrementer;
 
  beforeEach(() => {
      jest.clearAllMocks();
 
      mountName = 'testMount';
      timeStamp = '2025-02-17T12:00:00Z';
      traceIndicatorIncrementer = 1;
 
      mockRequestHeaders = {
          user: 'testUser',
          originator: 'testOriginator',
          xCorrelator: 'testXCorrelator',
          traceIndicator: 'testTraceIndicator',
          customerJourney: 'testCustomerJourney'
      };
 
      mockLtpStructure = {
          'core-model-1-4:control-construct': [
              {
                  'logical-termination-point': [
                      {
                          uuid: 'ltp-123',
                          'layer-protocol': [{ 'local-id': 'lp-001', 'layer-protocol-name': 'air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER' }]
                      }
                  ]
              }
          ]
      };
 
      jest.spyOn(readHistoricalData, 'RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces')
          .mockResolvedValue({
              processedLtpResponses: [{ uuid: 'ltp-123', localId: 'lp-001', layerProtocolName: 'air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER' }],
              traceIndicatorIncrementer: 2
          });
 
      jest.spyOn(readHistoricalData, 'RequestForProvidingHistoricalPmDataCausesIdentifyingPhysicalLinkAggregations')
          .mockResolvedValue({
              aggregatedResults: [{ uuid: 'ltp-123', linkId: 'link-001' }],
              traceIndicatorIncrementer: 3
          });
 
      jest.spyOn(readHistoricalData, 'RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache')
          .mockResolvedValue({
              airInterfaceConfigurations: [{ uuid: 'ltp-123', config: 'configData' }],
              traceIndicatorIncrementer: 4
          });
 
      jest.spyOn(readHistoricalData, 'RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache')
          .mockResolvedValue({
              airInterfaceCapabilities: [{ uuid: 'ltp-123', capabilities: 'capabilityData' }],
              traceIndicatorIncrementer: 5
          });
 
      jest.spyOn(readHistoricalData, 'RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache')
          .mockResolvedValue({
              processedResponses: [{ uuid: 'ltp-123', performance: 'performanceData' }],
              traceIndicatorIncrementer: 6
          });
 
      jest.spyOn(readHistoricalData, 'RequestForProvidingHistoricalPmDataCausesReadingHistoricalEthernetContainerPerformanceFromCache')
          .mockResolvedValue({
              processedResponses: [{ uuid: 'ltp-123', ethernetPerformance: 'ethernetPerformanceData' }],
              traceIndicatorIncrementer: 7
          });
 
      jest.spyOn(readHistoricalData, 'formulateHistoricalPmData')
          .mockResolvedValue({
              historicalData: 'finalAggregatedData'
          });
  });
 
  test('should call all sub-functions and return historical PM data', async () => {
      const result = await readHistoricalData.readHistoricalData(mountName, timeStamp, mockLtpStructure, mockRequestHeaders, traceIndicatorIncrementer);
 
      expect(readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces)
          .toHaveBeenCalledWith(mockLtpStructure, mountName, mockRequestHeaders, traceIndicatorIncrementer);
 
      expect(readHistoricalData.RequestForProvidingHistoricalPmDataCausesIdentifyingPhysicalLinkAggregations)
          .toHaveBeenCalledWith(mockLtpStructure, mountName, mockRequestHeaders, expect.any(Number));
 
      expect(readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache)
          .toHaveBeenCalledWith(mockLtpStructure, mountName, mockRequestHeaders, expect.any(Number));
 
      expect(readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache)
          .toHaveBeenCalledWith(mockLtpStructure, mountName, mockRequestHeaders, expect.any(Number));
 
      expect(readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache)
          .toHaveBeenCalledWith(mockLtpStructure, mountName, timeStamp, mockRequestHeaders, expect.any(Number));
 
      expect(readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingHistoricalEthernetContainerPerformanceFromCache)
          .toHaveBeenCalledWith(mockLtpStructure, mountName, timeStamp, mockRequestHeaders, expect.any(Number));
 
      expect(readHistoricalData.formulateHistoricalPmData)
          .toHaveBeenCalledWith(
              mountName, mockLtpStructure,
              expect.any(Object), expect.any(Object),
              expect.any(Object), expect.any(Object),
              expect.any(Object), expect.any(Object)
          );
 
      expect(result).toEqual({ historicalData: 'finalAggregatedData' });
  });
 
  test('should throw an error if a sub-function fails', async () => {
      readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces
          .mockRejectedValue(new Error('Mocked error'));
 
      await expect(readHistoricalData.readHistoricalData(mountName, timeStamp, mockLtpStructure, mockRequestHeaders, traceIndicatorIncrementer))
          .rejects.toThrow('Mocked error');
  });
});