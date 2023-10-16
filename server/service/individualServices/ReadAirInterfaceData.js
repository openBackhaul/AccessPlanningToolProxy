'use strict';

/**
 * @file This module provides functionality to gather the air-interface data for given mount-name and linkId. 
 * @module readAirInterfaceData
 **/
const IndividualServiceUtility = require('./IndividualServiceUtility');
const ltpStructureUtility = require('./LtpStructureUtility');
const createHttpError = require('http-errors');

const AIR_INTERFACE_LAYER_NAME = "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER";
const AIR_INTERFACE_CONFIGURATION = "air-interface-2-0:air-interface-configuration";
const AIR_INTERFACE_CAPABILITY = "air-interface-2-0:air-interface-capability";
const AIR_INTERFACE_STATUS = "air-interface-2-0:air-interface-status"

var traceIndicatorIncrementer = 1;

/**
 * This method performs the set of procedure to gather the airInterface data
 * @param {String} mountName Identifier of the device at the Controller
 * @param {String} linkId Identifier of the microwave link in the planning
 * @param {Object} ltpStructure ControlConstruct provided from cache
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} _traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * The following are the list of forwarding-construct that will be automated to gather the airInterface data 
 * 1. RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest
 * 2. RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache
 * 3. RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache
 * 4. RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive
   @returns {Object} result which contains the airInterface data and uuidUnderTest
* **/
exports.readAirInterfaceData = async function (mountName, linkId, ltpStructure, requestHeaders, _traceIndicatorIncrementer) {
  try {
    /****************************************************************************************
     * Declaring required variables
     ****************************************************************************************/
    let uuidUnderTest = "";
    let airInterface = {};
    traceIndicatorIncrementer = _traceIndicatorIncrementer;

    /****************************************************************************************
     *  Fetching and setting up UuidUnderTest and PathParameters
     ****************************************************************************************/

    let uuidUnderTestAndPathParams = await RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest(
      ltpStructure,
      mountName,
      linkId,
      requestHeaders);

    if (Object.keys(uuidUnderTestAndPathParams).length !== 0) {
      uuidUnderTest = uuidUnderTestAndPathParams.uuidUnderTest;
      let pathParams = uuidUnderTestAndPathParams.pathParams;

      /****************************************************************************************
       *  Fetching airInterfaceConfiguration , airInterfaceCapability, airInterfaceStatus
       ****************************************************************************************/

      let airInterfaceConfiguration = await RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(pathParams, requestHeaders);
      let airInterfaceCapability = await RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(pathParams, requestHeaders);
      let airInterfaceStatus = await RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive(pathParams, requestHeaders);

      /****************************************************************************************
       *  Fetching the air interface data for response body
       ****************************************************************************************/

      airInterface = await formulateAirInterfaceResponseBody(airInterfaceConfiguration, airInterfaceCapability, airInterfaceStatus)
    } else {
      throw new createHttpError.InternalServerError(`Unable to fetch UuidUnderTest and LocalIdUnderTest for linkId ${linkId} and muntName ${mountName}`);
    }

    let airInterfaceResult = {
      uuidUnderTest: uuidUnderTest,
      airInterface: airInterface,
      traceIndicatorIncrementer: traceIndicatorIncrementer
    };

    return airInterfaceResult;
  } catch (error) {
    console.log(`readAirInterfaceData is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
}

/**
 * Prepare attributes and automate RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest
 * @returns {Object} return values of uuidUnderTestAndPathParams if air-Interface-name === linkId or empty object
 */
async function RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest(ltpStructure, mountName, linkId, requestHeaders) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest";
  const stringName = "RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest.AirInterfaceName";
  try {
    let pathParamList = [];
    let uuidUnderTestAndPathParams = {};

    /***********************************************************************************
     * Preparing path paramrters list 
     ************************************************************************************/

    let airInterfaceLtpList = await ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(AIR_INTERFACE_LAYER_NAME, ltpStructure)
    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    for (let i = 0; i < airInterfaceLtpList.length; i++) {
      for (let j = 0; j < airInterfaceLtpList[i]["layer-protocol"].length; j++) {
        let uuid = airInterfaceLtpList[i]["uuid"];
        let localId = airInterfaceLtpList[i]["layer-protocol"][j]["local-id"]
        pathParamList = [];
        pathParamList.push(mountName);
        pathParamList.push(uuid);
        pathParamList.push(localId);
        let _traceIndicatorIncrementer = traceIndicatorIncrementer++;

        /****************************************************************************************************
         * RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest
         *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
         *        /logical-termination-point={uuid}/layer-protocol={local-id}
         * /air-interface-2-0:air-interface-pac/air-interface-configuration?fields=air-interface-name
         *****************************************************************************************************/

        let airInterfaceConfigurationResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParamList, requestHeaders, _traceIndicatorIncrementer);
        if (Object.keys(airInterfaceConfigurationResponse).length === 0) {
          throw new createHttpError.InternalServerError(`${forwardingName} is not success`);
        } else {
          if (airInterfaceConfigurationResponse[AIR_INTERFACE_CONFIGURATION]["air-interface-name"] === linkId) {
            uuidUnderTestAndPathParams.uuidUnderTest = uuid;
            uuidUnderTestAndPathParams.pathParams = pathParamList;
            break;
          }
        }
      }
    }
    return uuidUnderTestAndPathParams;
  } catch (error) {
    throw new createHttpError.InternalServerError(`${forwardingName} is not success with ${error}`);
  }
}

/**
 * Prepare attributes and automate RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache
 * @param {Object} pathParams path parameters.
 * @returns {Object} returns airInterfaceConfiguration for UuidUnderTest and LocalIdUnderTest
 */
async function RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(pathParams, requestHeaders) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache";
  const stringName = "RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache.ConfigurationFromCache"
  try {
    let airInterfaceConfiguration = {};

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
      console.log(`${forwardingName} is not success`);
      return new createHttpError.InternalServerError();
    } else {
      airInterfaceConfiguration = airInterfaceConfigurationResponse[AIR_INTERFACE_CONFIGURATION];
    }

    return airInterfaceConfiguration;
  } catch (error) {
    return new createHttpError.InternalServerError(`${forwardingName} is not success with ${error}`);
  }
}

/**
 * Prepare attributes and automate RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache
 * @param {Object} pathParams path parameters.
 * @returns {Object} returns airInterfaceCapability for UuidUnderTest and LocalIdUnderTest
 */
async function RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(pathParams, requestHeaders) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache";
  const stringName = "RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache.CapabilitiesFromCache"
  try {
    let airInterfaceCapability = {};

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
      console.log(`${forwardingName} is not success`);
      return new createHttpError.InternalServerError();
    } else {
      airInterfaceCapability = airInterfaceCapabilityResponse[AIR_INTERFACE_CAPABILITY];
    }
    return airInterfaceCapability;
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
}

/**
 * Prepare attributes and automate RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive
 * @param {Object} pathParams path parameters.
 * @returns {Object} returns airInterfaceStatus for UuidUnderTest and LocalIdUnderTest
 */
async function RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive(pathParams, requestHeaders) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive";
  const stringName = "RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive.StatusFromLive";
  try {
    let airInterfaceStatus = {};

    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive
     *   MWDI://core-model-1-4:network-control-domain=live/control-construct={mount-name}
     *        /logical-termination-point={uuid}/layer-protocol={local-id}
     *        /air-interface-2-0:air-interface-pac/air-interface-status
     *        ?fields=tx-level-cur;rx-level-cur;transmission-mode-cur;xpd-cur;snir-cur
     *****************************************************************************************************/

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let airInterfaceStatusResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(airInterfaceStatusResponse).length === 0) {
      console.log(`${forwardingName} is not success`);
      return new createHttpError.InternalServerError();
    } else {
      airInterfaceStatus = airInterfaceStatusResponse[AIR_INTERFACE_STATUS];
    }
    return airInterfaceStatus;
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
}

/**
 * Formulate air interface response body attributes.
 * @param {Object}  airInterfaceConfiguration air-interface-configuration fetched from callback RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache.
 * @param {Object}  airInterfaceCapability air-interface-capability from callback RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache .
 * @param {Object}  airInterfaceStatus air-interface-status fetched from callback RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive.
 * @returns {Object} returns formulated air interface response body attributes.
 */
async function formulateAirInterfaceResponseBody(airInterfaceConfiguration, airInterfaceCapability, airInterfaceStatus) {
  let airInterface = {};
  airInterface["configured-tx-power"] = airInterfaceConfiguration["tx-power"];
  airInterface["current-tx-power"] = airInterfaceStatus["tx-level-cur"];
  airInterface["current-rx-level"] = airInterfaceStatus["rx-level-cur"];
  airInterface["configured-tx-frequency"] = airInterfaceConfiguration["tx-frequency"];
  airInterface["configured-rx-frequency"] = airInterfaceConfiguration["rx-frequency"];
  airInterface["configured-transmitted-radio-signal-id"] = airInterfaceConfiguration["transmitted-radio-signal-id"];
  airInterface["configured-expected-radio-signal-id"] = airInterfaceConfiguration["expected-radio-signal-id"];
  airInterface["configured-atpc-is-on"] = airInterfaceConfiguration["atpc-is-on"];
  airInterface["configured-atpc-threshold-upper"] = airInterfaceConfiguration["atpc-thresh-upper"];
  airInterface["configured-atpc-threshold-lower"] = airInterfaceConfiguration["atpc-thresh-lower"];
  airInterface["configured-atpc-tx-power-min"] = airInterfaceConfiguration["atpc-tx-power-min"];
  airInterface["configured-adaptive-modulation-is-on"] = airInterfaceConfiguration["adaptive-modulation-is-on"];
  airInterface["current-cross-polarization-discrimination"] = airInterfaceStatus["xpd-cur"];
  airInterface["configured-performance-monitoring-is-on"] = airInterfaceConfiguration["performance-monitoring-is-on"];
  airInterface["configured-xpic-is-on"] = airInterfaceConfiguration["xpic-is-on"];
  airInterface["current-signal-to-noise-ratio"] = airInterfaceStatus["snir-cur"];
  let minTransmissionMode = await getConfiguredModulation(
    airInterfaceCapability,
    airInterfaceConfiguration["transmission-mode-min"]);
  let maxTransmissionMode = await getConfiguredModulation(
    airInterfaceCapability,
    airInterfaceConfiguration["transmission-mode-max"]);
  let curTransmissionMode = await getConfiguredModulation(
    airInterfaceCapability,
    airInterfaceStatus["transmission-mode-cur"]);
  airInterface["configured-modulation-minimum"] = {
    "number-of-states": minTransmissionMode["modulation-scheme"],
    "name-at-lct": minTransmissionMode["modulation-scheme-name-at-lct"]
  };
  airInterface["configured-modulation-maximum"] = {
    "number-of-states": maxTransmissionMode["modulation-scheme"],
    "name-at-lct": maxTransmissionMode["modulation-scheme-name-at-lct"]
  };
  airInterface["current-modulation"] = {
    "number-of-states": curTransmissionMode["modulation-scheme"],
    "name-at-lct": curTransmissionMode["modulation-scheme-name-at-lct"]
  };
  airInterface["configured-channel-bandwidth-min"] = minTransmissionMode["channel-bandwidth"];
  airInterface["configured-channel-bandwidth-max"] = maxTransmissionMode["channel-bandwidth"];
  return airInterface;
}

/**
 * Fetchs configured Modulation based on tansmission mode type min , max , or current .
 * @param {Object}  airInterfaceCapability air-interface-capability.
 * @param {Object}  transmissioModeType tansmission mode type min , max , or current.
 * @returns {Object} returns transmission mode fetched tansmission mode list of capability.
 */
async function getConfiguredModulation(airInterfaceCapability, transmissioModeType) {
  let transmissionModeList = airInterfaceCapability["transmission-mode-list"];
  let transmissionModeFromtransmissionModeList = {};
  if (transmissionModeList != undefined) {
    transmissionModeFromtransmissionModeList = transmissionModeList.find(transmissionMode =>
      transmissionMode["transmission-mode-name"] === transmissioModeType)
  }
  return transmissionModeFromtransmissionModeList;
}