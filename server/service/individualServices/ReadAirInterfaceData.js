'use strict';

/**
 * @file This module provides functionality to gather the air-interface data for given mount-name and linkId. 
 * @module readAirInterfaceData
 **/
const IndividualServiceUtility = require('./IndividualServiceUtility');
const ltpStructureUtility = require('./LtpStructureUtility');
const createHttpError = require('http-errors');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');

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
exports.readAirInterfaceData = async function (mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer) {
  try {
    /****************************************************************************************
     * Declaring required variables
     ****************************************************************************************/
    let uuidUnderTest = "";
    let airInterface = {};

    /****************************************************************************************
     *  Fetching and setting up UuidUnderTest and PathParameters
     ****************************************************************************************/
    logger.info(`readAirInterfaceData - Retrieving air interface UUID under test for MountName ${mountName} linkid ${linkId}`);
    let uuidUnderTestResponse = await RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest(
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
        logger.info(`readAirInterfaceData - Retrieving Configuration from Cache with path ${pathParams}`);
        let airInterfaceConfiguration = await exports.RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(pathParams, requestHeaders, traceIndicatorIncrementer);

        if (Object.keys(airInterfaceConfiguration).length !== 0) {
          traceIndicatorIncrementer = airInterfaceConfiguration.traceIndicatorIncrementer;
        } else {
          logger.warn(`readAirInterfaceData - NO DATA from Configuration from Cache with path ${pathParams}`);
        }

        logger.info(`readAirInterfaceData - Retrieving Capabilities from Cache with path ${pathParams}`);
        let airInterfaceCapability = await RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(pathParams, requestHeaders, traceIndicatorIncrementer);
        if (Object.keys(airInterfaceCapability).length !== 0) {
          traceIndicatorIncrementer = airInterfaceCapability.traceIndicatorIncrementer;
        } else {
          logger.warn(`readAirInterfaceData - NO DATA from Capabilities from Cache with path ${pathParams}`);
        }

        logger.info(`readAirInterfaceData - Retrieving Dedicated Status value from Live with path ${pathParams}`);
        let airInterfaceStatus = await RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive(pathParams, requestHeaders, traceIndicatorIncrementer);
        if (Object.keys(airInterfaceStatus).length !== 0) {
          traceIndicatorIncrementer = airInterfaceStatus.traceIndicatorIncrementer;
        } else {
          logger.warn(`readAirInterfaceData - NO DATA from Dedicated Status value from Live with path ${pathParams}`);
        }

        /****************************************************************************************
         *  Fetching the air interface data for response body
         ****************************************************************************************/
        if (Object.keys(airInterfaceConfiguration).length !== 0 ||
          Object.keys(airInterfaceCapability).length !== 0 ||
          Object.keys(airInterfaceStatus).length !== 0) {
          logger.debug("readAirInterfaceData - Transforming Air interface data to response body");
          airInterface = await formulateAirInterfaceResponseBody(airInterfaceEndPointName, airInterfaceConfiguration, airInterfaceCapability, airInterfaceStatus)
        } else {
          logger.warn("readAirInterfaceData - skipping formulateAirInterfaceResponseBody");
        }
      }
    } else {
      logger.error(`readAirInterfaceData - Unable to fetch UuidUnderTest and LocalIdUnderTest for linkId ${linkId} and mountName ${mountName}`);
    }

    let airInterfaceResult = {
      uuidUnderTest: uuidUnderTest,
      airInterface: airInterface,
      traceIndicatorIncrementer: traceIndicatorIncrementer
    };

    return airInterfaceResult;
  } catch (error) {
    logger.error(error, `readAirInterfaceData is not success`);
  }
}

/**
 * Prepare attributes and automate RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest
 * @param {Object}  ltpStructure ControlConstruct provided from cache.
 * @param {String}  mountName Identifier of the device at the Controller
 * @param {String}  linkId Identifier of the microwave link in the planning
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return values of uuidUnderTest,PathParams,trace indicator incrementer if external-label === linkId
 */
async function RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest(ltpStructure, mountName, linkId, requestHeaders, traceIndicatorIncrementer) {
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
        logger.error(`DeterminingAirInterfaceUuidUnderTest - ${forwardingName} is not success for mountname ${mountName} linkid ${linkId}`);
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
 * Prepare attributes and automate RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache
 * @param {Object}  pathParams path parameters UuidUnderTest and LocalIdUnderTest.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns airInterfaceConfiguration for UuidUnderTest and LocalIdUnderTest
 */
exports.RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache = async function (pathParams, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache";
  const stringName = "RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache.ConfigurationFromCache"
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
      logger.warn(`ReadingConfigurationFromCache - ${forwardingName} is not success, airInterfaceConfigurationResponse is empty`);
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
 * Prepare attributes and automate RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache
 * @param {Object}  pathParams path parameters UuidUnderTest and LocalIdUnderTest.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns airInterfaceCapability for UuidUnderTest and LocalIdUnderTest
 */
async function RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(pathParams, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache";
  const stringName = "RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache.CapabilitiesFromCache"
  let airInterfaceCapability = {};
  try {

    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mountName}
     *          /logical-termination-point={uuid}/layer-protocol={local-id}
     *        /air-interface-2-0:air-interface-pac/air-interface-capability
     *****************************************************************************************************/

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let airInterfaceCapabilityResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(airInterfaceCapabilityResponse).length === 0) {
      logger.warn(`ReadingCapabilitiesFromCache - ${forwardingName} is not success, airInterfaceCapabilityResponse is empty`);
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
 * Prepare attributes and automate RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive
 * @param {Object}  pathParams path parameters UuidUnderTest and LocalIdUnderTest.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator * 
 * @returns {Object} returns airInterfaceStatus for UuidUnderTest and LocalIdUnderTest
 */
async function RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive(pathParams, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive";
  const stringName = "RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive.StatusFromLive";
  let airInterfaceStatus = {};
  try {

    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive
     *   MWDI://core-model-1-4:network-control-domain=live/control-construct={mountName}
     *        /logical-termination-point={uuid}/layer-protocol={local-id}
     *        /air-interface-2-0:air-interface-pac/air-interface-status
     *        ?fields=tx-level-cur;rx-level-cur;transmission-mode-cur;xpd-cur;snir-cur
     *****************************************************************************************************/

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let airInterfaceStatusResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(airInterfaceStatusResponse).length === 0) {
      logger.error(`ReadingDedicatedStatusValuesFromLive - ${forwardingName} is not success, airInterfaceStatusResponse is empty`);
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
 * @param {Object}  airInterfaceConfiguration air-interface-configuration fetched from callback RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache.
 * @param {Object}  airInterfaceCapability air-interface-capability from callback RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache .
 * @param {Object}  airInterfaceStatus air-interface-status fetched from callback RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive.
 * @returns {Object} returns formulated air interface response body attributes.
 */
async function formulateAirInterfaceResponseBody(airInterfaceEndPointName, airInterfaceConfiguration, airInterfaceCapability, airInterfaceStatus) {
  let airInterface = {};
  try {
    if (airInterfaceEndPointName) {
      airInterface["air-interface-endpoint-name"] = airInterfaceEndPointName;
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceEndPointName is undefined`);
    }

    if (airInterfaceConfiguration.hasOwnProperty("tx-power")) {
      airInterface["configured-tx-power"] = airInterfaceConfiguration["tx-power"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceConfiguration - tx-power is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceStatus.hasOwnProperty("tx-level-cur")) {
      airInterface["current-tx-power"] = airInterfaceStatus["tx-level-cur"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceStatus - tx-level-curr is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceStatus.hasOwnProperty("rx-level-cur")) {
      airInterface["current-rx-level"] = airInterfaceStatus["rx-level-cur"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceStatus - rx-level-cur is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceStatus.hasOwnProperty("tx-frequency-cur")) {
      airInterface["current-tx-frequency"] = airInterfaceStatus["tx-frequency-cur"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceStatus - tx-frequency-cur is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceStatus.hasOwnProperty("rx-frequency-cur")) {
      airInterface["current-rx-frequency"] = airInterfaceStatus["rx-frequency-cur"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceStatus - rx-frequency-cur is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceConfiguration.hasOwnProperty("transmitted-radio-signal-id")) {
      airInterface["configured-transmitted-radio-signal-id"] = airInterfaceConfiguration["transmitted-radio-signal-id"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceConfiguration - transmitted-radio-signal-id is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceConfiguration.hasOwnProperty("expected-radio-signal-id")) {
      airInterface["configured-expected-radio-signal-id"] = airInterfaceConfiguration["expected-radio-signal-id"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceConfiguration - expected-radio-signal-id is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceConfiguration.hasOwnProperty("atpc-is-on")) {
      airInterface["configured-atpc-is-on"] = airInterfaceConfiguration["atpc-is-on"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceConfiguration - atpc-is-on is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceConfiguration.hasOwnProperty("atpc-thresh-upper")) {
      airInterface["configured-atpc-threshold-upper"] = airInterfaceConfiguration["atpc-thresh-upper"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceConfiguration - atpc-thresh-upper is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceConfiguration.hasOwnProperty("atpc-thresh-lower")) {
      airInterface["configured-atpc-threshold-lower"] = airInterfaceConfiguration["atpc-thresh-lower"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceConfiguration - atpc-thresh-lowe is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceConfiguration.hasOwnProperty("atpc-tx-power-min")) {
      airInterface["configured-atpc-tx-power-min"] = airInterfaceConfiguration["atpc-tx-power-min"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceConfiguration - atpc-tx-power-min is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceConfiguration.hasOwnProperty("adaptive-modulation-is-on")) {
      airInterface["configured-adaptive-modulation-is-on"] = airInterfaceConfiguration["adaptive-modulation-is-on"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceConfiguration - eadaptive-modulation-is-on is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceStatus.hasOwnProperty("xpd-cur")) {
      airInterface["current-cross-polarization-discrimination"] = airInterfaceStatus["xpd-cur"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceConfiguration - xpd-cur is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceConfiguration.hasOwnProperty("performance-monitoring-is-on")) {
      airInterface["configured-performance-monitoring-is-on"] = airInterfaceConfiguration["performance-monitoring-is-on"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceConfiguration - performance-monitoring-is-on is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceConfiguration.hasOwnProperty("xpic-is-on")) {
      airInterface["configured-xpic-is-on"] = airInterfaceConfiguration["xpic-is-on"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceConfiguration - xpic-is-on is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceStatus.hasOwnProperty("snir-cur")) {
      airInterface["current-signal-to-noise-ratio"] = airInterfaceStatus["snir-cur"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceStatus - snir-cur is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceCapability.hasOwnProperty("supported-radio-signal-id-datatype")) {
      airInterface["supported-radio-signal-id-datatype"] = airInterfaceCapability["supported-radio-signal-id-datatype"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceCapability - supported-radio-signal-id-datatype is undefined for ${airInterfaceEndPointName}`);
    }

    if (airInterfaceCapability.hasOwnProperty("supported-radio-signal-id-length")) {
      airInterface["supported-radio-signal-id-length"] = airInterfaceCapability["supported-radio-signal-id-length"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - airInterfaceCapability - supported-radio-signal-id-length is undefined for ${airInterfaceEndPointName}`);
    }

    let minTransmissionMode = await getConfiguredModulation(
      airInterfaceCapability,
      airInterfaceConfiguration["transmission-mode-min"]);

    let maxTransmissionMode = await getConfiguredModulation(
      airInterfaceCapability,
      airInterfaceConfiguration["transmission-mode-max"]);

    let curTransmissionMode = await getConfiguredModulation(
      airInterfaceCapability,
      airInterfaceStatus["transmission-mode-cur"]);

    if (minTransmissionMode) {
      airInterface["configured-modulation-minimum"] = {
        "number-of-states": minTransmissionMode["modulation-scheme"],
        "name-at-lct": minTransmissionMode["modulation-scheme-name-at-lct"]
      };
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - minTransmissionMode is undefined`);
    }

    if (maxTransmissionMode) {
      airInterface["configured-modulation-maximum"] = {
        "number-of-states": maxTransmissionMode["modulation-scheme"],
        "name-at-lct": maxTransmissionMode["modulation-scheme-name-at-lct"]
      };
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - maxTransmissionMode is undefined`);
    }

    // Current Transmission Mode
    if (curTransmissionMode) {
      airInterface["current-modulation"] = {
        "number-of-states": curTransmissionMode["modulation-scheme"],
        "name-at-lct": curTransmissionMode["modulation-scheme-name-at-lct"]
      };
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - curTransmissionMode (modulation-scheme) is undefined`);
    }

    if (minTransmissionMode.hasOwnProperty("channel-bandwidth")) {
      airInterface["configured-channel-bandwidth-min"] = minTransmissionMode["channel-bandwidth"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - minTransmissionMode (channel-bandwith) is undefined`);
    }

    if (maxTransmissionMode.hasOwnProperty("channel-bandwidth")) {
      airInterface["configured-channel-bandwidth-max"] = maxTransmissionMode["channel-bandwidth"];
    } else {
      logger.warn(`formulateAirInterfaceResponseBody - maxTransmissionMode (channel-bandwith) is undefined`);
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
      logger.warn("getConfiguredModulation - transmissionModeList and transmissioModeType is undefined");
    }
  } else {
    logger.warn("getConfiguredModulation - airInterfaceCapability is undefined");
  }

  return transmissionModeFromtransmissionModeList;
}

if (global.testPrivateFunctions === 1) {
  module.exports.readAirInterfaceData_private = {
    RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest,
    RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache,
    RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive,
    formulateAirInterfaceResponseBody
  };
}
