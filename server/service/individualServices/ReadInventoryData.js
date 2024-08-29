'use strict';

const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const IndividualServiceUtility = require('./IndividualServiceUtility');
const LtpStructureUtility = require('./LtpStructureUtility');
const ReadAirInterfaceData = require('./ReadAirInterfaceData');

const FIRMWARE = {
  MODULE: "firmware-1-0:",
  COLLECTION: "firmware-collection",
  CLASS_TYPE: "FIRMWARE_COMPONENT_CLASS_TYPE_PACKAGE",
  COMPONENT_LIST: "firmware-component-list",
  PAC: "firmware-component-pac",
  CAPABILITY: "firmware-component-capability",
  CLASS: "firmware-component-class",
  NAME: "firmware-component-name",
  VERSION: "firmware-component-version",
  STATUS: "firmware-component-status"
};

const PURE_ETHERNET_STRUCTURE = {
  MODULE: "pure-ethernet-structure-2-0:",
  LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER"
};
const ETHERNET_CONTAINER = {
  MODULE: "ethernet-container-2-0:",
  STATUS: "ethernet-container-status",
  INTERFACE_STATUS: "interface-status",
  LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER"
};
const WIRE_INTERFACE = {
  MODULE: "wire-interface-2-0:",
  LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
  CAPABILITY: "wire-interface-capability",
  STATUS: "wire-interface-status",
  SUPPORTED_PMD_LIST: "supported-pmd-kind-list",
  PMD_NAME: "pmd-name",
  PMD_KIND_CUR: "pmd-kind-cur"
};
const AIR_INTERFACE = {
  MODULE: "air-interface-2-0:",
  LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
  CONFIGURAION: "air-interface-configuration",
  NAME: "air-interface-name"
};
const LTP_AUGMENT = {
  MODULE: "ltp-augment-1-0:",
  PAC: "ltp-augment-pac",
  ORIGINAL_LTP_NAME: "original-ltp-name",
  EQUIPMENT: "equipment",
  CONNECTOR: "connector",
  EXTERNAL_LABEL: "external-label"
};
const HYBRID_MW_STRUCTURE = {
  MODULE: "hybrid-mw-structure-2-0:",
  LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER"
};
const CORE = {
  MODULE: "core-model-1-4:",
  CONTROL_CONSTRUCT: "control-construct",
  EQUIPMENT: "equipment"
}
const EQUIPMENT = {
  MODULE: "equipment-augment-1-0:",
  EQUIPMENT: {
    CONTAINED_HOLDER: "contained-holder",
    ACTUAL_EQUIPMENT: "actual-equipment",
    CONNECTOR: "connector"
  },
  CONNECTOR: {
    CONNECTOR_PAC: "connector-pac",
    SEQUENCE_ID: "sequence-id"
  },
  ACTUAL_EQUIPMENT: {
    MANUFACTURED_THING: "manufactured-thing",
    EQUIPMENT_NAME: "equipment-name",
    SERIAL_NUMBER: "serial-number",
    EQUIPMENT: "equipment",
    PART_NUMBER: "part-number",
    STRUCTURE: "structure",
    CATEGORY: "category",
    TYPE_NAME: "type-name",
    PART_TYPE_IDENTIFIER: "part-type-identifier",
    EQUIPMENT_TYPE: "equipment-type",
    EQUIPMENT_INSTANCE: "equipment-instance"
  },
  EQUIPMENT_CATEGORY: {
    MODEM: "EQUIPMENT_CATEGORY_MODEM",
    OUTDOOR_UNIT: "EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
    FULL_OUTDOOR_UNIT: "EQUIPMENT_CATEGORY_FULL_OUTDOOR_UNIT",
    SFP: "EQUIPMENT_CATEGORY_SMALL_FORMFACTOR_PLUGGABLE"
  }
}

const CONTAINED_HOLDER = {
  EQUIPMENT_AUGMENT: {
    MODULE: "equipment-augment-1-0:",
    VENDORL_LABEL: "vendor-label",
    HOLDER_PAC: "holder-pac"
  },
  OCCUPYING_FRU: "occupying-fru"
}

/**
 * This method performs the set of procedure to gather the inventory data
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} ltpStructure ControlConstruct provided from cache
 * @param {String} uuidUnderTest Identifier of the air-interface under test
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
   @returns {Object} result which contains the inventory data and traceIndicatorIncrementer
* **/
exports.readInventoryData = function (mountName, ltpStructure, uuidUnderTest, requestHeaders, traceIndicatorIncrementer) {
  return new Promise(async function (resolve, reject) {
    try {
      /****************************************************************************************
       * Declaring required variables
       ****************************************************************************************/
      let inventoryResult = {};
      let inventoryData = {};

      /****************************************************************************************
       *  Fetching data for installed-firmware attribute
       ****************************************************************************************/
      let installedFirmwareResponse = await RequestForProvidingAcceptanceDataCausesReadingFirmwareList(mountName, requestHeaders, traceIndicatorIncrementer);
      if (Object.keys(installedFirmwareResponse).length > 0) {
        if (installedFirmwareResponse.installedFirmware != undefined) {
          inventoryData.installedFirmware = installedFirmwareResponse.installedFirmware;
        }
        traceIndicatorIncrementer = installedFirmwareResponse.traceIndicatorIncrementer;
      }

      /****************************************************************************************
       *  Fetch data for Components Radio, Modem, Device  
       * The following are the list of forwarding-construct that are automated to fetch data
       * 1. RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.EquipmentUuid
       * 2. RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers.EquipmentInfo  
       ****************************************************************************************/

      if (uuidUnderTest != "") {
        let equipmentUuidList = [];
        let equipmentInfo = {};
        let equipmentUuidResponse = await RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentUuid(mountName, uuidUnderTest, requestHeaders, traceIndicatorIncrementer);

        if (Object.keys(equipmentUuidResponse).length !== 0) {
          traceIndicatorIncrementer = equipmentUuidResponse.traceIndicatorIncrementer;
          equipmentUuidList = equipmentUuidResponse.equipmentUuidList;
          if (equipmentUuidList && equipmentUuidList.length !== 0) {
            let equipmentInfoResponse = await RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers(mountName, equipmentUuidResponse, requestHeaders);
            if (Object.keys(equipmentInfoResponse).length !== 0) {
              traceIndicatorIncrementer = equipmentInfoResponse.traceIndicatorIncrementer;
              equipmentInfo = equipmentInfoResponse.equipmentInfo
            }
          }
        }

        if (equipmentInfo && Object.keys(equipmentInfo).length !== 0) {
          if (equipmentInfo.radio) {
            inventoryData.radio = equipmentInfo.radio;
          }
          if (equipmentInfo.modem) {
            inventoryData.modem = equipmentInfo.modem;
          }
          if (equipmentInfo.device) {
            inventoryData.device = equipmentInfo.device;
          }
        }

        /****************************************************************************************
         *  Fetch data for position-of-modem-board
         * The following are the list of forwarding-construct that are automated to fetch data
         * 1. RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.EquipmentCategory
         * 2. RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers.HolderLabel  
         ****************************************************************************************/

        if (equipmentUuidList && equipmentUuidList.length !== 0) {
          let equipmentCategoryResponse = await RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentCategory(mountName, equipmentUuidList, requestHeaders, traceIndicatorIncrementer);
          if (equipmentCategoryResponse) {
            let equipmentUuidOfModemCategory = equipmentCategoryResponse.equipmentUuidOfModemCategory;
            let equipmentUuidOfRadioCategory = equipmentCategoryResponse.equipmentUuidOfRadioCategory;
            traceIndicatorIncrementer = equipmentCategoryResponse.traceIndicatorIncrementer;
            if (equipmentUuidOfModemCategory && equipmentUuidOfRadioCategory) {
              let positionOfModemBoardResponse = await RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionHolderLabel(mountName, equipmentCategoryResponse, requestHeaders);
              if (Object.keys(positionOfModemBoardResponse).length !== 0) {
                traceIndicatorIncrementer = positionOfModemBoardResponse.traceIndicatorIncrementer;
                if (positionOfModemBoardResponse.positionOfModemBoard !== "") {
                  inventoryData.positionOfModemBoard = positionOfModemBoardResponse.positionOfModemBoard;
                }
              }
            }
          }
        }
      }

      /****************************************************************************************
       *  Fetching data for configured-group-of-air-interfaces attribute
       ****************************************************************************************/
      let configuredGroupOfAirInterfacesResponse = await FetchConfiguredGroupOfAirInterfaces(mountName, ltpStructure, uuidUnderTest, requestHeaders, traceIndicatorIncrementer);
      if (Object.keys(configuredGroupOfAirInterfacesResponse).length > 0) {
        if (Object.keys(configuredGroupOfAirInterfacesResponse.configuredGroupOfAirInterfaceList).length != 0) {
          inventoryData.configuredGroupOfAirInterfaces = configuredGroupOfAirInterfacesResponse.configuredGroupOfAirInterfaceList;
        }
        traceIndicatorIncrementer = configuredGroupOfAirInterfacesResponse.traceIndicatorIncrementer;
      }

      /****************************************************************************************
       *  Fetching data for plugged-sfp-pmd-list attribute
       ****************************************************************************************/
      let pluggedSfpPmdListResponse = await FetchPluggedSfpPmdList(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer);
      if (Object.keys(pluggedSfpPmdListResponse).length > 0) {
        if (Object.keys(pluggedSfpPmdListResponse.pluggedSfpPmdList).length > 0) {
          inventoryData.pluggedSfpPmdList = pluggedSfpPmdListResponse.pluggedSfpPmdList;
        }
        traceIndicatorIncrementer = pluggedSfpPmdListResponse.traceIndicatorIncrementer;
      }

      /****************************************************************************************
       *  Fetching data for connector-plugging-the-outdoor-unit attribute
       ****************************************************************************************/
      let connectorPluggingTheOutdoorUnitResponse = await FetchConnectorPluggingTheOutdoorUnit(mountName, uuidUnderTest, requestHeaders, traceIndicatorIncrementer);
      if (Object.keys(connectorPluggingTheOutdoorUnitResponse).length > 0) {
        if (connectorPluggingTheOutdoorUnitResponse.connectorPluggingTheOutdoorUnit != undefined) {
          inventoryData.connectorPluggingTheOutdoorUnit = connectorPluggingTheOutdoorUnitResponse.connectorPluggingTheOutdoorUnit;
        }
        traceIndicatorIncrementer = connectorPluggingTheOutdoorUnitResponse.traceIndicatorIncrementer;
      }

      /****************************************************************************************
       *  Forming inventory object for response-body
       ****************************************************************************************/
      inventoryResult = {
        inventory: inventoryData,
        traceIndicatorIncrementer: traceIndicatorIncrementer
      };
      resolve(inventoryResult);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

/**
 * Prepare attributes and automate the RequestForProvidingAcceptanceDataCausesReadingFirmwareList forwarding-construct 
 *    to gather installed-firmware list of given mount-name
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return values of installed-firmware list and traceIndicatorIncrementer
 */
async function RequestForProvidingAcceptanceDataCausesReadingFirmwareList(mountName, requestHeaders, traceIndicatorIncrementer) {
  let installedFirmwareResponse = {};
  let installedFirmwareList = [];
  let pathParamList = [];
  const fcNameForReadingFirmwareList = "RequestForProvidingAcceptanceDataCausesReadingFirmwareList";
  const stringNameForReadingFirmwareList = "RequestForProvidingAcceptanceDataCausesReadingFirmwareList.FirmwareFromCache";
  try {
    let clientAndFieldParamsForFirmwareList = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(fcNameForReadingFirmwareList, stringNameForReadingFirmwareList);
    pathParamList.push(mountName);
    /****************************************************************************************************
     * process required attributes from firmware-collection
     *   RequestForProvidingAcceptanceDataCausesReadingFirmwareList
     *     MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}/firmware-1-0:firmware-collection
     *****************************************************************************************************/
    let response = await IndividualServiceUtility.forwardRequest(clientAndFieldParamsForFirmwareList, pathParamList, requestHeaders, traceIndicatorIncrementer++);
    if (Object.keys(response).length > 0) {
      let firmwareCollection = response[FIRMWARE.MODULE + FIRMWARE.COLLECTION];
      let firmwareComponentList = [];
      if (firmwareCollection && firmwareCollection.hasOwnProperty(FIRMWARE.COMPONENT_LIST)) {
        firmwareComponentList = response[FIRMWARE.MODULE + FIRMWARE.COLLECTION][FIRMWARE.COMPONENT_LIST];
      }
      for (let i = 0; i < firmwareComponentList.length; i++) {
        let installedFirmware = {};
        let firmwareComponent = firmwareComponentList[i];
        if (firmwareComponent && firmwareComponent.hasOwnProperty(FIRMWARE.PAC)) {
          let firmwareComponentPac = firmwareComponentList[i][FIRMWARE.PAC];
          if (firmwareComponentPac.hasOwnProperty(FIRMWARE.CAPABILITY)) {
            let firmwareComponentCapability = firmwareComponentPac[FIRMWARE.CAPABILITY];
            if (firmwareComponentCapability.hasOwnProperty(FIRMWARE.CLASS)) {
              let firmwareComponentClass = firmwareComponentCapability[FIRMWARE.CLASS];
              let expectedFirmwareComponentClass = FIRMWARE.MODULE + FIRMWARE.CLASS_TYPE;
              if (firmwareComponentClass == expectedFirmwareComponentClass) {
                if (firmwareComponentCapability.hasOwnProperty(FIRMWARE.NAME)) installedFirmware.firmwareComponentName = firmwareComponentCapability[FIRMWARE.NAME];
                if (firmwareComponentCapability.hasOwnProperty(FIRMWARE.VERSION)) installedFirmware.firmwareComponentVersion = firmwareComponentCapability[FIRMWARE.VERSION];
                if (firmwareComponentPac.hasOwnProperty(FIRMWARE.STATUS)) {
                  let firmwareStatus = firmwareComponentPac[FIRMWARE.STATUS];
                  if (firmwareStatus.hasOwnProperty([FIRMWARE.STATUS])) { installedFirmware.firmwareComponentStatus = firmwareStatus[FIRMWARE.STATUS]; }
                }
                installedFirmwareList.push(installedFirmware);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(`${fcNameForReadingFirmwareList} is not success with ${error}`);
  }
  installedFirmwareResponse = {
    installedFirmware: installedFirmwareList,
    traceIndicatorIncrementer: traceIndicatorIncrementer
  };
  return installedFirmwareResponse;

}

/**
 * Prepare attributes and automate the RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentUuid forwarding-construct 
 *    to get equipment list of given mount-name and uuidUnderTest.
 * @param {String} mountName Identifier of the device at the Controller
 * @param {String} uuidUnderTest uuidUnderTest Identifier of the air-interface under test
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return equipment uuid list and traceIndicatorIncrementer
 */
async function RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentUuid(mountName, uuidUnderTest, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.EquipmentUuid";
  const stringName = "RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.EquipmentUuid";
  let equipmentUuidResponse = {};
  let equipmentUuidList = [];
  try {

    /********************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.EquipmentUuid
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *    /logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac?fields=equipment
     ******************************************************************************************************/
    let pathParams = [];
    pathParams.push(mountName);
    pathParams.push(uuidUnderTest);
    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let ltpAugmentResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(ltpAugmentResponse).length === 0) {
      console.log(`${forwardingName} is not success`);
    } else {
      let ltpAugmentPac = ltpAugmentResponse[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC];
      if (ltpAugmentPac && ltpAugmentPac.hasOwnProperty(LTP_AUGMENT.EQUIPMENT)) {
        equipmentUuidList = ltpAugmentPac[LTP_AUGMENT.EQUIPMENT];
      }
    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
  }
  equipmentUuidResponse.equipmentUuidList = equipmentUuidList;
  equipmentUuidResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return equipmentUuidResponse;
}

/**
 * Prepare attributes and automate the RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentCategory forwarding-construct 
 *    to get equipment information of given mount-name and equipmentuuid.
 * @param {String} mountName Identifier of the device at the Controller
 * @param {List}  equipmentUuidList List of equipment uuids for air-interface under test.
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return equipment uuid list of category modem and traceIndicatorIncrementer
 */
async function RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentCategory(mountName, equipmentUuidList, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.EquipmentCategory";
  const stringName = "RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.EquipmentCategory";
  let equipmentUuidOfModemCategory = "";
  let equipmentUuidOfRadioCategory = "";
  let equipmentCategoryResponse = {};
  try {

    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.EquipmentCategory
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *        /equipment={uuid}/actual-equipment?fields=structure(category)
     *****************************************************************************************************/
    for (let i = 0; i < equipmentUuidList.length; i++) {
      let equipmentUuid = equipmentUuidList[i];
      let pathParams = [];
      pathParams.push(mountName);
      pathParams.push(equipmentUuid);
      let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
      let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
      let equipmentCategoryResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
      if (Object.keys(equipmentCategoryResponse).length === 0) {
        console.log(`${forwardingName} is not success`);
      } else {
        if ((await isEquipmentCategoryModem(equipmentCategoryResponse))) {
          equipmentUuidOfModemCategory = equipmentUuid;
        }
        if (await isEquipmentCategoryRadio(equipmentCategoryResponse)) {
          equipmentUuidOfRadioCategory = equipmentUuid;
        }
      }
    }
    if (equipmentUuidOfModemCategory && equipmentUuidOfRadioCategory) {
      equipmentCategoryResponse.equipmentUuidOfModemCategory = equipmentUuidOfModemCategory;
      equipmentCategoryResponse.equipmentUuidOfRadioCategory = equipmentUuidOfRadioCategory;
    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
  }
  equipmentCategoryResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return equipmentCategoryResponse;
}

/**
 * Prepare attributes and automate the RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionHolderLabel forwarding-construct 
 *    to get vendor label of given mount-name and equipmentuuid.
 * @param {String} mountName Identifier of the device at the Controller
 * @param {List}  equipmentCategoryResponse equipment uuid of category modem and traceIndicatorIncrementer
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @returns {Object} return equipment uuid list of category modem and traceIndicatorIncrementer
 */
async function RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionHolderLabel(mountName, equipmentCategoryResponse, requestHeaders) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.HolderLabel";
  const stringName = "RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.HolderLabel";
  let positionOfModemBoardResponse = {};
  let positionOfModemBoard = "";
  let traceIndicatorIncrementer = equipmentCategoryResponse.traceIndicatorIncrementer;
  try {

    let equipmentUuidOfModemCategory = equipmentCategoryResponse.equipmentUuidOfModemCategory;
    let equipmentUuidOfRadioCategory = equipmentCategoryResponse.equipmentUuidOfRadioCategory;

    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.HolderLabel
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *     ?fields=equipment(contained-holder
     *         (occupying-fru;equipment-augment-1-0:holder-pac(vendor-label)))
     *****************************************************************************************************/

    let pathParams = [];
    pathParams.push(mountName);
    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let equipmentHolderLabelResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(equipmentHolderLabelResponse).length === 0) {
      console.log(`${forwardingName} is not success`);
    } else {

      /************************************************************************************************************
       * Formulate position-of-modem-board from eqipmentHolderLabelResponse and equipmentUuidListOfModemCategory
       ************************************************************************************************************/
      positionOfModemBoard = await formulatePositionofModemBoard(equipmentHolderLabelResponse, equipmentUuidOfModemCategory, equipmentUuidOfRadioCategory);
    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
  }
  positionOfModemBoardResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  positionOfModemBoardResponse.positionOfModemBoard = positionOfModemBoard;
  return positionOfModemBoardResponse;
}


/**
 * Prepare attributes and automate the RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers forwarding-construct 
 *    to get equipment information of given mount-name and equipmentuuid.
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} equipmentUuidResponse Comprises of EquipmentUuidList and traceIndicatorIncrementer
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @returns {Object} return equipment uuid list and traceIndicatorIncrementer
 */
async function RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers(mountName, equipmentUuidResponse, requestHeaders) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers";
  const stringName = "RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers.EquipmentInfo";
  let equipmentInfoResponse = {};
  let equipmentInfoList = [];
  let traceIndicatorIncrementer = equipmentUuidResponse.traceIndicatorIncrementer;
  try {

    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *      /equipment={uuid}/actual-equipment
     *      ?fields=structure(category);manufactured-thing(equipment-type(type-name;part-type-identifier)
     *            ;equipment-instance(serial-number))
     *****************************************************************************************************/
    let equipmentUuidList = equipmentUuidResponse.equipmentUuidList;
    for (let i = 0; i < equipmentUuidList.length; i++) {
      let equipmentUuid = equipmentUuidList[i];
      let pathParams = [];
      pathParams.push(mountName);
      pathParams.push(equipmentUuid);
      let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
      let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
      let equipmentInfoResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
      if (!equipmentInfoResponse || Object.keys(equipmentInfoResponse).length === 0) {
        console.log(`${forwardingName} is not success`);
      } else {
        equipmentInfoList.push(equipmentInfoResponse);
      }
    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
  }

  /****************************************************************************************************
   * Formulate equipmentInfoResponse from eqipmentInfoList
   *****************************************************************************************************/
  let equipmentInfo = await formulateEquipmentInfo(equipmentInfoList);
  equipmentInfoResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  equipmentInfoResponse.equipmentInfo = equipmentInfo;
  return equipmentInfoResponse;
}

/**
 * Function to gather the Configured group of resources (of type AirInterface or WireInterface) that are transporting fragments of the same Ethernet frames
 * If the client ethernet-container is shared with an air-interface(radio-link-bonding), RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache shall be used to get link-id
 * Else if the client ethernet-container is shared with the wire-interface (physical-link-aggregation), RequestForProvidingAcceptanceDataCausesAnalysingTheAggregation shall be used to get original-ltp-name
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} ltpStructure ControlConstruct provided from cache
 * @param {String} uuidUnderTest Identifier of the air-interface under test
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return values of installed-firmware list and traceIndicatorIncrementer
 */
async function FetchConfiguredGroupOfAirInterfaces(mountName, ltpStructure, uuidUnderTest, requestHeaders, traceIndicatorIncrementer) {
  let configuredGroupOfAirInterfacesResponse = {};
  let configuredGroupOfAirInterfaceList = [];
  try {
    /****************************************************************************************
     * extracting list of serving physic ltps for air-interface uuidUnderTest
     ****************************************************************************************/
    let firstLayerToReachEthernetContainer = [PURE_ETHERNET_STRUCTURE.MODULE + PURE_ETHERNET_STRUCTURE.LAYER_PROTOCOL_NAME, HYBRID_MW_STRUCTURE.MODULE + HYBRID_MW_STRUCTURE.LAYER_PROTOCOL_NAME];
    let secondLayerToReachEthernetContainer = [ETHERNET_CONTAINER.MODULE + ETHERNET_CONTAINER.LAYER_PROTOCOL_NAME];
    let interfaceListToReachEthernetContainer = [firstLayerToReachEthernetContainer, secondLayerToReachEthernetContainer];
    let airInterfaceLtpUnderTest = await LtpStructureUtility.getLtpForUuidFromLtpStructure(uuidUnderTest, ltpStructure);
    let clientContainerLtp = await LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure(airInterfaceLtpUnderTest, interfaceListToReachEthernetContainer, ltpStructure);
    if (Object.keys(clientContainerLtp).length > 0) {
      let servingPhysicLtpList = await getServingPhysicLtpList(clientContainerLtp, ltpStructure);
      if (servingPhysicLtpList != undefined) {
        if (servingPhysicLtpList.length > 1) {
          for (let i = 0; i < servingPhysicLtpList.length; i++) {
            let configuredResource = {};
            let servingPhysicLtp = servingPhysicLtpList[i];
            let layerProtocolName = servingPhysicLtp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME];
            let airInterfaceLayerProtocolName = AIR_INTERFACE.MODULE + AIR_INTERFACE.LAYER_PROTOCOL_NAME;
            let wireInterfaceLayerProtocolName = WIRE_INTERFACE.MODULE + WIRE_INTERFACE.LAYER_PROTOCOL_NAME;
            /****************************************************************************************
             * extracting link-id if radio-link-bonding or interface-name for physical-link-aggregation
             ****************************************************************************************/
            if (layerProtocolName == airInterfaceLayerProtocolName || layerProtocolName == wireInterfaceLayerProtocolName) {
              let ltpDesignationResponse = await getLtpDesignation(mountName, servingPhysicLtp, requestHeaders, traceIndicatorIncrementer);
              if (Object.keys(ltpDesignationResponse).length != 0) {
                let ltpDesignation = ltpDesignationResponse.ltpDesignation;
                if (ltpDesignation != undefined) {
                  if (layerProtocolName == airInterfaceLayerProtocolName) {
                    configuredResource.linkId = ltpDesignation[LTP_AUGMENT.EXTERNAL_LABEL];
                  } else if (layerProtocolName == wireInterfaceLayerProtocolName) {
                    configuredResource.interfaceName = ltpDesignation[LTP_AUGMENT.ORIGINAL_LTP_NAME];
                  }
                }
              }
              traceIndicatorIncrementer = ltpDesignationResponse.traceIndicatorIncrementer;
            }
            configuredGroupOfAirInterfaceList.push(configuredResource);
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
  configuredGroupOfAirInterfacesResponse = {
    configuredGroupOfAirInterfaceList: configuredGroupOfAirInterfaceList,
    traceIndicatorIncrementer: traceIndicatorIncrementer
  }
  return configuredGroupOfAirInterfacesResponse;
}
/**
 * Collects the list of serving physical layer ltps for given ethernet-container
 * @param {String} clientContainerLtp ethernet-container ltp for which serving physic ltps to be found
 * @param {Object} ltpStructure ControlConstruct provided from cache
 * @returns {Array} servingPhysicLtpList return list of serving physical layer ltp (air or wire)
 */
async function getServingPhysicLtpList(clientContainerLtp, ltpStructure) {
  let servingPhysicLtpList = [];
  try {
    let servingStructureUuidList = clientContainerLtp[onfAttributes.LOGICAL_TERMINATION_POINT.SERVER_LTP];
    if (servingStructureUuidList != undefined) {
      for (let i = 0; i < servingStructureUuidList.length; i++) {
        let servingStructureLtp = await LtpStructureUtility.getLtpForUuidFromLtpStructure(servingStructureUuidList[i], ltpStructure);
        let servingPhysicUuidList = servingStructureLtp[onfAttributes.LOGICAL_TERMINATION_POINT.SERVER_LTP];
        if (servingPhysicUuidList != undefined) {
          for (let j = 0; j < servingPhysicUuidList.length; j++) {
            let servingPhysicLtp = await LtpStructureUtility.getLtpForUuidFromLtpStructure(servingPhysicUuidList[j], ltpStructure);
            servingPhysicLtpList.push(servingPhysicLtp);
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
  return servingPhysicLtpList;
}

/**
 * Fetches original-ltp-name for wire-interface ltp found on physical-link-aggregation
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} ltp wire-interface ltp found on physical-link-aggregation
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns original-ltp-name(interface-name) value and traceIndicatorIncrementer
 */
async function getLtpDesignation(mountName, ltp, requestHeaders, traceIndicatorIncrementer) {
  let ltpDesignationResponse = {};
  let pathParamList = [];
  const forwardingName = "RequestForProvidingAcceptanceDataCausesAnalysingTheAggregation";
  const stringName = "RequestForProvidingAcceptanceDataCausesAnalysingTheAggregation.LtpDesignation";
  try {
    let uuid = ltp[onfAttributes.GLOBAL_CLASS.UUID];
    pathParamList.push(mountName, uuid);
    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesAnalysingTheAggregation
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}/logical-termination-point={uuid}
     *      /ltp-augment-1-0:ltp-augment-pac?fields=original-ltp-name;external-label
     *****************************************************************************************************/
    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName);
    let ltpAugmentResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParamList, requestHeaders, traceIndicatorIncrementer++);
    if (Object.keys(ltpAugmentResponse).length == 0) {
      console.log(`${forwardingName} is not success`);
    } else {
      ltpDesignationResponse.ltpDesignation = ltpAugmentResponse[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC];
    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
  }
  ltpDesignationResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return ltpDesignationResponse;
}

/**
 * Function to gather the list of plugged sfp pmd
 * The following forwardings shall be used for collecting the needed:
 * 1. RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.EquipmentUuid
 * 2. RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.EquipmentCategory
 * 3. RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.WireInterfaceName
 * 4. RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.SupportedPmds
 * 5. RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.OperatedPmd
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} ltpStructure ControlConstruct provided from cache
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return values of installed-firmware list and traceIndicatorIncrementer
 */
async function FetchPluggedSfpPmdList(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer) {
  let pluggedSfpPmdListResponse = {};
  let pluggedSfpPmdList = [];
  try {
    /****************************************************************************************
     * extracting list of pluggable SFP
     ****************************************************************************************/
    let pluggableSfpListResponse = await getListOfPluggableSfpLtp(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer);
    let pluggableSfpWireInterfaceList = pluggableSfpListResponse.pluggableSfpList;
    traceIndicatorIncrementer = pluggableSfpListResponse.traceIndicatorIncrementer;

    /****************************************************************************************
     * extracting plugged SFP PMD list
     ****************************************************************************************/
    for (let i = 0; i < pluggableSfpWireInterfaceList.length; i++) {
      let supportedSfpPmd = {};
      let wireInterfaceLtp = pluggableSfpWireInterfaceList[i];
      let wireInterfaceUuid = wireInterfaceLtp[onfAttributes.GLOBAL_CLASS.UUID];
      let wireInterfaceLocalId = wireInterfaceLtp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LOCAL_CLASS.LOCAL_ID];

      /****************************************************************************************
       * fetching data for wire-interface-name
       ****************************************************************************************/
      let wireInterfaceNameResponse = await getWireInterfaceNameForRetrievingSfpInformation(mountName, wireInterfaceUuid, requestHeaders, traceIndicatorIncrementer);
      if (Object.keys(wireInterfaceNameResponse).length != 0) {
        if (wireInterfaceNameResponse.wireInterfaceName != undefined) {
          supportedSfpPmd.interfaceName = wireInterfaceNameResponse.wireInterfaceName;
        }
      }
      traceIndicatorIncrementer = wireInterfaceNameResponse.traceIndicatorIncrementer;
      /****************************************************************************************
       * fetching data for supported-pmd-list
       ****************************************************************************************/
      let supportedPmdListResponse = await getSupportedPmdListForRetrievingSfpInformation(mountName, wireInterfaceUuid, wireInterfaceLocalId, requestHeaders, traceIndicatorIncrementer);
      if (Object.keys(supportedPmdListResponse).length != 0) {
        if (supportedPmdListResponse.supportedPmdList != undefined) {
          supportedSfpPmd.supportedPmdList = supportedPmdListResponse.supportedPmdList;
        }
      }
      traceIndicatorIncrementer = supportedPmdListResponse.traceIndicatorIncrementer;
      /****************************************************************************************
       * fetching data for currently-operated-pmd
       ****************************************************************************************/
      let operatedPmdResponse = await getCurrentlyOperatedPmdForRetrievingSfpInformation(mountName, wireInterfaceUuid, wireInterfaceLocalId, requestHeaders, traceIndicatorIncrementer);
      if (Object.keys(operatedPmdResponse).length != 0) {
        if (operatedPmdResponse.currentlyOperatedPmd != undefined) {
          supportedSfpPmd.currentlyOperatedPmd = operatedPmdResponse.currentlyOperatedPmd;
        }
      }
      traceIndicatorIncrementer = operatedPmdResponse.traceIndicatorIncrementer;
      pluggedSfpPmdList.push(supportedSfpPmd);
    }
  } catch (error) {
    console.log(error);
  }
  pluggedSfpPmdListResponse = {
    pluggedSfpPmdList: pluggedSfpPmdList,
    traceIndicatorIncrementer: traceIndicatorIncrementer
  }
  return pluggedSfpPmdListResponse;
}
/**
 * Filters wire-interface-ltp for EQUIPMENT_CATEGORY = EQUIPMENT_CATEGORY_SMALL_FORMFACTOR_PLUGGABLE
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} ltpStructure ControlConstruct provided from cache
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns original-ltp-name(interface-name) value and traceIndicatorIncrementer
 */
async function getListOfPluggableSfpLtp(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer) {
  let pluggableSfpListResponse = {};
  let pluggableSfpList = [];
  const equipmentUuidCallback = "RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.EquipmentUuid";
  const equipmentCategoryCallback = "RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.EquipmentCategory";
  try {
    let clientAndFieldParamsForEquipmentUuid = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(equipmentUuidCallback);
    let clientAndFieldParamsForEquipmentCategory = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(equipmentCategoryCallback);
    let wireInterfaceLtpList = await LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(WIRE_INTERFACE.MODULE + WIRE_INTERFACE.LAYER_PROTOCOL_NAME, ltpStructure);
    for (let i = 0; i < wireInterfaceLtpList.length; i++) {
      let pathParamList = [];
      let wireInterfaceLtp = wireInterfaceLtpList[i];
      let wireInterfaceUuid = wireInterfaceLtp[onfAttributes.GLOBAL_CLASS.UUID];
      pathParamList.push(mountName, wireInterfaceUuid);
      /****************************************************************************************************
       * RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.EquipmentUuid
       *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
       *    /logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac?fields=equipment
       *****************************************************************************************************/
      let equipmentUuidResponse = await IndividualServiceUtility.forwardRequest(clientAndFieldParamsForEquipmentUuid, pathParamList, requestHeaders, traceIndicatorIncrementer++);
      if (Object.keys(equipmentUuidResponse).length == 0) {
        console.log(`${equipmentUuidCallback} is not success`);
      } else {
        let ltpAugmentPac = equipmentUuidResponse[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC];
        let equipmentUuidList = [];
        if (ltpAugmentPac.hasOwnProperty(LTP_AUGMENT.EQUIPMENT)) {
          equipmentUuidList = ltpAugmentPac[LTP_AUGMENT.EQUIPMENT];
        }
        if (equipmentUuidList != undefined) {
          if (equipmentUuidList.length > 0) {
            let pluggableSfp = false;
            for (const equipmentUuid of equipmentUuidList) {
              pathParamList = [];
              pathParamList.push(mountName, equipmentUuid);
              /****************************************************************************************************
               * RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.EquipmentCategory
               *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
               *    /equipment={uuid}/actual-equipment?fields=structure(category)
               *****************************************************************************************************/
              let equipmentCategoryResponse = await IndividualServiceUtility.forwardRequest(clientAndFieldParamsForEquipmentCategory, pathParamList, requestHeaders, traceIndicatorIncrementer++);
              if (Object.keys(equipmentCategoryResponse).length == 0) {
                console.log(`${equipmentCategoryCallback} is not success`);
              } else {
                let actualEquipmentStructure = equipmentCategoryResponse[CORE.MODULE + EQUIPMENT.EQUIPMENT.ACTUAL_EQUIPMENT][EQUIPMENT.ACTUAL_EQUIPMENT.STRUCTURE];
                if (actualEquipmentStructure && actualEquipmentStructure.hasOwnProperty(EQUIPMENT.ACTUAL_EQUIPMENT.CATEGORY)) {
                  let equipmentCategory = actualEquipmentStructure[EQUIPMENT.ACTUAL_EQUIPMENT.CATEGORY];
                  let expectedEquipmentCategory = CORE.MODULE + EQUIPMENT.EQUIPMENT_CATEGORY.SFP;
                  if (equipmentCategory == expectedEquipmentCategory) {
                    pluggableSfp = true;
                    break;
                  }
                }
              }
            }
            if (pluggableSfp) {
              pluggableSfpList.push(wireInterfaceLtp);
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
  pluggableSfpListResponse.pluggableSfpList = pluggableSfpList;
  pluggableSfpListResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return pluggableSfpListResponse;
}

/**
 * Fetches interface-name for wire-interface ltp filtered as a pluggable resource
 * @param {String} mountName Identifier of the device at the Controller
 * @param {String} wireInterfaceUuid wire-interface uuid for which interface-name to be found
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns interface-name value and traceIndicatorIncrementer
 */
async function getWireInterfaceNameForRetrievingSfpInformation(mountName, wireInterfaceUuid, requestHeaders, traceIndicatorIncrementer) {
  let wireInterfaceNameResponse = {};
  let pathParamList = [];
  const wireInterfaceNameCallback = "RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.WireInterfaceName";
  try {
    let clientAndFieldParamsForWireInterfaceName = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(wireInterfaceNameCallback);
    pathParamList.push(mountName, wireInterfaceUuid);
    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.WireInterfaceName
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *    /logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac?fields=original-ltp-name
     *****************************************************************************************************/
    let response = await IndividualServiceUtility.forwardRequest(clientAndFieldParamsForWireInterfaceName, pathParamList, requestHeaders, traceIndicatorIncrementer++);
    if (Object.keys(response).length == 0) {
      console.log(`${wireInterfaceNameCallback} is not success`);
    } else {
      let ltpAugmentPac = response[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC];
      if (ltpAugmentPac && ltpAugmentPac.hasOwnProperty(LTP_AUGMENT.ORIGINAL_LTP_NAME)) {
        wireInterfaceNameResponse.wireInterfaceName = ltpAugmentPac[LTP_AUGMENT.ORIGINAL_LTP_NAME];
      }
    }
  } catch (error) {
    console.log(error);
  }
  wireInterfaceNameResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return wireInterfaceNameResponse;
}

/**
 * Fetches supported-pmd-kind-list(pmd-name) for wire-interface ltp filtered as a pluggable resource
 * @param {String} mountName Identifier of the device at the Controller
 * @param {String} wireInterfaceUuid wire-interface uuid for which supported-pmd-list to be found
 * @param {String} wireInterfaceLocalId local-id of wire-interface for which supported-pmd-list to be found
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns supported-pmd-list value and traceIndicatorIncrementer
 */
async function getSupportedPmdListForRetrievingSfpInformation(mountName, wireInterfaceUuid, wireInterfaceLocalId, requestHeaders, traceIndicatorIncrementer) {
  let supportedPmdListResponse = {};
  let pathParamList = [];
  const supportedPmdsCallback = "RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.SupportedPmds";
  try {
    let clientAndFieldParamsForSupportedPmds = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(supportedPmdsCallback);
    pathParamList.push(mountName, wireInterfaceUuid, wireInterfaceLocalId);
    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.SupportedPmds
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *    /logical-termination-point={uuid}/layer-protocol={local-id}/wire-interface-2-0:wire-interface-pac
     *     /wire-interface-capability?fields=supported-pmd-kind-list(pmd-name)
     *****************************************************************************************************/
    let response = await IndividualServiceUtility.forwardRequest(clientAndFieldParamsForSupportedPmds, pathParamList, requestHeaders, traceIndicatorIncrementer++);
    if (Object.keys(response).length == 0) {
      console.log(`${supportedPmdsCallback} is not success`);
    } else {
      let supportedPmdKindList = response[WIRE_INTERFACE.MODULE + WIRE_INTERFACE.CAPABILITY][WIRE_INTERFACE.SUPPORTED_PMD_LIST];
      let supportedPmdList = [];
      if (supportedPmdKindList) {
        for (let i = 0; i < supportedPmdKindList.length; i++) {
          let supportedPmdKind = supportedPmdKindList[i];
          if (supportedPmdKind.hasOwnProperty(WIRE_INTERFACE.PMD_NAME)) supportedPmdList.push(supportedPmdKind[WIRE_INTERFACE.PMD_NAME]);
        }
      }
      supportedPmdListResponse.supportedPmdList = supportedPmdList;
    }
  } catch (error) {
    console.log(error);
  }
  supportedPmdListResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return supportedPmdListResponse;
}

/**
 * Fetches pmd-kind-cur for wire-interface ltp filtered as a pluggable resource
 * @param {String} mountName Identifier of the device at the Controller
 * @param {String} wireInterfaceUuid wire-interface uuid for which supported-pmd-list to be found
 * @param {String} wireInterfaceLocalId local-id of wire-interface for which supported-pmd-list to be found
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns supported-pmd-list value and traceIndicatorIncrementer
 */
async function getCurrentlyOperatedPmdForRetrievingSfpInformation(mountName, wireInterfaceUuid, wireInterfaceLocalId, requestHeaders, traceIndicatorIncrementer) {
  let operatedPmdResponse = {};
  let pathParamList = [];
  const operatedPmdCallback = "RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.OperatedPmd";
  try {
    let clientAndFieldParamsForOperatedPmd = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(operatedPmdCallback);
    pathParamList.push(mountName, wireInterfaceUuid, wireInterfaceLocalId);
    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesRetrievingSfpInformation.OperatedPmd
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *    /logical-termination-point={uuid}/layer-protocol={local-id}/wire-interface-2-0:wire-interface-pac
     *     /wire-interface-status?fields=pmd-kind-cur
     *****************************************************************************************************/
    let response = await IndividualServiceUtility.forwardRequest(clientAndFieldParamsForOperatedPmd, pathParamList, requestHeaders, traceIndicatorIncrementer++);
    if (Object.keys(response).length == 0) {
      console.log(`${operatedPmdCallback} is not success`);
    } else {
      operatedPmdResponse.currentlyOperatedPmd = response[WIRE_INTERFACE.MODULE + WIRE_INTERFACE.STATUS][WIRE_INTERFACE.PMD_KIND_CUR];
    }
  } catch (error) {
    console.log(error);
  }
  operatedPmdResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return operatedPmdResponse;
}

/**
 * Function to find Label of the connector, which is connecting the outdoor unit, as it is printed at the outside of the device
 * RequestForProvidingAcceptanceDataCausesDeterminingTheOduConnector.ConnectorId shall be used to find the expected equipment/connector instance
 * RequestForProvidingAcceptanceDataCausesDeterminingTheOduConnector.ConnectorNumber shall be used to get the required "label"
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} ltpStructure ControlConstruct provided from cache
 * @param {String} uuidUnderTest Identifier of the air-interface under test
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return values of connector-plugging-the-outdoor-unit value and traceIndicatorIncrementer
 */
async function FetchConnectorPluggingTheOutdoorUnit(mountName, uuidUnderTest, requestHeaders, traceIndicatorIncrementer) {
  let connectorPluggingTheOutdoorUnitResponse = {};
  let pathParamList = [];
  const connectorIdCallback = "RequestForProvidingAcceptanceDataCausesDeterminingTheOduConnector.ConnectorId";
  const connectorNumberCallback = "RequestForProvidingAcceptanceDataCausesDeterminingTheOduConnector.ConnectorNumber";
  try {
    let clientAndFieldParamsForConnectorId = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(connectorIdCallback);
    let clientAndFieldParamsForConnectorNumber = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(connectorNumberCallback);
    pathParamList.push(mountName, uuidUnderTest);
    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesDeterminingTheOduConnector.ConnectorId
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *    /logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac?fields=equipment;connector
     *****************************************************************************************************/
    let connectorIdResponse = await IndividualServiceUtility.forwardRequest(clientAndFieldParamsForConnectorId, pathParamList, requestHeaders, traceIndicatorIncrementer++);
    if (Object.keys(connectorIdResponse).length == 0) {
      console.log(`${connectorIdCallback} is not success`);
    } else {
      let equipmentList = connectorIdResponse[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC][LTP_AUGMENT.EQUIPMENT];
      let connector = connectorIdResponse[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC][LTP_AUGMENT.CONNECTOR];
      if (equipmentList != undefined) {
        for (const equipmentUuid of equipmentList) {
          pathParamList = [];
          pathParamList.push(mountName, equipmentUuid, connector);
          /****************************************************************************************************
           * RequestForProvidingAcceptanceDataCausesDeterminingTheOduConnector.ConnectorNumber
           *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
           *    /equipment={uuid}/connector={local-id}?fields=equipment-augment-1-0:connector-pac(sequence-id)
           *****************************************************************************************************/
          let connectorNumberResponse = await IndividualServiceUtility.forwardRequest(clientAndFieldParamsForConnectorNumber, pathParamList, requestHeaders, traceIndicatorIncrementer++);
          if (Object.keys(connectorNumberResponse).length != 0) {
            let connector = connectorNumberResponse[CORE.MODULE + EQUIPMENT.EQUIPMENT.CONNECTOR];
            if (connector) {
              let connectorPac = connector[0][EQUIPMENT.MODULE + EQUIPMENT.CONNECTOR.CONNECTOR_PAC];
              if (connectorPac && connectorPac.hasOwnProperty(EQUIPMENT.CONNECTOR.SEQUENCE_ID)) {
                connectorPluggingTheOutdoorUnitResponse.connectorPluggingTheOutdoorUnit = connectorPac[EQUIPMENT.CONNECTOR.SEQUENCE_ID];
                break;
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
  connectorPluggingTheOutdoorUnitResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return connectorPluggingTheOutdoorUnitResponse;
}

/**
 * Formulate equipment info from equipmentInfoList
 * @param {list} equipmentInfoList List of equipment information
 * @returns {Object} return classified equipment info 
 */
async function formulateEquipmentInfo(equipmentInfoList) {
  let equipmentInfo = {};
  for (let i = 0; i < equipmentInfoList.length; i++) {
    let equipment = {};
    let actualEquipment = equipmentInfoList[i][CORE.MODULE + EQUIPMENT.EQUIPMENT.ACTUAL_EQUIPMENT];
    if (actualEquipment && Object.keys(actualEquipment).length !== 0) {
      let manufacturedThing = actualEquipment[EQUIPMENT.ACTUAL_EQUIPMENT.MANUFACTURED_THING];
      let category = actualEquipment[EQUIPMENT.ACTUAL_EQUIPMENT.STRUCTURE][EQUIPMENT.ACTUAL_EQUIPMENT.CATEGORY];
      if (manufacturedThing) {
        let equipmentType = manufacturedThing[EQUIPMENT.ACTUAL_EQUIPMENT.EQUIPMENT_TYPE];
        let equipmentInstance = manufacturedThing[EQUIPMENT.ACTUAL_EQUIPMENT.EQUIPMENT_INSTANCE];
        if (equipmentType && equipmentType.hasOwnProperty(EQUIPMENT.ACTUAL_EQUIPMENT.TYPE_NAME)) equipment[EQUIPMENT.ACTUAL_EQUIPMENT.EQUIPMENT_NAME] = equipmentType[EQUIPMENT.ACTUAL_EQUIPMENT.TYPE_NAME];
        if (equipmentInstance && equipmentInstance.hasOwnProperty(EQUIPMENT.ACTUAL_EQUIPMENT.SERIAL_NUMBER)) equipment[EQUIPMENT.ACTUAL_EQUIPMENT.SERIAL_NUMBER] = equipmentInstance[EQUIPMENT.ACTUAL_EQUIPMENT.SERIAL_NUMBER];
        if (equipmentType && equipmentType.hasOwnProperty(EQUIPMENT.ACTUAL_EQUIPMENT.PART_TYPE_IDENTIFIER)) equipment[EQUIPMENT.ACTUAL_EQUIPMENT.PART_NUMBER] = equipmentType[EQUIPMENT.ACTUAL_EQUIPMENT.PART_TYPE_IDENTIFIER];
      }
      if (category && Object.keys(category).length !== 0) {
        if (category === EQUIPMENT.MODULE + EQUIPMENT.EQUIPMENT_CATEGORY.MODEM) {
          equipmentInfo.modem = equipment;
        } else if (category === EQUIPMENT.MODULE + EQUIPMENT.EQUIPMENT_CATEGORY.OUTDOOR_UNIT) {
          equipmentInfo.radio = equipment;
        } else if (category === EQUIPMENT.MODULE + EQUIPMENT.EQUIPMENT_CATEGORY.FULL_OUTDOOR_UNIT) {
          equipmentInfo.device = equipment;
        }
      }
    }
  }
  return equipmentInfo;
}

/**
 * Check if equipment category is modem or not
 * @param {Object} equipmentCategoryResponse Equipment category
 * @returns {Boolean} return true if equipment category is modem else false
 */
async function isEquipmentCategoryModem(equipmentCategoryResponse) {
  let isEquipmentCategoryModem = false;
  let equipmentStructure = equipmentCategoryResponse[CORE.MODULE + EQUIPMENT.EQUIPMENT.ACTUAL_EQUIPMENT][EQUIPMENT.ACTUAL_EQUIPMENT.STRUCTURE];
  if (equipmentStructure && equipmentStructure.hasOwnProperty(EQUIPMENT.ACTUAL_EQUIPMENT.CATEGORY)) {
    let category = equipmentStructure[EQUIPMENT.ACTUAL_EQUIPMENT.CATEGORY];
    if (category === EQUIPMENT.MODULE + EQUIPMENT.EQUIPMENT_CATEGORY.MODEM) {
      isEquipmentCategoryModem = true;
    }
  }
  return isEquipmentCategoryModem;
}

/**
 * Check if equipment category is radio(OUTDOOR_UNIT) or not
 * @param {Object} equipmentCategoryResponse Equipment category
 * @returns {Boolean} return true if equipment category is modem else false
 */
async function isEquipmentCategoryRadio(equipmentCategoryResponse) {
  let isEquipmentCategoryRadio = false;
  let equipmentStructure = equipmentCategoryResponse[CORE.MODULE + EQUIPMENT.EQUIPMENT.ACTUAL_EQUIPMENT][EQUIPMENT.ACTUAL_EQUIPMENT.STRUCTURE];
  if (equipmentStructure && equipmentStructure.hasOwnProperty(EQUIPMENT.ACTUAL_EQUIPMENT.CATEGORY)) {
    let category = equipmentStructure[EQUIPMENT.ACTUAL_EQUIPMENT.CATEGORY];
    if (category === EQUIPMENT.MODULE + EQUIPMENT.EQUIPMENT_CATEGORY.OUTDOOR_UNIT) {
      isEquipmentCategoryRadio = true;
    }
  }
  return isEquipmentCategoryRadio;
}

/**
 * Formulate the response for position of modem board.
 * @param {list} equipmentHolderLabelResponse Equipment Holder label.
 * @param {list} equipmentUuidListOfModemCategory List of equipment uuid of category modem.
 * @returns {String} returns vendor label.
 */
async function formulatePositionofModemBoard(equipmentHolderLabelResponse, equipmentUuidOfModemCategory, equipmentUuidOfRadioCategory) {
  let equipmentList = equipmentHolderLabelResponse[CORE.MODULE + CORE.CONTROL_CONSTRUCT][0][CORE.EQUIPMENT];
  let vendorLabel = "";
  for (let i = 0; i < equipmentList.length; i++) {
    let equipment = equipmentList[i];
    let uuid = equipment[onfAttributes.GLOBAL_CLASS.UUID];
    if (uuid === equipmentUuidOfModemCategory) {
      let containedHolder = equipment[EQUIPMENT.EQUIPMENT.CONTAINED_HOLDER];
      if (containedHolder) {
        for (let j = 0; j < containedHolder.length; j++) {
          let occupyingFru = containedHolder[j][CONTAINED_HOLDER.OCCUPYING_FRU];
          if (occupyingFru && occupyingFru == equipmentUuidOfRadioCategory) {
            let containedHolderPac = containedHolder[j][CONTAINED_HOLDER.EQUIPMENT_AUGMENT.MODULE + CONTAINED_HOLDER.EQUIPMENT_AUGMENT.HOLDER_PAC];
            if (containedHolderPac) {
              vendorLabel = containedHolderPac[CONTAINED_HOLDER.EQUIPMENT_AUGMENT.VENDORL_LABEL];
              break;
            }
          }
        }
      }
    }
  }
  return vendorLabel;
}