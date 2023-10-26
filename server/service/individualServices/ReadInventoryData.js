'use strict';

const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const IndividualServiceUtility = require('./IndividualServiceUtility');
const LtpStructureUtility = require('./LtpStructureUtility');
const ReadAirInterfaceData = require('./ReadAirInterfaceData');
const createHttpError = require('http-errors');

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

const PURE_ETHERNET_STRUCTURE = { MODULE: "pure-ethernet-structure-2-0:", LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER" };
const ETHERNET_CONTAINER = { MODULE: "ethernet-container-2-0:", STATUS: "ethernet-container-status", INTERFACE_STATUS: "interface-status", LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER" };
const WIRE_INTERFACE = { MODULE: "wire-interface-2-0:", LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER", CAPABILITY: "wire-interface-capability", STATUS: "wire-interface-status", SUPPORTED_PMD_LIST: "supported-pmd-kind-list", PMD_NAME: "pmd-name", PMD_KIND_CUR: "pmd-kind-cur" };
const AIR_INTERFACE = { MODULE: "air-interface-2-0:", LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER", CONFIGURAION: "air-interface-configuration", NAME: "air-interface-name" };
const LTP_AUGMENT = { MODULE: "ltp-augment-1-0:", PAC: "ltp-augment-pac", ORIGINAL_LTP_NAME: "original-ltp-name", EQUIPMENT: "equipment", CONNECTOR: "connector" };
const HYBRID_MW_STRUCTURE = { MODULE: "hybrid-mw-structure-2-0:", LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER" };
const CORE = { MODULE: "core-model-1-4:" }
const EQUIPMENT = {
  MODULE: "equipment-augment-1-0:",
  EQUIPMENT: {
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
       ****************************************************************************************/

      let equipmentUuidResponse = await RequestForProvidingAcceptanceDataCausesDeterminingTheModemPositionEquipmentUuid(mountName, uuidUnderTest, requestHeaders, traceIndicatorIncrementer);

      if (Object.keys(equipmentUuidResponse).length > 0) {
        let equipmentInfoResponse = await RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers(mountName, equipmentUuidResponse, requestHeaders);

        let equipmentInfo = equipmentInfoResponse.equipmentInfo;

        if (Object.keys(equipmentInfo).length > 0) {
          if (equipmentInfo.radio != undefined) {
            inventoryData.radio = equipmentInfo.radio;
          }
          if (equipmentInfo.modem != undefined) {
            inventoryData.modem = equipmentInfo.modem;
          }
          if (equipmentInfo.device != undefined) {
            inventoryData.device = equipmentInfo.device;
          }
          traceIndicatorIncrementer = equipmentInfoResponse.traceIndicatorIncrementer;
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
      let connectorPluggingTheOutdoorUnitResponse = await FetchConnectorPluggingTheOutdoorUnit(mountName, ltpStructure, uuidUnderTest, requestHeaders, traceIndicatorIncrementer);
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
      let firmwareComponentList = response[FIRMWARE.MODULE + FIRMWARE.COLLECTION][FIRMWARE.COMPONENT_LIST];
      for (let i = 0; i < firmwareComponentList.length; i++) {
        let installedFirmware = {};
        let firmwareComponentPac = firmwareComponentList[i][FIRMWARE.PAC];
        let firmwareComponentCapability = firmwareComponentPac[FIRMWARE.CAPABILITY];
        let firmwareComponentClass = firmwareComponentCapability[FIRMWARE.CLASS];
        let expectedFirmwareComponentClass = FIRMWARE.MODULE + FIRMWARE.CLASS_TYPE;
        if (firmwareComponentClass == expectedFirmwareComponentClass) {
          installedFirmware.firmwareComponentName = firmwareComponentCapability[FIRMWARE.NAME];
          installedFirmware.firmwareComponentVersion = firmwareComponentCapability[FIRMWARE.VERSION];
          installedFirmware.firmwareComponentStatus = firmwareComponentPac[FIRMWARE.STATUS][FIRMWARE.STATUS];
          installedFirmwareList.push(installedFirmware);
        }
      }
    }
    installedFirmwareResponse = {
      installedFirmware: installedFirmwareList,
      traceIndicatorIncrementer: traceIndicatorIncrementer
    };
    return installedFirmwareResponse;
  } catch (error) {
    console.log(error);
    return new createHttpError.InternalServerError();
  }

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
  try {
    let equipmentUuidResponse = {};
    let pathParams = [];

    /********************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesDeterminingTheModemPosition.EquipmentUuid
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *    /logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac?fields=equipment
     ******************************************************************************************************/

    pathParams.push(mountName);
    pathParams.push(uuidUnderTest);
    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let ltpAugmentResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(ltpAugmentResponse).length === 0) {
      console.log(`${forwardingName} is not success`);
    } else {
      equipmentUuidResponse.equipmentUuidList = ltpAugmentResponse[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC][LTP_AUGMENT.EQUIPMENT];
    }
    equipmentUuidResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
    return equipmentUuidResponse;
  } catch (error) {
    return new createHttpError.InternalServerError(`${forwardingName} is not success with ${error}`);
  }
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
  const stringName = "RequestForProvidingAcceptanceDataCausesReadingTheRadioComponentIdentifiers";
  try {
    let equipmentInfoList = [];
    let equipmentInfoResponse = {};
    let traceIndicatorIncrementer = equipmentUuidResponse.traceIndicatorIncrementer;

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
      if (Object.keys(equipmentInfoResponse).length === 0) {
        console.log(`${forwardingName} is not success`);
      } else {
        equipmentInfoList.push(equipmentInfoResponse);
      }
    }

    /****************************************************************************************************
     * Formulate equipmentInfoResponse from eqipmentInfoList
     *****************************************************************************************************/

    let equipmentInfo = await formulateEquipmentInfo(equipmentInfoList);
    equipmentInfoResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
    equipmentInfoResponse.equipmentInfo = equipmentInfo;

    return equipmentInfoResponse;
  } catch (error) {
    return new createHttpError.InternalServerError(`${forwardingName} is not success with ${error}`);
  }
}

/**
 * Formulate equipment info from equipmentInfoList
 * @param {list} equipmentInfoList List of equipment information
 * @returns {Object} return classified equipment info 
 */
async function formulateEquipmentInfo(equipmentInfoList) {
  let equipmentInfo = {};
  let equipment = {};
  for (let i = 0; i < equipmentInfoList.length; i++) {
    let manufacturedThing = equipmentInfoList[i][CORE.MODULE + EQUIPMENT.EQUIPMENT.ACTUAL_EQUIPMENT][EQUIPMENT.ACTUAL_EQUIPMENT.MANUFACTURED_THING];
    let category = equipmentInfoList[i][CORE.MODULE + EQUIPMENT.EQUIPMENT.ACTUAL_EQUIPMENT][EQUIPMENT.ACTUAL_EQUIPMENT.STRUCTURE][EQUIPMENT.ACTUAL_EQUIPMENT.CATEGORY];
    equipment[EQUIPMENT.ACTUAL_EQUIPMENT.EQUIPMENT_NAME] = manufacturedThing[EQUIPMENT.ACTUAL_EQUIPMENT.EQUIPMENT_TYPE][EQUIPMENT.ACTUAL_EQUIPMENT.TYPE_NAME];
    equipment[EQUIPMENT.ACTUAL_EQUIPMENT.SERIAL_NUMBER] = manufacturedThing[EQUIPMENT.ACTUAL_EQUIPMENT.EQUIPMENT_INSTANCE][EQUIPMENT.ACTUAL_EQUIPMENT.SERIAL_NUMBER];
    equipment[EQUIPMENT.ACTUAL_EQUIPMENT.PART_NUMBER] = manufacturedThing[EQUIPMENT.ACTUAL_EQUIPMENT.EQUIPMENT_TYPE][EQUIPMENT.ACTUAL_EQUIPMENT.PART_TYPE_IDENTIFIER];
    if (category === EQUIPMENT.MODULE + EQUIPMENT.EQUIPMENT_CATEGORY.MODEM) {
      equipmentInfo.modem = equipment;
    } else if (category === EQUIPMENT.MODULE + EQUIPMENT.EQUIPMENT_CATEGORY.OUTDOOR_UNIT) {
      equipmentInfo.radio = equipment;
    } else if (category === EQUIPMENT.MODULE + EQUIPMENT.EQUIPMENT_CATEGORY.FULL_OUTDOOR_UNIT) {
      equipmentInfo.device = equipment;
    }
  }
  return equipmentInfo;
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
      if (servingPhysicLtpList != undefined || servingPhysicLtpList.length != 0) {
        for (let i = 0; i < servingPhysicLtpList.length; i++) {
          let configuredResource = {};
          let servingPhysicLtp = servingPhysicLtpList[i];
          let layerProtocolName = servingPhysicLtp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME];
          let airInterfaceLayerProtocolName = AIR_INTERFACE.MODULE + AIR_INTERFACE.LAYER_PROTOCOL_NAME;
          let wireInterfaceLayerProtocolName = WIRE_INTERFACE.MODULE + WIRE_INTERFACE.LAYER_PROTOCOL_NAME;
          /****************************************************************************************
          * extracting link-id if radio-link-bonding
          ****************************************************************************************/
          if (layerProtocolName == airInterfaceLayerProtocolName) {
            let linkIdResponse = await getAirInterfaceConfigurationLinkId(mountName, servingPhysicLtp, requestHeaders, traceIndicatorIncrementer);
            if (Object.keys(linkIdResponse).length != 0) {
              if (linkIdResponse.airInterfaceName != undefined) {
                configuredResource.linkId = linkIdResponse.airInterfaceName;
              }
            }
            traceIndicatorIncrementer = linkIdResponse.traceIndicatorIncrementer;
            /****************************************************************************************
            * extracting link-id if physical-link-aggregation
            ****************************************************************************************/
          } else if (layerProtocolName == wireInterfaceLayerProtocolName) {
            let interfaceNameResponse = await getWireInterfaceOriginalLtpName(mountName, servingPhysicLtp, requestHeaders, traceIndicatorIncrementer);
            if (Object.keys(interfaceNameResponse).length != 0) {
              if (interfaceNameResponse.originalLtpName != undefined) {
                configuredResource.interfaceName = interfaceNameResponse.originalLtpName;
              }
            }
            traceIndicatorIncrementer = interfaceNameResponse.traceIndicatorIncrementer;
          }
          configuredGroupOfAirInterfaceList.push(configuredResource);
        }
      }
    }
    configuredGroupOfAirInterfacesResponse = {
      configuredGroupOfAirInterfaceList: configuredGroupOfAirInterfaceList,
      traceIndicatorIncrementer: traceIndicatorIncrementer
    }
    return configuredGroupOfAirInterfacesResponse;
  } catch (error) {
    console.log(error);
    return new createHttpError.InternalServerError();
  }
}
/**
* Collects the list of serving physical layer ltps for given ethernet-container
* @param {String} clientContainerLtp ethernet-container ltp for which serving physic ltps to be found
* @param {Object} ltpStructure ControlConstruct provided from cache
* @returns {Array} servingPhysicLtpList return list of serving physical layer ltp (air or wire)
*/
async function getServingPhysicLtpList(clientContainerLtp, ltpStructure) {
  let servingPhysicLtpList = [];
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
  return servingPhysicLtpList;
}

/**
 * Fetches air-interface-name for air-interface ltp found on radio-link-bonding
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} ltp air-interface ltp found on radio-link-bonding
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns air-interface-name(link-id) value and traceIndicatorIncrementer
 */
async function getAirInterfaceConfigurationLinkId(mountName, ltp, requestHeaders, traceIndicatorIncrementer) {
  let airInterfaceNameResponse = {};
  let pathParamList = [];
  try {
    let uuid = ltp[onfAttributes.GLOBAL_CLASS.UUID];
    let localId = ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LOCAL_CLASS.LOCAL_ID];
    pathParamList.push(mountName, uuid, localId);

    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *    /logical-termination-point={uuid}/layer-protocol={local-id}
     *        /air-interface-2-0:air-interface-pac/air-interface-configuration
     *****************************************************************************************************/
    let airInterfaceConfiguration = await ReadAirInterfaceData.RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(pathParamList, requestHeaders, traceIndicatorIncrementer);
    if (Object.keys(airInterfaceConfiguration).length === 0) {
      console.log(`${airInterfaceConfigurationForwardingName} is not success`);
    } else {
      airInterfaceNameResponse.airInterfaceName = airInterfaceConfiguration[AIR_INTERFACE.NAME];
    }
    airInterfaceNameResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
    return airInterfaceNameResponse;
  } catch (error) {
    return new createHttpError.InternalServerError(`${airInterfaceConfigurationForwardingName} is not success with ${error}`);
  }

}

/**
 * Fetches original-ltp-name for wire-interface ltp found on physical-link-aggregation
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} ltp wire-interface ltp found on physical-link-aggregation
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns original-ltp-name(interface-name) value and traceIndicatorIncrementer
 */
async function getWireInterfaceOriginalLtpName(mountName, ltp, requestHeaders, traceIndicatorIncrementer) {
  let originalLtpNameResponse = {};
  let pathParamList = [];
  const physicalLinkAggregationForwardingName = "RequestForProvidingAcceptanceDataCausesAnalysingTheAggregation";
  const physicalLinkAggregationStringName = "RequestForProvidingAcceptanceDataCausesAnalysingTheAggregation.LtpName";
  try {
    let uuid = ltp[onfAttributes.GLOBAL_CLASS.UUID];
    pathParamList.push(mountName, uuid);
    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesAnalysingTheAggregation
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *    /logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac?fields=original-ltp-name
     *****************************************************************************************************/
    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(physicalLinkAggregationForwardingName, physicalLinkAggregationStringName);
    let ltpAugmentResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParamList, requestHeaders, traceIndicatorIncrementer++);
    if (Object.keys(ltpAugmentResponse).length == 0) {
      console.log(`${physicalLinkAggregationForwardingName} is not success`);
    } else {
      originalLtpNameResponse.originalLtpName = ltpAugmentResponse[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC][LTP_AUGMENT.ORIGINAL_LTP_NAME];
    }
    originalLtpNameResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
    return originalLtpNameResponse;

  } catch (error) {
    return new createHttpError.InternalServerError(`${physicalLinkAggregationForwardingName} is not success with ${error}`);
  }
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
* @param {String} uuidUnderTest Identifier of the air-interface under test
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
    pluggedSfpPmdListResponse = {
      pluggedSfpPmdList: pluggedSfpPmdList,
      traceIndicatorIncrementer: traceIndicatorIncrementer
    }
    return pluggedSfpPmdListResponse;

  } catch (error) {
    console.log(error);
    return new createHttpError.InternalServerError();
  }
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
        let equipmentUuidList = equipmentUuidResponse[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC][LTP_AUGMENT.EQUIPMENT];
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
                let equipmentCategory = equipmentCategoryResponse[CORE.MODULE + EQUIPMENT.EQUIPMENT.ACTUAL_EQUIPMENT][EQUIPMENT.ACTUAL_EQUIPMENT.STRUCTURE][EQUIPMENT.ACTUAL_EQUIPMENT.CATEGORY];
                let expectedEquipmentCategory = CORE.MODULE + EQUIPMENT.EQUIPMENT_CATEGORY.SFP;
                if (equipmentCategory == expectedEquipmentCategory) {
                  pluggableSfp = true;
                  break;
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
    pluggableSfpListResponse.pluggableSfpList = pluggableSfpList;
    pluggableSfpListResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
    return pluggableSfpListResponse;
  } catch (error) {
    console.log(error);
    return new createHttpError.InternalServerError();
  }
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
      wireInterfaceNameResponse.wireInterfaceName = response[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC][LTP_AUGMENT.ORIGINAL_LTP_NAME];
    }
    wireInterfaceNameResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
    return wireInterfaceNameResponse;
  } catch (error) {
    console.log(error);
    return new createHttpError.InternalServerError();
  }
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
      for (let i = 0; i < supportedPmdKindList.length; i++) {
        supportedPmdList.push(supportedPmdKindList[i][WIRE_INTERFACE.PMD_NAME]);
      }
      supportedPmdListResponse.supportedPmdList = supportedPmdList;
    }
    supportedPmdListResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
    return supportedPmdListResponse;
  } catch (error) {
    console.log(error);
    return new createHttpError.InternalServerError();
  }
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
    operatedPmdResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
    return operatedPmdResponse;
  } catch (error) {
    console.log(error);
    return new createHttpError.InternalServerError();
  }
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
async function FetchConnectorPluggingTheOutdoorUnit(mountName, ltpStructure, uuidUnderTest, requestHeaders, traceIndicatorIncrementer) {
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
            let sequenceId = connectorNumberResponse[CORE.MODULE + EQUIPMENT.EQUIPMENT.CONNECTOR][0][EQUIPMENT.MODULE + EQUIPMENT.CONNECTOR.CONNECTOR_PAC][EQUIPMENT.CONNECTOR.SEQUENCE_ID];
            if (sequenceId != undefined) {
              connectorPluggingTheOutdoorUnitResponse.connectorPluggingTheOutdoorUnit = sequenceId;
              break;
            }
          }
        }
      }
    }
    connectorPluggingTheOutdoorUnitResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
    return connectorPluggingTheOutdoorUnitResponse;
  } catch (error) {
    console.log(error);
    return new createHttpError.InternalServerError();
  }
}
