global.testPrivateFunctions = 1;
const { ReadInventoryData_Private } = require('../ReadInventoryData');
const IndividualServiceUtility = require('../IndividualServiceUtility');
const LtpStructureUtility = require('../LtpStructureUtility');
global.testPrivateFunctions = 0;

jest.mock('../LtpStructureUtility');
jest.mock('../IndividualServiceUtility');

describe("RequestForProvidingAcceptanceDataCausesReadingFirmwareList", () => {
  let mountName, requestHeaders, traceIndicatorIncrementer;

  beforeEach(() => {
    jest.clearAllMocks();
    mountName = "513250007";
    requestHeaders = {
      user: undefined,
      originator: "AccessPlanningToolProxy",
      xCorrelator: "a3Bb05ed-BDfC-3243-df7b-b8dDC60Cd85D",
      traceIndicator: "1",
      customerJourney: "unknown",
    };
    traceIndicatorIncrementer = 33;
  });

  it("should return installed firmware details when firmware data is available", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({
      operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-120",
      operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/firmware-1-0:firmware-collection",
      fields: "",
    });

    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      "firmware-1-0:firmware-collection": {
        "firmware-component-list": [
          {
            "local-id": "FW_BENCH_1_IMAGE_6",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "01.08.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_TDM-INIT",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_2_IMAGE_9",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "01.00.07",
                "individual-activation-is-avail": false,
                "firmware-component-name": "Conf_queue_depth",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_2_PACKAGE",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "subordinate-firmware-component-list": [
              "FW_BENCH_2_IMAGE_1",
              "FW_BENCH_2_IMAGE_4",
              "FW_BENCH_2_IMAGE_5",
              "FW_BENCH_2_IMAGE_2",
              "FW_BENCH_2_IMAGE_3",
              "FW_BENCH_2_IMAGE_8",
              "FW_BENCH_2_IMAGE_9",
              "FW_BENCH_2_IMAGE_6",
              "FW_BENCH_2_IMAGE_7",
              "FW_BENCH_2_IMAGE_12",
              "FW_BENCH_2_IMAGE_11",
              "FW_BENCH_2_IMAGE_10",
            ],
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N31030  01.12.04",
                "individual-activation-is-avail": true,
                "firmware-component-name": "IDU Board Bench 2",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_PACKAGE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_STAND_BY",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_1_IMAGE_7",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90709 01.02.05",
                "individual-activation-is-avail": false,
                "firmware-component-name": "Sets_FW",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FIRMWARE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_1_IMAGE_8",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "01.00.03",
                "individual-activation-is-avail": false,
                "firmware-component-name": "Sets_FW_Cfg",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_1_IMAGE_9",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "01.00.07",
                "individual-activation-is-avail": false,
                "firmware-component-name": "Conf_queue_depth",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BOOT_PACKAGE",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "subordinate-firmware-component-list": [
              "FW_BOOT_IMAGE_1",
            ],
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "E82115  01.02.01",
                "individual-activation-is-avail": true,
                "firmware-component-name": "Boot",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_PACKAGE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_1_IMAGE_2",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90700 01.12.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_Core",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FPGA_CODE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_1_IMAGE_3",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "00.00.15",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_Core_Cfg",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_1_IMAGE_4",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "01.11.03",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_ARI-INIT",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_1_IMAGE_5",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90704 01.12.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_Exp16_TDM",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FPGA_CODE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_2_IMAGE_1",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90720 01.12.04",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FW_appl",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_APPLICATION_SOFTWARE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_2_IMAGE_2",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90700 01.12.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_Core",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FPGA_CODE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_WEB_LCT_PACKAGE",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "subordinate-firmware-component-list": [
              "FW_WEB_LCT_IMAGE_1",
            ],
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N96121  01.12.03",
                "individual-activation-is-avail": true,
                "firmware-component-name": "Web Server LCT",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_PACKAGE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_2_IMAGE_3",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "00.00.15",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_Core_Cfg",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_1_PACKAGE",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "subordinate-firmware-component-list": [
              "FW_BENCH_1_IMAGE_9",
              "FW_BENCH_1_IMAGE_7",
              "FW_BENCH_1_IMAGE_11",
              "FW_BENCH_1_IMAGE_8",
              "FW_BENCH_1_IMAGE_10",
              "FW_BENCH_1_IMAGE_5",
              "FW_BENCH_1_IMAGE_6",
              "FW_BENCH_1_IMAGE_12",
              "FW_BENCH_1_IMAGE_3",
              "FW_BENCH_1_IMAGE_4",
              "FW_BENCH_1_IMAGE_1",
              "FW_BENCH_1_IMAGE_2",
            ],
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N31030  16.05.22",
                "individual-activation-is-avail": true,
                "firmware-component-name": "IDU Board Bench 1",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_PACKAGE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_2_IMAGE_4",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "01.11.03",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_ARI-INIT",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_2_IMAGE_5",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90704 01.12.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_Exp16_TDM",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FPGA_CODE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_2_IMAGE_6",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "01.08.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_TDM-INIT",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_2_IMAGE_7",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90709 01.02.05",
                "individual-activation-is-avail": false,
                "firmware-component-name": "Sets_FW",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FIRMWARE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_2_IMAGE_8",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "01.00.03",
                "individual-activation-is-avail": false,
                "firmware-component-name": "Sets_FW_Cfg",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_ODU_A_IMAGE_1",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "E82114 01.00.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FW_Boot",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FIRMWARE_BIOS",
                "related-kinds-of-equipment-list": [
                  "ODU MW interface",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "ODU-A",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BOOT_IMAGE_1",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "E82115  01.02.01",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FW_Boot",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FIRMWARE_BIOS",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_2_IMAGE_11",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "01.13.01",
                "individual-activation-is-avail": false,
                "firmware-component-name": "Conf_modem_650",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_2_IMAGE_10",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90711 01.12.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_Exp16_PW3",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FPGA_CODE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_WEB_LCT_IMAGE_1",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N96121  01.12.03",
                "individual-activation-is-avail": false,
                "firmware-component-name": "WebServerLCT",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_APPLICATION_SOFTWARE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_2_IMAGE_12",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90741 01.12.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_Exp_Core",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FPGA_CODE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_ODU_B_PACKAGE",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "subordinate-firmware-component-list": [
              "FW_ODU_B_IMAGE_1",
              "FW_ODU_B_IMAGE_2",
              "FW_ODU_B_IMAGE_3",
              "FW_ODU_B_IMAGE_4",
            ],
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90716 01.01.00",
                "individual-activation-is-avail": true,
                "firmware-component-name": "ODU-B",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_PACKAGE",
                "related-kinds-of-equipment-list": [
                  "ODU MW interface",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "ODU-B",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_ODU_A_IMAGE_4",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "NC0000  01.00.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "Conf_channel_table",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "ODU MW interface",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "ODU-A",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_ODU_A_IMAGE_2",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90716 01.01.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FW_appl",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FIRMWARE",
                "related-kinds-of-equipment-list": [
                  "ODU MW interface",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "ODU-A",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_ODU_A_IMAGE_3",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90717 01.01.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FPGA_CODE",
                "related-kinds-of-equipment-list": [
                  "ODU MW interface",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "ODU-A",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_ODU_B_IMAGE_3",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90717 01.01.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FPGA_CODE",
                "related-kinds-of-equipment-list": [
                  "ODU MW interface",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "ODU-B",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_ODU_B_IMAGE_4",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "NC0000  01.00.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "Conf_channel_table",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "ODU MW interface",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "ODU-B",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_1_IMAGE_12",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90741 01.12.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_Exp_Core",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FPGA_CODE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_ODU_B_IMAGE_1",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "E82114 01.00.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FW_Boot",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FIRMWARE_BIOS",
                "related-kinds-of-equipment-list": [
                  "ODU MW interface",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "ODU-B",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_1_IMAGE_11",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "01.13.01",
                "individual-activation-is-avail": false,
                "firmware-component-name": "Conf_modem_650",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_CONFIGURATION_DATA",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_ODU_B_IMAGE_2",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90716 01.01.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FW_appl",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FIRMWARE",
                "related-kinds-of-equipment-list": [
                  "ODU MW interface",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "ODU-B",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_1_IMAGE_10",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90711 01.12.00",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FPGA_Exp16_PW3",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_FPGA_CODE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_ODU_A_PACKAGE",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "subordinate-firmware-component-list": [
              "FW_ODU_A_IMAGE_3",
              "FW_ODU_A_IMAGE_4",
              "FW_ODU_A_IMAGE_1",
              "FW_ODU_A_IMAGE_2",
            ],
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90716 01.01.00",
                "individual-activation-is-avail": true,
                "firmware-component-name": "ODU-A",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_PACKAGE",
                "related-kinds-of-equipment-list": [
                  "ODU MW interface",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "ODU-A",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
          {
            "local-id": "FW_BENCH_1_IMAGE_1",
            "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
            "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
            "firmware-component-pac": {
              "firmware-component-capability": {
                "firmware-component-version": "N90720 01.12.04",
                "individual-activation-is-avail": false,
                "firmware-component-name": "FW_appl",
                "firmware-component-class": "firmware-1-0:FIRMWARE_COMPONENT_CLASS_TYPE_APPLICATION_SOFTWARE",
                "related-kinds-of-equipment-list": [
                  "AGS-20 Quad-IF Enhanced 16xE1 XG",
                ],
              },
              "firmware-component-status": {
                "firmware-component-status": "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_LIKE_SUPERIOR_FIRMWARE_COMPONENT",
                "firmware-component-activation-date": "2010-11-20T14:00:00+01:00",
                "is-active-on-equipment-list": [
                  "AGS-20 IDU",
                ],
              },
            },
            "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
          },
        ],
        download: {
          filename: "",
          "download-status-description": "Download completed",
          "download-status": "firmware-1-0:DOWNLOAD_STATUS_TYPE_SUCCESSFUL",
        },
      },
    });

    const result = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesReadingFirmwareList(
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      installedFirmware: [
        {
          firmwareComponentName: "IDU Board Bench 2",
          firmwareComponentVersion: "N31030  01.12.04",
          firmwareComponentStatus: "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_STAND_BY",
        },
        {
          firmwareComponentName: "Boot",
          firmwareComponentVersion: "E82115  01.02.01",
          firmwareComponentStatus: "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
        },
        {
          firmwareComponentName: "Web Server LCT",
          firmwareComponentVersion: "N96121  01.12.03",
          firmwareComponentStatus: "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
        },
        {
          firmwareComponentName: "IDU Board Bench 1",
          firmwareComponentVersion: "N31030  16.05.22",
          firmwareComponentStatus: "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
        },
        {
          firmwareComponentName: "ODU-B",
          firmwareComponentVersion: "N90716 01.01.00",
          firmwareComponentStatus: "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
        },
        {
          firmwareComponentName: "ODU-A",
          firmwareComponentVersion: "N90716 01.01.00",
          firmwareComponentStatus: "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE",
        },
      ],
      traceIndicatorIncrementer: 34,
    });

    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalled();
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalled();
  });

  it("should return an empty installed firmware list when no firmware data is found", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({
      operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-120",
      operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/firmware-1-0:firmware-collection",
      fields: "",
    });

    IndividualServiceUtility.forwardRequest.mockResolvedValue({});

    const result = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesReadingFirmwareList(
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      installedFirmware: [],
      traceIndicatorIncrementer: traceIndicatorIncrementer + 1,
    });

    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalled();
  });

  it("should handle errors gracefully and return an empty installed firmware list", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValue(
      new Error("Mocked error")
    );

    const result = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesReadingFirmwareList(
      mountName,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      installedFirmware: [],
      traceIndicatorIncrementer: traceIndicatorIncrementer,
    });

    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalled();
  });
});

describe("RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentUuid", () => {
  const mountName = "513250007";
  const uuidUnderTest = "LTP-MWPS-TTP-ODU-B";
  const requestHeaders = {
    user: undefined,
    originator: "AccessPlanningToolProxy",
    xCorrelator: "a3Bb05ed-BDfC-3243-df7b-b8dDC60Cd85D",
    traceIndicator: "1",
    customerJourney: "unknown",
  };
  const traceIndicatorIncrementer = 34;

  beforeEach(() => {
    jest.clearAllMocks();
  });


  test("should return equipmentUuidList when forwardRequest returns valid data", async () => {
    const mockResponse = {
      "ltp-augment-1-0:ltp-augment-pac": {
        equipment: [
          "ODU-B",
          "AGS-20 IDU",
        ],
      },
    };

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue(mockResponse);

    const response = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentUuid(
      mountName,
      uuidUnderTest,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(response).toEqual({
      equipmentUuidList: [
        "ODU-B",
        "AGS-20 IDU",
      ],
      traceIndicatorIncrementer: 35,
    });

    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalled();
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalled();
  });

  test("should return an empty equipmentUuidList when forwardRequest response is empty", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue({});

    const response = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentUuid(
      mountName,
      uuidUnderTest,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(response).toEqual({
      equipmentUuidList: [],
      traceIndicatorIncrementer: traceIndicatorIncrementer + 1,
    });

    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalled();
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalled();
  });

  test("should handle errors gracefully", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValue(new Error("Mocked error"));

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { }); // Suppress console output in test

    const response = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentUuid(
      mountName,
      uuidUnderTest,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(response).toEqual({
      equipmentUuidList: [],
      traceIndicatorIncrementer: traceIndicatorIncrementer,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.EquipmentUuid is not success with Error: Mocked error")
    );

    consoleSpy.mockRestore(); // Restore console
  });
});

describe("RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentCategory", () => {
  const mountName = "513250007";
  const equipmentUuidList = [
    "ODU-B",
    "AGS-20 IDU",
  ];
  const requestHeaders = {
    user: undefined,
    originator: "AccessPlanningToolProxy",
    xCorrelator: "a3Bb05ed-BDfC-3243-df7b-b8dDC60Cd85D",
    traceIndicator: "1",
    customerJourney: "unknown",
  };
  const traceIndicatorIncrementer = 38;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return empty modem and radio category UUIDs when forwardRequest gives empty response", async () => {

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue({});

    const response = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentCategory(
      mountName,
      equipmentUuidList,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(response).toEqual({
      traceIndicatorIncrementer: traceIndicatorIncrementer + 2,
    });

    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalledTimes(2);
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(2);
  });

  test("should return modem and radio category UUIDs when valid responses are received", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce({
      "core-model-1-4:actual-equipment": {
        structure: {
          category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_MODEM",
        },
      },
    }).mockResolvedValueOnce({
      "core-model-1-4:actual-equipment": {
        structure: {
          category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
        },
      },
    });


    const response = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentCategory(
      mountName,
      equipmentUuidList,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(response).toEqual({
      "equipmentUuidOfModemCategory": "ODU-B",
      "equipmentUuidOfRadioCategory": "AGS-20 IDU",
      "traceIndicatorIncrementer": 40
    });

    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalledTimes(2);
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(2);

  });

  test("should handle errors gracefully", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValue(new Error("Mocked error"));

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

    const response = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentCategory(
      mountName,
      equipmentUuidList,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(response).toEqual({
      traceIndicatorIncrementer: traceIndicatorIncrementer,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.EquipmentCategory is not success with Error: Mocked error")
    );

    consoleSpy.mockRestore();
  });
});

describe("RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionHolderLabel", () => {
  const mountName = "513250007";
  const requestHeaders = {
    user: undefined,
    originator: "AccessPlanningToolProxy",
    xCorrelator: "a3Bb05ed-BDfC-3243-df7b-b8dDC60Cd85D",
    traceIndicator: "1",
    customerJourney: "unknown",
  };
  const equipmentCategoryResponse = {
    "equipmentUuidOfModemCategory": "HUAWEI-EQUIPMENT-1",
    "equipmentUuidOfRadioCategory": "WIRE-EQUIPMENT-6",
    "traceIndicatorIncrementer": 40
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return a valid position when forwardRequest provides holder label response", async () => {
    const mockEquipmentHolderLabelResponse = {
      "core-model-1-4:control-construct": [
        {
          "uuid": "NE(99-49037) - CO-13619",
          "equipment": [
            {
              "uuid": "HUAWEI-EQUIPMENT-1",
              "contained-holder": [
                {
                  "local-id": "WIRE-EQUIPMENT-6",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "OptiXRTN950N"
                  },
                  "occupying-fru": "WIRE-EQUIPMENT-6"
                },
                {
                  "local-id": "AIR-EQUIPMENT-5",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "OptiXRTN950N"
                  },
                  "occupying-fru": "AIR-EQUIPMENT-5"
                },
                {
                  "local-id": "WIRE-EQUIPMENT-4",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "OptiXRTN950N"
                  },
                  "occupying-fru": "WIRE-EQUIPMENT-4"
                }
              ]
            },
            {
              "uuid": "WIRE-EQUIPMENT-4-2"
            },
            {
              "uuid": "WIRE-EQUIPMENT-4-1"
            },
            {
              "uuid": "WIRE-EQUIPMENT-4-4"
            },
            {
              "uuid": "WIRE-EQUIPMENT-6-2"
            },
            {
              "uuid": "WIRE-EQUIPMENT-4-3"
            },
            {
              "uuid": "WIRE-EQUIPMENT-6-1"
            },
            {
              "uuid": "AIR-EQUIPMENT-5",
              "contained-holder": [
                {
                  "local-id": "AIR-EQUIPMENT-5-1",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "SL91ISM6"
                  },
                  "occupying-fru": "AIR-EQUIPMENT-5-1"
                },
                {
                  "local-id": "AIR-EQUIPMENT-5-2",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "SL91ISM6"
                  },
                  "occupying-fru": "AIR-EQUIPMENT-5-2"
                }
              ]
            },
            {
              "uuid": "WIRE-EQUIPMENT-6-4"
            },
            {
              "uuid": "WIRE-EQUIPMENT-6-3"
            },
            {
              "uuid": "AIR-EQUIPMENT-5-1"
            },
            {
              "uuid": "AIR-EQUIPMENT-5-2"
            },
            {
              "uuid": "WIRE-EQUIPMENT-6",
              "contained-holder": [
                {
                  "local-id": "WIRE-EQUIPMENT-6-2",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "SL91EG4"
                  },
                  "occupying-fru": "WIRE-EQUIPMENT-6-2"
                },
                {
                  "local-id": "WIRE-EQUIPMENT-6-1",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "SL91EG4"
                  },
                  "occupying-fru": "WIRE-EQUIPMENT-6-1"
                },
                {
                  "local-id": "WIRE-EQUIPMENT-6-4",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "SL91EG4"
                  },
                  "occupying-fru": "WIRE-EQUIPMENT-6-4"
                },
                {
                  "local-id": "WIRE-EQUIPMENT-6-3",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "SL91EG4"
                  },
                  "occupying-fru": "WIRE-EQUIPMENT-6-3"
                }
              ]
            },
            {
              "uuid": "WIRE-EQUIPMENT-4",
              "contained-holder": [
                {
                  "local-id": "WIRE-EQUIPMENT-4-4",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "SL91EG4"
                  },
                  "occupying-fru": "WIRE-EQUIPMENT-4-4"
                },
                {
                  "local-id": "WIRE-EQUIPMENT-4-3",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "SL91EG4"
                  },
                  "occupying-fru": "WIRE-EQUIPMENT-4-3"
                },
                {
                  "local-id": "WIRE-EQUIPMENT-4-2",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "SL91EG4"
                  },
                  "occupying-fru": "WIRE-EQUIPMENT-4-2"
                },
                {
                  "local-id": "WIRE-EQUIPMENT-4-1",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "SL91EG4"
                  },
                  "occupying-fru": "WIRE-EQUIPMENT-4-1"
                }
              ]
            }
          ]
        }
      ]
    };
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue(mockEquipmentHolderLabelResponse);

    const response = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionHolderLabel(
      mountName,
      equipmentCategoryResponse,
      requestHeaders
    );

    expect(response).toEqual({
      traceIndicatorIncrementer: 41,
      positionOfModemBoard: "OptiXRTN950N",
    });

    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalledTimes(1);
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(1);
  });

  test("should return an empty position when forwardRequest gives an empty response", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue({});

    const response = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionHolderLabel(
      mountName,
      equipmentCategoryResponse,
      requestHeaders
    );

    expect(response).toEqual({
      traceIndicatorIncrementer: 41,
      positionOfModemBoard: "",
    });

    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalledTimes(1);
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(1);
  });

  test("should handle errors gracefully", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValue(new Error("Mocked error"));

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

    const response = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionHolderLabel(
      mountName,
      equipmentCategoryResponse,
      requestHeaders
    );

    expect(response).toEqual({
      traceIndicatorIncrementer: 40,
      positionOfModemBoard: "",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.HolderLabel is not success with Error: Mocked error")
    );

    consoleSpy.mockRestore();
  });
});

describe("RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers", () => {
  const mountName = "513250007";
  const requestHeaders = {
    user: undefined,
    originator: "AccessPlanningToolProxy",
    xCorrelator: "a3Bb05ed-BDfC-3243-df7b-b8dDC60Cd85D",
    traceIndicator: "1",
    customerJourney: "unknown",
  };
  const equipmentUuidResponse = {
    equipmentUuidList: [
      "ODU-B",
      "AGS-20 IDU",
    ],
    traceIndicatorIncrementer: 35,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });


  test("should return valid equipmentInfo when forwardRequest provides valid responses", async () => {
    const mockEquipmentInfoResponse1 = {
      "core-model-1-4:actual-equipment": {
        "manufactured-thing": {
          "equipment-type": {
            "part-type-identifier": "GE8704-52",
            "type-name": "ASNK-18G",
          },
          "equipment-instance": {
            "serial-number": "101821827000620",
          },
        },
        structure: {
          category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
        },
      },
    };
    const mockEquipmentInfoResponse2 = {
      "core-model-1-4:actual-equipment": {
        "manufactured-thing": {
          "equipment-type": {
            "part-type-identifier": "GAI0234-3",
            "type-name": "AGS-20",
          },
          "equipment-instance": {
            "serial-number": "10182245100011A",
          },
        },
        structure: {
          category: "core-model-1-4:EQUIPMENT_CATEGORY_SUBRACK",
        },
      },
    };

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest
      .mockResolvedValueOnce(mockEquipmentInfoResponse1)
      .mockResolvedValueOnce(mockEquipmentInfoResponse2);

    const response = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers(
      mountName,
      equipmentUuidResponse,
      requestHeaders
    );

    expect(response).toHaveProperty("traceIndicatorIncrementer", 37);
    expect(response).toHaveProperty("equipmentInfo");
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(2);
  });


  test("should return an empty equipmentInfo when forwardRequest provides empty responses", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
    IndividualServiceUtility.forwardRequest.mockResolvedValue({}); // Simulate empty response

    const response = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers(
      mountName,
      equipmentUuidResponse,
      requestHeaders
    );


    expect(response).toEqual({
      traceIndicatorIncrementer: 37,
      equipmentInfo: {}, // `formulateEquipmentInfo` should handle empty input
    });

    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalledTimes(2);
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(2);
  });

  test("should handle errors gracefully", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValue(new Error("Mocked error"));

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

    const response = await ReadInventoryData_Private.RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers(
      mountName,
      equipmentUuidResponse,
      requestHeaders
    );

    expect(response).toEqual({
      traceIndicatorIncrementer: 35,
      equipmentInfo: {},
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers is not success with Error: Mocked error")
    );

    consoleSpy.mockRestore();
  });
});

describe("FetchConfiguredGroupOfAirInterfaces", () => {

  const mountName = "513250007";
  const requestHeaders = {
    user: "admin",
    originator: "AccessPlanningToolProxy",
    xCorrelator: "8e74B4C2-c2cc-c59f-72Ef-eB97bea72d4b",
    traceIndicator: "1",
    customerJourney: "unknown",
  };
  const ltpStructure = {
    "core-model-1-4:control-construct": [
      {
        "logical-termination-point": [
          {
            uuid: "LTP-ETC-TTP-LAN-1-XG-SFP",
            "client-ltp": [
              "LTP-MAC-TTP-LAN-1-XG-SFP",
            ],
            "server-ltp": [
              "LTP-MWS-LAN-1-XG-SFP",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETC-TTP-LAN-1-XG-SFP",
                "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETC-TTP-LAN-2-XG-SFP",
            "client-ltp": [
              "LTP-MAC-TTP-LAN-2-XG-SFP",
            ],
            "server-ltp": [
              "LTP-MWS-LAN-2-XG-SFP",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETC-TTP-LAN-2-XG-SFP",
                "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
              },
            ],
          },
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
          },
          {
            uuid: "LTP-ETC-TTP-LAN-1-COMBO",
            "client-ltp": [
              "LTP-MAC-TTP-LAN-1-COMBO",
            ],
            "server-ltp": [
              "LTP-MWS-LAN-1-COMBO",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETC-TTP-LAN-1-COMBO",
                "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-MAC-TTP-LAN-1-COMBO",
            "client-ltp": [
              "LTP-VLAN-TTP-LAN-1-COMBO",
            ],
            "server-ltp": [
              "LTP-ETC-TTP-LAN-1-COMBO",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-MAC-TTP-LAN-1-COMBO",
                "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-MAC-TTP-LAN-1-XG-SFP",
            "client-ltp": [
              "LTP-VLAN-TTP-LAN-1-XG-SFP",
            ],
            "server-ltp": [
              "LTP-ETC-TTP-LAN-1-XG-SFP",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-MAC-TTP-LAN-1-XG-SFP",
                "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-MAC-TTP-LAN-2-XG-SFP",
            "client-ltp": [
              "LTP-VLAN-TTP-LAN-2-XG-SFP",
            ],
            "server-ltp": [
              "LTP-ETC-TTP-LAN-2-XG-SFP",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-MAC-TTP-LAN-2-XG-SFP",
                "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-MWS-LAN-1-XG-SFP",
            "client-ltp": [
              "LTP-ETC-TTP-LAN-1-XG-SFP",
            ],
            "server-ltp": [
              "LTP-ETY-TTP-LAN-1-XG-SFP",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-MWS-LAN-1-XG-SFP",
                "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETY-TTP-LAN-2-RJ45",
            "client-ltp": [
              "LTP-MWS-LAN-2-COMBO",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETY-TTP-LAN-2-RJ45",
                "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-MWS-LAN-2-XG-SFP",
            "client-ltp": [
              "LTP-ETC-TTP-LAN-2-XG-SFP",
            ],
            "server-ltp": [
              "LTP-ETY-TTP-LAN-2-XG-SFP",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-MWS-LAN-2-XG-SFP",
                "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETY-TTP-LAN-1-SFP",
            "client-ltp": [
              "LTP-MWS-LAN-1-COMBO",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETY-TTP-LAN-1-SFP",
                "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-MAC-TTP-LAN-2-COMBO",
            "client-ltp": [
              "LTP-VLAN-TTP-LAN-2-COMBO",
            ],
            "server-ltp": [
              "LTP-ETC-TTP-LAN-2-COMBO",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-MAC-TTP-LAN-2-COMBO",
                "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-MAC-TTP-LAN-4-RJ45",
            "client-ltp": [
              "LTP-VLAN-TTP-LAN-4-RJ45",
            ],
            "server-ltp": [
              "LTP-ETC-TTP-LAN-4-RJ45",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-MAC-TTP-LAN-4-RJ45",
                "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-VLAN-TTP-ODU-A",
            "server-ltp": [
              "LTP-MAC-TTP-ODU-A",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-VLAN-TTP-ODU-A",
                "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-VLAN-TTP-LAN-1-COMBO",
            "server-ltp": [
              "LTP-MAC-TTP-LAN-1-COMBO",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-VLAN-TTP-LAN-1-COMBO",
                "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-MWS-LAN-4-RJ45",
            "client-ltp": [
              "LTP-ETC-TTP-LAN-4-RJ45",
            ],
            "server-ltp": [
              "LTP-ETY-TTP-LAN-4-RJ45",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-MWS-LAN-4-RJ45",
                "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-MWS-LAN-2-COMBO",
            "client-ltp": [
              "LTP-ETC-TTP-LAN-2-COMBO",
            ],
            "server-ltp": [
              "LTP-ETY-TTP-LAN-2-SFP",
              "LTP-ETY-TTP-LAN-2-RJ45",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-MWS-LAN-2-COMBO",
                "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-MAC-TTP-ODU-A",
            "client-ltp": [
              "LTP-VLAN-TTP-ODU-A",
            ],
            "server-ltp": [
              "LTP-ETC-TTP-ODU-A",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-MAC-TTP-ODU-A",
                "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETC-TTP-LAN-2-COMBO",
            "client-ltp": [
              "LTP-MAC-TTP-LAN-2-COMBO",
            ],
            "server-ltp": [
              "LTP-MWS-LAN-2-COMBO",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETC-TTP-LAN-2-COMBO",
                "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETY-TTP-LAN-2-SFP",
            "client-ltp": [
              "LTP-MWS-LAN-2-COMBO",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETY-TTP-LAN-2-SFP",
                "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETY-TTP-LAN-1-XG-SFP",
            "client-ltp": [
              "LTP-MWS-LAN-1-XG-SFP",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETY-TTP-LAN-1-XG-SFP",
                "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-MWS-LAN-1-COMBO",
            "client-ltp": [
              "LTP-ETC-TTP-LAN-1-COMBO",
            ],
            "server-ltp": [
              "LTP-ETY-TTP-LAN-1-SFP",
              "LTP-ETY-TTP-LAN-1-RJ45",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-MWS-LAN-1-COMBO",
                "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETY-TTP-LAN-2-XG-SFP",
            "client-ltp": [
              "LTP-MWS-LAN-2-XG-SFP",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETY-TTP-LAN-2-XG-SFP",
                "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-VLAN-TTP-LAN-2-COMBO",
            "server-ltp": [
              "LTP-MAC-TTP-LAN-2-COMBO",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-VLAN-TTP-LAN-2-COMBO",
                "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-VLAN-TTP-LAN-4-RJ45",
            "server-ltp": [
              "LTP-MAC-TTP-LAN-4-RJ45",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-VLAN-TTP-LAN-4-RJ45",
                "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-VLAN-TTP-LAN-1-XG-SFP",
            "server-ltp": [
              "LTP-MAC-TTP-LAN-1-XG-SFP",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-VLAN-TTP-LAN-1-XG-SFP",
                "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETC-TTP-LAN-4-RJ45",
            "client-ltp": [
              "LTP-MAC-TTP-LAN-4-RJ45",
            ],
            "server-ltp": [
              "LTP-MWS-LAN-4-RJ45",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETC-TTP-LAN-4-RJ45",
                "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-VLAN-TTP-LAN-2-XG-SFP",
            "server-ltp": [
              "LTP-MAC-TTP-LAN-2-XG-SFP",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-VLAN-TTP-LAN-2-XG-SFP",
                "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-TDM-CTP-ODU-A-1",
            "server-ltp": [
              "LTP-MWS-ODU-A",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-TDM-CTP-ODU-A-1",
                "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-TDM-CTP-ODU-A-2",
            "server-ltp": [
              "LTP-MWS-ODU-A",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-TDM-CTP-ODU-A-2",
                "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-TDM-CTP-ODU-A-3",
            "server-ltp": [
              "LTP-MWS-ODU-A",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-TDM-CTP-ODU-A-3",
                "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-TDM-CTP-ODU-A-4",
            "server-ltp": [
              "LTP-MWS-ODU-A",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-TDM-CTP-ODU-A-4",
                "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-TDM-CTP-ODU-A-5",
            "server-ltp": [
              "LTP-MWS-ODU-A",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-TDM-CTP-ODU-A-5",
                "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETC-TTP-ODU-A",
            "client-ltp": [
              "LTP-MAC-TTP-ODU-A",
            ],
            "server-ltp": [
              "LTP-MWS-ODU-A",
              "LTP-MWS-ODU-B",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETC-TTP-ODU-A",
                "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETY-TTP-LAN-1-RJ45",
            "client-ltp": [
              "LTP-MWS-LAN-1-COMBO",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETY-TTP-LAN-1-RJ45",
                "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-MWS-ODU-A",
            "client-ltp": [
              "LTP-TDM-CTP-ODU-A-5",
              "LTP-ETC-TTP-ODU-A",
              "LTP-TDM-CTP-ODU-A-1",
              "LTP-TDM-CTP-ODU-A-2",
              "LTP-TDM-CTP-ODU-A-3",
              "LTP-TDM-CTP-ODU-A-4",
            ],
            "server-ltp": [
              "LTP-MWPS-TTP-ODU-A",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-MWS-ODU-A",
                "layer-protocol-name": "hybrid-mw-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-MWS-ODU-B",
            "client-ltp": [
              "LTP-ETC-TTP-ODU-A",
            ],
            "server-ltp": [
              "LTP-MWPS-TTP-ODU-B",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-MWS-ODU-B",
                "layer-protocol-name": "hybrid-mw-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETY-TTP-LAN-4-RJ45",
            "client-ltp": [
              "LTP-MWS-LAN-4-RJ45",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETY-TTP-LAN-4-RJ45",
                "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
              },
            ],
          },
        ],
      },
    ],
  };
  const uuidUnderTest = "LTP-MWPS-TTP-ODU-B";
  let traceIndicatorIncrementer = 39;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return a valid configured group of air interfaces", async () => {
    const mockAirInterfaceLtp = {
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
    };
    const mockClientContainerLtp = {
      uuid: "LTP-ETC-TTP-ODU-A",
      "client-ltp": [
        "LTP-MAC-TTP-ODU-A",
      ],
      "server-ltp": [
        "LTP-MWS-ODU-A",
        "LTP-MWS-ODU-B",
      ],
      "layer-protocol": [
        {
          "local-id": "LP-ETC-TTP-ODU-A",
          "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
        },
      ],
    };
    const servingStructureLtp1 = {
      uuid: "LTP-MWS-ODU-A",
      "client-ltp": [
        "LTP-TDM-CTP-ODU-A-5",
        "LTP-ETC-TTP-ODU-A",
        "LTP-TDM-CTP-ODU-A-1",
        "LTP-TDM-CTP-ODU-A-2",
        "LTP-TDM-CTP-ODU-A-3",
        "LTP-TDM-CTP-ODU-A-4",
      ],
      "server-ltp": [
        "LTP-MWPS-TTP-ODU-A",
      ],
      "layer-protocol": [
        {
          "local-id": "LP-MWS-ODU-A",
          "layer-protocol-name": "hybrid-mw-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER",
        },
      ],
    };
    const servingPhysicLtp1 = {
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
    };
    const servingStructureLtp2 = {
      uuid: "LTP-MWS-ODU-B",
      "client-ltp": [
        "LTP-ETC-TTP-ODU-A",
      ],
      "server-ltp": [
        "LTP-MWPS-TTP-ODU-B",
      ],
      "layer-protocol": [
        {
          "local-id": "LP-MWS-ODU-B",
          "layer-protocol-name": "hybrid-mw-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER",
        },
      ],
    };
    const servingPhysicLtp2 = {
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
    };
    const consequentOperationClientAndFieldParams1 = {
      operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-201",
      operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac",
      fields: "original-ltp-name%3Bexternal-label",
    };
    const ltpAugmentResponse1 = {
      "ltp-augment-1-0:ltp-augment-pac": {
        "external-label": "513559992B",
        "original-ltp-name": "ODU A",
      },
    };
    const consequentOperationClientAndFieldParams2 = {
      operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-201",
      operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac",
      fields: "original-ltp-name%3Bexternal-label",
    };
    const ltpAugmentResponse2 = {
      "ltp-augment-1-0:ltp-augment-pac": {
        "external-label": "513559993B",
        "original-ltp-name": "ODU B",
      },
    };


    LtpStructureUtility.getLtpForUuidFromLtpStructure.mockResolvedValueOnce(mockAirInterfaceLtp).mockResolvedValueOnce(servingStructureLtp1).mockResolvedValueOnce(servingPhysicLtp1).mockResolvedValueOnce(servingStructureLtp2).mockResolvedValueOnce(servingPhysicLtp2);
    LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure.mockResolvedValue(mockClientContainerLtp);
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce(consequentOperationClientAndFieldParams1).mockResolvedValueOnce(consequentOperationClientAndFieldParams2);
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce(ltpAugmentResponse1).mockResolvedValueOnce(ltpAugmentResponse2);
    //getServingPhysicLtpList.mockResolvedValue(mockServingPhysicLtpList);
    //getLtpDesignation.mockResolvedValue(mockLtpDesignationResponse);

    const response = await ReadInventoryData_Private.FetchConfiguredGroupOfAirInterfaces(
      mountName,
      ltpStructure,
      uuidUnderTest,
      requestHeaders,
      traceIndicatorIncrementer
    );


    expect(response).toEqual({
      configuredGroupOfAirInterfaceList: [
        {
          linkId: "513559992B",
        },
        {
          linkId: "513559993B",
        },
      ],
      traceIndicatorIncrementer: 41,
    });

  });

  test("should return empty list when no servingPhysicLtpList found", async () => {
    LtpStructureUtility.getLtpForUuidFromLtpStructure.mockResolvedValue({});
    LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure.mockResolvedValue({});
    // ReadInventoryData_Private.getServingPhysicLtpList.mockResolvedValue([]);

    const response = await ReadInventoryData_Private.FetchConfiguredGroupOfAirInterfaces(
      mountName,
      ltpStructure,
      uuidUnderTest,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(response).toEqual({
      configuredGroupOfAirInterfaceList: [],
      traceIndicatorIncrementer: 39,
    });
  });

  test("should handle errors gracefully", async () => {
    LtpStructureUtility.getLtpForUuidFromLtpStructure.mockRejectedValue(new Error("Mocked error"));
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

    const result = await ReadInventoryData_Private.FetchConfiguredGroupOfAirInterfaces(
      mountName,
      ltpStructure,
      uuidUnderTest,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      configuredGroupOfAirInterfaceList: [],
      traceIndicatorIncrementer: 39,
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    consoleSpy.mockRestore();
  });
});

describe("getServingPhysicLtpList", () => {
  let clientContainerLtp, ltpStructure;

  beforeEach(() => {
    clientContainerLtp = {
      uuid: "LTP-ETC-TTP-ODU-A",
      "client-ltp": [
        "LTP-MAC-TTP-ODU-A",
      ],
      "server-ltp": [
        "LTP-MWS-ODU-A",
        "LTP-MWS-ODU-B",
      ],
      "layer-protocol": [
        {
          "local-id": "LP-ETC-TTP-ODU-A",
          "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
        },
      ],
    };
    ltpStructure = {
      "core-model-1-4:control-construct": [
        {
          "logical-termination-point": [
            {
              uuid: "LTP-ETC-TTP-LAN-1-XG-SFP",
              "client-ltp": [
                "LTP-MAC-TTP-LAN-1-XG-SFP",
              ],
              "server-ltp": [
                "LTP-MWS-LAN-1-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETC-TTP-LAN-1-XG-SFP",
                  "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETC-TTP-LAN-2-XG-SFP",
              "client-ltp": [
                "LTP-MAC-TTP-LAN-2-XG-SFP",
              ],
              "server-ltp": [
                "LTP-MWS-LAN-2-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETC-TTP-LAN-2-XG-SFP",
                  "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                },
              ],
            },
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
            },
            {
              uuid: "LTP-ETC-TTP-LAN-1-COMBO",
              "client-ltp": [
                "LTP-MAC-TTP-LAN-1-COMBO",
              ],
              "server-ltp": [
                "LTP-MWS-LAN-1-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETC-TTP-LAN-1-COMBO",
                  "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MAC-TTP-LAN-1-COMBO",
              "client-ltp": [
                "LTP-VLAN-TTP-LAN-1-COMBO",
              ],
              "server-ltp": [
                "LTP-ETC-TTP-LAN-1-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MAC-TTP-LAN-1-COMBO",
                  "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MAC-TTP-LAN-1-XG-SFP",
              "client-ltp": [
                "LTP-VLAN-TTP-LAN-1-XG-SFP",
              ],
              "server-ltp": [
                "LTP-ETC-TTP-LAN-1-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MAC-TTP-LAN-1-XG-SFP",
                  "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MAC-TTP-LAN-2-XG-SFP",
              "client-ltp": [
                "LTP-VLAN-TTP-LAN-2-XG-SFP",
              ],
              "server-ltp": [
                "LTP-ETC-TTP-LAN-2-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MAC-TTP-LAN-2-XG-SFP",
                  "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-LAN-1-XG-SFP",
              "client-ltp": [
                "LTP-ETC-TTP-LAN-1-XG-SFP",
              ],
              "server-ltp": [
                "LTP-ETY-TTP-LAN-1-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-LAN-1-XG-SFP",
                  "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-2-RJ45",
              "client-ltp": [
                "LTP-MWS-LAN-2-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-2-RJ45",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-LAN-2-XG-SFP",
              "client-ltp": [
                "LTP-ETC-TTP-LAN-2-XG-SFP",
              ],
              "server-ltp": [
                "LTP-ETY-TTP-LAN-2-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-LAN-2-XG-SFP",
                  "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-1-SFP",
              "client-ltp": [
                "LTP-MWS-LAN-1-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-1-SFP",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MAC-TTP-LAN-2-COMBO",
              "client-ltp": [
                "LTP-VLAN-TTP-LAN-2-COMBO",
              ],
              "server-ltp": [
                "LTP-ETC-TTP-LAN-2-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MAC-TTP-LAN-2-COMBO",
                  "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MAC-TTP-LAN-4-RJ45",
              "client-ltp": [
                "LTP-VLAN-TTP-LAN-4-RJ45",
              ],
              "server-ltp": [
                "LTP-ETC-TTP-LAN-4-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MAC-TTP-LAN-4-RJ45",
                  "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-VLAN-TTP-ODU-A",
              "server-ltp": [
                "LTP-MAC-TTP-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-VLAN-TTP-ODU-A",
                  "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-VLAN-TTP-LAN-1-COMBO",
              "server-ltp": [
                "LTP-MAC-TTP-LAN-1-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-VLAN-TTP-LAN-1-COMBO",
                  "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-LAN-4-RJ45",
              "client-ltp": [
                "LTP-ETC-TTP-LAN-4-RJ45",
              ],
              "server-ltp": [
                "LTP-ETY-TTP-LAN-4-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-LAN-4-RJ45",
                  "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-LAN-2-COMBO",
              "client-ltp": [
                "LTP-ETC-TTP-LAN-2-COMBO",
              ],
              "server-ltp": [
                "LTP-ETY-TTP-LAN-2-SFP",
                "LTP-ETY-TTP-LAN-2-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-LAN-2-COMBO",
                  "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MAC-TTP-ODU-A",
              "client-ltp": [
                "LTP-VLAN-TTP-ODU-A",
              ],
              "server-ltp": [
                "LTP-ETC-TTP-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MAC-TTP-ODU-A",
                  "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETC-TTP-LAN-2-COMBO",
              "client-ltp": [
                "LTP-MAC-TTP-LAN-2-COMBO",
              ],
              "server-ltp": [
                "LTP-MWS-LAN-2-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETC-TTP-LAN-2-COMBO",
                  "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-2-SFP",
              "client-ltp": [
                "LTP-MWS-LAN-2-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-2-SFP",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-1-XG-SFP",
              "client-ltp": [
                "LTP-MWS-LAN-1-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-1-XG-SFP",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-LAN-1-COMBO",
              "client-ltp": [
                "LTP-ETC-TTP-LAN-1-COMBO",
              ],
              "server-ltp": [
                "LTP-ETY-TTP-LAN-1-SFP",
                "LTP-ETY-TTP-LAN-1-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-LAN-1-COMBO",
                  "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-2-XG-SFP",
              "client-ltp": [
                "LTP-MWS-LAN-2-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-2-XG-SFP",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-VLAN-TTP-LAN-2-COMBO",
              "server-ltp": [
                "LTP-MAC-TTP-LAN-2-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-VLAN-TTP-LAN-2-COMBO",
                  "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-VLAN-TTP-LAN-4-RJ45",
              "server-ltp": [
                "LTP-MAC-TTP-LAN-4-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-VLAN-TTP-LAN-4-RJ45",
                  "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-VLAN-TTP-LAN-1-XG-SFP",
              "server-ltp": [
                "LTP-MAC-TTP-LAN-1-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-VLAN-TTP-LAN-1-XG-SFP",
                  "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETC-TTP-LAN-4-RJ45",
              "client-ltp": [
                "LTP-MAC-TTP-LAN-4-RJ45",
              ],
              "server-ltp": [
                "LTP-MWS-LAN-4-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETC-TTP-LAN-4-RJ45",
                  "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-VLAN-TTP-LAN-2-XG-SFP",
              "server-ltp": [
                "LTP-MAC-TTP-LAN-2-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-VLAN-TTP-LAN-2-XG-SFP",
                  "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-TDM-CTP-ODU-A-1",
              "server-ltp": [
                "LTP-MWS-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-TDM-CTP-ODU-A-1",
                  "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-TDM-CTP-ODU-A-2",
              "server-ltp": [
                "LTP-MWS-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-TDM-CTP-ODU-A-2",
                  "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-TDM-CTP-ODU-A-3",
              "server-ltp": [
                "LTP-MWS-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-TDM-CTP-ODU-A-3",
                  "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-TDM-CTP-ODU-A-4",
              "server-ltp": [
                "LTP-MWS-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-TDM-CTP-ODU-A-4",
                  "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-TDM-CTP-ODU-A-5",
              "server-ltp": [
                "LTP-MWS-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-TDM-CTP-ODU-A-5",
                  "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETC-TTP-ODU-A",
              "client-ltp": [
                "LTP-MAC-TTP-ODU-A",
              ],
              "server-ltp": [
                "LTP-MWS-ODU-A",
                "LTP-MWS-ODU-B",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETC-TTP-ODU-A",
                  "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-1-RJ45",
              "client-ltp": [
                "LTP-MWS-LAN-1-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-1-RJ45",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-ODU-A",
              "client-ltp": [
                "LTP-TDM-CTP-ODU-A-5",
                "LTP-ETC-TTP-ODU-A",
                "LTP-TDM-CTP-ODU-A-1",
                "LTP-TDM-CTP-ODU-A-2",
                "LTP-TDM-CTP-ODU-A-3",
                "LTP-TDM-CTP-ODU-A-4",
              ],
              "server-ltp": [
                "LTP-MWPS-TTP-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-ODU-A",
                  "layer-protocol-name": "hybrid-mw-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-ODU-B",
              "client-ltp": [
                "LTP-ETC-TTP-ODU-A",
              ],
              "server-ltp": [
                "LTP-MWPS-TTP-ODU-B",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-ODU-B",
                  "layer-protocol-name": "hybrid-mw-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-4-RJ45",
              "client-ltp": [
                "LTP-MWS-LAN-4-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-4-RJ45",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
          ],
        },
      ],
    };
    jest.clearAllMocks();
  });

  servingStructureLtp1 = {
    uuid: "LTP-MWS-ODU-A",
    "client-ltp": [
      "LTP-TDM-CTP-ODU-A-5",
      "LTP-ETC-TTP-ODU-A",
      "LTP-TDM-CTP-ODU-A-1",
      "LTP-TDM-CTP-ODU-A-2",
      "LTP-TDM-CTP-ODU-A-3",
      "LTP-TDM-CTP-ODU-A-4",
    ],
    "server-ltp": [
      "LTP-MWPS-TTP-ODU-A",
    ],
    "layer-protocol": [
      {
        "local-id": "LP-MWS-ODU-A",
        "layer-protocol-name": "hybrid-mw-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER",
      },
    ],
  };

  servingStructureLtp2 = {
    uuid: "LTP-MWS-ODU-B",
    "client-ltp": [
      "LTP-ETC-TTP-ODU-A",
    ],
    "server-ltp": [
      "LTP-MWPS-TTP-ODU-B",
    ],
    "layer-protocol": [
      {
        "local-id": "LP-MWS-ODU-B",
        "layer-protocol-name": "hybrid-mw-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER",
      },
    ],
  };

  servingPhysicLtp1 = {
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
  };

  servingPhysicLtp2 = {
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
  };





  it("should return the serving physical LTP list when data is available", async () => {
    //   LtpStructureUtility.getLtpForUuidFromLtpStructure
    //     .mockImplementation(async (uuid, structure) => structure[uuid]);

    // LtpStructureUtility.getLtpForUuidFromLtpStructure.mockRejectedValueOnce()
    LtpStructureUtility.getLtpForUuidFromLtpStructure.mockResolvedValueOnce(servingStructureLtp1).mockResolvedValueOnce(servingPhysicLtp1).mockResolvedValueOnce(servingStructureLtp2).mockResolvedValueOnce(servingPhysicLtp2);
    const result = await ReadInventoryData_Private.getServingPhysicLtpList(clientContainerLtp, ltpStructure);

    expect(result).toEqual([
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
      },
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
  });

  it("should return an empty list when no serving LTPs are found", async () => {
    clientContainerLtp = { serverLtp: [] };
    LtpStructureUtility.getLtpForUuidFromLtpStructure.mockResolvedValueOnce(undefined);

    const result = await ReadInventoryData_Private.getServingPhysicLtpList(clientContainerLtp, ltpStructure);
    expect(result).toEqual([]);
  });

  it("should handle errors and return an empty list", async () => {
    LtpStructureUtility.getLtpForUuidFromLtpStructure.mockRejectedValueOnce(new Error("Test error"));

    const result = await ReadInventoryData_Private.getServingPhysicLtpList(clientContainerLtp, ltpStructure);
    expect(result).toEqual([]);
  });
});

//----------------------------------------------------------------
describe("getLtpDesignation", () => {
  let mountName, ltp, requestHeaders, traceIndicatorIncrementer;

  beforeEach(() => {
    mountName = "513250007";
    ltp = {
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
    };
    requestHeaders = {
      user: "admin",
      originator: "AccessPlanningToolProxy",
      xCorrelator: "42EFeA3f-bc39-a5D9-AA14-FFDA2dB732ec",
      traceIndicator: "1",
      customerJourney: "unknown",
    };
    traceIndicatorIncrementer = 39;
    jest.clearAllMocks();
  });

  it("should return the LTP designation when the response is successful", async () => {
    const ltpAugmentResponseMock = {
      "ltp-augment-1-0:ltp-augment-pac": { "original-ltp-name": "test-ltp", "external-label": "test-label" }
    };

    const consequentOperationClientAndFieldParams = {
      operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-201",
      operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac",
      fields: "original-ltp-name%3Bexternal-label",
    };
    const ltpAugmentResponse = {
      "ltp-augment-1-0:ltp-augment-pac": {
        "external-label": "513559992B",
        "original-ltp-name": "ODU A",
      },
    };

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce(consequentOperationClientAndFieldParams);
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce(ltpAugmentResponse);

    const result = await ReadInventoryData_Private.getLtpDesignation(
      mountName,
      ltp,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual(
      {
        ltpDesignation: {
          "external-label": "513559992B",
          "original-ltp-name": "ODU A",
        },
        traceIndicatorIncrementer: 40,
      }
    );
  });

  it("should return an empty response if no LTP designation is found", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce({});
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce({});

    const result = await ReadInventoryData_Private.getLtpDesignation(
      mountName,
      ltp,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      ltpDesignation: undefined,
      traceIndicatorIncrementer: traceIndicatorIncrementer + 1,
    });
  });

  it("should handle errors and return only the traceIndicatorIncrementer", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValueOnce(new Error("Test error"));

    const result = await ReadInventoryData_Private.getLtpDesignation(
      mountName,
      ltp,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      ltpDesignation: undefined,
      traceIndicatorIncrementer: traceIndicatorIncrementer,
    });
  });
});

describe('FetchPluggedSfpPmdList1', () => {

  const rewire = require('rewire');
  const moduleUnderTest = rewire('../ReadInventoryData'); // update this path accordingly

  const FetchPluggedSfpPmdList = moduleUnderTest.__get__('FetchPluggedSfpPmdList');

  // Mocking onfAttributes module
  jest.mock('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');


  describe('FetchPluggedSfpPmdList', () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a populated pluggedSfpPmdListResponse', async () => {
      const mockMountName = '513250007';
      const mockLtpStructure = {
        "core-model-1-4:control-construct": [
          {
            "logical-termination-point": [
              {
                uuid: "LTP-ETC-TTP-LAN-1-XG-SFP",
                "client-ltp": [
                  "LTP-MAC-TTP-LAN-1-XG-SFP",
                ],
                "server-ltp": [
                  "LTP-MWS-LAN-1-XG-SFP",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-ETC-TTP-LAN-1-XG-SFP",
                    "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-ETC-TTP-LAN-2-XG-SFP",
                "client-ltp": [
                  "LTP-MAC-TTP-LAN-2-XG-SFP",
                ],
                "server-ltp": [
                  "LTP-MWS-LAN-2-XG-SFP",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-ETC-TTP-LAN-2-XG-SFP",
                    "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                  },
                ],
              },
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
              },
              {
                uuid: "LTP-ETC-TTP-LAN-1-COMBO",
                "client-ltp": [
                  "LTP-MAC-TTP-LAN-1-COMBO",
                ],
                "server-ltp": [
                  "LTP-MWS-LAN-1-COMBO",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-ETC-TTP-LAN-1-COMBO",
                    "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-MAC-TTP-LAN-1-COMBO",
                "client-ltp": [
                  "LTP-VLAN-TTP-LAN-1-COMBO",
                ],
                "server-ltp": [
                  "LTP-ETC-TTP-LAN-1-COMBO",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-MAC-TTP-LAN-1-COMBO",
                    "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-MAC-TTP-LAN-1-XG-SFP",
                "client-ltp": [
                  "LTP-VLAN-TTP-LAN-1-XG-SFP",
                ],
                "server-ltp": [
                  "LTP-ETC-TTP-LAN-1-XG-SFP",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-MAC-TTP-LAN-1-XG-SFP",
                    "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-MAC-TTP-LAN-2-XG-SFP",
                "client-ltp": [
                  "LTP-VLAN-TTP-LAN-2-XG-SFP",
                ],
                "server-ltp": [
                  "LTP-ETC-TTP-LAN-2-XG-SFP",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-MAC-TTP-LAN-2-XG-SFP",
                    "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-MWS-LAN-1-XG-SFP",
                "client-ltp": [
                  "LTP-ETC-TTP-LAN-1-XG-SFP",
                ],
                "server-ltp": [
                  "LTP-ETY-TTP-LAN-1-XG-SFP",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-MWS-LAN-1-XG-SFP",
                    "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-ETY-TTP-LAN-2-RJ45",
                "client-ltp": [
                  "LTP-MWS-LAN-2-COMBO",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-ETY-TTP-LAN-2-RJ45",
                    "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-MWS-LAN-2-XG-SFP",
                "client-ltp": [
                  "LTP-ETC-TTP-LAN-2-XG-SFP",
                ],
                "server-ltp": [
                  "LTP-ETY-TTP-LAN-2-XG-SFP",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-MWS-LAN-2-XG-SFP",
                    "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-ETY-TTP-LAN-1-SFP",
                "client-ltp": [
                  "LTP-MWS-LAN-1-COMBO",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-ETY-TTP-LAN-1-SFP",
                    "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-MAC-TTP-LAN-2-COMBO",
                "client-ltp": [
                  "LTP-VLAN-TTP-LAN-2-COMBO",
                ],
                "server-ltp": [
                  "LTP-ETC-TTP-LAN-2-COMBO",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-MAC-TTP-LAN-2-COMBO",
                    "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-MAC-TTP-LAN-4-RJ45",
                "client-ltp": [
                  "LTP-VLAN-TTP-LAN-4-RJ45",
                ],
                "server-ltp": [
                  "LTP-ETC-TTP-LAN-4-RJ45",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-MAC-TTP-LAN-4-RJ45",
                    "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-VLAN-TTP-ODU-A",
                "server-ltp": [
                  "LTP-MAC-TTP-ODU-A",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-VLAN-TTP-ODU-A",
                    "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-VLAN-TTP-LAN-1-COMBO",
                "server-ltp": [
                  "LTP-MAC-TTP-LAN-1-COMBO",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-VLAN-TTP-LAN-1-COMBO",
                    "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-MWS-LAN-4-RJ45",
                "client-ltp": [
                  "LTP-ETC-TTP-LAN-4-RJ45",
                ],
                "server-ltp": [
                  "LTP-ETY-TTP-LAN-4-RJ45",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-MWS-LAN-4-RJ45",
                    "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-MWS-LAN-2-COMBO",
                "client-ltp": [
                  "LTP-ETC-TTP-LAN-2-COMBO",
                ],
                "server-ltp": [
                  "LTP-ETY-TTP-LAN-2-SFP",
                  "LTP-ETY-TTP-LAN-2-RJ45",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-MWS-LAN-2-COMBO",
                    "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-MAC-TTP-ODU-A",
                "client-ltp": [
                  "LTP-VLAN-TTP-ODU-A",
                ],
                "server-ltp": [
                  "LTP-ETC-TTP-ODU-A",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-MAC-TTP-ODU-A",
                    "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-ETC-TTP-LAN-2-COMBO",
                "client-ltp": [
                  "LTP-MAC-TTP-LAN-2-COMBO",
                ],
                "server-ltp": [
                  "LTP-MWS-LAN-2-COMBO",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-ETC-TTP-LAN-2-COMBO",
                    "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-ETY-TTP-LAN-2-SFP",
                "client-ltp": [
                  "LTP-MWS-LAN-2-COMBO",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-ETY-TTP-LAN-2-SFP",
                    "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-ETY-TTP-LAN-1-XG-SFP",
                "client-ltp": [
                  "LTP-MWS-LAN-1-XG-SFP",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-ETY-TTP-LAN-1-XG-SFP",
                    "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-MWS-LAN-1-COMBO",
                "client-ltp": [
                  "LTP-ETC-TTP-LAN-1-COMBO",
                ],
                "server-ltp": [
                  "LTP-ETY-TTP-LAN-1-SFP",
                  "LTP-ETY-TTP-LAN-1-RJ45",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-MWS-LAN-1-COMBO",
                    "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-ETY-TTP-LAN-2-XG-SFP",
                "client-ltp": [
                  "LTP-MWS-LAN-2-XG-SFP",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-ETY-TTP-LAN-2-XG-SFP",
                    "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-VLAN-TTP-LAN-2-COMBO",
                "server-ltp": [
                  "LTP-MAC-TTP-LAN-2-COMBO",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-VLAN-TTP-LAN-2-COMBO",
                    "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-VLAN-TTP-LAN-4-RJ45",
                "server-ltp": [
                  "LTP-MAC-TTP-LAN-4-RJ45",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-VLAN-TTP-LAN-4-RJ45",
                    "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-VLAN-TTP-LAN-1-XG-SFP",
                "server-ltp": [
                  "LTP-MAC-TTP-LAN-1-XG-SFP",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-VLAN-TTP-LAN-1-XG-SFP",
                    "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-ETC-TTP-LAN-4-RJ45",
                "client-ltp": [
                  "LTP-MAC-TTP-LAN-4-RJ45",
                ],
                "server-ltp": [
                  "LTP-MWS-LAN-4-RJ45",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-ETC-TTP-LAN-4-RJ45",
                    "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-VLAN-TTP-LAN-2-XG-SFP",
                "server-ltp": [
                  "LTP-MAC-TTP-LAN-2-XG-SFP",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-VLAN-TTP-LAN-2-XG-SFP",
                    "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-TDM-CTP-ODU-A-1",
                "server-ltp": [
                  "LTP-MWS-ODU-A",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-TDM-CTP-ODU-A-1",
                    "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-TDM-CTP-ODU-A-2",
                "server-ltp": [
                  "LTP-MWS-ODU-A",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-TDM-CTP-ODU-A-2",
                    "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-TDM-CTP-ODU-A-3",
                "server-ltp": [
                  "LTP-MWS-ODU-A",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-TDM-CTP-ODU-A-3",
                    "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-TDM-CTP-ODU-A-4",
                "server-ltp": [
                  "LTP-MWS-ODU-A",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-TDM-CTP-ODU-A-4",
                    "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-TDM-CTP-ODU-A-5",
                "server-ltp": [
                  "LTP-MWS-ODU-A",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-TDM-CTP-ODU-A-5",
                    "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-ETC-TTP-ODU-A",
                "client-ltp": [
                  "LTP-MAC-TTP-ODU-A",
                ],
                "server-ltp": [
                  "LTP-MWS-ODU-A",
                  "LTP-MWS-ODU-B",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-ETC-TTP-ODU-A",
                    "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-ETY-TTP-LAN-1-RJ45",
                "client-ltp": [
                  "LTP-MWS-LAN-1-COMBO",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-ETY-TTP-LAN-1-RJ45",
                    "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-MWS-ODU-A",
                "client-ltp": [
                  "LTP-TDM-CTP-ODU-A-5",
                  "LTP-ETC-TTP-ODU-A",
                  "LTP-TDM-CTP-ODU-A-1",
                  "LTP-TDM-CTP-ODU-A-2",
                  "LTP-TDM-CTP-ODU-A-3",
                  "LTP-TDM-CTP-ODU-A-4",
                ],
                "server-ltp": [
                  "LTP-MWPS-TTP-ODU-A",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-MWS-ODU-A",
                    "layer-protocol-name": "hybrid-mw-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-MWS-ODU-B",
                "client-ltp": [
                  "LTP-ETC-TTP-ODU-A",
                ],
                "server-ltp": [
                  "LTP-MWPS-TTP-ODU-B",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-MWS-ODU-B",
                    "layer-protocol-name": "hybrid-mw-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER",
                  },
                ],
              },
              {
                uuid: "LTP-ETY-TTP-LAN-4-RJ45",
                "client-ltp": [
                  "LTP-MWS-LAN-4-RJ45",
                ],
                "layer-protocol": [
                  {
                    "local-id": "LP-ETY-TTP-LAN-4-RJ45",
                    "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                  },
                ],
              },
            ],
          },
        ],
      };
      const mockRequestHeaders = {
        user: "admin",
        originator: "AccessPlanningToolProxy",
        xCorrelator: "9C3d4bAc-67b4-aA6c-957b-FDaE6E12cEB4",
        traceIndicator: "1",
        customerJourney: "unknown",
      };
      let traceIndicatorIncrementer = 41;

      const mockPluggableSfpList = [
        {
          'uuid': 'uuid-1',
          'layer-protocol': [
            {
              'local-id': 'local-1'
            }
          ]
        }
      ];

      const mockPluggableSfpListResponse = {
        pluggableSfpList: [
          {
            uuid: "LTP-ETY-TTP-LAN-1-SFP",
            "client-ltp": [
              "LTP-MWS-LAN-1-COMBO",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETY-TTP-LAN-1-SFP",
                "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETY-TTP-LAN-2-SFP",
            "client-ltp": [
              "LTP-MWS-LAN-2-COMBO",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETY-TTP-LAN-2-SFP",
                "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETY-TTP-LAN-1-XG-SFP",
            "client-ltp": [
              "LTP-MWS-LAN-1-XG-SFP",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETY-TTP-LAN-1-XG-SFP",
                "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
              },
            ],
          },
          {
            uuid: "LTP-ETY-TTP-LAN-2-XG-SFP",
            "client-ltp": [
              "LTP-MWS-LAN-2-XG-SFP",
            ],
            "layer-protocol": [
              {
                "local-id": "LP-ETY-TTP-LAN-2-XG-SFP",
                "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
              },
            ],
          },
        ],
        traceIndicatorIncrementer: 55,
      };

      const wireInterfaceNameResponse1 = {
        wireInterfaceName: "LAN-1-SFP",
        traceIndicatorIncrementer: 56,
      };

      const supportedPmdListResponse1 = {
        supportedPmdList: [
          "1000BASE-LX_FD",
          "10GBASE-LR_FD",
        ],
        traceIndicatorIncrementer: 57,
      };

      const operatedPmdResponse1 = {
        currentlyOperatedPmd: "1000BASE-LX_FD",
        traceIndicatorIncrementer: 58,
      };

      const wireInterfaceNameResponse2 = {
        wireInterfaceName: "LAN-2-SFP",
        traceIndicatorIncrementer: 59,
      };
      const supportedPmdListResponse2 = {
        supportedPmdList: [
          "1000BASE-LX_FD",
          "10GBASE-LR_FD",
        ],
        traceIndicatorIncrementer: 60,
      };
      const operatedPmdResponse2 = {
        currentlyOperatedPmd: "1000BASE-T_HD",
        traceIndicatorIncrementer: 61,
      };
      const wireInterfaceNameResponse3 = {
        wireInterfaceName: "LAN-1-XG-SFP",
        traceIndicatorIncrementer: 62,
      };
      const supportedPmdListResponse3 = {
        supportedPmdList: [
          "1000BASE-LX_FD",
        ],
        traceIndicatorIncrementer: 63,
      };
      const operatedPmdResponse3 = {
        currentlyOperatedPmd: "1000BASE-LX_FD",
        traceIndicatorIncrementer: 64,
      };
      const wireInterfaceNameResponse4 = {
        wireInterfaceName: "LAN-2-XG-SFP",
        traceIndicatorIncrementer: 65,
      };
      const supportedPmdListResponse4 = {
        supportedPmdList: [
          "1000BASE-LX_FD",
          "10GBASE-LR_FD",
        ],
        traceIndicatorIncrementer: 66,
      };
      const operatedPmdResponse4 = {
        currentlyOperatedPmd: "1000BASE-LX_FD",
        traceIndicatorIncrementer: 67,
      };


      // Mocked responses for all async functions
      moduleUnderTest.__set__('getListOfPluggableSfpLtp', jest.fn().mockResolvedValueOnce(mockPluggableSfpListResponse));

      moduleUnderTest.__set__('getWireInterfaceNameForRetrievingSfpInformation', jest.fn().mockResolvedValueOnce(wireInterfaceNameResponse1).mockResolvedValueOnce(wireInterfaceNameResponse2).mockResolvedValueOnce(wireInterfaceNameResponse3).mockResolvedValueOnce(wireInterfaceNameResponse4));

      moduleUnderTest.__set__('getSupportedPmdListForRetrievingSfpInformation', jest.fn().mockResolvedValueOnce(supportedPmdListResponse1).mockResolvedValueOnce(supportedPmdListResponse2).mockResolvedValueOnce(supportedPmdListResponse3).mockResolvedValueOnce(supportedPmdListResponse4));

      moduleUnderTest.__set__('getCurrentlyOperatedPmdForRetrievingSfpInformation', jest.fn().mockResolvedValueOnce(operatedPmdResponse1).mockResolvedValueOnce(operatedPmdResponse2).mockResolvedValueOnce(operatedPmdResponse3).mockResolvedValueOnce(operatedPmdResponse4));

      const result = await FetchPluggedSfpPmdList(
        mockMountName,
        mockLtpStructure,
        mockRequestHeaders,
        traceIndicatorIncrementer
      );

      expect(result).toEqual({
        pluggedSfpPmdList: [
          {
            interfaceName: "LAN-1-SFP",
            supportedPmdList: [
              "1000BASE-LX_FD",
              "10GBASE-LR_FD",
            ],
            currentlyOperatedPmd: "1000BASE-LX_FD",
          },
          {
            interfaceName: "LAN-2-SFP",
            supportedPmdList: [
              "1000BASE-LX_FD",
              "10GBASE-LR_FD",
            ],
            currentlyOperatedPmd: "1000BASE-T_HD",
          },
          {
            interfaceName: "LAN-1-XG-SFP",
            supportedPmdList: [
              "1000BASE-LX_FD",
            ],
            currentlyOperatedPmd: "1000BASE-LX_FD",
          },
          {
            interfaceName: "LAN-2-XG-SFP",
            supportedPmdList: [
              "1000BASE-LX_FD",
              "10GBASE-LR_FD",
            ],
            currentlyOperatedPmd: "1000BASE-LX_FD",
          },
        ],
        traceIndicatorIncrementer: 67,
      });
    });



    it('should handle empty pluggable SFP list', async () => {
      moduleUnderTest.__set__('getListOfPluggableSfpLtp', jest.fn().mockResolvedValue({
        pluggableSfpList: [],
        traceIndicatorIncrementer: 5
      }));

      const result = await FetchPluggedSfpPmdList('mount', {}, {}, 1);
      expect(result).toEqual({
        pluggedSfpPmdList: [],
        traceIndicatorIncrementer: 5
      });
    });

    it('should catch and log errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

      moduleUnderTest.__set__('getListOfPluggableSfpLtp', jest.fn().mockRejectedValue(new Error('Some error')));

      const result = await FetchPluggedSfpPmdList('mount', {}, {}, 1);

      // expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(result).toEqual({
        pluggedSfpPmdList: [],
        traceIndicatorIncrementer: 1
      });

      consoleSpy.mockRestore();
    });

  });
});


describe("getListOfPluggableSfpLtp", () => {
  let mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer;

  beforeEach(() => {
    mountName = "513250007";
    ltpStructure = {
      "core-model-1-4:control-construct": [
        {
          "logical-termination-point": [
            {
              uuid: "LTP-ETC-TTP-LAN-1-XG-SFP",
              "client-ltp": [
                "LTP-MAC-TTP-LAN-1-XG-SFP",
              ],
              "server-ltp": [
                "LTP-MWS-LAN-1-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETC-TTP-LAN-1-XG-SFP",
                  "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETC-TTP-LAN-2-XG-SFP",
              "client-ltp": [
                "LTP-MAC-TTP-LAN-2-XG-SFP",
              ],
              "server-ltp": [
                "LTP-MWS-LAN-2-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETC-TTP-LAN-2-XG-SFP",
                  "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                },
              ],
            },
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
            },
            {
              uuid: "LTP-ETC-TTP-LAN-1-COMBO",
              "client-ltp": [
                "LTP-MAC-TTP-LAN-1-COMBO",
              ],
              "server-ltp": [
                "LTP-MWS-LAN-1-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETC-TTP-LAN-1-COMBO",
                  "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MAC-TTP-LAN-1-COMBO",
              "client-ltp": [
                "LTP-VLAN-TTP-LAN-1-COMBO",
              ],
              "server-ltp": [
                "LTP-ETC-TTP-LAN-1-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MAC-TTP-LAN-1-COMBO",
                  "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MAC-TTP-LAN-1-XG-SFP",
              "client-ltp": [
                "LTP-VLAN-TTP-LAN-1-XG-SFP",
              ],
              "server-ltp": [
                "LTP-ETC-TTP-LAN-1-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MAC-TTP-LAN-1-XG-SFP",
                  "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MAC-TTP-LAN-2-XG-SFP",
              "client-ltp": [
                "LTP-VLAN-TTP-LAN-2-XG-SFP",
              ],
              "server-ltp": [
                "LTP-ETC-TTP-LAN-2-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MAC-TTP-LAN-2-XG-SFP",
                  "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-LAN-1-XG-SFP",
              "client-ltp": [
                "LTP-ETC-TTP-LAN-1-XG-SFP",
              ],
              "server-ltp": [
                "LTP-ETY-TTP-LAN-1-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-LAN-1-XG-SFP",
                  "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-2-RJ45",
              "client-ltp": [
                "LTP-MWS-LAN-2-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-2-RJ45",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-LAN-2-XG-SFP",
              "client-ltp": [
                "LTP-ETC-TTP-LAN-2-XG-SFP",
              ],
              "server-ltp": [
                "LTP-ETY-TTP-LAN-2-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-LAN-2-XG-SFP",
                  "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-1-SFP",
              "client-ltp": [
                "LTP-MWS-LAN-1-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-1-SFP",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MAC-TTP-LAN-2-COMBO",
              "client-ltp": [
                "LTP-VLAN-TTP-LAN-2-COMBO",
              ],
              "server-ltp": [
                "LTP-ETC-TTP-LAN-2-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MAC-TTP-LAN-2-COMBO",
                  "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MAC-TTP-LAN-4-RJ45",
              "client-ltp": [
                "LTP-VLAN-TTP-LAN-4-RJ45",
              ],
              "server-ltp": [
                "LTP-ETC-TTP-LAN-4-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MAC-TTP-LAN-4-RJ45",
                  "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-VLAN-TTP-ODU-A",
              "server-ltp": [
                "LTP-MAC-TTP-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-VLAN-TTP-ODU-A",
                  "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-VLAN-TTP-LAN-1-COMBO",
              "server-ltp": [
                "LTP-MAC-TTP-LAN-1-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-VLAN-TTP-LAN-1-COMBO",
                  "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-LAN-4-RJ45",
              "client-ltp": [
                "LTP-ETC-TTP-LAN-4-RJ45",
              ],
              "server-ltp": [
                "LTP-ETY-TTP-LAN-4-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-LAN-4-RJ45",
                  "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-LAN-2-COMBO",
              "client-ltp": [
                "LTP-ETC-TTP-LAN-2-COMBO",
              ],
              "server-ltp": [
                "LTP-ETY-TTP-LAN-2-SFP",
                "LTP-ETY-TTP-LAN-2-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-LAN-2-COMBO",
                  "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MAC-TTP-ODU-A",
              "client-ltp": [
                "LTP-VLAN-TTP-ODU-A",
              ],
              "server-ltp": [
                "LTP-ETC-TTP-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MAC-TTP-ODU-A",
                  "layer-protocol-name": "mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETC-TTP-LAN-2-COMBO",
              "client-ltp": [
                "LTP-MAC-TTP-LAN-2-COMBO",
              ],
              "server-ltp": [
                "LTP-MWS-LAN-2-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETC-TTP-LAN-2-COMBO",
                  "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-2-SFP",
              "client-ltp": [
                "LTP-MWS-LAN-2-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-2-SFP",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-1-XG-SFP",
              "client-ltp": [
                "LTP-MWS-LAN-1-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-1-XG-SFP",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-LAN-1-COMBO",
              "client-ltp": [
                "LTP-ETC-TTP-LAN-1-COMBO",
              ],
              "server-ltp": [
                "LTP-ETY-TTP-LAN-1-SFP",
                "LTP-ETY-TTP-LAN-1-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-LAN-1-COMBO",
                  "layer-protocol-name": "pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-2-XG-SFP",
              "client-ltp": [
                "LTP-MWS-LAN-2-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-2-XG-SFP",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-VLAN-TTP-LAN-2-COMBO",
              "server-ltp": [
                "LTP-MAC-TTP-LAN-2-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-VLAN-TTP-LAN-2-COMBO",
                  "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-VLAN-TTP-LAN-4-RJ45",
              "server-ltp": [
                "LTP-MAC-TTP-LAN-4-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-VLAN-TTP-LAN-4-RJ45",
                  "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-VLAN-TTP-LAN-1-XG-SFP",
              "server-ltp": [
                "LTP-MAC-TTP-LAN-1-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-VLAN-TTP-LAN-1-XG-SFP",
                  "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETC-TTP-LAN-4-RJ45",
              "client-ltp": [
                "LTP-MAC-TTP-LAN-4-RJ45",
              ],
              "server-ltp": [
                "LTP-MWS-LAN-4-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETC-TTP-LAN-4-RJ45",
                  "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-VLAN-TTP-LAN-2-XG-SFP",
              "server-ltp": [
                "LTP-MAC-TTP-LAN-2-XG-SFP",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-VLAN-TTP-LAN-2-XG-SFP",
                  "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-TDM-CTP-ODU-A-1",
              "server-ltp": [
                "LTP-MWS-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-TDM-CTP-ODU-A-1",
                  "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-TDM-CTP-ODU-A-2",
              "server-ltp": [
                "LTP-MWS-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-TDM-CTP-ODU-A-2",
                  "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-TDM-CTP-ODU-A-3",
              "server-ltp": [
                "LTP-MWS-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-TDM-CTP-ODU-A-3",
                  "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-TDM-CTP-ODU-A-4",
              "server-ltp": [
                "LTP-MWS-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-TDM-CTP-ODU-A-4",
                  "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-TDM-CTP-ODU-A-5",
              "server-ltp": [
                "LTP-MWS-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-TDM-CTP-ODU-A-5",
                  "layer-protocol-name": "tdm-container-2-0:LAYER_PROTOCOL_NAME_TYPE_TDM_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETC-TTP-ODU-A",
              "client-ltp": [
                "LTP-MAC-TTP-ODU-A",
              ],
              "server-ltp": [
                "LTP-MWS-ODU-A",
                "LTP-MWS-ODU-B",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETC-TTP-ODU-A",
                  "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-1-RJ45",
              "client-ltp": [
                "LTP-MWS-LAN-1-COMBO",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-1-RJ45",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-ODU-A",
              "client-ltp": [
                "LTP-TDM-CTP-ODU-A-5",
                "LTP-ETC-TTP-ODU-A",
                "LTP-TDM-CTP-ODU-A-1",
                "LTP-TDM-CTP-ODU-A-2",
                "LTP-TDM-CTP-ODU-A-3",
                "LTP-TDM-CTP-ODU-A-4",
              ],
              "server-ltp": [
                "LTP-MWPS-TTP-ODU-A",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-ODU-A",
                  "layer-protocol-name": "hybrid-mw-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-MWS-ODU-B",
              "client-ltp": [
                "LTP-ETC-TTP-ODU-A",
              ],
              "server-ltp": [
                "LTP-MWPS-TTP-ODU-B",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-MWS-ODU-B",
                  "layer-protocol-name": "hybrid-mw-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER",
                },
              ],
            },
            {
              uuid: "LTP-ETY-TTP-LAN-4-RJ45",
              "client-ltp": [
                "LTP-MWS-LAN-4-RJ45",
              ],
              "layer-protocol": [
                {
                  "local-id": "LP-ETY-TTP-LAN-4-RJ45",
                  "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
                },
              ],
            },
          ],
        },
      ],
    };
    requestHeaders = {
      user: "admin",
      originator: "AccessPlanningToolProxy",
      xCorrelator: "9BDADb6C-cd5d-Fa4d-6846-A2dF0208081c",
      traceIndicator: "1",
      customerJourney: "unknown",
    };
    traceIndicatorIncrementer = 41;
    jest.clearAllMocks();
  });

  it("should return the list of pluggable SFP LTPs when the response is successful", async () => {
    const wireInterfaceLtpList = [{ uuid: "wire-uuid-1" }, { uuid: "wire-uuid-2" }];
    const equipmentUuidResponseMock = {
      "ltp-augment-1-0:ltp-augment-pac": { equipment: ["equip-uuid-1"] },
    };
    const equipmentCategoryResponseMock = {
      "equipment-augment-1-0:actual-equipment": { category: "EQUIPMENT_CATEGORY_SMALL_FORMFACTOR_PLUGGABLE" },
    };
    const clientAndFieldParamsForEquipmentUuid1 = {
      operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-201",
      operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac",
      fields: "equipment",
    };
    const clientAndFieldParamsForEquipmentCategory1 = {
      operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-114",
      operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/equipment={uuid}/actual-equipment",
      fields: "",
    };
    const wireInterfaceLtpList1 = [
      {
        uuid: "LTP-ETY-TTP-LAN-2-RJ45",
        "client-ltp": [
          "LTP-MWS-LAN-2-COMBO",
        ],
        "layer-protocol": [
          {
            "local-id": "LP-ETY-TTP-LAN-2-RJ45",
            "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
          },
        ],
      },
      {
        uuid: "LTP-ETY-TTP-LAN-1-SFP",
        "client-ltp": [
          "LTP-MWS-LAN-1-COMBO",
        ],
        "layer-protocol": [
          {
            "local-id": "LP-ETY-TTP-LAN-1-SFP",
            "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
          },
        ],
      },
      {
        uuid: "LTP-ETY-TTP-LAN-2-SFP",
        "client-ltp": [
          "LTP-MWS-LAN-2-COMBO",
        ],
        "layer-protocol": [
          {
            "local-id": "LP-ETY-TTP-LAN-2-SFP",
            "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
          },
        ],
      },
      {
        uuid: "LTP-ETY-TTP-LAN-1-XG-SFP",
        "client-ltp": [
          "LTP-MWS-LAN-1-XG-SFP",
        ],
        "layer-protocol": [
          {
            "local-id": "LP-ETY-TTP-LAN-1-XG-SFP",
            "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
          },
        ],
      },
      {
        uuid: "LTP-ETY-TTP-LAN-2-XG-SFP",
        "client-ltp": [
          "LTP-MWS-LAN-2-XG-SFP",
        ],
        "layer-protocol": [
          {
            "local-id": "LP-ETY-TTP-LAN-2-XG-SFP",
            "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
          },
        ],
      },
      {
        uuid: "LTP-ETY-TTP-LAN-1-RJ45",
        "client-ltp": [
          "LTP-MWS-LAN-1-COMBO",
        ],
        "layer-protocol": [
          {
            "local-id": "LP-ETY-TTP-LAN-1-RJ45",
            "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
          },
        ],
      },
      {
        uuid: "LTP-ETY-TTP-LAN-4-RJ45",
        "client-ltp": [
          "LTP-MWS-LAN-4-RJ45",
        ],
        "layer-protocol": [
          {
            "local-id": "LP-ETY-TTP-LAN-4-RJ45",
            "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
          },
        ],
      },
    ];
    const equipmentUuidResponse1 = {
      "ltp-augment-1-0:ltp-augment-pac": {
        equipment: [
          "AGS-20 IDU",
        ],
      },
    };
    const equipmentCategoryResponse1 = {
      "core-model-1-4:actual-equipment": {
        "local-id": "",
        "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
        "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
        "physical-properties": {
          temperature: "30",
        },
        "physical-characteristics": {
          "fire-characteristics": "",
          materials: "",
          "weight-characeristics": "",
        },
        "manufactured-thing": {
          "operator-augmented-equipment-type": {
            "asset-type-identifier": "",
          },
          "equipment-type": {
            version: "003",
            "equipment-augment-1-0:equipment-type-pac": {
              "lct-label": "",
              "outside-label": "",
            },
            description: "INDOOR UNIT AGS-20",
            "model-identifier": "AGS-20 Quad-IF Enhanced 16xE1 XG",
            "part-type-identifier": "GAI0234-3",
            "type-name": "AGS-20",
          },
          "operator-augmented-equipment-instance": {
            "asset-instance-identifier": "",
          },
          "manufacturer-properties": {
            "manufacturer-name": "SIAE Microelettronica SpA",
            "manufacturer-identifier": "",
          },
          "equipment-instance": {
            "manufacture-date": "0000-00-00",
            "serial-number": "10182245100011A",
            "asset-instance-identifier": "",
          },
        },
        "spatial-properties-of-type": {
          width: "",
          length: "",
          height: "",
        },
        structure: {
          category: "core-model-1-4:EQUIPMENT_CATEGORY_SUBRACK",
        },
        "mechanical-functions": {
          "rotation-speed": "",
        },
        "environmental-rating": {
          "thermal-rating": {
            "minimum-temperature": "-255.0",
            "thermal-rating-name": "",
            "maximum-temperature": "99.0",
          },
          "humidity-rating": "",
          "power-rating": {
            "power-rating-name": "",
            "power-rating-value": "",
          },
        },
        location: {
          "equipment-location": "",
          "geographical-location": "",
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
        swappability: {
          "is-hot-swappable": false,
        },
        "function-enablers": {
          "power-state": "",
        },
        "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
      },
    };
    const equipmentUuidResponse2 = {
      "ltp-augment-1-0:ltp-augment-pac": {
        equipment: [
          "LAN-1 SFP",
        ],
      },
    };
    const equipmentCategoryResponse2 = {
      "core-model-1-4:actual-equipment": {
        "local-id": "",
        "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
        "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
        "physical-properties": {
          temperature: "33",
        },
        "physical-characteristics": {
          "fire-characteristics": "",
          materials: "",
          "weight-characeristics": "",
        },
        "manufactured-thing": {
          "operator-augmented-equipment-type": {
            "asset-type-identifier": "",
          },
          "equipment-type": {
            version: "G2.1",
            "equipment-augment-1-0:equipment-type-pac": {
              "lct-label": "LAN-1",
              "outside-label": "",
            },
            description: "SFP module in LAN-1 SFP connector",
            "model-identifier": "Generic",
            "part-type-identifier": "AFCT-739ISMZ",
            "type-name": "SFP module",
          },
          "operator-augmented-equipment-instance": {
            "asset-instance-identifier": "",
          },
          "manufacturer-properties": {
            "manufacturer-name": "AVAGO",
            "manufacturer-identifier": "",
          },
          "equipment-instance": {
            "manufacture-date": "2019-05-07",
            "serial-number": "AD1919500D5",
            "asset-instance-identifier": "",
          },
        },
        "spatial-properties-of-type": {
          width: "",
          length: "",
          height: "",
        },
        structure: {
          category: "core-model-1-4:EQUIPMENT_CATEGORY_SMALL_FORMFACTOR_PLUGGABLE",
        },
        "mechanical-functions": {
          "rotation-speed": "",
        },
        "environmental-rating": {
          "thermal-rating": {
            "minimum-temperature": "-255.0",
            "thermal-rating-name": "",
            "maximum-temperature": "99.0",
          },
          "humidity-rating": "",
          "power-rating": {
            "power-rating-name": "",
            "power-rating-value": "",
          },
        },
        location: {
          "equipment-location": "",
          "geographical-location": "",
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
        swappability: {
          "is-hot-swappable": true,
        },
        "function-enablers": {
          "power-state": "",
        },
        "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
      },
    };
    const equipmentUuidResponse3 = {
      "ltp-augment-1-0:ltp-augment-pac": {
        equipment: [
          "LAN-2 SFP",
        ],
      },
    };
    const equipmentCategoryResponse3 = {
      "core-model-1-4:actual-equipment": {
        "local-id": "",
        "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
        "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
        "physical-properties": {
          temperature: "34",
        },
        "physical-characteristics": {
          "fire-characteristics": "",
          materials: "",
          "weight-characeristics": "",
        },
        "manufactured-thing": {
          "operator-augmented-equipment-type": {
            "asset-type-identifier": "",
          },
          "equipment-type": {
            version: "G2.1",
            "equipment-augment-1-0:equipment-type-pac": {
              "lct-label": "LAN-2",
              "outside-label": "",
            },
            description: "SFP module in LAN-2 SFP connector",
            "model-identifier": "Generic",
            "part-type-identifier": "AFCT-739ISMZ",
            "type-name": "SFP module",
          },
          "operator-augmented-equipment-instance": {
            "asset-instance-identifier": "",
          },
          "manufacturer-properties": {
            "manufacturer-name": "AVAGO",
            "manufacturer-identifier": "",
          },
          "equipment-instance": {
            "manufacture-date": "2019-05-07",
            "serial-number": "AD1919500DK",
            "asset-instance-identifier": "",
          },
        },
        "spatial-properties-of-type": {
          width: "",
          length: "",
          height: "",
        },
        structure: {
          category: "core-model-1-4:EQUIPMENT_CATEGORY_SMALL_FORMFACTOR_PLUGGABLE",
        },
        "mechanical-functions": {
          "rotation-speed": "",
        },
        "environmental-rating": {
          "thermal-rating": {
            "minimum-temperature": "-255.0",
            "thermal-rating-name": "",
            "maximum-temperature": "99.0",
          },
          "humidity-rating": "",
          "power-rating": {
            "power-rating-name": "",
            "power-rating-value": "",
          },
        },
        location: {
          "equipment-location": "",
          "geographical-location": "",
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
        swappability: {
          "is-hot-swappable": true,
        },
        "function-enablers": {
          "power-state": "",
        },
        "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
      },
    };
    const equipmentUuidResponse4 = {
      "ltp-augment-1-0:ltp-augment-pac": {
        equipment: [
          "XGLAN-1 SFP",
        ],
      },
    };
    const equipmentCategoryResponse4 = {
      "core-model-1-4:actual-equipment": {
        "local-id": "",
        "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
        "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
        "physical-properties": {
          temperature: "38",
        },
        "physical-characteristics": {
          "fire-characteristics": "",
          materials: "",
          "weight-characeristics": "",
        },
        "manufactured-thing": {
          "operator-augmented-equipment-type": {
            "asset-type-identifier": "",
          },
          "equipment-type": {
            version: "V2.0",
            "equipment-augment-1-0:equipment-type-pac": {
              "lct-label": "XGLAN-1",
              "outside-label": "",
            },
            description: "SFP module in XGLAN-1 SFP connector",
            "model-identifier": "Generic",
            "part-type-identifier": "AXGD-1354-0533",
            "type-name": "SFP module",
          },
          "operator-augmented-equipment-instance": {
            "asset-instance-identifier": "",
          },
          "manufacturer-properties": {
            "manufacturer-name": "Axcen Photonics",
            "manufacturer-identifier": "",
          },
          "equipment-instance": {
            "manufacture-date": "2017-05-19",
            "serial-number": "AX17200011164",
            "asset-instance-identifier": "",
          },
        },
        "spatial-properties-of-type": {
          width: "",
          length: "",
          height: "",
        },
        structure: {
          category: "core-model-1-4:EQUIPMENT_CATEGORY_SMALL_FORMFACTOR_PLUGGABLE",
        },
        "mechanical-functions": {
          "rotation-speed": "",
        },
        "environmental-rating": {
          "thermal-rating": {
            "minimum-temperature": "-255.0",
            "thermal-rating-name": "",
            "maximum-temperature": "99.0",
          },
          "humidity-rating": "",
          "power-rating": {
            "power-rating-name": "",
            "power-rating-value": "",
          },
        },
        location: {
          "equipment-location": "",
          "geographical-location": "",
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
        swappability: {
          "is-hot-swappable": true,
        },
        "function-enablers": {
          "power-state": "",
        },
        "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
      },
    };
    const equipmentUuidResponse5 = {
      "ltp-augment-1-0:ltp-augment-pac": {
        equipment: [
          "XGLAN-2 SFP",
        ],
      },
    };
    const equipmentCategoryResponse5 = {
      "core-model-1-4:actual-equipment": {
        "local-id": "",
        "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
        "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
        "physical-properties": {
          temperature: "35",
        },
        "physical-characteristics": {
          "fire-characteristics": "",
          materials: "",
          "weight-characeristics": "",
        },
        "manufactured-thing": {
          "operator-augmented-equipment-type": {
            "asset-type-identifier": "",
          },
          "equipment-type": {
            version: "G2.1",
            "equipment-augment-1-0:equipment-type-pac": {
              "lct-label": "XGLAN-2",
              "outside-label": "",
            },
            description: "SFP module in XGLAN-2 SFP connector",
            "model-identifier": "Generic",
            "part-type-identifier": "AFCT-739ISMZ",
            "type-name": "SFP module",
          },
          "operator-augmented-equipment-instance": {
            "asset-instance-identifier": "",
          },
          "manufacturer-properties": {
            "manufacturer-name": "AVAGO",
            "manufacturer-identifier": "",
          },
          "equipment-instance": {
            "manufacture-date": "2019-05-07",
            "serial-number": "AD1919500DT",
            "asset-instance-identifier": "",
          },
        },
        "spatial-properties-of-type": {
          width: "",
          length: "",
          height: "",
        },
        structure: {
          category: "core-model-1-4:EQUIPMENT_CATEGORY_SMALL_FORMFACTOR_PLUGGABLE",
        },
        "mechanical-functions": {
          "rotation-speed": "",
        },
        "environmental-rating": {
          "thermal-rating": {
            "minimum-temperature": "-255.0",
            "thermal-rating-name": "",
            "maximum-temperature": "99.0",
          },
          "humidity-rating": "",
          "power-rating": {
            "power-rating-name": "",
            "power-rating-value": "",
          },
        },
        location: {
          "equipment-location": "",
          "geographical-location": "",
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
        swappability: {
          "is-hot-swappable": true,
        },
        "function-enablers": {
          "power-state": "",
        },
        "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
      },
    };
    const equipmentUuidResponse6 = {
      "ltp-augment-1-0:ltp-augment-pac": {
        equipment: [
          "AGS-20 IDU",
        ],
      },
    };
    const equipmentCategoryResponse6 = {
      "core-model-1-4:actual-equipment": {
        "local-id": "",
        "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
        "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
        "physical-properties": {
          temperature: "30",
        },
        "physical-characteristics": {
          "fire-characteristics": "",
          materials: "",
          "weight-characeristics": "",
        },
        "manufactured-thing": {
          "operator-augmented-equipment-type": {
            "asset-type-identifier": "",
          },
          "equipment-type": {
            version: "003",
            "equipment-augment-1-0:equipment-type-pac": {
              "lct-label": "",
              "outside-label": "",
            },
            description: "INDOOR UNIT AGS-20",
            "model-identifier": "AGS-20 Quad-IF Enhanced 16xE1 XG",
            "part-type-identifier": "GAI0234-3",
            "type-name": "AGS-20",
          },
          "operator-augmented-equipment-instance": {
            "asset-instance-identifier": "",
          },
          "manufacturer-properties": {
            "manufacturer-name": "SIAE Microelettronica SpA",
            "manufacturer-identifier": "",
          },
          "equipment-instance": {
            "manufacture-date": "0000-00-00",
            "serial-number": "10182245100011A",
            "asset-instance-identifier": "",
          },
        },
        "spatial-properties-of-type": {
          width: "",
          length: "",
          height: "",
        },
        structure: {
          category: "core-model-1-4:EQUIPMENT_CATEGORY_SUBRACK",
        },
        "mechanical-functions": {
          "rotation-speed": "",
        },
        "environmental-rating": {
          "thermal-rating": {
            "minimum-temperature": "-255.0",
            "thermal-rating-name": "",
            "maximum-temperature": "99.0",
          },
          "humidity-rating": "",
          "power-rating": {
            "power-rating-name": "",
            "power-rating-value": "",
          },
        },
        location: {
          "equipment-location": "",
          "geographical-location": "",
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
        swappability: {
          "is-hot-swappable": false,
        },
        "function-enablers": {
          "power-state": "",
        },
        "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
      },
    };
    const equipmentUuidResponse7 = {
      "ltp-augment-1-0:ltp-augment-pac": {
        equipment: [
          "AGS-20 IDU",
        ],
      },
    };
    const equipmentCategoryResponse7 = {
      "core-model-1-4:actual-equipment": {
        "local-id": "",
        "lifecycle-state": "core-model-1-4:LIFECYCLE_STATE_INSTALLED",
        "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
        "physical-properties": {
          temperature: "30",
        },
        "physical-characteristics": {
          "fire-characteristics": "",
          materials: "",
          "weight-characeristics": "",
        },
        "manufactured-thing": {
          "operator-augmented-equipment-type": {
            "asset-type-identifier": "",
          },
          "equipment-type": {
            version: "003",
            "equipment-augment-1-0:equipment-type-pac": {
              "lct-label": "",
              "outside-label": "",
            },
            description: "INDOOR UNIT AGS-20",
            "model-identifier": "AGS-20 Quad-IF Enhanced 16xE1 XG",
            "part-type-identifier": "GAI0234-3",
            "type-name": "AGS-20",
          },
          "operator-augmented-equipment-instance": {
            "asset-instance-identifier": "",
          },
          "manufacturer-properties": {
            "manufacturer-name": "SIAE Microelettronica SpA",
            "manufacturer-identifier": "",
          },
          "equipment-instance": {
            "manufacture-date": "0000-00-00",
            "serial-number": "10182245100011A",
            "asset-instance-identifier": "",
          },
        },
        "spatial-properties-of-type": {
          width: "",
          length: "",
          height: "",
        },
        structure: {
          category: "core-model-1-4:EQUIPMENT_CATEGORY_SUBRACK",
        },
        "mechanical-functions": {
          "rotation-speed": "",
        },
        "environmental-rating": {
          "thermal-rating": {
            "minimum-temperature": "-255.0",
            "thermal-rating-name": "",
            "maximum-temperature": "99.0",
          },
          "humidity-rating": "",
          "power-rating": {
            "power-rating-name": "",
            "power-rating-value": "",
          },
        },
        location: {
          "equipment-location": "",
          "geographical-location": "",
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
        swappability: {
          "is-hot-swappable": false,
        },
        "function-enablers": {
          "power-state": "",
        },
        "administrative-control": "core-model-1-4:ADMINISTRATIVE_CONTROL_UNLOCK",
      },
    };

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce(clientAndFieldParamsForEquipmentUuid1)
      .mockResolvedValueOnce(clientAndFieldParamsForEquipmentCategory1);
    LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValueOnce(wireInterfaceLtpList1);

    IndividualServiceUtility.forwardRequest
      .mockResolvedValueOnce(equipmentUuidResponse1).mockResolvedValueOnce(equipmentCategoryResponse1)
      .mockResolvedValueOnce(equipmentUuidResponse2).mockResolvedValueOnce(equipmentCategoryResponse2)
      .mockResolvedValueOnce(equipmentUuidResponse3).mockResolvedValueOnce(equipmentCategoryResponse3)
      .mockResolvedValueOnce(equipmentUuidResponse4).mockResolvedValueOnce(equipmentCategoryResponse4)
      .mockResolvedValueOnce(equipmentUuidResponse5).mockResolvedValueOnce(equipmentCategoryResponse5)
      .mockResolvedValueOnce(equipmentUuidResponse6).mockResolvedValueOnce(equipmentCategoryResponse6)
      .mockResolvedValueOnce(equipmentUuidResponse7).mockResolvedValueOnce(equipmentCategoryResponse7);

    // Spy on the function to capture intermediate values
    // const spyGetListOfPluggableSfpLtp = jest.spyOn(ReadInventoryData_Private, "getListOfPluggableSfpLtp");

    const result = await ReadInventoryData_Private.getListOfPluggableSfpLtp(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer
    );


    expect(result).toEqual({
      pluggableSfpList: [
        {
          uuid: "LTP-ETY-TTP-LAN-1-SFP",
          "client-ltp": [
            "LTP-MWS-LAN-1-COMBO",
          ],
          "layer-protocol": [
            {
              "local-id": "LP-ETY-TTP-LAN-1-SFP",
              "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
            },
          ],
        },
        {
          uuid: "LTP-ETY-TTP-LAN-2-SFP",
          "client-ltp": [
            "LTP-MWS-LAN-2-COMBO",
          ],
          "layer-protocol": [
            {
              "local-id": "LP-ETY-TTP-LAN-2-SFP",
              "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
            },
          ],
        },
        {
          uuid: "LTP-ETY-TTP-LAN-1-XG-SFP",
          "client-ltp": [
            "LTP-MWS-LAN-1-XG-SFP",
          ],
          "layer-protocol": [
            {
              "local-id": "LP-ETY-TTP-LAN-1-XG-SFP",
              "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
            },
          ],
        },
        {
          uuid: "LTP-ETY-TTP-LAN-2-XG-SFP",
          "client-ltp": [
            "LTP-MWS-LAN-2-XG-SFP",
          ],
          "layer-protocol": [
            {
              "local-id": "LP-ETY-TTP-LAN-2-XG-SFP",
              "layer-protocol-name": "wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
            },
          ],
        },
      ],
      traceIndicatorIncrementer: 55,
    });
  });

  it("should return an empty list if no pluggable SFPs are found", async () => {
    LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValueOnce();

    const result = await ReadInventoryData_Private.getListOfPluggableSfpLtp(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      pluggableSfpList: [],
      traceIndicatorIncrementer: traceIndicatorIncrementer
    });
  });

  it("should handle errors and return only the traceIndicatorIncrementer", async () => {
    LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValueOnce(new Error("Test erro"));

    const result = await ReadInventoryData_Private.getListOfPluggableSfpLtp(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      pluggableSfpList: [],
      traceIndicatorIncrementer: traceIndicatorIncrementer
    });
  });
});

describe("getWireInterfaceNameForRetrievingSfpInformation", () => {
  let mountName, wireInterfaceUuid, requestHeaders, traceIndicatorIncrementer;

  beforeEach(() => {
    mountName = "513250007";
    wireInterfaceUuid = "LTP-ETY-TTP-LAN-2-SFP";
    requestHeaders = {
      user: undefined,
      originator: "AccessPlanningToolProxy",
      xCorrelator: "C64adA6a-B2e3-6bed-a1fD-3A3dafef9426",
      traceIndicator: "1",
      customerJourney: "unknown",
    };
    traceIndicatorIncrementer = 58;
    jest.clearAllMocks();
  });

  it("should return the wire interface name when the response is successful", async () => {
    const responseMock = {
      "ltp-augment-1-0:ltp-augment-pac": {
        "original-ltp-name": "LAN-2-SFP",
      },
    };

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce({
      operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-201",
      operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac",
      fields: "original-ltp-name",
    });
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce(responseMock);

    const result = await ReadInventoryData_Private.getWireInterfaceNameForRetrievingSfpInformation(
      mountName,
      wireInterfaceUuid,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      wireInterfaceName: "LAN-2-SFP",
      traceIndicatorIncrementer: 59,
    });
  });

  it("should return an empty response if the API response is empty", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce({
      operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-201",
      operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac",
      fields: "original-ltp-name",
    });
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce({});

    const result = await ReadInventoryData_Private.getWireInterfaceNameForRetrievingSfpInformation(
      mountName,
      wireInterfaceUuid,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({ traceIndicatorIncrementer: traceIndicatorIncrementer + 1 });
  });

  it("should handle errors and return only the traceIndicatorIncrementer", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValueOnce(new Error("Test error"));

    const result = await ReadInventoryData_Private.getWireInterfaceNameForRetrievingSfpInformation(
      mountName,
      wireInterfaceUuid,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({ traceIndicatorIncrementer: traceIndicatorIncrementer });
  });
});

describe("getSupportedPmdListForRetrievingSfpInformation", () => {
  let mountName, wireInterfaceUuid, wireInterfaceLocalId, requestHeaders, traceIndicatorIncrementer;

  beforeEach(() => {
    mountName = "513250007";
    wireInterfaceUuid = "LTP-ETY-TTP-LAN-2-SFP";
    wireInterfaceLocalId = "LP-ETY-TTP-LAN-2-SFP";
    requestHeaders = {
      user: undefined,
      originator: "AccessPlanningToolProxy",
      xCorrelator: "C64adA6a-B2e3-6bed-a1fD-3A3dafef9426",
      traceIndicator: "1",
      customerJourney: "unknown",
    };
    traceIndicatorIncrementer = 59;
    jest.clearAllMocks();
  });

  it("should return the supported PMD list when the response is successful", async () => {
    const responseMock = {
      "wire-interface-2-0:wire-interface-capability": {
        "supported-pmd-kind-list": [
          {
            "pmd-name": "1000BASE-LX_FD",
          },
          {
            "pmd-name": "10GBASE-LR_FD",
          },
        ],
      },
    };

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce({
      operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-270",
      operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/logical-termination-point={uuid}/layer-protocol={local-id}/wire-interface-2-0:wire-interface-pac/wire-interface-capability",
      fields: "supported-pmd-kind-list%28pmd-name%29",
    });
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce(responseMock);

    const result = await ReadInventoryData_Private.getSupportedPmdListForRetrievingSfpInformation(
      mountName,
      wireInterfaceUuid,
      wireInterfaceLocalId,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      supportedPmdList: [
        "1000BASE-LX_FD",
        "10GBASE-LR_FD",
      ],
      traceIndicatorIncrementer: 60,
    });
  });

  it("should return an empty response if the API response is empty", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce({});
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce({});

    const result = await ReadInventoryData_Private.getSupportedPmdListForRetrievingSfpInformation(
      mountName,
      wireInterfaceUuid,
      wireInterfaceLocalId,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({ traceIndicatorIncrementer: traceIndicatorIncrementer + 1 });
  });

  it("should handle errors and return only the traceIndicatorIncrementer", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValueOnce(new Error("Test error"));

    const result = await ReadInventoryData_Private.getSupportedPmdListForRetrievingSfpInformation(
      mountName,
      wireInterfaceUuid,
      wireInterfaceLocalId,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({ traceIndicatorIncrementer: traceIndicatorIncrementer });
  });
  it("should return multiple PMD types when more than two are present", async () => {
    const responseMock = {
      "wire-interface-2-0:wire-interface-capability": {
        "supported-pmd-kind-list": [
          { "pmd-name": "100G-LR4" },
          { "pmd-name": "10G-SR" },
          { "pmd-name": "40G-CR4" },
          { "pmd-name": "25G-SR" }
        ]
      }
    };

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce("clientParamsSupportedPmds");
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce(responseMock);

    const result = await ReadInventoryData_Private.getSupportedPmdListForRetrievingSfpInformation(
      mountName,
      wireInterfaceUuid,
      wireInterfaceLocalId,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      supportedPmdList: ["100G-LR4", "10G-SR", "40G-CR4", "25G-SR"],
      traceIndicatorIncrementer: traceIndicatorIncrementer + 1
    });
  });
});

describe("getCurrentlyOperatedPmdForRetrievingSfpInformation", () => {
  let mountName, wireInterfaceUuid, wireInterfaceLocalId, requestHeaders, traceIndicatorIncrementer;

  beforeEach(() => {
    mountName = "513250007";
    wireInterfaceUuid = "LTP-ETY-TTP-LAN-1-SFP";
    wireInterfaceLocalId = "LP-ETY-TTP-LAN-1-SFP";
    requestHeaders = {
      user: undefined,
      originator: "AccessPlanningToolProxy",
      xCorrelator: "C64adA6a-B2e3-6bed-a1fD-3A3dafef9426",
      traceIndicator: "1",
      customerJourney: "unknown",
    };
    traceIndicatorIncrementer = 42;
    jest.clearAllMocks();
  });

  it("should return the currently operated PMD when the response is successful", async () => {
    const responseMock = {
      "wire-interface-2-0:wire-interface-status": {
        "pmd-kind-cur": "1000BASE-LX_FD",
      },
    };

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce({
      operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-272",
      operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/logical-termination-point={uuid}/layer-protocol={local-id}/wire-interface-2-0:wire-interface-pac/wire-interface-status",
      fields: "pmd-kind-cur",
    });
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce(responseMock);

    const result = await ReadInventoryData_Private.getCurrentlyOperatedPmdForRetrievingSfpInformation(
      mountName,
      wireInterfaceUuid,
      wireInterfaceLocalId,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      currentlyOperatedPmd: "1000BASE-LX_FD",
      traceIndicatorIncrementer: 43,
    });
  });

  it("should return an empty response if the API response is empty", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce("clientParamsOperatedPmd");
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce({});

    const result = await ReadInventoryData_Private.getCurrentlyOperatedPmdForRetrievingSfpInformation(
      mountName,
      wireInterfaceUuid,
      wireInterfaceLocalId,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({ traceIndicatorIncrementer: traceIndicatorIncrementer + 1 });
  });

  it("should handle errors and return only the traceIndicatorIncrementer", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValueOnce(new Error("Test error"));

    const result = await ReadInventoryData_Private.getCurrentlyOperatedPmdForRetrievingSfpInformation(
      mountName,
      wireInterfaceUuid,
      wireInterfaceLocalId,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({ traceIndicatorIncrementer: traceIndicatorIncrementer });
  });

  it("should return no currently operated PMD if 'pmd-kind-cur' is missing", async () => {
    const responseMock = {
      "wire-interface-2-0:wire-interface-status": {}
    };

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce("clientParamsOperatedPmd");
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce(responseMock);

    const result = await ReadInventoryData_Private.getCurrentlyOperatedPmdForRetrievingSfpInformation(
      mountName,
      wireInterfaceUuid,
      wireInterfaceLocalId,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({ traceIndicatorIncrementer: traceIndicatorIncrementer + 1 });
  });
});

describe("FetchConnectorPluggingTheOutdoorUnit", () => {
  let mountName, uuidUnderTest, requestHeaders, traceIndicatorIncrementer;

  beforeEach(() => {
    mountName = "513250007";
    uuidUnderTest = "LTP-MWPS-TTP-ODU-B";
    requestHeaders = {
      user: undefined,
      originator: "AccessPlanningToolProxy",
      xCorrelator: "C64adA6a-B2e3-6bed-a1fD-3A3dafef9426",
      traceIndicator: "1",
      customerJourney: "unknown",
    };
    traceIndicatorIncrementer = 67;
    jest.clearAllMocks();
  });

  it("should return the correct sequence ID when all responses are successful", async () => {
    const connectorIdResponseMock = {
      "ltp-augment-1-0:ltp-augment-pac": {
        connector: "ANTENNA-ODU-B-Connector",
        equipment: [
          "ODU-B",
          "AGS-20 IDU",
        ],
      },
    };
    const connectorNumberResponseMock = {
      "core-model-1-4:connector": [
        {
          "equipment-augment-1-0:connector-pac": {
            "sequence-id": 1,
          },
        },
      ],
    };

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams
      .mockResolvedValueOnce({
        operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-201",
        operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac",
        fields: "equipment%3Bconnector",
      })
      .mockResolvedValueOnce({
        operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-111",
        operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/equipment={uuid}/connector={local-id}",
        fields: "equipment-augment-1-0%3Aconnector-pac%28sequence-id%29",
      });
    IndividualServiceUtility.forwardRequest
      .mockResolvedValueOnce(connectorIdResponseMock)
      .mockResolvedValueOnce(connectorNumberResponseMock);

    const result = await ReadInventoryData_Private.FetchConnectorPluggingTheOutdoorUnit(
      mountName,
      uuidUnderTest,
      requestHeaders,
      traceIndicatorIncrementer
    );
    expect(result).toEqual({
      connectorPluggingTheOutdoorUnit: 1,
      traceIndicatorIncrementer: 69
    });
  });

  it("should return an empty response if connectorIdResponse is empty", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams
      .mockResolvedValueOnce({
        operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-201",
        operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac",
        fields: "equipment%3Bconnector",
      })
      .mockResolvedValueOnce({
        operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-111",
        operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/equipment={uuid}/connector={local-id}",
        fields: "equipment-augment-1-0%3Aconnector-pac%28sequence-id%29",
      });
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce({});

    const result = await ReadInventoryData_Private.FetchConnectorPluggingTheOutdoorUnit(mountName, uuidUnderTest, requestHeaders, traceIndicatorIncrementer);

    expect(result).toEqual({ traceIndicatorIncrementer: traceIndicatorIncrementer + 1 });
  });

  it("should handle errors and return only the traceIndicatorIncrementer", async () => {
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValueOnce(new Error("Test error"));

    const result = await ReadInventoryData_Private.FetchConnectorPluggingTheOutdoorUnit(mountName, uuidUnderTest, requestHeaders, traceIndicatorIncrementer);

    expect(result).toEqual({ traceIndicatorIncrementer: traceIndicatorIncrementer });
  });

  it("should handle missing or empty equipmentList", async () => {
    const connectorIdResponseMock = {
      "ltp-augment-1-0:ltp-augment-pac": {
        connector: "connector-id" // No equipment key
      }
    };

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce("clientParamsId");
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce("clientParamsNumber");
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce(connectorIdResponseMock);

    const result = await ReadInventoryData_Private.FetchConnectorPluggingTheOutdoorUnit(mountName, uuidUnderTest, requestHeaders, traceIndicatorIncrementer);

    expect(result).toEqual({ traceIndicatorIncrementer: traceIndicatorIncrementer + 1 });
  });

  it("should return no sequence ID if connectorPac or sequence-id is missing", async () => {
    const connectorIdResponseMock = {
      "ltp-augment-1-0:ltp-augment-pac": {
        equipment: ["equipment-uuid"],
        connector: "connector-id"
      }
    };
    const connectorNumberResponseMock = {
      "core-model-1-4:equipment-connector": [
        {
          "equipment-augment-1-0:connector-pac": {} // No sequence-id
        }
      ]
    };

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce("clientParamsId");
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValueOnce("clientParamsNumber");
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce(connectorIdResponseMock);
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce(connectorNumberResponseMock);

    const result = await ReadInventoryData_Private.FetchConnectorPluggingTheOutdoorUnit(mountName, uuidUnderTest, requestHeaders, traceIndicatorIncrementer);

    expect(result).toEqual({ traceIndicatorIncrementer: traceIndicatorIncrementer + 2 });
  });

  it("should handle failure of second API call", async () => {
    const connectorIdResponseMock = {
      "ltp-augment-1-0:ltp-augment-pac": {
        equipment: ["equipment-uuid"],
        connector: "connector-id"
      }
    };

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams
      .mockResolvedValueOnce({
        operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-201",
        operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac",
        fields: "equipment%3Bconnector",
      })
      .mockResolvedValueOnce({
        operationClientUuid: "aptp-1-1-0-op-c-is-mwdi-1-1-2-111",
        operationName: "/core-model-1-4:network-control-domain=cache/control-construct={mountName}/equipment={uuid}/connector={local-id}",
        fields: "equipment-augment-1-0%3Aconnector-pac%28sequence-id%29",
      });
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce(connectorIdResponseMock);
    IndividualServiceUtility.forwardRequest.mockResolvedValueOnce({});

    const result = await ReadInventoryData_Private.FetchConnectorPluggingTheOutdoorUnit(mountName, uuidUnderTest, requestHeaders, traceIndicatorIncrementer);

    expect(result).toEqual({ traceIndicatorIncrementer: traceIndicatorIncrementer + 2 });
  });
});

describe("formulateEquipmentInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock data before each test
  });
  test("should return an empty object when given an empty list", async () => {
    // formulateEquipmentInfo.mockResolvedValue({}); // Mock return value
    const result = await ReadInventoryData_Private.formulateEquipmentInfo([]);
    expect(result).toEqual({});
  });
  test("should process a list containing a modem", async () => {
    const mockInput = [
      {
        "core-model-1-4:actual-equipment": {
          "manufactured-thing": {
            "equipment-type": {
              "part-type-identifier": "GE8704-52",
              "type-name": "ASNK-18G",
            },
            "equipment-instance": {
              "serial-number": "101821827000620",
            },
          },
          structure: {
            category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
          },
        },
      },
      {
        "core-model-1-4:actual-equipment": {
          "manufactured-thing": {
            "equipment-type": {
              "part-type-identifier": "GAI0234-3",
              "type-name": "AGS-20",
            },
            "equipment-instance": {
              "serial-number": "10182245100011A",
            },
          },
          structure: {
            category: "core-model-1-4:EQUIPMENT_CATEGORY_SUBRACK",
          },
        },
      },
    ];
    const mockOutput = {
      radio: {
        "equipment-name": "ASNK-18G",
        "serial-number": "101821827000620",
        "part-number": "GE8704-52",
      },
    };
    // formulateEquipmentInfo.mockResolvedValue(mockOutput);
    const result = await ReadInventoryData_Private.formulateEquipmentInfo(mockInput);
    expect(result).toEqual(mockOutput);
  });
  test("should process multiple equipment categories", async () => {
    const mockInput = [
      {
        "core-model-1-4:actual-equipment": {
          "manufactured-thing": {
            "equipment-type": {
              "part-type-identifier": "GE8704-52",
              "type-name": "ASNK-18G",
            },
            "equipment-instance": {
              "serial-number": "101821827000620",
            },
          },
          structure: {
            category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
          },
        },
      },
      {
        "core-model-1-4:actual-equipment": {
          "manufactured-thing": {
            "equipment-type": {
              "part-type-identifier": "GAI0234-3",
              "type-name": "AGS-20",
            },
            "equipment-instance": {
              "serial-number": "10182245100011A",
            },
          },
          structure: {
            category: "core-model-1-4:EQUIPMENT_CATEGORY_SUBRACK",
          },
        },
      },
    ];
    const mockOutput = {
      radio: {
        "equipment-name": "ASNK-18G",
        "serial-number": "101821827000620",
        "part-number": "GE8704-52",
      },
    };
    // formulateEquipmentInfo.mockResolvedValue(mockOutput);
    const result = await ReadInventoryData_Private.formulateEquipmentInfo(mockInput);
    expect(result).toEqual(mockOutput);
  });
  test("should return an empty object when manufacturedThing is missing", async () => {
    const mockInput = [
      {
        "core-model-1-4:actual-equipment": {
          // "manufactured-thing": {
          //   // "equipment-type": {
          //   //   "part-type-identifier": "GE8704-52",
          //   //   "type-name": "ASNK-18G",
          //   // },
          //   // "equipment-instance": {
          //   //   "serial-number": "101821827000620",
          //   // },
          // },
          structure: {
            category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
          },
        },
      },
      {
        "core-model-1-4:actual-equipment": {
          "manufactured-thing": {
            "equipment-type": {
              "part-type-identifier": "GAI0234-3",
              "type-name": "AGS-20",
            },
            "equipment-instance": {
              "serial-number": "10182245100011A",
            },
          },
          structure: {
            category: "core-model-1-4:EQUIPMENT_CATEGORY_SUBRACK",
          },
        },
      },
    ];
    // formulateEquipmentInfo.mockResolvedValue({}); // Expected to return empty object
    const result = await ReadInventoryData_Private.formulateEquipmentInfo(mockInput);
    expect(result).toEqual({ "radio": {} });
  });
});
describe('isEquipmentCategoryModem', () => {
  test('should return true when equipment category is MODEM', async () => {
    const equipmentCategoryResponse = {
      "core-model-1-4:actual-equipment": {
        structure: {
          category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_MODEM",
        },
      },
    }
    // console.log("Input Data:", JSON.stringify(equipmentCategoryResponse, null, 2));
    const result = await ReadInventoryData_Private.isEquipmentCategoryModem(equipmentCategoryResponse);
    // console.log("Function Output:", result);
    expect(result).toBe(true);
  });
  test('should return false when equipmentCategoryResponse is not modem', async () => {
    const equipmentCategoryResponse = {
      "core-model-1-4:actual-equipment": {
        structure: {
          category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
        },
      },
    };
    const result = await ReadInventoryData_Private.isEquipmentCategoryModem(equipmentCategoryResponse);
    expect(result).toBe(false);
  });
  test('should return false when equipmentCategoryResponse has not any category property', async () => {
    const equipmentCategoryResponse = {
      "core-model-1-4:actual-equipment": {
        structure: {
          nonCategory: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
        },
      },
    };
    const result = await ReadInventoryData_Private.isEquipmentCategoryModem(equipmentCategoryResponse);
    expect(result).toBe(false);
  });
});
describe('isEquipmentCategoryRadio', () => {
  test('should return true when equipment category is OUTDOOR_UNIT', async () => {
    const equipmentCategoryResponse = {
      "core-model-1-4:actual-equipment": {
        structure: {
          category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
        },
      },
    };
    const result = await ReadInventoryData_Private.isEquipmentCategoryRadio(equipmentCategoryResponse);
    expect(result).toBe(true);
  });
  test('should return false when equipmentCategoryResponse is not OUTDOOR_UNIT', async () => {
    const equipmentCategoryResponse = {
      "core-model-1-4:actual-equipment": {
        structure: {
          category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
        },
      },
    };
    const result = await ReadInventoryData_Private.isEquipmentCategoryModem(equipmentCategoryResponse);
    expect(result).toBe(false);
  });
  test('should return false when equipmentCategoryResponse has not any category property', async () => {
    const equipmentCategoryResponse = {
      "core-model-1-4:actual-equipment": {
        structure: {
          nonCategory: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
        },
      },
    };
    const result = await ReadInventoryData_Private.isEquipmentCategoryModem(equipmentCategoryResponse);
    expect(result).toBe(false);
  });
});
describe('formulatePositionofModemBoard', () => {
  test('should return vendorLabel when equipmentUuidOfModemCategory matches and contains equipmentUuidOfRadioCategory', async () => {
    const equipmentHolderLabelResponse = {
      "core-model-1-4:control-construct": [
        {
          "equipment": [
            {
              "uuid": "uuid-modem-123",
              "contained-holder": [
                {
                  "occupying-fru": "uuid-radio-456",
                  "equipment-augment-1-0:holder-pac": {
                    "vendor-label": "VendorXYZ"
                  }
                }
              ]
            }
          ]
        }
      ]
    };
    const equipmentUuidOfModemCategory = "uuid-modem-123";
    const equipmentUuidOfRadioCategory = "uuid-radio-456";
    const result = await ReadInventoryData_Private.formulatePositionofModemBoard(
      equipmentHolderLabelResponse,
      equipmentUuidOfModemCategory,
      equipmentUuidOfRadioCategory
    );
    console.log("result is", result);
    expect(result).toBe("VendorXYZ");
  });
  test('should return empty string when equipmentUuidOfModemCategory does not match', async () => {
    const equipmentHolderLabelResponse = {
      "core-model-1-4:control-construct": [{
        "equipment": [
          {
            "uuid": "modem-uuid-999", // Does not match
            "contained-holder": [
              {
                "occupying-fru": "radio-uuid-456",
                "equipment-augment-1-0:holder-pac": {
                  "equipment-augment-1-0:vendor-label": "VendorXYZ"
                }
              }
            ]
          }
        ]
      }]
    };
    const result = await ReadInventoryData_Private.formulatePositionofModemBoard(equipmentHolderLabelResponse, "modem-uuid-123", "radio-uuid-456");
    expect(result).toBe("");
  });
  test('should return empty string when occupying-fru does not match equipmentUuidOfRadioCategory', async () => {
    const equipmentHolderLabelResponse = {
      "core-model-1-4:control-construct": [{
        "equipment": [
          {
            "uuid": "modem-uuid-123",
            "contained-holder": [
              {
                "occupying-fru": "radio-uuid-789", // Does not match
                "equipment-augment-1-0:holder-pac": {
                  "equipment-augment-1-0:vendor-label": "VendorXYZ"
                }
              }
            ]
          }
        ]
      }]
    };
    const result = await ReadInventoryData_Private.formulatePositionofModemBoard(equipmentHolderLabelResponse, "modem-uuid-123", "radio-uuid-456");
    expect(result).toBe("");
  });
  test('should return empty string when contained-holder is missing', async () => {
    const equipmentHolderLabelResponse = {
      "core-model-1-4:control-construct": [{
        "equipment": [
          {
            "uuid": "modem-uuid-123"
          }
        ]
      }]
    };
    const result = await ReadInventoryData_Private.formulatePositionofModemBoard(equipmentHolderLabelResponse, "modem-uuid-123", "radio-uuid-456");
    expect(result).toBe("");
  });
  test('should return empty string when equipmentHolderLabelResponse is undefined', async () => {
    let result;
    try {
      result = await ReadInventoryData_Private.formulatePositionofModemBoard(undefined, "modem-uuid-123", "radio-uuid-456");
    } catch (error) {
      result = "";
    }
    expect(result).toBe("");
  });
});