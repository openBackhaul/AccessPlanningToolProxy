const IndividualServiceUtility = require('./IndividualServiceUtility');
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

const LTP_AUGMENT = {
  MODULE: "ltp-augment-1-0",
  PAC: "ltp-augment-pac",
  EQUIPMENT: "equipment"
}

const EQUIPMENT = {
  CORE_MODEL_ACTUAL_EQUIPMENT: "core-model-1-4:actual-equipment",
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
    MODULE: "equipment-augment-1-0",
    MODEM: "EQUIPMENT_CATEGORY_MODEM",
    OUTDOOR_UNIT: "EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
    FULL_OUTDOOR_UNIT: "EQUIPMENT_CATEGORY_FULL_OUTDOOR_UNIT"
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
      return new createHttpError.InternalServerError();
    }

    equipmentUuidResponse.equipmentUuidList = ltpAugmentResponse[LTP_AUGMENT.MODULE + ":" + LTP_AUGMENT.PAC][LTP_AUGMENT.EQUIPMENT];
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
        return new createHttpError.InternalServerError();
      }
      equipmentInfoList.push(equipmentInfoResponse);
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
    let manufacturedThing = equipmentInfoList[i][EQUIPMENT.CORE_MODEL_ACTUAL_EQUIPMENT][EQUIPMENT.ACTUAL_EQUIPMENT.MANUFACTURED_THING];
    let category = equipmentInfoList[i][EQUIPMENT.CORE_MODEL_ACTUAL_EQUIPMENT][EQUIPMENT.ACTUAL_EQUIPMENT.STRUCTURE][EQUIPMENT.ACTUAL_EQUIPMENT.CATEGORY];
    equipment[EQUIPMENT.ACTUAL_EQUIPMENT.EQUIPMENT_NAME] = manufacturedThing[EQUIPMENT.ACTUAL_EQUIPMENT.EQUIPMENT_TYPE][EQUIPMENT.ACTUAL_EQUIPMENT.TYPE_NAME];
    equipment[EQUIPMENT.ACTUAL_EQUIPMENT.SERIAL_NUMBER] = manufacturedThing[EQUIPMENT.ACTUAL_EQUIPMENT.EQUIPMENT_INSTANCE][EQUIPMENT.ACTUAL_EQUIPMENT.SERIAL_NUMBER];
    equipment[EQUIPMENT.ACTUAL_EQUIPMENT.PART_NUMBER] = manufacturedThing[EQUIPMENT.ACTUAL_EQUIPMENT.EQUIPMENT_TYPE][EQUIPMENT.ACTUAL_EQUIPMENT.PART_TYPE_IDENTIFIER];
    if (category === EQUIPMENT.EQUIPMENT_CATEGORY.MODULE + ":" + EQUIPMENT.EQUIPMENT_CATEGORY.MODEM) {
      equipmentInfo.modem = equipment;
    } else if (category === EQUIPMENT.EQUIPMENT_CATEGORY.MODULE + ":" + EQUIPMENT.EQUIPMENT_CATEGORY.OUTDOOR_UNIT) {
      equipmentInfo.radio = equipment;
    } else if (category === EQUIPMENT.EQUIPMENT_CATEGORY.MODULE + ":" + EQUIPMENT.EQUIPMENT_CATEGORY.FULL_OUTDOOR_UNIT) {
      equipmentInfo.device = equipment;
    }
  }
  return equipmentInfo;
}