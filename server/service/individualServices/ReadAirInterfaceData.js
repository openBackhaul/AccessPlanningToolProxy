'use strict';

/**
 * @file This module provides functionality to gather the air-interface data for given mount-name and linkId. 
 * @module readAirInterfaceData
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
}

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

    let uuidUnderTestResponse = await RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest(
      ltpStructure,
      mountName,
      linkId,
      requestHeaders,
      traceIndicatorIncrementer);

    if (Object.keys(uuidUnderTestResponse).length !== 0) {

      uuidUnderTest = uuidUnderTestResponse.uuidUnderTest;
      let pathParams = uuidUnderTestResponse.pathParams;
      traceIndicatorIncrementer = uuidUnderTestResponse.traceIndicatorIncrementer;

      /****************************************************************************************
       *  Fetching airInterfaceConfiguration , airInterfaceCapability, airInterfaceStatus
       ****************************************************************************************/
      if (uuidUnderTest != "") {

        let airInterfaceConfiguration = await exports.RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(pathParams, requestHeaders, traceIndicatorIncrementer);

        if (Object.keys(airInterfaceConfiguration).length !== 0) {
          traceIndicatorIncrementer = airInterfaceConfiguration.traceIndicatorIncrementer;
        }

        let airInterfaceCapability = await RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(pathParams, requestHeaders, traceIndicatorIncrementer);
        if (Object.keys(airInterfaceCapability).length !== 0) {
          traceIndicatorIncrementer = airInterfaceCapability.traceIndicatorIncrementer;
        }

        let airInterfaceStatus = await RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive(pathParams, requestHeaders, traceIndicatorIncrementer);
        if (Object.keys(airInterfaceStatus).length !== 0) {
          traceIndicatorIncrementer = airInterfaceStatus.traceIndicatorIncrementer;
        }


        /****************************************************************************************
         *  Fetching the air interface data for response body
         ****************************************************************************************/
        if (Object.keys(airInterfaceConfiguration).length !== 0 ||
          Object.keys(airInterfaceCapability).length !== 0 ||
          Object.keys(airInterfaceStatus).length !== 0) {
          airInterface = await formulateAirInterfaceResponseBody(airInterfaceConfiguration, airInterfaceCapability, airInterfaceStatus)
        }
      }
    } else {
      console.log(`Unable to fetch UuidUnderTest and LocalIdUnderTest for linkId ${linkId} and muntName ${mountName}`);
    }

    let airInterfaceResult = {
      uuidUnderTest: uuidUnderTest,
      airInterface: airInterface,
      traceIndicatorIncrementer: traceIndicatorIncrementer
    };

    return airInterfaceResult;
  } catch (error) {
    console.log(`readAirInterfaceData is not success with ${error}`);
  }
}

/**
 * Prepare attributes and automate RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest
 * @param {Object}  ltpStructure ControlConstruct provided from cache.
 * @param {String}  mountName Identifier of the device at the Controller
 * @param {String}  linkId Identifier of the microwave link in the planning
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return values of uuidUnderTest,PathParams,trace indicator incrementer if air-Interface-name === linkId
 */
async function RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest(ltpStructure, mountName, linkId, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest";
  const stringName = "RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest.AirInterfaceName";
  let uuidUnderTestResponse = {};
  let uuidUnderTest = "";
  let pathParams = [];
  try {
    let pathParamList = [];

    /***********************************************************************************
     * Preparing path paramrters list 
     ************************************************************************************/

    let airInterfaceLtpList = await ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(
      AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.LAYER_PROTOCOL_NAME, ltpStructure)
    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    for (let i = 0; i < airInterfaceLtpList.length; i++) {
      for (let j = 0; j < airInterfaceLtpList[i][onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL].length; j++) {
        let uuid = airInterfaceLtpList[i][onfAttributes.GLOBAL_CLASS.UUID];
        let localId = airInterfaceLtpList[i][onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][j][onfAttributes.LOCAL_CLASS.LOCAL_ID]
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
          console.log(createHttpError.InternalServerError(`${forwardingName} is not success`));
        } else {
          if (airInterfaceConfigurationResponse[AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.CONFIGURATION][AIR_INTERFACE.NAME] === linkId) {
            uuidUnderTest = uuid;
            pathParams = pathParamList;
            break;
          }
        }
      }
    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
  }
  uuidUnderTestResponse.uuidUnderTest = uuidUnderTest;
  uuidUnderTestResponse.pathParams = pathParams;
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
      console.log(`${forwardingName} is not success`);
    } else {
      airInterfaceConfiguration = airInterfaceConfigurationResponse[AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.CONFIGURATION];
    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
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
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
     *          /logical-termination-point={uuid}/layer-protocol={local-id}
     *        /air-interface-2-0:air-interface-pac/air-interface-capability
     *****************************************************************************************************/

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let airInterfaceCapabilityResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(airInterfaceCapabilityResponse).length === 0) {
      console.log(`${forwardingName} is not success`);
    } else {
      airInterfaceCapability = airInterfaceCapabilityResponse[AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.CAPABILITY];
    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
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
    } else {
      airInterfaceStatus = airInterfaceStatusResponse[AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.STATUS];
    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
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