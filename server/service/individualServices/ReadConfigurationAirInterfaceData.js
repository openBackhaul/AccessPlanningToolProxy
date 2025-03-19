'use strict';

/**
 * @file This module provides functionality to gather the air-interface data for given mount-name and linkId. 
 * @module readConfigurationAirInterfaceData
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

exports.readConfigurationAirInterfaceData = async function (mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer) {
  try {
    /****************************************************************************************
     * Declaring required variables
     ****************************************************************************************/
    let uuidUnderTest = "";
    let airInterface = {};

    /****************************************************************************************
     *  Fetching and setting up UuidUnderTest and PathParameters
     ****************************************************************************************/

    let uuidUnderTestResponse = await exports.RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest(
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

        let airInterfaceConfiguration = await exports.RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(pathParams, requestHeaders, traceIndicatorIncrementer);

        if (Object.keys(airInterfaceConfiguration).length !== 0) {
          traceIndicatorIncrementer = airInterfaceConfiguration.traceIndicatorIncrementer;
        }

        let airInterfaceCapability = await exports.RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(pathParams, requestHeaders, traceIndicatorIncrementer);
        if (Object.keys(airInterfaceCapability).length !== 0) {
          traceIndicatorIncrementer = airInterfaceCapability.traceIndicatorIncrementer;
        }

        /****************************************************************************************
         *  Fetching the air interface data for response body
         ****************************************************************************************/
        if (Object.keys(airInterfaceConfiguration).length !== 0 ||
          Object.keys(airInterfaceCapability).length !== 0) {
          airInterface = await formulateAirInterfaceResponseBody(airInterfaceEndPointName, airInterfaceConfiguration, airInterfaceCapability)
        }
      }
    } else {
      logger.error(`Unable to fetch UuidUnderTest and LocalIdUnderTest for linkId ${linkId} and muntName ${mountName}`);
    }

    let airInterfaceResult = {
      uuidUnderTest: uuidUnderTest,
      airInterface: airInterface,
      traceIndicatorIncrementer: traceIndicatorIncrementer
    };

    return airInterfaceResult;
  } catch (error) {
    logger.error(`readConfigurationAirInterfaceData is not success with ${error}`);
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
exports.RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest = async function (ltpStructure, mountName, linkId, requestHeaders, traceIndicatorIncrementer) 
{
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
       *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}/logical-termination-point={uuid}
       *      /ltp-augment-1-0:ltp-augment-pac?fields=external-label
       *****************************************************************************************************/

      let externalLabelResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParamList, requestHeaders, _traceIndicatorIncrementer);
      if (Object.keys(externalLabelResponse).length === 0) {
        logger.error(createHttpError.InternalServerError(`${forwardingName} is not success`));
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
    logger.error(`${forwardingName} is not success with ${error}`);
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
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *    /logical-termination-point={uuid}/layer-protocol={local-id}
     *        /air-interface-2-0:air-interface-pac/air-interface-configuration
     *****************************************************************************************************/

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let airInterfaceConfigurationResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(airInterfaceConfigurationResponse).length === 0) {
      logger.error(`${forwardingName} is not success`);
    } else {
      airInterfaceConfiguration = airInterfaceConfigurationResponse[AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.CONFIGURATION];
    }
  } catch (error) {
    logger.error(`${forwardingName} is not success with ${error}`);
  }
  if (airInterfaceConfiguration == undefined) {
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
exports.RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache= async function (pathParams, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache";
  const stringName = "RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache.CapabilitiesFromCache"
  let airInterfaceCapability = {};
  try {

    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *          /logical-termination-point={uuid}/layer-protocol={local-id}
     *        /air-interface-2-0:air-interface-pac/air-interface-capability
     *****************************************************************************************************/

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let airInterfaceCapabilityResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(airInterfaceCapabilityResponse).length === 0) {
      logger.error(`${forwardingName} is not success`);
    } else {
      airInterfaceCapability = airInterfaceCapabilityResponse[AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.CAPABILITY];
    }
  } catch (error) {
    logger.error(`${forwardingName} is not success with ${error}`);
  }
  if (airInterfaceCapability == undefined) {
    airInterfaceCapability = {};
  }
  airInterfaceCapability.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return airInterfaceCapability;
}

/**
 * Prepare attributes and automate RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache
 * @param {Object}  pathParams path parameters UuidUnderTest and LocalIdUnderTest.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns airInterfaceCapability for UuidUnderTest and LocalIdUnderTest
 */

/**
 * Formulate air interface response body attributes.
 * @param {Object}  airInterfaceConfiguration air-interface-configuration fetched from callback RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache.
 * @param {Object}  airInterfaceCapability air-interface-capability from callback RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache .
 * @returns {Object} returns formulated air interface response body attributes.
 */
async function formulateAirInterfaceResponseBody(airInterfaceEndPointName, airInterfaceConfiguration, airInterfaceCapability) {
  let airInterface = {};
  try {
    if (airInterfaceEndPointName) airInterface["air-interface-endpoint-name"] = airInterfaceEndPointName;
    if (airInterfaceConfiguration.hasOwnProperty("tx-power")) airInterface["configured-tx-power"] = airInterfaceConfiguration["tx-power"];
    if (airInterfaceCapability.hasOwnProperty("supported-radio-signal-id-datatype")) airInterface["supported-radio-signal-id-datatype"] = airInterfaceCapability["supported-radio-signal-id-datatype"];
    if (airInterfaceCapability.hasOwnProperty("supported-radio-signal-id-length")) airInterface["supported-radio-signal-id-length"] = airInterfaceCapability["supported-radio-signal-id-length"];
    if (airInterfaceConfiguration.hasOwnProperty("transmitted-radio-signal-id")) airInterface["configured-transmitted-radio-signal-id"] = airInterfaceConfiguration["transmitted-radio-signal-id"];
    if (airInterfaceConfiguration.hasOwnProperty("expected-radio-signal-id")) airInterface["configured-expected-radio-signal-id"] = airInterfaceConfiguration["expected-radio-signal-id"];
    if (airInterfaceConfiguration.hasOwnProperty("atpc-is-on")) airInterface["configured-atpc-is-on"] = airInterfaceConfiguration["atpc-is-on"];
    if (airInterfaceConfiguration.hasOwnProperty("atpc-thresh-upper")) airInterface["configured-atpc-threshold-upper"] = airInterfaceConfiguration["atpc-thresh-upper"];
    if (airInterfaceConfiguration.hasOwnProperty("atpc-thresh-lower")) airInterface["configured-atpc-threshold-lower"] = airInterfaceConfiguration["atpc-thresh-lower"];
    if (airInterfaceConfiguration.hasOwnProperty("atpc-tx-power-min")) airInterface["configured-atpc-tx-power-min"] = airInterfaceConfiguration["atpc-tx-power-min"];
    if (airInterfaceConfiguration.hasOwnProperty("adaptive-modulation-is-on")) airInterface["configured-adaptive-modulation-is-on"] = airInterfaceConfiguration["adaptive-modulation-is-on"];
    let minTransmissionMode = await getConfiguredModulation(
      airInterfaceCapability,
      airInterfaceConfiguration["transmission-mode-min"]);
    let maxTransmissionMode = await getConfiguredModulation(
      airInterfaceCapability,
      airInterfaceConfiguration["transmission-mode-max"]);
    if (minTransmissionMode) {
      airInterface["configured-modulation-minimum"] = {
        "number-of-states": minTransmissionMode["modulation-scheme"],
        "name-at-lct": minTransmissionMode["modulation-scheme-name-at-lct"]
      };
    }
    if (maxTransmissionMode) {
      airInterface["configured-modulation-maximum"] = {
        "number-of-states": maxTransmissionMode["modulation-scheme"],
        "name-at-lct": maxTransmissionMode["modulation-scheme-name-at-lct"]
      };
    }
    if (minTransmissionMode.hasOwnProperty("channel-bandwidth")) airInterface["configured-channel-bandwidth-min"] = minTransmissionMode["channel-bandwidth"];
    if (maxTransmissionMode.hasOwnProperty("channel-bandwidth")) airInterface["configured-channel-bandwidth-max"] = maxTransmissionMode["channel-bandwidth"];
    if (airInterfaceConfiguration.hasOwnProperty("xpic-is-on")) airInterface["configured-xpic-is-on"] = airInterfaceConfiguration["xpic-is-on"];
    
  } catch (error) {
    logger.error(error);
  }
  return airInterface;
}

/**
 * Fetchs configured Modulation based on transmission mode type min , max , or current .
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
    }
  }
  return transmissionModeFromtransmissionModeList;
}
