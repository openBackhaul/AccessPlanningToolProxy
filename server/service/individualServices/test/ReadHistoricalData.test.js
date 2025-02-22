const rewire = require('rewire');
const readHistoricalDataRewire = rewire('../ReadHistoricalData');
const readHistoricalData = require('../ReadHistoricalData');
const ltpStructureUtility = require('../LtpStructureUtility');
const IndividualServiceUtility = require('../IndividualServiceUtility');

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
      { uuid: 'uuid1', 'layer-protocol': [{ 'local-id': 'localId1', 'layer-protocol-name': 'LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER' }] },
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
      { uuid: 'uuid1', 'layer-protocol': [{ 'local-id': 'localId1', 'layer-protocol-name': 'LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER' }] },
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
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
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
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
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
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
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
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
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
 
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
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
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
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
      ["air-interface-2-0:air-container-pac"]: {
        "air-interface-capability": { capabilityKey: "capabilityValue" }
      }
    };

    IndividualServiceUtility.forwardRequest.mockResolvedValue(mockCapabilitiesResponse);

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache(
      ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer
    );

    expect(result).toEqual([
      {
        mountName: "testMount",
        uuid: "uuid1",
        localId: "localId1",
        airInterfaceCapabilities: { capabilityKey: "capabilityValue" }
      }
    ]);
  });

  test("should return an empty array when no LTPs are found", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([]);
    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache(
      ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer
    );
    expect(result).toEqual([]);
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

    expect(result).toEqual([]);
  });

  test("should handle errors gracefully", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValue(new Error("Mock Error"));
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache(
      ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer
    );

    expect(result).toEqual([]);
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
    timeStamp = new Date().toISOString();
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
            [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME]: "LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
          },
        ],
      },
    ];

    const mockResponse = {
      "air-interface-2-0:air-container-historical-performances": [
        {
          "historical-performance-data-list": [
            {
              "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
              "period-end-time": new Date(Date.now() + 1000).toISOString(),
              "tx-level-min": -10,
              "tx-level-max": -5,
              "tx-level-avg": -7,
            },
          ],
        },
      ],
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

    expect(result).toEqual([
      {
        uuid: "uuid1",
        mountName: "testMount",
        localId: "localId1",
        hpdList: [
          {
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "period-end-time": expect.any(String),
            "tx-level-min": -10,
            "tx-level-max": -5,
            "tx-level-avg": -7,
          },
        ],
      },
    ]);
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

    expect(result).toEqual([]);
  });

  it("should return an empty array when forwardRequest returns an empty response", async () => {
    const mockLtpStructure = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
            [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME]: "LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
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

    expect(result).toEqual([]);
  });

  it("should handle errors gracefully and return an empty array", async () => {
      const mockLtpStructure = [
        {
          [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
          [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
            {
              [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
              [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME]: "LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
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
            
      expect(result).toEqual([]);
      consoleSpyLog.mockRestore();
    });
    

  it("should process multiple LTPs correctly", async () => {
    const mockLtpStructure = [
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid1",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId1",
            [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME]: "LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
          },
        ],
      },
      {
        [onfAttributes.GLOBAL_CLASS.UUID]: "uuid2",
        [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
          {
            [onfAttributes.LOCAL_CLASS.LOCAL_ID]: "localId2",
            [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME]: "LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
          },
        ],
      },
    ];

    const mockResponse = {
      "air-interface-2-0:air-container-historical-performances": [
        {
          "historical-performance-data-list": [
            {
              "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
              "period-end-time": new Date(Date.now() + 1000).toISOString(),
              "tx-level-min": -10,
              "tx-level-max": -5,
              "tx-level-avg": -7,
            },
          ],
        },
      ],
    };

    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(mockLtpStructure);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse);

    const result = await readHistoricalData.RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache(
      ltpStructure,
      mountName,
      timeStamp,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual([
      {
        uuid: "uuid1",
        mountName: "testMount",
        localId: "localId1",
        hpdList: expect.any(Array),
      },
      {
        uuid: "uuid2",
        mountName: "testMount",
        localId: "localId2",
        hpdList: expect.any(Array),
      },
    ]);
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
            [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME]: "LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
          },
        ],
      },
    ];

    mountName = "testMount";
    timeStamp = new Date().toISOString();
    requestHeaders = { Authorization: "Bearer test-token" };
    traceIndicatorIncrementer = 1;

    jest.clearAllMocks();
  });

  it("should return filtered historical Ethernet container performance data", async () => {
    ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue(ltpStructure);

    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      "ethernet-container-2-0:ethernet-container-pac": [
        {
          "ethernet-container-historical-performances": [
            {
              "granularity-period": "ethernet-container-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
              "period-end-time": new Date(Date.now() + 10000).toISOString(), // Future date
            },
            {
              "granularity-period": "ethernet-container-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
              "period-end-time": new Date(Date.now() - 10000).toISOString(), // Past date
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

    expect(result).toEqual([
      {
        uuid: "uuid1",
        mountName: "testMount",
        localId: "localId1",
        filteredEntries: [
          {
            "granularity-period": "ethernet-container-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "period-end-time": expect.any(String),
          },
        ],
      },
    ]);
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

    expect(result).toEqual([]);
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

    expect(result).toEqual([
      {
        uuid: "uuid1",
        mountName: "testMount",
        localId: "localId1",
        filteredEntries: [],
      },
    ]);
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

    expect(result).toEqual([]);

    consoleSpy.mockRestore();
  });
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