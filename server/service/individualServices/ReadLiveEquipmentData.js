'use strict';

/**
 * @file This module provides functionality to gather the Equipment data for given mount-name and linkId. 
 * @module readLiveEquipmentData
 **/
const IndividualServiceUtility = require('./IndividualServiceUtility');
const ltpStructureUtility = require('./LtpStructureUtility');
const createHttpError = require('http-errors');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');

const AIR_INTERFACE = {
  MODULE: "air-interface-2-0",
  LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
  CONFIGURATION: "air-interface-configuration",
  CAPABILITY: "air-interface-capability",
  STATUS: "air-interface-status",
  NAME: "air-interface-name"
};

const LTP_AUGMENT = {
  MODULE: "ltp-augment-1-0:",
  PAC: "ltp-augment-pac",
  EXTERNAL_LABEL: "external-label",
  EQUIPMENT: "equipment"
};

/**
 * This method performs the set of procedure to gather the airInterface data
 * @param {String}  mountName Identifier of the device at the Controller
 * @param {String}  linkId Identifier of the microwave link in the planning
 * @param {Object}  ltpStructure ControlConstruct provided from cache
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * The following are the list of forwarding-construct that will be automated to gather the airInterface data 
 * 1. RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest
 * 2. RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache
 * 3. RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache
 * 4. RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive
   @returns {Object} result which contains the airInterface data and uuidUnderTest
* **/
exports.readLiveEquipmentData = async function (mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer) {
  try {
    /****************************************************************************************
     * Declaring required variables
     ****************************************************************************************/
    let uuidUnderTest = "";
    let airInterface = {};

    /****************************************************************************************
     *  Fetching and setting up UuidUnderTest and PathParameters
     ****************************************************************************************/
    let uuidUnderTestResponse = await RequestForProvidingEquipmentForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest(
      ltpStructure,
      mountName,
      linkId,
      requestHeaders,
      traceIndicatorIncrementer);

    if (Object.keys(uuidUnderTestResponse).length !== 0) {
      uuidUnderTest = uuidUnderTestResponse.uuidUnderTest;
      let pathParams = uuidUnderTestResponse.pathParams;
      let airInterfaceEndPointName = uuidUnderTestResponse.externalLabel;
      traceIndicatorIncrementer = uuidUnderTestResponse.traceIndicatorIncrementer;

      /****************************************************************************************
       *  Fetching airInterfaceConfiguration , airInterfaceCapability, airInterfaceStatus
       ****************************************************************************************/
      if (uuidUnderTest != "") {
        let listEquipmentUuid = await exports.RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache(pathParams, requestHeaders, traceIndicatorIncrementer);
        return listEquipmentUuid;
      }

    }
  } catch (error) {
    console.log(`readAirInterfaceData is not success with ${error}`);
  }
}

/**
 * Prepare attributes and automate RequestForProvidingStatusForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest
 * @param {Object}  ltpStructure ControlConstruct provided from cache.
 * @param {String}  mountName Identifier of the device at the Controller
 * @param {String}  linkId Identifier of the microwave link in the planning
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return values of uuidUnderTest,PathParams,trace indicator incrementer if external-label === linkId
 */
async function RequestForProvidingEquipmentForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest(ltpStructure, mountName, linkId, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest";
  const stringName = "RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest.AirInterfaceLabel";
  let uuidUnderTestResponse = {};
  let uuidUnderTest = "";
  let externalLabel = "";
  let pathParams = [];
  try {
    let pathParamList = [];

    /***********************************************************************************
     * Preparing path paramrters list 
     ************************************************************************************/

    let airInterfaceLtpList = await ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(
      AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.LAYER_PROTOCOL_NAME, ltpStructure);
    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    for (let i = 0; i < airInterfaceLtpList.length; i++) {
      let uuid = airInterfaceLtpList[i][onfAttributes.GLOBAL_CLASS.UUID];
      let localId = airInterfaceLtpList[i][onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LOCAL_CLASS.LOCAL_ID];
      pathParamList = [];
      pathParamList.push(mountName);
      pathParamList.push(uuid);
      pathParamList.push(localId);
      let _traceIndicatorIncrementer = traceIndicatorIncrementer++;

      /****************************************************************************************************
       * RequestForProvidingEquipmentForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest
       *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}/logical-termination-point={uuid}
       *      /ltp-augment-1-0:ltp-augment-pac?fields=external-label
       *****************************************************************************************************/

      let externalLabelResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParamList, requestHeaders, _traceIndicatorIncrementer);
      if (Object.keys(externalLabelResponse).length === 0) {
        console.log(createHttpError.InternalServerError(`${forwardingName} is not success`));
      } else {
        externalLabelResponse = externalLabelResponse[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC][LTP_AUGMENT.EXTERNAL_LABEL];
        let linkIdFromExternalLabel = externalLabelResponse.substring(0, 9);
        if (linkIdFromExternalLabel === linkId) {
          uuidUnderTest = uuid;
          externalLabel = externalLabelResponse;
          pathParams = pathParamList;
          break;
        }
      }
    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
  }
  uuidUnderTestResponse.uuidUnderTest = uuidUnderTest;
  uuidUnderTestResponse.pathParams = pathParams;
  uuidUnderTestResponse.externalLabel = externalLabel;
  uuidUnderTestResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return uuidUnderTestResponse;
}

/**
 * Prepare attributes and automate RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCacheEquipmentUuid
 * @param {Object}  pathParams path parameters UuidUnderTest and LocalIdUnderTest.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns airInterfaceConfiguration for UuidUnderTest and LocalIdUnderTest
 */
exports.RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache = async function (pathParams, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache.EquipmentUuid";
  const stringName = "RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache.EquipmentUuid";
  let equipmentUuidList = {}; 
  let newStructure = {
    "radio": {
      "equipment-name": "",
      "serial-number": "",
      "part-number": ""
    },
    "modem": {
      "equipment-name": "",
      "serial-number": "",
      "part-number": ""
    },
    "device": {
      "equipment-name": "",
      "serial-number": "",
      "part-number": ""
    }
  };
  try {

    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *    /logical-termination-point={uuid}/layer-protocol={local-id}
     *        /air-interface-2-0:air-interface-pac/air-interface-configuration
     *****************************************************************************************************/

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let equipmentUuidListResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(equipmentUuidListResponse).length === 0) {
      console.log(`${forwardingName} is not success`);
    }
    const forwardingName1 = "RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache.EquipmentInfo";
    const stringName1 = "RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache.EquipmentInfo";
    equipmentUuidListResponse = equipmentUuidListResponse[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC][LTP_AUGMENT.EQUIPMENT]
    
    for (let i = 0; i < equipmentUuidListResponse.length; i++) {
      let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName1, stringName1)
      let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
      pathParams[1] = equipmentUuidListResponse[i];
      let equipmentCategoryResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
      equipmentCategoryResponse = equipmentCategoryResponse["core-model-1-4:actual-equipment"]
      if (Object.keys(equipmentUuidListResponse).length === 0) {
        console.log(`${forwardingName} is not success`);
      } else {
        addToStructure(equipmentCategoryResponse, newStructure);
      }

    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
  }
  
  return newStructure;
}

// Helping routine that extract data and fill the structure with equipment information
function addToStructure(data, structure) {
  const { category } = data.structure;
  const { "type-name": equipmentName, "part-type-identifier": partNumber } = data["manufactured-thing"]["equipment-type"];
  const { "serial-number": serialNumber } = data["manufactured-thing"]["equipment-instance"];

  if (category === "equipment-augment-1-0:EQUIPMENT_CATEGORY_MODEM") {
    structure.modem = {
      "equipment-name": equipmentName,
      "serial-number": serialNumber,
      "part-number": partNumber,
    };
  } else if (category === "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT") {
    structure.radio = {
      "equipment-name": equipmentName,
      "serial-number": serialNumber,
      "part-number": partNumber,
    };
  } else if (category === "equipment-augment-1-0:EQUIPMENT_CATEGORY_FULL_OUTDOOR_UNIT") {
    structure.device = {
      "equipment-name": equipmentName,
      "serial-number": serialNumber,
      "part-number": partNumber,
    };
  }
}
