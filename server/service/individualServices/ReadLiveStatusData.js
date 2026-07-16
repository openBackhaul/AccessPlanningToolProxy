'use strict';

/**
 * @file This module provides functionality to gather the status data for given mount-name and linkId. 
 * @module readStatusInterfaceData
 **/
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');

const createHttpError = require('http-errors');

const IndividualServiceUtility = require('./IndividualServiceUtility');
const ltpStructureUtility = require('./LtpStructureUtility');

const logger = require('../LoggingService').getLogger();

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
  EXTERNAL_LABEL: "external-label"
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
exports.readStatusInterfaceData = async function (mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer) {
  let uuidUnderTest = "";
  try {
    /****************************************************************************************
     * Declaring required variables
     ****************************************************************************************/

    let airInterface = {};

    /****************************************************************************************
     *  Fetching and setting up UuidUnderTest and PathParameters
     ****************************************************************************************/
    logger.info(`readStatusInterfaceData - Calling RequestForProvidingStatusForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest ${mountName} linkid ${linkId}`);
    let uuidUnderTestResponse = await exports.RequestForProvidingStatusForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest(
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

        let airInterfaceCapability = await exports.RequestForProvidingStatusForLivenetviewCausesReadingCapabilitiesFromCache(pathParams, requestHeaders, traceIndicatorIncrementer);
        if (Object.keys(airInterfaceCapability).length !== 0) {
          traceIndicatorIncrementer = airInterfaceCapability.traceIndicatorIncrementer;
        }

        let airInterfaceStatus = await exports.RequestForProvidingStatusForLivenetviewCausesReadingDedicatedStatusValuesFromLive(pathParams, requestHeaders, traceIndicatorIncrementer);
        if (Object.keys(airInterfaceStatus).length !== 0) {
          traceIndicatorIncrementer = airInterfaceStatus.traceIndicatorIncrementer;
        }


        /****************************************************************************************
         *  Fetching the air interface data for response body
         ****************************************************************************************/
        if (Object.keys(airInterfaceCapability).length !== 0 ||
          Object.keys(airInterfaceStatus).length !== 0) {
          airInterface = await formulateAirInterfaceResponseBody(airInterfaceEndPointName, airInterfaceCapability, airInterfaceStatus)
        }

        let airInterfaceResult = {
          uuidUnderTest: uuidUnderTest,
          airInterface: airInterface,
          traceIndicatorIncrementer: traceIndicatorIncrementer
        };

        return airInterfaceResult;
      }
    } else {
      logger.warn(`readStatusInterfaceData - Unable to fetch UuidUnderTest and LocalIdUnderTest for linkId ${linkId} and mountName ${mountName}`);
    }

  } catch (error) {
    logger.error(error, "readStatusInterfaceData is not success");
  }

  if (uuidUnderTest == "") {
    logger.warn(`readStatusInterfaceData - Resource not existing. Device informs about addressed resource unknown, Throwing 470 error`);
    throw new createHttpError(470, "Resource not existing. Device informs about addressed resource unknown");
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
exports.RequestForProvidingStatusForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest = async function (ltpStructure, mountName, linkId, requestHeaders, traceIndicatorIncrementer) {
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
       * RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest
       *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mountName}/logical-termination-point={uuid}
       *      /ltp-augment-1-0:ltp-augment-pac?fields=external-label
       *****************************************************************************************************/

      let externalLabelResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParamList, requestHeaders, _traceIndicatorIncrementer);
      if (Object.keys(externalLabelResponse).length === 0) {
        logger.warn(`DeterminingAirInterfaceUuidUnderTest - externalLabelResponse for ${forwardingName} doesn't contains keys`);
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
    logger.error(error, `${forwardingName} is not success`);
  }
  uuidUnderTestResponse.uuidUnderTest = uuidUnderTest;
  uuidUnderTestResponse.pathParams = pathParams;
  uuidUnderTestResponse.externalLabel = externalLabel;
  uuidUnderTestResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return uuidUnderTestResponse;
}

/**
 * Prepare attributes and automate RequestForProvidingStatusForLivenetviewCausesReadingConfigurationFromCache
 * @param {Object}  pathParams path parameters UuidUnderTest and LocalIdUnderTest.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns airInterfaceConfiguration for UuidUnderTest and LocalIdUnderTest
 */
exports.RequestForProvidingStatusForLivenetviewCausesReadingConfigurationFromCache = async function (pathParams, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingStatusForLivenetviewCausesReadingConfigurationFromCache";
  const stringName = "RequestForProvidingStatusForLivenetviewCausesReadingConfigurationFromCache.ConfigurationFromCache"
  let airInterfaceConfiguration = {};
  try {

    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mountName}
     *    /logical-termination-point={uuid}/layer-protocol={local-id}
     *        /air-interface-2-0:air-interface-pac/air-interface-configuration
     *****************************************************************************************************/

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let airInterfaceConfigurationResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(airInterfaceConfigurationResponse).length === 0) {
      logger.warn("ReadingConfigurationFromCache - keys in airInterfaceConfigurationResponse are 0");
    } else {
      airInterfaceConfiguration = airInterfaceConfigurationResponse[AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.CONFIGURATION];
    }
  } catch (error) {
    logger.error(error, `${forwardingName} is not success`);
  }

  if (airInterfaceConfiguration == undefined) {
    logger.warn("ReadingConfigurationFromCache - airInterfaceConfiguration is undefined, filling with empty object");
    airInterfaceConfiguration = {};
  }

  airInterfaceConfiguration.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return airInterfaceConfiguration;
}

/**
 * Prepare attributes and automate RequestForProvidingStatusForLivenetviewCausesReadingCapabilitiesFromCache
 * @param {Object}  pathParams path parameters UuidUnderTest and LocalIdUnderTest.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns airInterfaceCapability for UuidUnderTest and LocalIdUnderTest
 */
exports.RequestForProvidingStatusForLivenetviewCausesReadingCapabilitiesFromCache = async function (pathParams, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingStatusForLivenetviewCausesReadingCapabilitiesFromCache";
  const stringName = "RequestForProvidingStatusForLivenetviewCausesReadingCapabilitiesFromCache.CapabilitiesFromCache"
  let airInterfaceCapability = {};
  try {

    /****************************************************************************************************
     * RequestForProvidingStatusForLivenetviewCausesReadingCapabilitiesFromCache
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mountName}
     *          /logical-termination-point={uuid}/layer-protocol={local-id}
     *        /air-interface-2-0:air-interface-pac/air-interface-capability
     *****************************************************************************************************/

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let airInterfaceCapabilityResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(airInterfaceCapabilityResponse).length === 0) {
      logger.warn("ReadingCapabilitiesFromCache - keys in airInterfaceCapabilityResponse are 0");
    } else {
      airInterfaceCapability = airInterfaceCapabilityResponse[AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.CAPABILITY];
    }
  } catch (error) {
    logger.error(error, `${forwardingName} is not success`);
  }

  if (airInterfaceCapability == undefined) {
    logger.warn("ReadingCapabilitiesFromCache - airInterfaceCapability is undefined, filling with empty object");
    airInterfaceCapability = {};
  }
  airInterfaceCapability.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return airInterfaceCapability;
}

/**
 * Prepare attributes and automate RequestForProvidingStatusForLivenetviewCausesReadingDedicatedStatusValuesFromLive
 * @param {Object}  pathParams path parameters UuidUnderTest and LocalIdUnderTest.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator * 
 * @returns {Object} returns airInterfaceStatus for UuidUnderTest and LocalIdUnderTest
 */
exports.RequestForProvidingStatusForLivenetviewCausesReadingDedicatedStatusValuesFromLive = async function (pathParams, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingStatusForLivenetviewCausesReadingDedicatedStatusValuesFromLive";
  const stringName = "RequestForProvidingStatusForLivenetviewCausesReadingDedicatedStatusValuesFromLive.DedicatedStatusValuesFromLive";
  let airInterfaceStatus = {};
  try {

    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive
     *   MWDI://core-model-1-4:network-control-domain=live/control-construct={mountName}
     *        /logical-termination-point={uuid}/layer-protocol={local-id}
     *        /air-interface-2-0:air-interface-pac/air-interface-status
     *        ?fields=tx-level-cur;rx-level-cur;transmission-mode-cur;rx-frequency-cur;tx-frequency-cur
     *****************************************************************************************************/

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let airInterfaceStatusResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(airInterfaceStatusResponse).length === 0) {
      logger.warn("ReadingDedicatedStatusValuesFromLive - keys in airInterfaceStatusResponse are 0");
    } else {
      airInterfaceStatus = airInterfaceStatusResponse[AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.STATUS];
    }
  } catch (error) {
    logger.error(error, `${forwardingName} is not success`);
  }

  if (airInterfaceStatus == undefined) {
    logger.warn("ReadingDedicatedStatusValuesFromLive - airInterfaceStatus is undefined, filling with empty object");
    airInterfaceStatus = {};
  }

  airInterfaceStatus.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return airInterfaceStatus;
}

/**
 * Formulate air interface response body attributes.
 * @param {Object}  airInterfaceCapability air-interface-capability from callback RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache .
 * @param {Object}  airInterfaceStatus air-interface-status fetched from callback RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive.
 * @returns {Object} returns formulated air interface response body attributes.
 */
async function formulateAirInterfaceResponseBody(airInterfaceEndPointName, airInterfaceCapability, airInterfaceStatus) {
  let airInterface = {};
  try {
    if (airInterfaceStatus.hasOwnProperty("tx-level-cur")) {
      airInterface["current-tx-power"] = airInterfaceStatus["tx-level-cur"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - NO tx-level-cur for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceStatus.hasOwnProperty("rx-level-cur")) {
      airInterface["current-rx-level"] = airInterfaceStatus["rx-level-cur"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - NO rx-level-cur for ${airInterfaceEndPointName}`);
    }

    let curTransmissionMode = await getConfiguredModulation(
      airInterfaceCapability,
      airInterfaceStatus["transmission-mode-cur"]);

    if (curTransmissionMode) {
      airInterface["current-modulation"] = {
        "number-of-states": curTransmissionMode["modulation-scheme"],
        "name-at-lct": curTransmissionMode["modulation-scheme-name-at-lct"]
      };
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - NO current-modulation for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceStatus.hasOwnProperty("tx-frequency-cur")) {
      airInterface["current-tx-frequency"] = airInterfaceStatus["tx-frequency-cur"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - NO tx-frequency-cur for ${airInterfaceEndPointName}`);
    }
    if (airInterfaceStatus.hasOwnProperty("rx-frequency-cur")) {
      airInterface["current-rx-frequency"] = airInterfaceStatus["rx-frequency-cur"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - NO rx-frequency-cur for ${airInterfaceEndPointName}`);
    }

  } catch (error) {
    logger.error(error);
  }
  return airInterface;
}

/**
 * Fetchs configured Modulation based on tansmission mode type min , max , or current .
 * @param {Object}  airInterfaceCapability air-interface-capability.
 * @param {Object}  transmissioModeType tansmission mode type min , max , or current.
 * @returns {Object} returns transmission mode fetched tansmission mode list of capability.
 */
async function getConfiguredModulation(airInterfaceCapability, transmissioModeType) {
  let transmissionModeFromtransmissionModeList = {};
  if (airInterfaceCapability && airInterfaceCapability.hasOwnProperty("transmission-mode-list")) {
    let transmissionModeList = airInterfaceCapability["transmission-mode-list"];
    if (transmissionModeList != undefined && transmissioModeType != undefined) {
      transmissionModeFromtransmissionModeList = transmissionModeList.find(transmissionMode =>
        transmissionMode["transmission-mode-name"] === transmissioModeType)
    } else {
      logger.debug(`getConfiguredModulation - transmissionModeList or transmissioModeType are undefined`);
    }
  } else {
    logger.debug(`getConfiguredModulation - airInterfaceCapability is undefined`);
  }
  return transmissionModeFromtransmissionModeList;
}
