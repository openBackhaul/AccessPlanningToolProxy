'use strict';

/**
 * @file This module provides functionality to gather the air-interface data for given mount-name and linkId. 
 * @module ReadHistoricalData
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
const ETHERNET_INTERFACE = {
  MODULE: "ethernet-container-2-0",
  LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
  CONFIGURATION: "ethernet-container-configuration",
  CAPABILITY: "ethernet-container-capability",
  STATUS: "ethernet-container-status",
  NAME: "ethernet-container-name"
};
const LTP_AUGMENT = {
  MODULE: "ltp-augment-1-0:",
  PAC: "ltp-augment-pac",
  EXTERNAL_LABEL: "external-label",
  ORIGINAL_LTP_NAME:"original-ltp-name"
};

/**
 * This method performs the set of procedure to gather the airInterface data
 * @param {String}  mountName Identifier of the device at the Controller
 * @param {String}  timeStamp timeStamp of the PM requested
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
exports.ReadHistoricalData = async function (mountName, timeStamp, ltpStructure, requestHeaders, traceIndicatorIncrementer) {
  try {
    /****************************************************************************************
     * Declaring required variables
     ****************************************************************************************/
    let uuidUnderTest = "";
    let airInterface = {};

    /****************************************************************************************
     *  Fetching and setting up UuidUnderTest and PathParameters
     ****************************************************************************************/

    let airAndEthernetInterfacesResponse = await RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces(
      ltpStructure,
      mountName,
      requestHeaders,
      traceIndicatorIncrementer);
      
    if (Object.keys(airAndEthernetInterfacesResponse).length !== 0) {
        traceIndicatorIncrementer = airAndEthernetInterfacesResponse.traceIndicatorIncrementer;
      }

    let airInterfaceHistoricalPerformance = await RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache(
      ltpStructure,
      mountName,
      timeStamp,
      requestHeaders,
      traceIndicatorIncrementer);

      if (Object.keys(airInterfaceHistoricalPerformance).length !== 0) {
        traceIndicatorIncrementer = airInterfaceHistoricalPerformance.traceIndicatorIncrementer;
      }

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
          airInterface = await formulateAirInterfaceResponseBody(airInterfaceEndPointName, airInterfaceConfiguration, airInterfaceCapability, airInterfaceStatus)
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
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return values of uuidUnderTest,PathParams,trace indicator incrementer if external-label === linkId
 */
exports.RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces = async function (ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces";
  const stringName = "RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces.LtpDesignation";
  
  let processedLtpResponses = [];
  let interfaceLtpList = [];
  
  try {
  let pathParams=[];
  /***********************************************************************************
   *Fetch LTPs for both AIR and ETHERNET layers
   ************************************************************************************/
  let airInterfaceLtpList = await ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(
      AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.LAYER_PROTOCOL_NAME, ltpStructure);
  let ethInterfaceLtpList = await ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(
      ETHERNET_INTERFACE.MODULE + ":" + ETHERNET_INTERFACE.LAYER_PROTOCOL_NAME, ltpStructure);

  interfaceLtpList = airInterfaceLtpList.concat(ethInterfaceLtpList); 
  let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName);

  /***********************************************************************************
   *Loop through each LTP and fetch corresponding originalLtpName & externalLabel
   ************************************************************************************/
  for (let i = 0; i < interfaceLtpList.length; i++) {
    let uuid = interfaceLtpList[i][onfAttributes.GLOBAL_CLASS.UUID];
    let localId = interfaceLtpList[i][onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LOCAL_CLASS.LOCAL_ID];
    let layerProtocolName = interfaceLtpList[i][onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME];

    pathParams = [mountName, uuid, localId];
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
	  
	  /****************************************************************************************************
     * RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces
     *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}/logical-termination-point={uuid}
     *      /ltp-augment-1-0:ltp-augment-pac?fields=external-label
     *****************************************************************************************************/

    // Fetch external label and original LTP name
    let externalLabelResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);

    if (Object.keys(externalLabelResponse).length === 0)
      console.log(createHttpError.InternalServerError(`${forwardingName} is not success`));

    // Extract the response fields
    let originalLtpName = externalLabelResponse[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC][LTP_AUGMENT.ORIGINAL_LTP_NAME];
    let externalLabel = externalLabelResponse[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC][LTP_AUGMENT.EXTERNAL_LABEL];

    // Map results based on protocol type
    let responseObject = {
      uuid: uuid,
      localId: localId,
      layerProtocolName: layerProtocolName,
    };

    if (layerProtocolName === "AIR_LAYER") {
      responseObject["linkEndPointName"] = externalLabel;
    } else if (layerProtocolName === "ETHERNET_CONTAINER_LAYER") {
      responseObject["interfaceName"] = originalLtpName;
    }

    processedLtpResponses.push(responseObject);
  }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
  }
  return processedLtpResponses;
}


/**
 * Prepare attributes and automate RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache
 * @param {Object}  ltpStructure ControlConstruct provided from cache.
 * @param {String}  mountName Identifier of the device at the Controller
 * @param {String}  timeStamp timeStamp of the PM requested
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return values of uuidUnderTest,PathParams,trace indicator incrementer if external-label === linkId
 */

exports.RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache = async function (ltpStructure, mountName,timeStamp, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache";
  const stringName = "RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache.AirInterfaceHistoricalPmFromCache";
  
  let processedResponses = [];
  
  try {
  let pathParams=[];
  /***********************************************************************************
   *Fetch LTPs for both AIR and ETHERNET layers
   ************************************************************************************/
  let interfaceLtpList = await ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(
      AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.LAYER_PROTOCOL_NAME, ltpStructure);
  
  
  let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName);

  /***********************************************************************************
   *Loop through each LTP and fetch corresponding airInterfaceHistoricalPerformance
   ************************************************************************************/
  for (let i = 0; i < interfaceLtpList.length; i++) {
    let uuid = interfaceLtpList[i][onfAttributes.GLOBAL_CLASS.UUID];
    let localId = interfaceLtpList[i][onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LOCAL_CLASS.LOCAL_ID];

    pathParams = [mountName, uuid, localId];
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
	  
	  /****************************************************************************************************
     * RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces
     *MWDI://core-model-1-4:network-control-domain=cache/control-construct={mountName}/logical-termination-point={uuid}/layer-protocol={localId}/
	 *air-interface-2-0:air-interface-pac/air-interface-historical-performances
     *****************************************************************************************************/

    // Fetch external label and original LTP name
    let airInterfaceHistoricalPerformance = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);

    if (Object.keys(airInterfaceHistoricalPerformance).length === 0)
      console.log(createHttpError.InternalServerError(`${forwardingName} is not success`));

 let hpdListFiltered = [];
    let hpdList = airInterfaceHistoricalPerformance["air-interface-2-0:air-interface-historical-performances"][0][historical-performance-data-list];
    if (hpdList != undefined) {
        hpdListFiltered = hpdList.filter(htp =>
                htp["granularity-period"] === "TYPE_PERIOD-15-MIN" && htp["period-end-time"] > timeStamp);
    }
	
    
    // Map results based on protocol type
    let responseObject = {
      uuid: uuid,
      localId: localId,
      hpdList: hpdListFiltered,
    };

    processedResponses.push(responseObject);
  }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
  }
  return processedResponses;
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
  if (airInterfaceCapability == undefined) {
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
  if (airInterfaceStatus == undefined) {
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
    if (airInterfaceEndPointName) airInterface["air-interface-endpoint-name"] = airInterfaceEndPointName;
    if (airInterfaceConfiguration.hasOwnProperty("tx-power")) airInterface["configured-tx-power"] = airInterfaceConfiguration["tx-power"];
    if (airInterfaceStatus.hasOwnProperty("tx-level-cur")) airInterface["current-tx-power"] = airInterfaceStatus["tx-level-cur"];
    if (airInterfaceStatus.hasOwnProperty("rx-level-cur")) airInterface["current-rx-level"] = airInterfaceStatus["rx-level-cur"];
    if (airInterfaceConfiguration.hasOwnProperty("tx-frequency")) airInterface["configured-tx-frequency"] = airInterfaceConfiguration["tx-frequency"];
    if (airInterfaceConfiguration.hasOwnProperty("rx-frequency")) airInterface["configured-rx-frequency"] = airInterfaceConfiguration["rx-frequency"];
    if (airInterfaceConfiguration.hasOwnProperty("transmitted-radio-signal-id")) airInterface["configured-transmitted-radio-signal-id"] = airInterfaceConfiguration["transmitted-radio-signal-id"];
    if (airInterfaceConfiguration.hasOwnProperty("expected-radio-signal-id")) airInterface["configured-expected-radio-signal-id"] = airInterfaceConfiguration["expected-radio-signal-id"];
    if (airInterfaceConfiguration.hasOwnProperty("atpc-is-on")) airInterface["configured-atpc-is-on"] = airInterfaceConfiguration["atpc-is-on"];
    if (airInterfaceConfiguration.hasOwnProperty("atpc-thresh-upper")) airInterface["configured-atpc-threshold-upper"] = airInterfaceConfiguration["atpc-thresh-upper"];
    if (airInterfaceConfiguration.hasOwnProperty("atpc-thresh-lower")) airInterface["configured-atpc-threshold-lower"] = airInterfaceConfiguration["atpc-thresh-lower"];
    if (airInterfaceConfiguration.hasOwnProperty("atpc-tx-power-min")) airInterface["configured-atpc-tx-power-min"] = airInterfaceConfiguration["atpc-tx-power-min"];
    if (airInterfaceConfiguration.hasOwnProperty("adaptive-modulation-is-on")) airInterface["configured-adaptive-modulation-is-on"] = airInterfaceConfiguration["adaptive-modulation-is-on"];
    if (airInterfaceStatus.hasOwnProperty("xpd-cur")) airInterface["current-cross-polarization-discrimination"] = airInterfaceStatus["xpd-cur"];
    if (airInterfaceConfiguration.hasOwnProperty("performance-monitoring-is-on")) airInterface["configured-performance-monitoring-is-on"] = airInterfaceConfiguration["performance-monitoring-is-on"];
    if (airInterfaceConfiguration.hasOwnProperty("xpic-is-on")) airInterface["configured-xpic-is-on"] = airInterfaceConfiguration["xpic-is-on"];
    if (airInterfaceStatus.hasOwnProperty("snir-cur")) airInterface["current-signal-to-noise-ratio"] = airInterfaceStatus["snir-cur"];
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
    }
    if (maxTransmissionMode) {
      airInterface["configured-modulation-maximum"] = {
        "number-of-states": maxTransmissionMode["modulation-scheme"],
        "name-at-lct": maxTransmissionMode["modulation-scheme-name-at-lct"]
      };
    }
    if (curTransmissionMode) {
      airInterface["current-modulation"] = {
        "number-of-states": curTransmissionMode["modulation-scheme"],
        "name-at-lct": curTransmissionMode["modulation-scheme-name-at-lct"]
      };
    }
    if (minTransmissionMode.hasOwnProperty("channel-bandwidth")) airInterface["configured-channel-bandwidth-min"] = minTransmissionMode["channel-bandwidth"];
    if (maxTransmissionMode.hasOwnProperty("channel-bandwidth")) airInterface["configured-channel-bandwidth-max"] = maxTransmissionMode["channel-bandwidth"];
  } catch (error) {
    console.log(error);
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
    }
  }
  return transmissionModeFromtransmissionModeList;
}