global.testPrivateFuntions = 1;
 
const {ReadAcceptanceData_Private} = require("../ReadAcceptanceData");
const ReadLtpStructure = require("../ReadLtpStructure");
const ReadAirInterfaceData = require("../ReadAirInterfaceData");
const ReadVlanInterfaceData = require("../ReadVlanInterfaceData");
const ReadInventoryData = require("../ReadInventoryData");
const ReadAlarmsData = require("../ReadAlarmsData");
const onfAttributes = require("onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes");
const FcPort = require("onf-core-model-ap/applicationPattern/onfModel/models/FcPort");
const { executeAcceptanceDataRequest } = require("../ReadAcceptanceData");
const createHttpError = require("http-errors");
const onfAttributeFormatter = require("onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter");
const rewire = require('rewire');
const ReadAcceptanceDataRewire = rewire('../ReadAcceptanceData')
 
global.testPrivateFuntions = 0;
 
jest.mock("../ReadLtpStructure");
jest.mock("../ReadAirInterfaceData");
jest.mock("../ReadVlanInterfaceData");
jest.mock("../ReadInventoryData");
jest.mock("../ReadAlarmsData");
 
describe("getFcPortOutputLogicalTerminationPointList", () => {
  test("should return an empty array when given an empty FC port list", () => {
    const forwardingConstructInstance = { [onfAttributes.FORWARDING_CONSTRUCT.FC_PORT]: [] };
    expect(ReadAcceptanceData_Private.getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance)).toEqual([]);
  });
 
  test("should return an empty array when there are no OUTPUT ports", () => {
    const forwardingConstructInstance = {
      [onfAttributes.FORWARDING_CONSTRUCT.FC_PORT]: [
        { [onfAttributes.FC_PORT.PORT_DIRECTION]: FcPort.portDirectionEnum.INPUT, [onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT]: "ltp1" },
        { [onfAttributes.FC_PORT.PORT_DIRECTION]: FcPort.portDirectionEnum.INPUT, [onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT]: "ltp2" }
      ]
    };
    expect(ReadAcceptanceData_Private.getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance)).toEqual([]);
  });
 
  test("should return logical termination points for OUTPUT ports only", () => {
    const forwardingConstructInstance = {
      uuid: "aptp-1-1-0-op-fc-is-170",
      name: [
        {
          "value-name": "ForwardingKind",
          value: "core-model-1-4:FORWARDING_KIND_TYPE_INVARIANT_PROCESS_SNIPPET",
        },
        {
          "value-name": "ForwardingName",
          value: "RequestForProvidingAcceptanceDataCausesDeliveringRequestedAcceptanceData",
        },
      ],
      "fc-port": [
        {
          "local-id": "100",
          "port-direction": "core-model-1-4:PORT_DIRECTION_TYPE_INPUT",
          "logical-termination-point": "aptp-1-1-0-op-s-is-000",
        },
        {
          "local-id": "200",
          "port-direction": "core-model-1-4:PORT_DIRECTION_TYPE_OUTPUT",
          "logical-termination-point": "aptp-1-1-0-op-c-is-apt-24-5-0-000",
        },
      ],
    };
    expect(ReadAcceptanceData_Private.getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance)).toEqual([
      "aptp-1-1-0-op-c-is-apt-24-5-0-000",
    ]);
  });
});
 
describe("RequestForProvidingAcceptanceDataCausesDeliveringRequestedAcceptanceData", () => {
  let mockForwardRequest;
 
  beforeEach(() => {

    request_id="513250007-513559993-1744115928985";
     requestHeaders={
      user: "admin",
      originator: "AccessPlanningToolProxy",
      xCorrelator: "8Ea5285D-4B9d-83f1-Cb44-020E5fb20701",
      traceIndicator: "1",
      customerJourney: "unknown",
    };
     acceptanceDataOfLinkEndPoint={
      inventory: {
        radio: {
          "equipment-name": "ASNK-18G",
          "serial-number": "101821827000620",
          "part-number": "GE8704-52",
        },
        "installed-firmware": [
          {
            "firmware-component-name": "IDU Board Bench 2",
            "firmware-component-version": "N31030  01.12.04",
            "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_STAND_BY",
          },
          {
            "firmware-component-name": "Boot",
            "firmware-component-version": "E82115  01.02.01",
            "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
          },
          {
            "firmware-component-name": "Web Server LCT",
            "firmware-component-version": "N96121  01.12.03",
            "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
          },
          {
            "firmware-component-name": "IDU Board Bench 1",
            "firmware-component-version": "N31030  16.05.22",
            "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
          },
          {
            "firmware-component-name": "ODU-B",
            "firmware-component-version": "N90716 01.01.00",
            "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
          },
          {
            "firmware-component-name": "ODU-A",
            "firmware-component-version": "N90716 01.01.00",
            "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
          },
        ],
        "configured-group-of-air-interfaces": [
          {
            "link-id": "513559992B",
          },
          {
            "link-id": "513559993B",
          },
        ],
        "plugged-sfp-pmd-list": [
          {
            "interface-name": "LAN-1-SFP",
            "supported-pmd-list": [
              "1000BASE-LX_FD",
              "10GBASE-LR_FD",
            ],
            "currently-operated-pmd": "1000BASE-LX_FD",
          },
          {
            "interface-name": "LAN-2-SFP",
            "supported-pmd-list": [
              "1000BASE-LX_FD",
              "10GBASE-LR_FD",
            ],
            "currently-operated-pmd": "1000BASE-T_HD",
          },
          {
            "interface-name": "LAN-1-XG-SFP",
            "supported-pmd-list": [
              "1000BASE-LX_FD",
            ],
            "currently-operated-pmd": "1000BASE-LX_FD",
          },
          {
            "interface-name": "LAN-2-XG-SFP",
            "supported-pmd-list": [
              "1000BASE-LX_FD",
              "10GBASE-LR_FD",
            ],
            "currently-operated-pmd": "1000BASE-LX_FD",
          },
        ],
        "connector-plugging-the-outdoor-unit": 1,
      },
      alarms: {
        "current-alarms": {
          "number-of-current-alarms": 9,
          "current-alarm-list": [
            {
              "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
              "alarm-type-qualifier": "",
              "alarm-type-id": "siae-alarms-1-0:pmG828-UASAlarm",
            },
            {
              "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
              "alarm-type-qualifier": "",
              "alarm-type-id": "siae-alarms-1-0:equipPowerSupply1Alarm",
            },
            {
              "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
              "alarm-type-qualifier": "",
              "alarm-type-id": "siae-alarms-1-0:sfpLowAlarm",
            },
            {
              "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
              "alarm-type-qualifier": "",
              "alarm-type-id": "siae-alarms-1-0:ifextLosAlarm",
            },
            {
              "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
              "alarm-type-qualifier": "",
              "alarm-type-id": "siae-alarms-1-0:radioDemodulatorFailAlarm",
            },
            {
              "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
              "alarm-type-qualifier": "",
              "alarm-type-id": "siae-alarms-1-0:radioRxPowerLowAlarm",
            },
            {
              "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
              "alarm-type-qualifier": "",
              "alarm-type-id": "siae-alarms-1-0:linkLinkTelemetryFailAlarm",
            },
            {
              "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
              "alarm-type-qualifier": "",
              "alarm-type-id": "siae-alarms-1-0:linkSetupMismatchAlarm",
            },
            {
              "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
              "alarm-type-qualifier": "",
              "alarm-type-id": "siae-alarms-1-0:radioRxAGCAlarm",
            },
          ],
        },
      },
      "air-interface": {
        "air-interface-endpoint-name": "513559993B",
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
        "configured-adaptive-modulation-is-on": true,
        "current-cross-polarization-discrimination": 60,
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
      },
      "vlan-interface": {
        "configured-lan-port-role-list": [
          {
            "interface-name": "LAN-2-COMBO",
            "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
            "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
          },
          {
            "interface-name": "LAN-1-COMBO",
            "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
            "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
          },
          {
            "interface-name": "LAN-2-COMBO",
            "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
            "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
          },
          {
            "interface-name": "LAN-1-XG-SFP",
            "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
            "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
          },
          {
            "interface-name": "LAN-2-XG-SFP",
            "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
            "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
          },
          {
            "interface-name": "LAN-1-COMBO",
            "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
            "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
          },
          {
            "interface-name": "LAN-4-RJ45",
            "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
            "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
          },
        ],
        "configured-wan-port-role-list": [
          {
            "interface-name": "ODU A",
            "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
            "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
          },
          {
            "interface-name": "ODU A",
            "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
            "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
          },
        ],
      },
    };
    traceIndicatorIncrementer=1;
    mockForwardRequest= jest.fn();
    ReadAcceptanceDataRewire.__set__('forwardRequest',mockForwardRequest);
  });
 
  afterEach(() => {
    jest.restoreAllMocks();
  });
 
  test("should return response when forwardRequest succeeds", async () => {
    const mockResponse = { success: true };
    mockForwardRequest.mockResolvedValue(mockResponse);
 
    const result = await ReadAcceptanceDataRewire.RequestForProvidingAcceptanceDataCausesDeliveringRequestedAcceptanceData(request_id, requestHeaders, acceptanceDataOfLinkEndPoint,traceIndicatorIncrementer);
 
    expect(result).toEqual(mockResponse);
    expect(mockForwardRequest).toHaveBeenCalledTimes(1);
  });
 
  test("should return internal server error when forwardRequest throws an error", async () => {
    mockForwardRequest.mockRejectedValue(new Error("Network error"));
 
    const result = await ReadAcceptanceDataRewire.RequestForProvidingAcceptanceDataCausesDeliveringRequestedAcceptanceData(
      "123", { user: "testUser", xCorrelator: "xyz", traceIndicator: "1", customerJourney: "abc" },
      { "air-interface": {}, "vlan-interface": {}, "inventory": {}, "alarms": {} }, 1
    );
 
    expect(result.message).toContain("Network error");
  });
});
 
describe("processAcceptanceDataRequest", () => {
  let mockExecuteAcceptanceDataRequest;
  let mockRequestForProvidingAcceptanceData;
 
  beforeEach(() => {
    mountName="513250007";
    linkId="513559993"; 
    request_id="513250007-513559993-1744114351517"; 
    requestHeaders={
      user: "admin",
      originator: "AccessPlanningToolProxy",
      xCorrelator: "AF14cFBE-0C6e-8D8e-Efa1-caC2DFE20544",
      traceIndicator: "1",
      customerJourney: "unknown",
    }; 
    traceIndicatorIncrementer=1;
    global.counterStatusAcceptanceDataOfLinkEndpointCall = 5; // Set an initial value
  });
 
  afterEach(() => {
      jest.restoreAllMocks();
  });
 
  test("should call dependent functions successfully", async () => {
      const mockAcceptanceData = {
        inventory: {
          radio: {
            "equipment-name": "ASNK-18G",
            "serial-number": "101821827000620",
            "part-number": "GE8704-52",
          },
          "installed-firmware": [
            {
              "firmware-component-name": "IDU Board Bench 2",
              "firmware-component-version": "N31030  01.12.04",
              "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_STAND_BY",
            },
            {
              "firmware-component-name": "Boot",
              "firmware-component-version": "E82115  01.02.01",
              "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
            },
            {
              "firmware-component-name": "Web Server LCT",
              "firmware-component-version": "N96121  01.12.03",
              "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
            },
            {
              "firmware-component-name": "IDU Board Bench 1",
              "firmware-component-version": "N31030  16.05.22",
              "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
            },
            {
              "firmware-component-name": "ODU-B",
              "firmware-component-version": "N90716 01.01.00",
              "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
            },
            {
              "firmware-component-name": "ODU-A",
              "firmware-component-version": "N90716 01.01.00",
              "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
            },
          ],
          "configured-group-of-air-interfaces": [
            {
              "link-id": "513559992B",
            },
            {
              "link-id": "513559993B",
            },
          ],
          "plugged-sfp-pmd-list": [
            {
              "interface-name": "LAN-1-SFP",
              "supported-pmd-list": [
                "1000BASE-LX_FD",
                "10GBASE-LR_FD",
              ],
              "currently-operated-pmd": "1000BASE-LX_FD",
            },
            {
              "interface-name": "LAN-2-SFP",
              "supported-pmd-list": [
                "1000BASE-LX_FD",
                "10GBASE-LR_FD",
              ],
              "currently-operated-pmd": "1000BASE-T_HD",
            },
            {
              "interface-name": "LAN-1-XG-SFP",
              "supported-pmd-list": [
                "1000BASE-LX_FD",
              ],
              "currently-operated-pmd": "1000BASE-LX_FD",
            },
            {
              "interface-name": "LAN-2-XG-SFP",
              "supported-pmd-list": [
                "1000BASE-LX_FD",
                "10GBASE-LR_FD",
              ],
              "currently-operated-pmd": "1000BASE-LX_FD",
            },
          ],
          "connector-plugging-the-outdoor-unit": 1,
        },
        alarms: {
          "current-alarms": {
            "number-of-current-alarms": 9,
            "current-alarm-list": [
              {
                "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
                "alarm-type-qualifier": "",
                "alarm-type-id": "siae-alarms-1-0:pmG828-UASAlarm",
              },
              {
                "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
                "alarm-type-qualifier": "",
                "alarm-type-id": "siae-alarms-1-0:equipPowerSupply1Alarm",
              },
              {
                "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
                "alarm-type-qualifier": "",
                "alarm-type-id": "siae-alarms-1-0:sfpLowAlarm",
              },
              {
                "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
                "alarm-type-qualifier": "",
                "alarm-type-id": "siae-alarms-1-0:ifextLosAlarm",
              },
              {
                "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
                "alarm-type-qualifier": "",
                "alarm-type-id": "siae-alarms-1-0:radioDemodulatorFailAlarm",
              },
              {
                "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
                "alarm-type-qualifier": "",
                "alarm-type-id": "siae-alarms-1-0:radioRxPowerLowAlarm",
              },
              {
                "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
                "alarm-type-qualifier": "",
                "alarm-type-id": "siae-alarms-1-0:linkLinkTelemetryFailAlarm",
              },
              {
                "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
                "alarm-type-qualifier": "",
                "alarm-type-id": "siae-alarms-1-0:linkSetupMismatchAlarm",
              },
              {
                "alarm-severity": "alarms-1-0:SEVERITY_TYPE_MAJOR",
                "alarm-type-qualifier": "",
                "alarm-type-id": "siae-alarms-1-0:radioRxAGCAlarm",
              },
            ],
          },
        },
        "air-interface": {
          "air-interface-endpoint-name": "513559993B",
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
          "configured-adaptive-modulation-is-on": true,
          "current-cross-polarization-discrimination": 99,
          "configured-performance-monitoring-is-on": true,
          "configured-xpic-is-on": true,
          "current-signal-to-noise-ratio": 41,
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
        },
        "vlan-interface": {
          "configured-lan-port-role-list": [
            {
              "interface-name": "LAN-2-COMBO",
              "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
              "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
            },
            {
              "interface-name": "LAN-1-COMBO",
              "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
              "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
            },
            {
              "interface-name": "LAN-2-COMBO",
              "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
              "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
            },
            {
              "interface-name": "LAN-1-XG-SFP",
              "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
              "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
            },
            {
              "interface-name": "LAN-2-XG-SFP",
              "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
              "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
            },
            {
              "interface-name": "LAN-1-COMBO",
              "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
              "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
            },
            {
              "interface-name": "LAN-4-RJ45",
              "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
              "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
            },
          ],
          "configured-wan-port-role-list": [
            {
              "interface-name": "ODU A",
              "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
              "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
            },
            {
              "interface-name": "ODU A",
              "vlan-interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
              "serving-ethernet-container-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP",
            },
          ],
        },
      };
      ReadAcceptanceDataRewire.executeAcceptanceDataRequest = jest.fn().mockResolvedValue(mockAcceptanceData);
      ReadAcceptanceDataRewire.RequestForProvidingAcceptanceDataCausesDeliveringRequestedAcceptanceData = jest.fn().mockResolvedValue(true);
  
      const result=await ReadAcceptanceDataRewire.processAcceptanceDataRequest(mountName, linkId, request_id, requestHeaders, traceIndicatorIncrementer);
 
      expect(ReadAcceptanceDataRewire.executeAcceptanceDataRequest).toHaveBeenCalledWith(mountName, linkId, requestHeaders, traceIndicatorIncrementer);
      expect(ReadAcceptanceDataRewire.RequestForProvidingAcceptanceDataCausesDeliveringRequestedAcceptanceData).toHaveBeenCalledWith("513250007-513559993-1744114351517", requestHeaders, mockAcceptanceData, 1);
      expect(global.counterStatusAcceptanceDataOfLinkEndpointCall).toBe(5);
    });
 
  test("should handle error in executeAcceptanceDataRequest", async () => {
    ReadAcceptanceDataRewire.executeAcceptanceDataRequest = jest.fn().mockRejectedValue(new Error("Network error"));
    ReadAcceptanceDataRewire.RequestForProvidingAcceptanceDataCausesDeliveringRequestedAcceptanceData=jest.fn();
 
      await ReadAcceptanceDataRewire.processAcceptanceDataRequest("mount1", "link1", "123", { user: "testUser" }, 1);
 
      expect(ReadAcceptanceDataRewire.executeAcceptanceDataRequest).toHaveBeenCalled();
      expect(ReadAcceptanceDataRewire.RequestForProvidingAcceptanceDataCausesDeliveringRequestedAcceptanceData).not.toHaveBeenCalled();
      expect(global.counterStatusAcceptanceDataOfLinkEndpointCall).toBe(5);
  });
 
  test("should handle error in RequestForProvidingAcceptanceDataCausesDeliveringRequestedAcceptanceData", async () => {
      const mockAcceptanceData = { success: true };
      ReadAcceptanceDataRewire.executeAcceptanceDataRequest = jest.fn().mockRejectedValue(mockAcceptanceData)
      await ReadAcceptanceDataRewire.processAcceptanceDataRequest("mount1", "link1", "123", { user: "testUser" }, 1);
 
      expect(ReadAcceptanceDataRewire.executeAcceptanceDataRequest).toHaveBeenCalled();
      expect(global.counterStatusAcceptanceDataOfLinkEndpointCall).toBe(5);
  });
 
});