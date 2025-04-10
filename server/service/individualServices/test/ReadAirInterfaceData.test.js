global.testPrivateFuntions=1;
const rewire = require('rewire');
const ReadAirInterfaceDataRewire = rewire('../ReadAirInterfaceData'); 
const {readAirInterfaceData_private}= require('../ReadAirInterfaceData');
const IndividualServiceUtility = require("../IndividualServiceUtility");
const LtpStructureUtility=require('../LtpStructureUtility');

const getConfiguredModulation = ReadAirInterfaceDataRewire.__get__('getConfiguredModulation');
const formulateAirInterfaceResponseBody = ReadAirInterfaceDataRewire.__get__('formulateAirInterfaceResponseBody');
const {RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache} = require("../ReadAirInterfaceData");
global.testPrivateFuntions=0;

  jest.mock("../IndividualServiceUtility", () => ({
    forwardRequest: jest.fn(),
    getConsequentOperationClientAndFieldParams: jest.fn(),
  }));

  jest.mock('../LtpStructureUtility');
  jest.mock('http-errors');

describe('RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest', () => {
    let mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer;
 
    beforeEach(() => {
        jest.clearAllMocks();
        mountName = "513250007";
        linkId = "513559993";
        ltpStructure = {
            "core-model-1-4:control-construct": [
                {
                    "logical-termination-point": [
                        {
                            uuid: "LTP-ETC-TTP-LAN-1-XG-SFP",
                            "client-ltp": ["LTP-MAC-TTP-LAN-1-XG-SFP"],
                            "server-ltp": ["LTP-MWS-LAN-1-XG-SFP"],
                            "layer-protocol": [
                                {
                                    "local-id": "LP-ETC-TTP-LAN-1-XG-SFP",
                                    "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                                },
                            ],
                        },
                        {
                            uuid: "LTP-ETC-TTP-LAN-2-XG-SFP",
                            "client-ltp": ["LTP-MAC-TTP-LAN-2-XG-SFP"],
                            "server-ltp": ["LTP-MWS-LAN-2-XG-SFP"],
                            "layer-protocol": [
                                {
                                    "local-id": "LP-ETC-TTP-LAN-2-XG-SFP",
                                    "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER"
                                }],
                        },
                        {
                            uuid: "LTP-MWPS-TTP-ODU-B",
                            "client-ltp": ["LTP-MWS-ODU-B"],
                            "layer-protocol": [{ "local-id": "LP-MWPS-TTP-ODU-B", "layer-protocol-name": "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER" }],
                        },
                    ],
                }
            ]
        };
        requestHeaders = { user: "nms5ux", originator: "AccessPlanningToolProxy", xCorrelator: "eEA79D86-0f0E-DDCF-aaAD-336eebb57E77", traceIndicator: "1", customerJourney: "unknown" };
        traceIndicatorIncrementer = 1;
    });
 
    it('should return uuidUnderTest when external-label matches linkId', async () => {
        LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([
            {
                uuid: "LTP-MWPS-TTP-ODU-B",
                "client-ltp": [
                    "LTP-MWS-ODU-B",
                ],
                "layer-protocol": [
                    {
                        "local-id": "LP-MWPS-TTP-ODU-B",
                        "layer-protocol-name": "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
                    },
                ],
            },
        ]
        );
         IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
 
        IndividualServiceUtility.forwardRequest.mockResolvedValue({
            "ltp-augment-1-0:ltp-augment-pac": {
                "external-label": "513559993",
            },
        });
 
        const result = await readAirInterfaceData_private.RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest(
            ltpStructure, mountName, linkId, requestHeaders, traceIndicatorIncrementer
        );
 
        expect(LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure).toHaveBeenCalled();
        expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalled();
        expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalled();

        console.log('result is', result);
 
        expect(result).toEqual({
            uuidUnderTest: 'LTP-MWPS-TTP-ODU-B',
            pathParams: ['513250007', 'LTP-MWPS-TTP-ODU-B', 'LP-MWPS-TTP-ODU-B'],
            externalLabel: '513559993',
            traceIndicatorIncrementer: 2
        });
    });
 
    it('should return empty result when no external-label matches linkId', async () => {
        LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([
            {
                uuid: "LTP-MWPS-TTP-ODU-B",
                "client-ltp": [
                    "LTP-MWS-ODU-B",
                ],
                "layer-protocol": [
                    {
                        "local-id": "LP-MWPS-TTP-ODU-B",
                        "layer-protocol-name": "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
                    },
                ],
            },
        ]);
 
        IndividualServiceUtility.forwardRequest.mockResolvedValue({
            "ltp-augment-1-0:ltp-augment-pac": {
                "external-label": "5135F"
            }
        });
 
        const result = await readAirInterfaceData_private.RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest(
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
                uuid: "LTP-MWPS-TTP-ODU-B",
                "client-ltp": [
                    "LTP-MWS-ODU-B",
                ],
                "layer-protocol": [
                    {
                        "local-id": "LP-MWPS-TTP-ODU-B",
                        "layer-protocol-name": "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
                    },
                ],
            },
            {
                uuid: "LTP-MWPS-TTP-ODU-A",
                "client-ltp": [
                    "LTP-MWS-ODU-A",
                ],
                "layer-protocol": [
                    {
                        "local-id": "LP-MWPS-TTP-ODU-A",
                        "layer-protocol-name": "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
                    },
                ],
            }
        ]);
 
        IndividualServiceUtility.forwardRequest.mockImplementation(() => {
            throw new Error("Mocked forwardRequest error");
        });
 
        const result = await readAirInterfaceData_private.RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest(
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

describe("RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache", () => {
  let pathParams, requestHeaders, traceIndicatorIncrementer;

beforeEach(() => {
  jest.clearAllMocks();
  pathParams =  ['513250007', 'LTP-MWPS-TTP-ODU-B', 'LP-MWPS-TTP-ODU-B'];
  requestHeaders = {
      user: "nms5ux",
      originator: "AccessPlanningToolProxy",
      xCorrelator: "e2c217A2-3B6D-Efcc-83Df-EEd28b1b4736",
      traceIndicator: "1",
      customerJourney: "unknown",
    };
  traceIndicatorIncrementer = 5;
});

test("should return valid air interface configuration when response is not empty", async () => {
 
  IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});

  const mockResponse = {'air-interface-2-0:air-interface-configuration':
      {
      'rx-frequency': '-1',
      "transmitted-radio-signal-id": {
        "alphanumeric-radio-signal-id": "Not yet defined.",
        "numeric-radio-signal-id": 193,
      },
      "auto-freq-select-range": -1,
      "modulation-is-on": true,
      "performance-monitoring-is-on": true,
      "mimo-is-on": false,
      "atpc-is-on": false,
      "loop-back-kind-on": "air-interface-2-0:LOOP_BACK_TYPE_NONE",
      "expected-radio-signal-id": {
        "alphanumeric-radio-signal-id": "Not yet defined.",
        "numeric-radio-signal-id": -1,
      },
      "remote-air-interface-name": "",
      "air-interface-name": "Radio-1",
      "transmission-mode-min": "56002",
      "tx-power": 23,
      "acm-threshold-cross-alarm-list": [
        {
          "acm-threshold-cross-alarm-definition-number": 5,
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
          "transmission-mode": "56005",
          "seconds-for-raising-alarm": -1,
          "seconds-for-clearing-alarm": -1,
        },
        {
          "acm-threshold-cross-alarm-definition-number": 13,
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
          "transmission-mode": "56013",
          "seconds-for-raising-alarm": -1,
          "seconds-for-clearing-alarm": -1,
        }
        ], 
      "atpc-thresh-upper": -40,
      "maintenance-timer": 350,
      "duplex-distance": 1010000,
      "auto-freq-select-is-on": false,
      "cryptographic-key": "Cryptographic key not yet defined.",
      "transmitter-is-on": true,
      "adaptive-modulation-is-on": false,
      "encryption-is-on": false,
      "tx-frequency": 18460000,
      "transmission-mode-max": "56002",
      "g-826-threshold-cross-alarm-list": [
        {
          "g-826-value-kind": "air-interface-2-0:G_826_TYPE_ES",
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
          "alarm-raising-threshold": 0,
          "alarm-clearing-threshold": -1,
        },
        {
          "g-826-value-kind": "air-interface-2-0:G_826_TYPE_ES",
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
          "alarm-raising-threshold": 0,
          "alarm-clearing-threshold": -1,
        }
      ],
      "xlts-threshold-cross-alarm-list": [
        {
          "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
          "xlts-threshold-cross-alarm-definition-number": 5,
          "amount-of-seconds": 0,
          "xlts-level": -80,
        },
        {
          "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
          "xlts-threshold-cross-alarm-definition-number": 4,
          "amount-of-seconds": 0,
          "xlts-level": -70,
        }
        
      ],
      "atpc-thresh-lower": -60,
      "xpic-is-on": true,
      "power-is-on": true,
      "atpc-tx-power-min": -7,
      "alic-is-on": false,
      "receiver-is-on": true,
    }};
  IndividualServiceUtility.forwardRequest.mockResolvedValue(mockResponse);

  const result = await RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(
    pathParams,
    requestHeaders,
    traceIndicatorIncrementer
  );

  const expectedResult = {
      'rx-frequency': '-1',
      'transmitted-radio-signal-id': {
        'alphanumeric-radio-signal-id': 'Not yet defined.',
        'numeric-radio-signal-id': 193
      },
      'auto-freq-select-range': -1,
      'modulation-is-on': true,
      'performance-monitoring-is-on': true,
      'mimo-is-on': false,
      'atpc-is-on': false,
      'loop-back-kind-on': 'air-interface-2-0:LOOP_BACK_TYPE_NONE',
      'expected-radio-signal-id': {
        'alphanumeric-radio-signal-id': 'Not yet defined.',
        'numeric-radio-signal-id': -1
      },
      'remote-air-interface-name': '',
      'air-interface-name': 'Radio-1',
      'transmission-mode-min': '56002',
      'tx-power': 23,
     "acm-threshold-cross-alarm-list": [
        {
          "acm-threshold-cross-alarm-definition-number": 5,
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
          "transmission-mode": "56005",
          "seconds-for-raising-alarm": -1,
          "seconds-for-clearing-alarm": -1,
        },
        {
          "acm-threshold-cross-alarm-definition-number": 13,
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
          "transmission-mode": "56013",
          "seconds-for-raising-alarm": -1,
          "seconds-for-clearing-alarm": -1,
        }
        ],
      'atpc-thresh-upper': -40,
      'maintenance-timer': 350,
      'duplex-distance': 1010000,
      'auto-freq-select-is-on': false,
      'cryptographic-key': 'Cryptographic key not yet defined.',
      'transmitter-is-on': true,
      'adaptive-modulation-is-on': false,
      'encryption-is-on': false,
      'tx-frequency': 18460000,
      'transmission-mode-max': '56002',
      "g-826-threshold-cross-alarm-list": [
        {
          "g-826-value-kind": "air-interface-2-0:G_826_TYPE_ES",
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
          "alarm-raising-threshold": 0,
          "alarm-clearing-threshold": -1,
        },
        {
          "g-826-value-kind": "air-interface-2-0:G_826_TYPE_ES",
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
          "alarm-raising-threshold": 0,
          "alarm-clearing-threshold": -1,
        }
      ],
    
      "xlts-threshold-cross-alarm-list": [
        {
          "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
          "xlts-threshold-cross-alarm-definition-number": 5,
          "amount-of-seconds": 0,
          "xlts-level": -80,
        },
        {
          "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
          "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
          "xlts-threshold-cross-alarm-definition-number": 4,
          "amount-of-seconds": 0,
          "xlts-level": -70,
        }
        
      ],
      'atpc-thresh-lower': -60,
      'xpic-is-on': true,
      'power-is-on': true,
      'atpc-tx-power-min': -7,
      'alic-is-on': false,
      'receiver-is-on': true,
      traceIndicatorIncrementer: 6
    }

  expect(result).toEqual(expectedResult);
});

test("should return an empty object when response is empty", async () => {

  IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
  IndividualServiceUtility.forwardRequest.mockResolvedValue({}); // Empty response

  const result = await RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(
    pathParams,
    requestHeaders,
    traceIndicatorIncrementer
  );

  expect(result).toEqual({
    traceIndicatorIncrementer: 6,
  });

  expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(1);
});

test("should handle errors and return an empty object", async () => {
  IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
  IndividualServiceUtility.forwardRequest.mockRejectedValue(new Error("Network error"));

  const result = await RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(
    pathParams,
    requestHeaders,
    traceIndicatorIncrementer
  );

  expect(result).toEqual({
    traceIndicatorIncrementer: 6,
  });

  expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(1);
});

});

describe('RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache', () => {

  const pathParams =['513250007', 'LTP-MWPS-TTP-ODU-B', 'LP-MWPS-TTP-ODU-B'];

  const requestHeaders = {
    user: "nms5ux",
    originator: "AccessPlanningToolProxy",
    xCorrelator: "eEA79D86-0f0E-DDCF-aaAD-336eebb57E77",
    traceIndicator: "1",
    customerJourney: "unknown",
  }

  const traceIndicatorIncrementer = 1;
  beforeEach(() => {

    jest.clearAllMocks();

  });
 
  it('should return airInterfaceCapability when data is found', async () => {

    // Mocking the necessary methods

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});

    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      "air-interface-2-0:air-interface-capability": {
        "adaptive-modulation-is-avail": true,
        "duplex-distance-list": [
          1010000,
          1008000,
        ],
        "supported-radio-signal-id-datatype": "air-interface-2-0:RADIO_SIGNAL_ID_DATATYPE_TYPE_INTEGER",
        "rx-frequency-max": 19701500,
        "transmission-mode-list": [
          {
            "transmission-mode-name": "112013",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -52,
            "am-downshift-level": -49,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 112013,
            "am-upshift-level": -47,
            "modulation-scheme-name-at-lct": "2048QAM",
            "modulation-scheme": 2048,
            "code-rate": 88,
          },
          {
            "transmission-mode-name": "112012",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -54,
            "am-downshift-level": -51,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 112012,
            "am-upshift-level": -50,
            "modulation-scheme-name-at-lct": "1024QAM",
            "modulation-scheme": 1024,
            "code-rate": 92,
          },
        ],
        "direction-of-acm-performance-values": "air-interface-2-0:DIRECTION_TYPE_TX",
        "supported-loop-back-kind-list": [
          "air-interface-2-0:LOOP_BACK_TYPE_IF_TO_LOCAL",
          "air-interface-2-0:LOOP_BACK_TYPE_RF_TO_LOCAL",
        ],
        "clearing-threshold-cross-alarms-is-avail": false,
        "duplex-distance-is-freely-configurable": false,
        "tx-frequency-max": 18691500,
        "maintenance-timer-range": "0-172800",
        "acm-threshold-cross-alarms-is-avail": false,
        "expected-equals-transmitted-radio-signal-id": true,
        "atpc-is-avail": true,
        "encryption-is-avail": false,
        "type-of-equipment": "AGS-20",
        "receiver-on-off-is-avail": false,
        "atpc-range": 0,
        "supported-radio-signal-id-length": 255,
        "performance-monitoring-is-avail": true,
        "auto-freq-select-is-avail": false,
        "rx-frequency-min": 19341500,
        "tx-frequency-min": 18331500,
      },
    });
    const result = await readAirInterfaceData_private.RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(
      pathParams, requestHeaders, traceIndicatorIncrementer);

    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalled();

    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledWith({}, pathParams, requestHeaders, traceIndicatorIncrementer);
 
    expect(result).toEqual({
      
        "adaptive-modulation-is-avail": true,
        "duplex-distance-list": [
          1010000,
          1008000,
        ],
        "supported-radio-signal-id-datatype": "air-interface-2-0:RADIO_SIGNAL_ID_DATATYPE_TYPE_INTEGER",
        "rx-frequency-max": 19701500,
        "transmission-mode-list": [
          {
            "transmission-mode-name": "112013",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -52,
            "am-downshift-level": -49,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 112013,
            "am-upshift-level": -47,
            "modulation-scheme-name-at-lct": "2048QAM",
            "modulation-scheme": 2048,
            "code-rate": 88,
          },
          {
            "transmission-mode-name": "112012",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -54,
            "am-downshift-level": -51,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 112012,
            "am-upshift-level": -50,
            "modulation-scheme-name-at-lct": "1024QAM",
            "modulation-scheme": 1024,
            "code-rate": 92,
          },
        ],
        "direction-of-acm-performance-values": "air-interface-2-0:DIRECTION_TYPE_TX",
        "supported-loop-back-kind-list": [
          "air-interface-2-0:LOOP_BACK_TYPE_IF_TO_LOCAL",
          "air-interface-2-0:LOOP_BACK_TYPE_RF_TO_LOCAL",
        ],
        "clearing-threshold-cross-alarms-is-avail": false,
        "duplex-distance-is-freely-configurable": false,
        "tx-frequency-max": 18691500,
        "maintenance-timer-range": "0-172800",
        "acm-threshold-cross-alarms-is-avail": false,
        "expected-equals-transmitted-radio-signal-id": true,
        "atpc-is-avail": true,
        "encryption-is-avail": false,
        "type-of-equipment": "AGS-20",
        "receiver-on-off-is-avail": false,
        "atpc-range": 0,
        "supported-radio-signal-id-length": 255,
        "traceIndicatorIncrementer": 2,
        "performance-monitoring-is-avail": true,
        "auto-freq-select-is-avail": false,
        "rx-frequency-min": 19341500,
        "tx-frequency-min": 18331500,
      
    });

  });
 
  it('should return empty object if no capability data is found', async () => {
    // Mocking the necessary methods to return empty response
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});

    IndividualServiceUtility.forwardRequest.mockResolvedValue({});
 
    const result = await readAirInterfaceData_private.RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(

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
 
    const result = await readAirInterfaceData_private.RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(

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
 
    const result = await readAirInterfaceData_private.RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(

      pathParams, requestHeaders, traceIndicatorIncrementer

    );
 
    expect(result).toEqual({

      traceIndicatorIncrementer: 1

    });

  });


});

describe('RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive', () => {
  let pathParams, requestHeaders, traceIndicatorIncrementer;

  beforeEach(() => {
    pathParams = ['513250007', 'LTP-MWPS-TTP-ODU-B', 'LP-MWPS-TTP-ODU-B'];
    requestHeaders = { user: "nms5ux", originator: "AccessPlanningToolProxy", xCorrelator: "eEA79D86-0f0E-DDCF-aaAD-336eebb57E77", traceIndicator: "1", customerJourney: "unknown" };
    traceIndicatorIncrementer = 1;
  });

  it('should return air interface status when response is valid', async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      "air-interface-2-0:air-interface-status":{
      "snir-cur": 40,
      "tx-frequency-cur": 18460000,
      "xpd-cur": 99,
      "tx-level-cur": 23,
      "transmission-mode-cur": "56002",
      "rx-level-cur": -50,
      "rx-frequency-cur": 19470000,
      }
    });

    const result = await readAirInterfaceData_private.RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive(
      pathParams, requestHeaders, traceIndicatorIncrementer
    );

    expect(result).toEqual({
      "snir-cur": 40,
      "tx-frequency-cur": 18460000,
      "xpd-cur": 99,
      "tx-level-cur": 23,
      "transmission-mode-cur": "56002",
      "rx-level-cur": -50,
      "rx-frequency-cur": 19470000,
      traceIndicatorIncrementer: 2,
    });
  });

  it('should return an empty object if response is empty', async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue({});

    const result = await readAirInterfaceData_private.RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive(
      pathParams, requestHeaders, traceIndicatorIncrementer
    );

    expect(result).toEqual({ traceIndicatorIncrementer: 2 });
  });

  it('should handle errors and return an empty object', async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValue(new Error('Mocked error'));

    const result = await readAirInterfaceData_private.RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive(
      pathParams, requestHeaders, traceIndicatorIncrementer
    );

    expect(result).toEqual({ traceIndicatorIncrementer: 1 });
  });
});

describe('formulateAirInterfaceResponseBody', () => {

  test('should return correctly mapped response body', async () => {
   
      const airInterfaceEndPointName = "513559993";
      const airInterfaceConfiguration = {
        "rx-frequency": -1,
        "transmitted-radio-signal-id": {
          "alphanumeric-radio-signal-id": "Not yet defined.",
          "numeric-radio-signal-id": 193,
        },
        "auto-freq-select-range": -1,
        "modulation-is-on": true,
        "performance-monitoring-is-on": true,
        "mimo-is-on": false,
        "atpc-is-on": false,
        "loop-back-kind-on": "air-interface-2-0:LOOP_BACK_TYPE_NONE",
        "expected-radio-signal-id": {
          "alphanumeric-radio-signal-id": "Not yet defined.",
          "numeric-radio-signal-id": -1,
        },
        "remote-air-interface-name": "",
        "air-interface-name": "Radio-1",
        "transmission-mode-min": "56002",
        "tx-power": 23,
        "acm-threshold-cross-alarm-list": [
          {
            "acm-threshold-cross-alarm-definition-number": 5,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56005",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 13,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56013",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 6,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56006",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 12,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56012",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 7,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56007",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 8,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56008",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 14,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56014",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 9,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56009",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 9,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56009",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 8,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56008",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 10,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56010",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 11,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56011",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 11,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56011",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 10,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56010",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 12,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56012",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 1,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56001",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 2,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56002",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 3,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56003",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 4,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56004",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 5,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56005",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 13,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56013",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 4,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56004",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 14,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "transmission-mode": "56014",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 7,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56007",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 6,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56006",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 1,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56001",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 3,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56003",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
          {
            "acm-threshold-cross-alarm-definition-number": 2,
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "transmission-mode": "56002",
            "seconds-for-raising-alarm": -1,
            "seconds-for-clearing-alarm": -1,
          },
        ],
        "atpc-thresh-upper": -40,
        "maintenance-timer": 350,
        "duplex-distance": 1010000,
        "auto-freq-select-is-on": false,
        "cryptographic-key": "Cryptographic key not yet defined.",
        "transmitter-is-on": true,
        "adaptive-modulation-is-on": false,
        "encryption-is-on": false,
        "tx-frequency": 18460000,
        "transmission-mode-max": "56002",
        "g-826-threshold-cross-alarm-list": [
          {
            "g-826-value-kind": "air-interface-2-0:G_826_TYPE_ES",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "alarm-raising-threshold": 0,
            "alarm-clearing-threshold": -1,
          },
          {
            "g-826-value-kind": "air-interface-2-0:G_826_TYPE_ES",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "alarm-raising-threshold": 0,
            "alarm-clearing-threshold": -1,
          },
          {
            "g-826-value-kind": "air-interface-2-0:G_826_TYPE_CSES",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "alarm-raising-threshold": 0,
            "alarm-clearing-threshold": -1,
          },
          {
            "g-826-value-kind": "air-interface-2-0:G_826_TYPE_SES",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "alarm-raising-threshold": 0,
            "alarm-clearing-threshold": -1,
          },
          {
            "g-826-value-kind": "air-interface-2-0:G_826_TYPE_CSES",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "alarm-raising-threshold": 0,
            "alarm-clearing-threshold": -1,
          },
          {
            "g-826-value-kind": "air-interface-2-0:G_826_TYPE_SES",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "alarm-raising-threshold": 0,
            "alarm-clearing-threshold": -1,
          },
        ],
        "xlts-threshold-cross-alarm-list": [
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "xlts-threshold-cross-alarm-definition-number": 5,
            "amount-of-seconds": 0,
            "xlts-level": -80,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "xlts-threshold-cross-alarm-definition-number": 4,
            "amount-of-seconds": 0,
            "xlts-level": -70,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_TLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "xlts-threshold-cross-alarm-definition-number": 1,
            "amount-of-seconds": 0,
            "xlts-level": 13,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_TLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "xlts-threshold-cross-alarm-definition-number": 2,
            "amount-of-seconds": 0,
            "xlts-level": 15,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "xlts-threshold-cross-alarm-definition-number": 1,
            "amount-of-seconds": 0,
            "xlts-level": -40,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_TLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "xlts-threshold-cross-alarm-definition-number": 3,
            "amount-of-seconds": 0,
            "xlts-level": 17,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "xlts-threshold-cross-alarm-definition-number": 2,
            "amount-of-seconds": 0,
            "xlts-level": -50,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_TLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "xlts-threshold-cross-alarm-definition-number": 4,
            "amount-of-seconds": 0,
            "xlts-level": 19,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "xlts-threshold-cross-alarm-definition-number": 3,
            "amount-of-seconds": 0,
            "xlts-level": -60,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "xlts-threshold-cross-alarm-definition-number": 4,
            "amount-of-seconds": 0,
            "xlts-level": -70,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
            "xlts-threshold-cross-alarm-definition-number": 5,
            "amount-of-seconds": 0,
            "xlts-level": -80,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_TLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "xlts-threshold-cross-alarm-definition-number": 2,
            "amount-of-seconds": 0,
            "xlts-level": 15,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_TLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "xlts-threshold-cross-alarm-definition-number": 3,
            "amount-of-seconds": 0,
            "xlts-level": 17,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_TLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "xlts-threshold-cross-alarm-definition-number": 4,
            "amount-of-seconds": 0,
            "xlts-level": 19,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "xlts-threshold-cross-alarm-definition-number": 3,
            "amount-of-seconds": 0,
            "xlts-level": -60,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "xlts-threshold-cross-alarm-definition-number": 2,
            "amount-of-seconds": 0,
            "xlts-level": -50,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_RLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "xlts-threshold-cross-alarm-definition-number": 1,
            "amount-of-seconds": 0,
            "xlts-level": -40,
          },
          {
            "level-threshold-second-kind": "air-interface-2-0:XLEVEL_THRESHOLD_SECOND_KIND_TYPE_TLTS",
            "granularity-period": "air-interface-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-24-HOURS",
            "xlts-threshold-cross-alarm-definition-number": 1,
            "amount-of-seconds": 0,
            "xlts-level": 13,
          },
        ],
        "atpc-thresh-lower": -60,
        "xpic-is-on": true,
        "power-is-on": true,
        "atpc-tx-power-min": -7,
        "alic-is-on": false,
        "receiver-is-on": true,
        traceIndicatorIncrementer: 4,
      };
      const airInterfaceStatus = {
        "snir-cur": 40,
        "tx-frequency-cur": 18460000,
        "xpd-cur": 99,
        "tx-level-cur": 23,
        "transmission-mode-cur": "56002",
        "rx-level-cur": -50,
        "rx-frequency-cur": 19470000,
        traceIndicatorIncrementer: 6,
      }
    ;
      const airInterfaceCapability = {
        "adaptive-modulation-is-avail": true,
        "duplex-distance-list": [
          1010000,
          1008000,
        ],
        "supported-radio-signal-id-datatype": "air-interface-2-0:RADIO_SIGNAL_ID_DATATYPE_TYPE_INTEGER",
        "rx-frequency-max": 19701500,
        "transmission-mode-list": [
          {
            "transmission-mode-name": "112013",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -52,
            "am-downshift-level": -49,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 112013,
            "am-upshift-level": -47,
            "modulation-scheme-name-at-lct": "2048QAM",
            "modulation-scheme": 2048,
            "code-rate": 88,
          },
          {
            "transmission-mode-name": "112012",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -54,
            "am-downshift-level": -51,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 112012,
            "am-upshift-level": -50,
            "modulation-scheme-name-at-lct": "1024QAM",
            "modulation-scheme": 1024,
            "code-rate": 92,
          },
          {
            "transmission-mode-name": "112014",
            "tx-power-max": 16,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -49,
            "am-downshift-level": -46,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": false,
            "tx-power-min": -4,
            "transmission-mode-rank": 112014,
            "am-upshift-level": -45,
            "modulation-scheme-name-at-lct": "4096QAM",
            "modulation-scheme": 4096,
            "code-rate": 88,
          },
          {
            "transmission-mode-name": "112011",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -54,
            "am-downshift-level": -51,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 112011,
            "am-upshift-level": -50,
            "modulation-scheme-name-at-lct": "1024QAMStrong",
            "modulation-scheme": 1024,
            "code-rate": 92,
          },
          {
            "transmission-mode-name": "112010",
            "tx-power-max": 18,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -58,
            "am-downshift-level": -55,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 112010,
            "am-upshift-level": -53,
            "modulation-scheme-name-at-lct": "512QAM",
            "modulation-scheme": 512,
            "code-rate": 91,
          },
          {
            "transmission-mode-name": "56006",
            "tx-power-max": 19,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -70,
            "am-downshift-level": -66,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "tx-power-min": -5,
            "transmission-mode-rank": 56006,
            "am-upshift-level": -64,
            "modulation-scheme-name-at-lct": "64QAM",
            "modulation-scheme": 64,
            "code-rate": 90,
          },
          {
            "transmission-mode-name": "14010",
            "tx-power-max": 18,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -66,
            "am-downshift-level": -63,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 14000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 14010,
            "am-upshift-level": -61,
            "modulation-scheme-name-at-lct": "512QAM",
            "modulation-scheme": 512,
            "code-rate": 89,
          },
          {
            "transmission-mode-name": "56007",
            "tx-power-max": 19,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -67,
            "am-downshift-level": -64,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "tx-power-min": -5,
            "transmission-mode-rank": 56007,
            "am-upshift-level": -62,
            "modulation-scheme-name-at-lct": "128QAM",
            "modulation-scheme": 128,
            "code-rate": 91,
          },
          {
            "transmission-mode-name": "14011",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -63,
            "am-downshift-level": -60,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 14000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 14011,
            "am-upshift-level": -58,
            "modulation-scheme-name-at-lct": "1024QAMStrong",
            "modulation-scheme": 1024,
            "code-rate": 89,
          },
          {
            "transmission-mode-name": "56004",
            "tx-power-max": 21,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -76,
            "am-downshift-level": -71,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "tx-power-min": -6,
            "transmission-mode-rank": 56004,
            "am-upshift-level": -69,
            "modulation-scheme-name-at-lct": "16QAM",
            "modulation-scheme": 16,
            "code-rate": 85,
          },
          {
            "transmission-mode-name": "14012",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -63,
            "am-downshift-level": -60,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 14000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 14012,
            "am-upshift-level": -58,
            "modulation-scheme-name-at-lct": "1024QAM",
            "modulation-scheme": 1024,
            "code-rate": 89,
          },
          {
            "transmission-mode-name": "56005",
            "tx-power-max": 21,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -73,
            "am-downshift-level": -69,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "tx-power-min": -6,
            "transmission-mode-rank": 56005,
            "am-upshift-level": -67,
            "modulation-scheme-name-at-lct": "32QAM",
            "modulation-scheme": 32,
            "code-rate": 85,
          },
          {
            "transmission-mode-name": "14013",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -61,
            "am-downshift-level": -58,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 14000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 14013,
            "am-upshift-level": -57,
            "modulation-scheme-name-at-lct": "2048QAM",
            "modulation-scheme": 2048,
            "code-rate": 83,
          },
          {
            "transmission-mode-name": "56008",
            "tx-power-max": 18,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -64,
            "am-downshift-level": -61,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 56008,
            "am-upshift-level": -59,
            "modulation-scheme-name-at-lct": "256QAM",
            "modulation-scheme": 256,
            "code-rate": 92,
          },
          {
            "transmission-mode-name": "56009",
            "tx-power-max": 18,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -61,
            "am-downshift-level": -58,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 56009,
            "am-upshift-level": -56,
            "modulation-scheme-name-at-lct": "512QAMStrong",
            "modulation-scheme": 512,
            "code-rate": 91,
          },
          {
            "transmission-mode-name": "14006",
            "tx-power-max": 19,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -75,
            "am-downshift-level": -71,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 14000,
            "xpic-is-avail": true,
            "tx-power-min": -5,
            "transmission-mode-rank": 14006,
            "am-upshift-level": -69,
            "modulation-scheme-name-at-lct": "64QAM",
            "modulation-scheme": 64,
            "code-rate": 88,
          },
          {
            "transmission-mode-name": "14007",
            "tx-power-max": 19,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -72,
            "am-downshift-level": -68,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 14000,
            "xpic-is-avail": true,
            "tx-power-min": -5,
            "transmission-mode-rank": 14007,
            "am-upshift-level": -66,
            "modulation-scheme-name-at-lct": "128QAM",
            "modulation-scheme": 128,
            "code-rate": 89,
          },
          {
            "transmission-mode-name": "56010",
            "tx-power-max": 18,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -61,
            "am-downshift-level": -58,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 56010,
            "am-upshift-level": -56,
            "modulation-scheme-name-at-lct": "512QAM",
            "modulation-scheme": 512,
            "code-rate": 91,
          },
          {
            "transmission-mode-name": "14008",
            "tx-power-max": 18,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -69,
            "am-downshift-level": -66,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 14000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 14008,
            "am-upshift-level": -64,
            "modulation-scheme-name-at-lct": "256QAM",
            "modulation-scheme": 256,
            "code-rate": 90,
          },
          {
            "transmission-mode-name": "14009",
            "tx-power-max": 18,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -66,
            "am-downshift-level": -63,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 14000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 14009,
            "am-upshift-level": -61,
            "modulation-scheme-name-at-lct": "512QAMStrong",
            "modulation-scheme": 512,
            "code-rate": 89,
          },
          {
            "transmission-mode-name": "56013",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -56,
            "am-downshift-level": -53,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 56013,
            "am-upshift-level": -52,
            "modulation-scheme-name-at-lct": "2048QAM",
            "modulation-scheme": 2048,
            "code-rate": 88,
          },
          {
            "transmission-mode-name": "56014",
            "tx-power-max": 16,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -52,
            "am-downshift-level": -49,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 56000,
            "xpic-is-avail": false,
            "tx-power-min": -4,
            "transmission-mode-rank": 56014,
            "am-upshift-level": -48,
            "modulation-scheme-name-at-lct": "4096QAM",
            "modulation-scheme": 4096,
            "code-rate": 89,
          },
          {
            "transmission-mode-name": "56011",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -58,
            "am-downshift-level": -55,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 56011,
            "am-upshift-level": -53,
            "modulation-scheme-name-at-lct": "1024QAMStrong",
            "modulation-scheme": 1024,
            "code-rate": 92,
          },
          {
            "transmission-mode-name": "56012",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -58,
            "am-downshift-level": -55,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 56012,
            "am-upshift-level": -53,
            "modulation-scheme-name-at-lct": "1024QAM",
            "modulation-scheme": 1024,
            "code-rate": 92,
          },
          {
            "transmission-mode-name": "28001",
            "tx-power-max": 23,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -86,
            "am-downshift-level": -86,
            "supported-as-fixed-configuration": false,
            "channel-bandwidth": 28000,
            "xpic-is-avail": true,
            "tx-power-min": -7,
            "transmission-mode-rank": 28001,
            "am-upshift-level": -86,
            "modulation-scheme-name-at-lct": "4QAMStrong",
            "modulation-scheme": 4,
            "code-rate": 76,
          },
          {
            "transmission-mode-name": "28002",
            "tx-power-max": 23,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -84,
            "am-downshift-level": -79,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 28000,
            "xpic-is-avail": true,
            "tx-power-min": -7,
            "transmission-mode-rank": 28002,
            "am-upshift-level": -77,
            "modulation-scheme-name-at-lct": "4QAM",
            "modulation-scheme": 4,
            "code-rate": 88,
          },
          {
            "transmission-mode-name": "28003",
            "tx-power-max": 21,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -80,
            "am-downshift-level": -76,
            "supported-as-fixed-configuration": false,
            "channel-bandwidth": 28000,
            "xpic-is-avail": true,
            "tx-power-min": -6,
            "transmission-mode-rank": 28003,
            "am-upshift-level": -74,
            "modulation-scheme-name-at-lct": "16QAMStrong",
            "modulation-scheme": 16,
            "code-rate": 75,
          },
          {
            "transmission-mode-name": "28004",
            "tx-power-max": 21,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -79,
            "am-downshift-level": -74,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 28000,
            "xpic-is-avail": true,
            "tx-power-min": -6,
            "transmission-mode-rank": 28004,
            "am-upshift-level": -72,
            "modulation-scheme-name-at-lct": "16QAM",
            "modulation-scheme": 16,
            "code-rate": 86,
          },
          {
            "transmission-mode-name": "28005",
            "tx-power-max": 21,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -75,
            "am-downshift-level": -71,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 28000,
            "xpic-is-avail": true,
            "tx-power-min": -6,
            "transmission-mode-rank": 28005,
            "am-upshift-level": -69,
            "modulation-scheme-name-at-lct": "32QAM",
            "modulation-scheme": 32,
            "code-rate": 86,
          },
          {
            "transmission-mode-name": "28006",
            "tx-power-max": 19,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -72,
            "am-downshift-level": -68,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 28000,
            "xpic-is-avail": true,
            "tx-power-min": -5,
            "transmission-mode-rank": 28006,
            "am-upshift-level": -66,
            "modulation-scheme-name-at-lct": "64QAM",
            "modulation-scheme": 64,
            "code-rate": 90,
          },
          {
            "transmission-mode-name": "28007",
            "tx-power-max": 19,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -69,
            "am-downshift-level": -66,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 28000,
            "xpic-is-avail": true,
            "tx-power-min": -5,
            "transmission-mode-rank": 28007,
            "am-upshift-level": -64,
            "modulation-scheme-name-at-lct": "128QAM",
            "modulation-scheme": 128,
            "code-rate": 92,
          },
          {
            "transmission-mode-name": "28008",
            "tx-power-max": 18,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -66,
            "am-downshift-level": -63,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 28000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 28008,
            "am-upshift-level": -61,
            "modulation-scheme-name-at-lct": "256QAM",
            "modulation-scheme": 256,
            "code-rate": 93,
          },
          {
            "transmission-mode-name": "28009",
            "tx-power-max": 18,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -63,
            "am-downshift-level": -60,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 28000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 28009,
            "am-upshift-level": -58,
            "modulation-scheme-name-at-lct": "512QAMStrong",
            "modulation-scheme": 512,
            "code-rate": 92,
          },
          {
            "transmission-mode-name": "14001",
            "tx-power-max": 23,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -89,
            "am-downshift-level": -89,
            "supported-as-fixed-configuration": false,
            "channel-bandwidth": 14000,
            "xpic-is-avail": true,
            "tx-power-min": -7,
            "transmission-mode-rank": 14001,
            "am-upshift-level": -89,
            "modulation-scheme-name-at-lct": "4QAMStrong",
            "modulation-scheme": 4,
            "code-rate": 75,
          },
          {
            "transmission-mode-name": "14002",
            "tx-power-max": 23,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -87,
            "am-downshift-level": -82,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 14000,
            "xpic-is-avail": true,
            "tx-power-min": -7,
            "transmission-mode-rank": 14002,
            "am-upshift-level": -80,
            "modulation-scheme-name-at-lct": "4QAM",
            "modulation-scheme": 4,
            "code-rate": 86,
          },
          {
            "transmission-mode-name": "14003",
            "tx-power-max": 21,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -83,
            "am-downshift-level": -79,
            "supported-as-fixed-configuration": false,
            "channel-bandwidth": 14000,
            "xpic-is-avail": true,
            "tx-power-min": -6,
            "transmission-mode-rank": 14003,
            "am-upshift-level": -77,
            "modulation-scheme-name-at-lct": "16QAMStrong",
            "modulation-scheme": 16,
            "code-rate": 74,
          },
          {
            "transmission-mode-name": "14004",
            "tx-power-max": 21,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -81,
            "am-downshift-level": -76,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 14000,
            "xpic-is-avail": true,
            "tx-power-min": -6,
            "transmission-mode-rank": 14004,
            "am-upshift-level": -74,
            "modulation-scheme-name-at-lct": "16QAM",
            "modulation-scheme": 16,
            "code-rate": 88,
          },
          {
            "transmission-mode-name": "14005",
            "tx-power-max": 21,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -78,
            "am-downshift-level": -74,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 14000,
            "xpic-is-avail": true,
            "tx-power-min": -6,
            "transmission-mode-rank": 14005,
            "am-upshift-level": -72,
            "modulation-scheme-name-at-lct": "32QAM",
            "modulation-scheme": 32,
            "code-rate": 84,
          },
          {
            "transmission-mode-name": "56002",
            "tx-power-max": 23,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -82,
            "am-downshift-level": -77,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "tx-power-min": -7,
            "transmission-mode-rank": 56002,
            "am-upshift-level": -75,
            "modulation-scheme-name-at-lct": "4QAM",
            "modulation-scheme": 4,
            "code-rate": 87,
          },
          {
            "transmission-mode-name": "56003",
            "tx-power-max": 21,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -77,
            "am-downshift-level": -73,
            "supported-as-fixed-configuration": false,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "tx-power-min": -6,
            "transmission-mode-rank": 56003,
            "am-upshift-level": -71,
            "modulation-scheme-name-at-lct": "16QAMStrong",
            "modulation-scheme": 16,
            "code-rate": 74,
          },
          {
            "transmission-mode-name": "28010",
            "tx-power-max": 18,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -63,
            "am-downshift-level": -60,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 28000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 28010,
            "am-upshift-level": -58,
            "modulation-scheme-name-at-lct": "512QAM",
            "modulation-scheme": 512,
            "code-rate": 92,
          },
          {
            "transmission-mode-name": "28011",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -60,
            "am-downshift-level": -57,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 28000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 28011,
            "am-upshift-level": -55,
            "modulation-scheme-name-at-lct": "1024QAMStrong",
            "modulation-scheme": 1024,
            "code-rate": 92,
          },
          {
            "transmission-mode-name": "56001",
            "tx-power-max": 23,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -83,
            "am-downshift-level": -83,
            "supported-as-fixed-configuration": false,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "tx-power-min": -7,
            "transmission-mode-rank": 56001,
            "am-upshift-level": -83,
            "modulation-scheme-name-at-lct": "4QAMStrong",
            "modulation-scheme": 4,
            "code-rate": 74,
          },
          {
            "transmission-mode-name": "28012",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -60,
            "am-downshift-level": -57,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 28000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 28012,
            "am-upshift-level": -55,
            "modulation-scheme-name-at-lct": "1024QAM",
            "modulation-scheme": 1024,
            "code-rate": 92,
          },
          {
            "transmission-mode-name": "28013",
            "tx-power-max": 17,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -58,
            "am-downshift-level": -55,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 28000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 28013,
            "am-upshift-level": -54,
            "modulation-scheme-name-at-lct": "2048QAM",
            "modulation-scheme": 2048,
            "code-rate": 87,
          },
          {
            "transmission-mode-name": "28014",
            "tx-power-max": 16,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -53,
            "am-downshift-level": -51,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 28000,
            "xpic-is-avail": false,
            "tx-power-min": -4,
            "transmission-mode-rank": 28014,
            "am-upshift-level": -50,
            "modulation-scheme-name-at-lct": "4096QAM",
            "modulation-scheme": 4096,
            "code-rate": 88,
          },
          {
            "transmission-mode-name": "112002",
            "tx-power-max": 23,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -79,
            "am-downshift-level": -74,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -7,
            "transmission-mode-rank": 112002,
            "am-upshift-level": -72,
            "modulation-scheme-name-at-lct": "4QAM",
            "modulation-scheme": 4,
            "code-rate": 86,
          },
          {
            "transmission-mode-name": "112001",
            "tx-power-max": 23,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -80,
            "am-downshift-level": -80,
            "supported-as-fixed-configuration": false,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -7,
            "transmission-mode-rank": 112001,
            "am-upshift-level": -80,
            "modulation-scheme-name-at-lct": "4QAMStrong",
            "modulation-scheme": 4,
            "code-rate": 73,
          },
          {
            "transmission-mode-name": "112004",
            "tx-power-max": 21,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -73,
            "am-downshift-level": -68,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -6,
            "transmission-mode-rank": 112004,
            "am-upshift-level": -66,
            "modulation-scheme-name-at-lct": "16QAM",
            "modulation-scheme": 16,
            "code-rate": 85,
          },
          {
            "transmission-mode-name": "112003",
            "tx-power-max": 21,
            "symbol-rate-reduction-factor": -6,
            "rx-threshold": -74,
            "am-downshift-level": -70,
            "supported-as-fixed-configuration": false,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": 1,
            "transmission-mode-rank": 112003,
            "am-upshift-level": -68,
            "modulation-scheme-name-at-lct": "16QAMStrong",
            "modulation-scheme": 16,
            "code-rate": 73,
          },
          {
            "transmission-mode-name": "112009",
            "tx-power-max": 18,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -58,
            "am-downshift-level": -55,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 112009,
            "am-upshift-level": -53,
            "modulation-scheme-name-at-lct": "512QAMStrong",
            "modulation-scheme": 512,
            "code-rate": 91,
          },
          {
            "transmission-mode-name": "112006",
            "tx-power-max": 19,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -67,
            "am-downshift-level": -63,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -5,
            "transmission-mode-rank": 112006,
            "am-upshift-level": -61,
            "modulation-scheme-name-at-lct": "64QAM",
            "modulation-scheme": 64,
            "code-rate": 90,
          },
          {
            "transmission-mode-name": "112005",
            "tx-power-max": 21,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -70,
            "am-downshift-level": -66,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -6,
            "transmission-mode-rank": 112005,
            "am-upshift-level": -64,
            "modulation-scheme-name-at-lct": "32QAM",
            "modulation-scheme": 32,
            "code-rate": 85,
          },
          {
            "transmission-mode-name": "112008",
            "tx-power-max": 18,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -61,
            "am-downshift-level": -58,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -4,
            "transmission-mode-rank": 112008,
            "am-upshift-level": -56,
            "modulation-scheme-name-at-lct": "256QAM",
            "modulation-scheme": 256,
            "code-rate": 92,
          },
          {
            "transmission-mode-name": "112007",
            "tx-power-max": 19,
            "symbol-rate-reduction-factor": 1,
            "rx-threshold": -64,
            "am-downshift-level": -60,
            "supported-as-fixed-configuration": true,
            "channel-bandwidth": 112000,
            "xpic-is-avail": true,
            "tx-power-min": -5,
            "transmission-mode-rank": 112007,
            "am-upshift-level": -58,
            "modulation-scheme-name-at-lct": "128QAM",
            "modulation-scheme": 128,
            "code-rate": 91,
          },
        ],
        "direction-of-acm-performance-values": "air-interface-2-0:DIRECTION_TYPE_TX",
        "supported-loop-back-kind-list": [
          "air-interface-2-0:LOOP_BACK_TYPE_IF_TO_LOCAL",
          "air-interface-2-0:LOOP_BACK_TYPE_RF_TO_LOCAL",
        ],
        "clearing-threshold-cross-alarms-is-avail": false,
        "duplex-distance-is-freely-configurable": false,
        "tx-frequency-max": 18691500,
        "maintenance-timer-range": "0-172800",
        "acm-threshold-cross-alarms-is-avail": false,
        "expected-equals-transmitted-radio-signal-id": true,
        "atpc-is-avail": true,
        "encryption-is-avail": false,
        "type-of-equipment": "AGS-20",
        "receiver-on-off-is-avail": false,
        "atpc-range": 0,
        "supported-radio-signal-id-length": 255,
        "performance-monitoring-is-avail": true,
        "auto-freq-select-is-avail": false,
        "rx-frequency-min": 19341500,
        "tx-frequency-min": 18331500,
        traceIndicatorIncrementer: 5,
      }
    ;
  
      const result = await formulateAirInterfaceResponseBody(
        airInterfaceEndPointName,
        airInterfaceConfiguration,
        airInterfaceCapability,
        airInterfaceStatus
      );
  
      expect(result).toEqual({
        "air-interface-endpoint-name": "513559993",
        "configured-tx-power": 23,
        "current-tx-power": 23,
        "current-rx-level": -50,
        "configured-tx-frequency": 18460000,
        "configured-rx-frequency": -1,
        "configured-transmitted-radio-signal-id": {
          "alphanumeric-radio-signal-id": "Not yet defined.",
          "numeric-radio-signal-id": 193,
        },
        "configured-expected-radio-signal-id": {
          "alphanumeric-radio-signal-id": "Not yet defined.",
          "numeric-radio-signal-id": -1,
        },
        "configured-atpc-is-on": false,
        "configured-atpc-threshold-upper": -40,
        "configured-atpc-threshold-lower": -60,
        "configured-atpc-tx-power-min": -7,
        "configured-adaptive-modulation-is-on": false,
        "current-cross-polarization-discrimination": 99,
        "configured-performance-monitoring-is-on": true,
        "configured-xpic-is-on": true,
        "current-signal-to-noise-ratio": 40,
        "configured-modulation-minimum": {
          "number-of-states": 4,
          "name-at-lct": "4QAM",
        },
        "configured-modulation-maximum": {
          "number-of-states": 4,
          "name-at-lct": "4QAM",
        },
        "current-modulation": {
          "number-of-states": 4,
          "name-at-lct": "4QAM",
        },
        "configured-channel-bandwidth-min": 56000,
        "configured-channel-bandwidth-max": 56000,
      });
  
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

describe('getConfiguredModulation', () => {
  test('should return the correct transmission mode when a matching type is found', async () => {
    const airInterfaceCapability = {
      'acm-threshold-cross-alarms-is-avail' : false,
      'adaptive-modulation-is-avail' : true,
      'atpc-is-avail' : true,
      'atpc-range' : 0,
      'auto-freq-select-is-avail' : false,
      'clearing-threshold-cross-alarms-is-avail' : false,
      'direction-of-acm-performance-values' : 'air-interface-2-0:DIRECTION_TYPE_TX',
      'duplex-distance-is-freely-configurable' : false,
      'duplex-distance-list' : [1010000, 1008000],
      'encryption-is-avail' : false,
      'expected-equals-transmitted-radio-signal-id' : true,
      'maintenance-timer-range' : '0-172800',
      'performance-monitoring-is-avail' : true,
      'receiver-on-off-is-avail' : false,
      'rx-frequency-max' : 19701500,
      'rx-frequency-min' : 19341500,
      'supported-loop-back-kind-list' : ['air-interface-2-0:LOOP_BACK_TYPE_IF_TO_LOCAL', 'air-interface-2-0:LOOP_BACK_TYPE_RF_TO_LOCAL'],
      'supported-radio-signal-id-datatype' : 'air-interface-2-0:RADIO_SIGNAL_ID_DATATYPE_TYPE_INTEGER',
      'supported-radio-signal-id-length' : 255,
      traceIndicatorIncrementer : 5,
      'transmission-mode-list' : [
          {
              "transmission-mode-name": "112013",
              "tx-power-max": 17,
              "symbol-rate-reduction-factor": 1,
              "rx-threshold": -52,
              "am-downshift-level": -49,
              "supported-as-fixed-configuration": true,
              "channel-bandwidth": 112000,
              "xpic-is-avail": true,
              "tx-power-min": -4,
              "transmission-mode-rank": 112013,
              "am-upshift-level": -47,
              "modulation-scheme-name-at-lct": "2048QAM",
              "modulation-scheme": 2048,
              "code-rate": 88,
            },
            {
              "transmission-mode-name": "112012",
              "tx-power-max": 17,
              "symbol-rate-reduction-factor": 1,
              "rx-threshold": -54,
              "am-downshift-level": -51,
              "supported-as-fixed-configuration": true,
              "channel-bandwidth": 112000,
              "xpic-is-avail": true,
              "tx-power-min": -4,
              "transmission-mode-rank": 112012,
              "am-upshift-level": -50,
              "modulation-scheme-name-at-lct": "1024QAM",
              "modulation-scheme": 1024,
              "code-rate": 92,
            },
            {
              "transmission-mode-name": "112014",
              "tx-power-max": 16,
              "symbol-rate-reduction-factor": 1,
              "rx-threshold": -49,
              "am-downshift-level": -46,
              "supported-as-fixed-configuration": true,
              "channel-bandwidth": 112000,
              "xpic-is-avail": false,
              "tx-power-min": -4,
              "transmission-mode-rank": 112014,
              "am-upshift-level": -45,
              "modulation-scheme-name-at-lct": "4096QAM",
              "modulation-scheme": 4096,
              "code-rate": 88,
            }
          ],
      'tx-frequency-max' : 18691500,
      'tx-frequency-min' : 18331500,
      'type-of-equipment' : 'AGS-20'
      };
    const transmissioModeType = '112013';
   
    const result = await getConfiguredModulation(airInterfaceCapability, transmissioModeType);
    expect(result).toEqual({
      'am-downshift-level' : -49,
      'am-upshift-level' : -47,
      'channel-bandwidth' : 112000,
      'code-rate' : 88,
      'modulation-scheme' :2048,
      'modulation-scheme-name-at-lct' : '2048QAM',
      'rx-threshold' : -52,
      'supported-as-fixed-configuration' : true,
      'symbol-rate-reduction-factor' : 1,
      'transmission-mode-name' : '112013',
      'transmission-mode-rank' : 112013,
      'tx-power-max' : 17,
      'tx-power-min' : -4,
      'xpic-is-avail' : true
  });
  });


  test('should return an empty object if no matching transmission mode is found', async () => {
    const airInterfaceCapability = {
      'acm-threshold-cross-alarms-is-avail' : false,
      'adaptive-modulation-is-avail' : true,
      'atpc-is-avail' : true,
      'atpc-range' : 0,
      'auto-freq-select-is-avail' : false,
      'clearing-threshold-cross-alarms-is-avail' : false,
      'direction-of-acm-performance-values' : 'air-interface-2-0:DIRECTION_TYPE_TX',
      'duplex-distance-is-freely-configurable' : false,
      'duplex-distance-list' : [1010000, 1008000],
      'encryption-is-avail' : false,
      'expected-equals-transmitted-radio-signal-id' : true,
      'maintenance-timer-range' : '0-172800',
      'performance-monitoring-is-avail' : true,
      'receiver-on-off-is-avail' : false,
      'rx-frequency-max' : 19701500,
      'rx-frequency-min' : 19341500,
      'supported-loop-back-kind-list' : ['air-interface-2-0:LOOP_BACK_TYPE_IF_TO_LOCAL', 'air-interface-2-0:LOOP_BACK_TYPE_RF_TO_LOCAL'],
      'supported-radio-signal-id-datatype' : 'air-interface-2-0:RADIO_SIGNAL_ID_DATATYPE_TYPE_INTEGER',
      'supported-radio-signal-id-length' : 255,
      traceIndicatorIncrementer : 5,
      'transmission-mode-list' : [
          {
              "transmission-mode-name": "112013",
              "tx-power-max": 17,
              "symbol-rate-reduction-factor": 1,
              "rx-threshold": -52,
              "am-downshift-level": -49,
              "supported-as-fixed-configuration": true,
              "channel-bandwidth": 112000,
              "xpic-is-avail": true,
              "tx-power-min": -4,
              "transmission-mode-rank": 112013,
              "am-upshift-level": -47,
              "modulation-scheme-name-at-lct": "2048QAM",
              "modulation-scheme": 2048,
              "code-rate": 88,
            },
            {
              "transmission-mode-name": "112012",
              "tx-power-max": 17,
              "symbol-rate-reduction-factor": 1,
              "rx-threshold": -54,
              "am-downshift-level": -51,
              "supported-as-fixed-configuration": true,
              "channel-bandwidth": 112000,
              "xpic-is-avail": true,
              "tx-power-min": -4,
              "transmission-mode-rank": 112012,
              "am-upshift-level": -50,
              "modulation-scheme-name-at-lct": "1024QAM",
              "modulation-scheme": 1024,
              "code-rate": 92,
            },
            {
              "transmission-mode-name": "112014",
              "tx-power-max": 16,
              "symbol-rate-reduction-factor": 1,
              "rx-threshold": -49,
              "am-downshift-level": -46,
              "supported-as-fixed-configuration": true,
              "channel-bandwidth": 112000,
              "xpic-is-avail": false,
              "tx-power-min": -4,
              "transmission-mode-rank": 112014,
              "am-upshift-level": -45,
              "modulation-scheme-name-at-lct": "4096QAM",
              "modulation-scheme": 4096,
              "code-rate": 88,
            }
          ],
      'tx-frequency-max' : 18691500,
      'tx-frequency-min' : 18331500,
      'type-of-equipment' : 'AGS-20'
      };
    const transmissioModeType = "459218";
    
    const result = await getConfiguredModulation(airInterfaceCapability, transmissioModeType);
    expect(result).undefined;
  });

  test('should return an empty object if airInterfaceCapability is undefined', async () => {
    const result = await getConfiguredModulation(undefined, "459211");
    expect(result).toEqual({});
  });

  test('should return an empty object if airInterfaceCapability does not contain transmission-mode-list', async () => {
    const airInterfaceCapability = {
      'acm-threshold-cross-alarms-is-avail' : false,
      'adaptive-modulation-is-avail' : true,
      'atpc-is-avail' : true,
      'atpc-range' : 0,
      'auto-freq-select-is-avail' : false,
      'clearing-threshold-cross-alarms-is-avail' : false,
      'direction-of-acm-performance-values' : 'air-interface-2-0:DIRECTION_TYPE_TX',
      'duplex-distance-is-freely-configurable' : false,
      'duplex-distance-list' : [1010000, 1008000],
      'encryption-is-avail' : false,
      'expected-equals-transmitted-radio-signal-id' : true,
      'maintenance-timer-range' : '0-172800',
      'performance-monitoring-is-avail' : true,
      'receiver-on-off-is-avail' : false,
      'rx-frequency-max' : 19701500,
      'rx-frequency-min' : 19341500,
      'supported-loop-back-kind-list' : ['air-interface-2-0:LOOP_BACK_TYPE_IF_TO_LOCAL', 'air-interface-2-0:LOOP_BACK_TYPE_RF_TO_LOCAL'],
      'supported-radio-signal-id-datatype' : 'air-interface-2-0:RADIO_SIGNAL_ID_DATATYPE_TYPE_INTEGER',
      'supported-radio-signal-id-length' : 255,
      traceIndicatorIncrementer : 5,
      'tx-frequency-max' : 18691500,
      'tx-frequency-min' : 18331500,
      'type-of-equipment' : 'AGS-20'
      };    const result = await getConfiguredModulation(airInterfaceCapability, "562976");
    expect(result).toEqual({});
  });

});