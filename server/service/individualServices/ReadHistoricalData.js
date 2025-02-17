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
  NAME: "air-interface-name",
  PAC: "air-container-pac",
  HISTORICAL_PERFORMANCES: "air-container-historical-performances"
};
const ETHERNET_INTERFACE = {
  MODULE: "ethernet-container-2-0",
  LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
  CONFIGURATION: "ethernet-container-configuration",
  CAPABILITY: "ethernet-container-capability",
  STATUS: "ethernet-container-status",
  NAME: "ethernet-container-name",
  PAC: "ethernet-container-pac",
  HISTORICAL_PERFORMANCES: "ethernet-container-historical-performances"
};
const LTP_AUGMENT = {
  MODULE: "ltp-augment-1-0",
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
exports.readHistoricalData = async function (mountName, timeStamp, ltpStructure, requestHeaders, traceIndicatorIncrementer) {
  try {

    /****************************************************************************************
     *  Fetch Name of Air and Ethernet Interfaces
     ****************************************************************************************/
    let airAndEthernetInterfacesResponse = await RequestForProvidingHistoricalPmDataCausesReadingNameOfAirAndEthernetInterfaces(
      ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer);
      
    if (Object.keys(airAndEthernetInterfacesResponse).length !== 0) {
        traceIndicatorIncrementer = airAndEthernetInterfacesResponse.traceIndicatorIncrementer;
      }

    /****************************************************************************************
     *  Identify Physical Link Aggregations
     ****************************************************************************************/
    let physicalLinkAggregations = await exports.RequestForProvidingHistoricalPmDataCausesIdentifyingPhysicalLinkAggregations(
      ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer);

    if (Object.keys(physicalLinkAggregations).length !== 0) {
      traceIndicatorIncrementer = physicalLinkAggregations.traceIndicatorIncrementer;
    }

    /****************************************************************************************
     *  Fetch Air Interface Configuration from Cache
     ****************************************************************************************/
    let airInterfaceConfiguration = await exports.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache(
      ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer);

    if (Object.keys(airInterfaceConfiguration).length !== 0) {
      traceIndicatorIncrementer = airInterfaceConfiguration.traceIndicatorIncrementer;
    }

    /****************************************************************************************
     *  Fetch Air Interface Capabilities from Cache
     ****************************************************************************************/
    let airInterfaceCapabilities = await exports.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache(
      ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer);

    if (Object.keys(airInterfaceCapabilities).length !== 0) {
      traceIndicatorIncrementer = airInterfaceCapabilities.traceIndicatorIncrementer;
    }

    /****************************************************************************************
     *  Fetch Historical Air Interface Performance from Cache
     ****************************************************************************************/
    let airInterfacePerformance = await exports.RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache(
      ltpStructure, mountName, timeStamp, requestHeaders, traceIndicatorIncrementer);

    if (Object.keys(airInterfacePerformance).length !== 0) {
      traceIndicatorIncrementer = airInterfacePerformance.traceIndicatorIncrementer;
    }

    /****************************************************************************************
     *  Fetch Historical Ethernet Container Performance from Cache
     ****************************************************************************************/
    let ethernetPerformance = await exports.RequestForProvidingHistoricalPmDataCausesReadingHistoricalEthernetContainerPerformanceFromCache(
      ltpStructure, mountName, timeStamp, requestHeaders, traceIndicatorIncrementer);

    if (Object.keys(ethernetPerformance).length !== 0) {
      traceIndicatorIncrementer = ethernetPerformance.traceIndicatorIncrementer;
    }

    /****************************************************************************************
    *  Aggregating all retrieved data into a structured response format.
    *  This function combines Air & Ethernet Interface names, Physical Link Aggregations, 
    *  Air Interface Configuration, Capabilities, Historical Performance, 
    *  and Ethernet Container Performance into a single response.
    ******************************************************************************************/
    let historicalData = RequestForProvidingHistoricalPmDataCausesDeliveringRequestedPmData(airAndEthernetInterfacesResponse, physicalLinkAggregations, airInterfaceConfiguration,
      airInterfaceCapabilities, airInterfacePerformance, ethernetPerformance);

    
    // Returning the final structured historical PM data response.
    return historicalData;
  } catch (error) {
    console.error(`readAirInterfaceData is not success with ${error}`);
    throw error;
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
    let originalLtpName = externalLabelResponse[LTP_AUGMENT.MODULE + ":" + LTP_AUGMENT.PAC][LTP_AUGMENT.ORIGINAL_LTP_NAME];
    let externalLabel = externalLabelResponse[LTP_AUGMENT.MODULE + ":" + LTP_AUGMENT.PAC][LTP_AUGMENT.EXTERNAL_LABEL];

    // Map results based on protocol type
    let responseObject = {
      uuid: uuid,
      localId: localId,
      mountName : mountName,
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
 * Identify physical link aggregations based on AirInterfaceUuid.
 * @param {Object} ltpStructure - The control construct containing LTP details.
 * @param {String} mountName - The device name.
 * @param {Object} requestHeaders - Request headers including `apiKeyAuth`.
 * @param {Integer} traceIndicatorIncrementer - Trace indicator incrementer.
 * @returns {Array} Aggregated results for Wire/AirInterfaces.
 */
exports.RequestForProvidingHistoricalPmDataCausesIdentifyingPhysicalLinkAggregations = async function (ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = 'RequestForProvidingHistoricalPmDataCausesIdentifyingPhysicalLinkAggregations';
  const stringName = "RequestForProvidingHistoricalPmDataCausesIdentifyingPhysicalLinkAggregations.LtpDesignation";
  let aggregatedResults = [];

  try {
    /***************************************************************************************************************
     * Fetch all AIR_LAYER LTPs
     ****************************************************************************************************************/
    const airInterfaceLtps = ltpStructure.filter(
      (ltp) => ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0]
                [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME] === 'AIR_LAYER');

    /***************************************************************************************************************
     * Process each AirInterfaceUuid to find corresponding EthernetContainerUuid and Wire/AirInterfaceUuids
     ****************************************************************************************************************/
    for (let airLtp of airInterfaceLtps) {
      const airInterfaceUuid = airLtp[onfAttributes.GLOBAL_CLASS.UUID];
      let clientStructureUuid = airLtp[onfAttributes.LOGICAL_TERMINATION_POINT.CLIENT_LTP][0];

      // Navigate upwards to find the EthernetContainerUuid
      let clientEthernetContainerUuid;
      while (clientStructureUuid) {
        const clientLtp = ltpStructure.find((ltp) => ltp[airInterfaceUuid] === clientStructureUuid);

        if (clientLtp && clientLtp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][
            onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME] === 'ETHERNET_CONTAINER_LAYER') {
          clientEthernetContainerUuid = clientStructureUuid;
          break;
        }
        clientStructureUuid = clientLtp[onfAttributes.LOGICAL_TERMINATION_POINT.CLIENT_LTP][0];
      }

      // Navigate downwards to find Wire/AirInterfaceUuids
      const servingStructureUuids = [];
      const ethernetContainerLtp = ltpStructure.find((ltp) => ltp[airInterfaceUuid] === clientEthernetContainerUuid);
      if (ethernetContainerLtp) {
        servingStructureUuids.push(...ethernetContainerLtp[onfAttributes.LOGICAL_TERMINATION_POINT.SERVER_LTP]);
      }

      for (let servingUuid of servingStructureUuids) {
        const serverLtp = ltpStructure.find((ltp) => ltp[airInterfaceUuid] === servingUuid);

        if (serverLtp) {
          const layerProtocolName = serverLtp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0]
                                                [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL_NAME];

          const pathParams = [mountName, servingUuid];
          const consequentOperationClientAndFieldParams =await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName);
          const ltpDesignationResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, traceIndicatorIncrementer++);

          if (Object.keys(ltpDesignationResponse).length > 0) {
            const originalLtpName = ltpDesignationResponse[LTP_AUGMENT.MODULE + ":" + LTP_AUGMENT.PAC][LTP_AUGMENT.ORIGINAL_LTP_NAME];
            const externalLabel = ltpDesignationResponse[LTP_AUGMENT.MODULE + ":" +LTP_AUGMENT.PAC][LTP_AUGMENT.EXTERNAL_LABEL];
            const result = 
            { uuid: servingUuid, 
              mountName: mountName, 
              layerProtocolName: layerProtocolName };

            if (layerProtocolName === 'WIRE_LAYER') {
              result['interface-name'] = originalLtpName;
            } else if (layerProtocolName === 'AIR_LAYER') {
              result['link-id'] = externalLabel.substring(0, 9);
            }

            aggregatedResults.push(result);
          }
        }
      }
    }
  } catch (error) {
    console.error(`${forwardingName} is not success with ${error}`);
  }

  return aggregatedResults;
};

/**
 * This method fetches Air Interface Configuration from Cache
 * @param {Object} ltpStructure ControlConstruct provided from cache.
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} requestHeaders Holds information of the requestHeaders
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} Returns air interface configurations from cache
 **/
exports.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache = async function (ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache";
  const stringName = "RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceConfigurationFromCache.AirInterfaceConfiguration";
  let airInterfaceConfigurations = [];

  try {
    // Fetch all LTPs of AIR_LAYER
    let airInterfaceLtpList = await ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(
      "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER", ltpStructure);

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName);

    // Loop through each LTP and fetch corresponding Air Interface Configuration
    for (let i = 0; i < airInterfaceLtpList.length; i++) {
      let uuid = airInterfaceLtpList[i]["uuid"];
      let localId = airInterfaceLtpList[i]["layerProtocol"][0]["local-id"];

      let pathParams = [mountName, uuid, localId];
      let _traceIndicatorIncrementer = traceIndicatorIncrementer++;

      let airInterfaceConfigurationResponse = await IndividualServiceUtility.forwardRequest(
        consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);

      let response= {
        mountName: mountName,
        uuid: uuid,
        localId: localId
      };

      if (Object.keys(airInterfaceConfigurationResponse).length === 0) {
        console.log(`${forwardingName} is not success`);
      } else {
        response.push(airInterfaceConfigurationResponse[AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.PAC][AIR_INTERFACE.CONFIGURATION]);
        airInterfaceConfigurations.push(response);
      }
    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
  }

  return airInterfaceConfigurations;
};

/**
 * This method fetches Air Interface Capabilities from Cache
 * @param {Object} ltpStructure ControlConstruct provided from cache.
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} requestHeaders Holds information of the requestHeaders
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} Returns air interface capabilities from cache
 **/
exports.RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache = async function (ltpStructure, mountName, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache";
  const stringName = "RequestForProvidingHistoricalPmDataCausesReadingAirInterfaceCapabilitiesFromCache.AirInterfaceCapabilities";
  let airInterfaceCapabilities = [];

  try {
    // Fetch all LTPs of AIR_LAYER
    let airInterfaceLtpList = await ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(
      "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER", ltpStructure);

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName);

    // Loop through each LTP and fetch corresponding Air Interface Capabilities
    for (let i = 0; i < airInterfaceLtpList.length; i++) {
      let uuid = airInterfaceLtpList[i]["uuid"];
      let localId = airInterfaceLtpList[i]["layerProtocol"][0]["local-id"];

      let pathParams = [mountName, uuid, localId];
      let _traceIndicatorIncrementer = traceIndicatorIncrementer++;

      let airInterfaceCapabilitiesResponse = await IndividualServiceUtility.forwardRequest(
        consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
        let response= {
          mountName: mountName,
          uuid: uuid,
          localId: localId
        };

      if (Object.keys(airInterfaceCapabilitiesResponse).length === 0) {
        console.log(`${forwardingName} is not success`);
      } else {
        response.push(airInterfaceCapabilitiesResponse[AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.PAC][AIR_INTERFACE.CAPABILITY]);
        airInterfaceCapabilities.push(response);
      }
    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
  }

  return airInterfaceCapabilities;
};

/**
 * Prepare attributes and automate RequestForProvidingHistoricalPmDataCausesReadingHistoricalAirInterfacePerformanceFromCache
 * @param {*} ltpStructure ControlConstruct provided from cache.
 * @param {*} mountName Identifier of the device at the Controller
 * @param {*} timeStamp timeStamp of the PM requested
 * @param {*} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {*} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
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
    let hpdList = airInterfaceHistoricalPerformance[AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.HISTORICAL_PERFORMANCES][0][historical-performance-data-list];
    if (hpdList != undefined) {
        hpdListFiltered = hpdList.filter(htp =>
                htp["granularity-period"] === "TYPE_PERIOD-15-MIN" && htp["period-end-time"] > timeStamp);
    }
	
    // Map results based on protocol type
    let responseObject = {
      uuid: uuid,
      mountName: mountName,
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
 * Fetch historical Ethernet container performance data from the cache.
 * @param {Object} ltpStructure - Control construct with Logical Termination Points.
 * @param {String} mountName - Name of the device at the Controller.
 * @param {String} timeStamp - Reference timestamp for filtering performance data.
 * @param {Object} requestHeaders - Request headers (e.g., apiKeyAuth).
 * @param {Integer} traceIndicatorIncrementer - Incrementer for trace indicator.
 * @returns {Array} Filtered Ethernet container performance data.
 */
exports.RequestForProvidingHistoricalPmDataCausesReadingHistoricalEthernetContainerPerformanceFromCache = async function( ltpStructure, mountName, timeStamp, requestHeaders, traceIndicatorIncrementer ) {
  const forwardingName = "RequestForProvidingHistoricalPmDataCausesReadingHistoricalEthernetContainerPerformanceFromCache";
  const stringName = "RequestForProvidingHistoricalPmDataCausesReadingHistoricalEthernetContainerPerformanceFromCache.EthernetContainerHistoricalPmFromCache"
  const processedResponses = [];

  try {
    /***********************************************************************************
     * Fetch LTPs with ETHERNET_CONTAINER_LAYER from ltpStructure
     ************************************************************************************/
    const ethInterfaceLtpList = await ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(
      ETHERNET_INTERFACE.MODULE + ":" + ETHERNET_INTERFACE.LAYER_PROTOCOL_NAME, ltpStructure );

    const consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName);

    /***********************************************************************************
     * Loop through each ETHERNET_CONTAINER_LAYER LTP
     ************************************************************************************/
    for (let ltp of ethInterfaceLtpList) {
      const uuid = ltp[onfAttributes.GLOBAL_CLASS.UUID];
      const localId = ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LOCAL_CLASS.LOCAL_ID];

      const pathParams = [mountName, uuid, localId];

      // Increment the trace indicator for each request
      const _traceIndicatorIncrementer = traceIndicatorIncrementer++;

      /***********************************************************************************
       * Fetch Ethernet container performances from cache
       ************************************************************************************/
      const ethernetInterfacePerformanceResponse  = await IndividualServiceUtility.forwardRequest(
        consequentOperationClientAndFieldParams,
        pathParams,
        requestHeaders,
        _traceIndicatorIncrementer
      );
      if (Object.keys(ethernetInterfacePerformanceResponse).length === 0) {
        console.log(`${forwardingName} is not success for UUID: ${uuid}`);
      }

      const performances = ethernetInterfacePerformanceResponse[ETHERNET_INTERFACE.MODULE + ":" + ETHERNET_INTERFACE.PAC][0][ETHERNET_INTERFACE.HISTORICAL_PERFORMANCES];

      /***********************************************************************************
       * Filter performance measurements
       ************************************************************************************/
      const filteredEntries = performances.filter(entry => {
        return (
          entry["granularity-period"] === "TYPE_PERIOD-15-MIN" &&
          new Date(entry["period-end-time"]) > new Date(timeStamp)
        );
      });

          // Map results based on protocol type
      let responseObject = {
        uuid: uuid,
        mountName: mountName,
        localId: localId,
        filteredEntries: filteredEntries
      };

    processedResponses.push(responseObject);
    }
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
  }

  return processedResponses;
}

/**
 * Function to deliver the requested PM data by aggregating the results 
 * and sending them to LinkVis.
 * @param {Array} airAndEthernetInterfacesResponse - The retrieved Name of Air and Ethernet Interfaces
 * @param {Array} physicalLinkAggregations - Identify Physical Link Aggregations
 * @param {Array} airInterfaceConfiguration - The retrieved Air Interface Configurations.
 * @param {Array} airInterfaceCapabilities - The retrieved Air Interface Capabilities.
 * @param {Array} airInterfacePerformance - The retrieved historical performance of Air Interfaces.
 * @param {Array} ethernetPerformance - The retrieved historical performance of Ethernet interfaces.
 * @returns {Object} Response status of the PM data delivery.
 */
exports.RequestForProvidingHistoricalPmDataCausesDeliveringRequestedPmData = async function (airAndEthernetInterfacesResponse, physicalLinkAggregations, airInterfaceConfiguration,
  airInterfaceCapabilities, airInterfacePerformance, ethernetPerformance)
{
  let airInterface = {};
  try {

    if(airAndEthernetInterfacesResponse.hasOwnProperty("link-end-point-name")) airInterface["link-end-point-name"] = airAndEthernetInterfacesResponse["link-end-point-name"];
    if(airAndEthernetInterfacesResponse.hasOwnProperty("interface-name")) airInterface["interface-name"] = airAndEthernetInterfacesResponse["interface-name"];

    if(physicalLinkAggregations.hasOwnProperty("link-id")) airInterface["link-id"] = physicalLinkAggregations["link-id"];
    if(physicalLinkAggregations.hasOwnProperty("interface-name")) airInterface["interface-name"] = physicalLinkAggregations["interface-name"];

    if (airInterfaceConfiguration.hasOwnProperty("atpc-is-on")) airInterface["configured-atpc-is-on"] = airInterfaceConfiguration["atpc-is-on"];
    let minTransmissionMode = await getConfiguredModulation(
      airInterfaceCapabilities,
      airInterfaceConfiguration["transmission-mode-min"]);
    let maxTransmissionMode = await getConfiguredModulation(
      airInterfaceCapabilities,
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


    if(airInterfaceCapabilities) airInterface['air-interface-capabilities'] = airInterfaceCapabilities;  
    if(airInterfacePerformance) airInterface['air-interface-performance'] = airInterfacePerformance;  
    if(ethernetPerformance) airInterface['ethernet-performance'] = ethernetPerformance;   

  } catch (error) {
    console.log(error);
  }
  return airInterface;
}

/**
 * Fetchs configured Modulation based on tansmission mode type min , max , or current .
 * @param {Object}  airInterfaceCapabilities air-interface-capability.
 * @param {Object}  transmissioModeType tansmission mode type min , max , or current.
 * @returns {Object} returns transmission mode fetched tansmission mode list of capability.
 */
async function getConfiguredModulation(airInterfaceCapabilities, transmissioModeType) {
  let transmissionModeFromtransmissionModeList = {};
  if (airInterfaceCapabilities && airInterfaceCapabilities.hasOwnProperty("transmission-mode-list")) {
    let transmissionModeList = airInterfaceCapabilities["transmission-mode-list"];
    if (transmissionModeList != undefined && transmissioModeType != undefined) {
      transmissionModeFromtransmissionModeList = transmissionModeList.find(transmissionMode =>
        transmissionMode["transmission-mode-name"] === transmissioModeType)
    }
  }
  return transmissionModeFromtransmissionModeList;
}