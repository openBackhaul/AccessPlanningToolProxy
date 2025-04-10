'use strict';

/**
 * @file This module provides functionality to gather the air-interface data for given mount-name and linkId. 
 * @module ReadHistoricalData
 **/

const ReadAirInterfaceData = require('./ReadAirInterfaceData');
const ReadVlanInterfaceData = require('./ReadVlanInterfaceData');
const ReadInventoryData = require('./ReadInventoryData');
const ReadAlarmsData = require('./ReadAlarmsData');

const createHttpError = require('http-errors');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const ReadLtpStructure = require('./ReadLtpStructure');
const eventDispatcher = require('./EventDispatcherWithResponse');
const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const FcPort = require('onf-core-model-ap/applicationPattern/onfModel/models/FcPort');
const onfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');


/**
 * @description This function automates the forwarding construct by calling the appropriate call back operations based on the fcPort input and output directions.
 * @param {String} forwardingKindName forwarding Name
 * @param {list}   attributeList list of attributes required during forwarding construct automation(to send in the request body)
 * @param {String} user user who initiates this request
 * @param {string} originator originator of the request
 * @param {string} xCorrelator flow id of this request
 * @param {string} traceIndicator trace indicator of the request
 * @param {string} customerJourney customer journey of the request
 **/
async function forwardRequest(forwardingKindName, attributeList, user, xCorrelator, traceIndicator, customerJourney) {
  let forwardingConstructInstance = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingKindName);
  let operationClientUuid = (getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance))[0];
  let result = await eventDispatcher.dispatchEvent(
    operationClientUuid,
    attributeList,
    user,
    xCorrelator,
    traceIndicator,
    customerJourney,
    "POST"
  );
  return result;
}

function getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance) {
  let fcPortOutputLogicalTerminationPointList = [];
  let fcPortList = forwardingConstructInstance[
    onfAttributes.FORWARDING_CONSTRUCT.FC_PORT];
  for (let i = 0; i < fcPortList.length; i++) {
    let fcPort = fcPortList[i];
    let fcPortPortDirection = fcPort[onfAttributes.FC_PORT.PORT_DIRECTION];
    if (fcPortPortDirection === FcPort.portDirectionEnum.OUTPUT) {
      let fclogicalTerminationPoint = fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT];
      fcPortOutputLogicalTerminationPointList.push(fclogicalTerminationPoint);
    }
  }
  return fcPortOutputLogicalTerminationPointList;
}

exports.RequestForProvidingAcceptanceDataCausesDeliveringRequestedAcceptanceData = async function (request_id, requestHeaders, acceptanceDataOfLinkEndPoint,traceIndicatorIncrementer) {

  const forwardingName = "RequestForProvidingAcceptanceDataCausesDeliveringRequestedAcceptanceData";
  let response;
  let requestBody;

  try {

    if (acceptanceDataOfLinkEndPoint.error && Object.keys(acceptanceDataOfLinkEndPoint.error).length != 0) {
      requestBody = {
        "request-id": request_id,
        "code": acceptanceDataOfLinkEndPoint.error.code,
        "message": acceptanceDataOfLinkEndPoint.error.message
      };
    } else {
      requestBody = {
        "request-id": request_id,
        "air-interface": acceptanceDataOfLinkEndPoint["air-interface"],
        "vlan-interface": acceptanceDataOfLinkEndPoint["vlan-interface"],
        "inventory": acceptanceDataOfLinkEndPoint["inventory"],
        "alarms": acceptanceDataOfLinkEndPoint["alarms"]
      };
    }


    /****************************************************************************************************
     *   RequestForProvidingAcceptanceDataCausesDeliveringRequestedAcceptanceData
     *  
     *****************************************************************************************************/
    response = await forwardRequest(
      forwardingName,
      requestBody,
      requestHeaders.user,
      requestHeaders.xCorrelator,
      requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
      requestHeaders.customerJourney
    );

    return response;
  } catch (error) {
    console.log(error);
    return (new createHttpError.InternalServerError(`${error}`));
  }

}
exports.processAcceptanceDataRequest = async function (mountName, linkId, request_id, requestHeaders, traceIndicatorIncrementer) {

  let acceptanceDataOfLinkEndPoint = {};
  try {
    acceptanceDataOfLinkEndPoint = await exports.executeAcceptanceDataRequest(mountName, linkId, requestHeaders, traceIndicatorIncrementer);
    await exports.RequestForProvidingAcceptanceDataCausesDeliveringRequestedAcceptanceData(
      request_id, requestHeaders, acceptanceDataOfLinkEndPoint, traceIndicatorIncrementer);
  }
  catch (error) {
    console.error(`readAirInterfaceData is not success with ${error}`);
  }
  finally {
    global.counterStatusAcceptanceDataOfLinkEndpointCall--;
  }

}


exports.executeAcceptanceDataRequest = async function (mountName, linkId, requestHeaders, traceIndicatorIncrementer) {

  let acceptanceDataOfLinkEndPoint = {};
  let error = {};
  try {
    let ltpStructure = {};
    try {
      let ltpStructureResult = await ReadLtpStructure.readLtpStructure(mountName, requestHeaders, traceIndicatorIncrementer)
      ltpStructure = ltpStructureResult.ltpStructure;
      traceIndicatorIncrementer = ltpStructureResult.traceIndicatorIncrementer;
    } catch (err) {
      error.code = 502;
      error.message = "Bad Gateway. The upstream server (MicrowveDeviceInventory) is unavailable";
      acceptanceDataOfLinkEndPoint.error = error;
      throw new createHttpError.InternalServerError(`${err}`);
    };


    /****************************************************************************************
     * Collect air-interface data
     ****************************************************************************************/
    let airInterfaceResult = await ReadAirInterfaceData.readAirInterfaceData(mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer)
      .catch(err => console.log(` ${err}`));

    let uuidUnderTest = "";
    if (airInterfaceResult) {
      if (airInterfaceResult.uuidUnderTest && airInterfaceResult.uuidUnderTest != "") {
        uuidUnderTest = airInterfaceResult.uuidUnderTest;
      } else {
        error.code = 470;
        error.message = "The requested ressource does not exist within the referenced device";
        acceptanceDataOfLinkEndPoint.error = error;
        throw new createHttpError.InternalServerError(`${err}`);
      }
      if (Object.keys(airInterfaceResult.airInterface).length != 0) {
        acceptanceDataOfLinkEndPoint.airInterface = airInterfaceResult.airInterface;
      }
      traceIndicatorIncrementer = airInterfaceResult.traceIndicatorIncrementer;
    }
    else {
      error.code = 530;
      error.message = "Data invalid. Response data not available, incomplete or corrupted";
      acceptanceDataOfLinkEndPoint.error = error;
      throw new createHttpError.InternalServerError(`${err}`);
    }

    /****************************************************************************************
     * Collect vlan-interface data
     ****************************************************************************************/
    let vlanInterfaceResult = await ReadVlanInterfaceData.readVlanInterfaceData(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer)
      .catch(err => console.log(` ${err}`));

    if(vlanInterfaceResult && vlanInterfaceResult.vlanInterface) {

      if (Object.keys(vlanInterfaceResult.vlanInterface).length != 0) {
        acceptanceDataOfLinkEndPoint.vlanInterface = vlanInterfaceResult.vlanInterface;
      }
      traceIndicatorIncrementer = vlanInterfaceResult.traceIndicatorIncrementer;
    }
    else {
      error.code = 530;
      error.message = "Data invalid. Response data not available, incomplete or corrupted";
      acceptanceDataOfLinkEndPoint.error = error;
      throw new createHttpError.InternalServerError(`${err}`);
    }
    /****************************************************************************************
     * Collect inventory data
     ****************************************************************************************/
    let inventoryResult = await ReadInventoryData.readInventoryData(mountName, ltpStructure, uuidUnderTest, requestHeaders, traceIndicatorIncrementer)
      .catch(err => console.log(` ${err}`));

    if(inventoryResult && inventoryResult.inventory) {
    if (Object.keys(inventoryResult.inventory).length != 0) {
      acceptanceDataOfLinkEndPoint.inventory = inventoryResult.inventory;
    }
    traceIndicatorIncrementer = inventoryResult.traceIndicatorIncrementer;
    } else {
      error.code = 530;
      error.message = "Data invalid. Response data not available, incomplete or corrupted";
      acceptanceDataOfLinkEndPoint.error = error;
      throw new createHttpError.InternalServerError(`${err}`);
    }
    /****************************************************************************************
     * Collect alarms data
     ****************************************************************************************/
    let alarmsResult = await ReadAlarmsData.readAlarmsData(mountName, requestHeaders, traceIndicatorIncrementer)
      .catch(err => console.log(` ${err}`));
    if (alarmsResult) {
      if (Object.keys(alarmsResult.alarms).length != 0) {
        if (alarmsResult.alarms) {
          acceptanceDataOfLinkEndPoint.alarms = alarmsResult.alarms;
        }
      }
      traceIndicatorIncrementer = alarmsResult.traceIndicatorIncrementer;
    } else {
      error.code = 530;
      error.message = "Data invalid. Response data not available, incomplete or corrupted";
      acceptanceDataOfLinkEndPoint.error = error;
      throw new createHttpError.InternalServerError(`${err}`);
    }

  }
  catch (error) {
    console.error(`readAirInterfaceData is not success with ${error}`);
  }
  finally{
    acceptanceDataOfLinkEndPoint = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(acceptanceDataOfLinkEndPoint);
    return acceptanceDataOfLinkEndPoint;
  }

}
