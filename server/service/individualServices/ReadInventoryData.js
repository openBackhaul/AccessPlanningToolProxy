const IndividualServiceUtility = require('./IndividualServiceUtility');
const createHttpError = require('http-errors');

const FIRMWARE = {
  MODULE: "firmware-1-0:", COLLECTION: "firmware-collection", CLASS_TYPE: "FIRMWARE_COMPONENT_CLASS_TYPE_PACKAGE",
  COMPONENT_LIST: "firmware-component-list", PAC: "firmware-component-pac", CAPABILITY: "firmware-component-capability",
  CLASS: "firmware-component-class", NAME: "firmware-component-name", VERSION: "firmware-component-version", STATUS: "firmware-component-status"
};

/**
 * This method performs the set of procedure to gather the inventory data
 * @param {String} mountName Identifier of the device at the Controller
 * @param {String} linkId Identifier of the microwave link in the planning
 * @param {String} uuidUnderTest Identifier of the air-interface under test
 * @param {Object} ltpStructure ControlConstruct provided from cache
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
   @returns {Object} result which contains the inventory data and traceIndicatorIncrementer
* **/
exports.readInventoryData = function (mountName, linkId, ltpStructure, uuidUnderTest, requestHeaders, traceIndicatorIncrementer) {
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
        if(Object.keys(installedFirmwareResponse).length > 0) {
          if(installedFirmwareResponse.installedFirmware != undefined) {
            inventoryData.installedFirmware = installedFirmwareResponse.installedFirmware;
          }
          traceIndicatorIncrementer = installedFirmwareResponse.traceIndicatorIncrementer;
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