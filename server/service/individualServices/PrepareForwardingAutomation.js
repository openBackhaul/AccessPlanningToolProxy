const prepareALTForwardingAutomation = require('onf-core-model-ap-bs/basicServices/services/PrepareALTForwardingAutomation');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const eventDispatcher = require('onf-core-model-ap/applicationPattern/rest/client/eventDispatcher');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const FcPort = require('onf-core-model-ap/applicationPattern/onfModel/models/FcPort');


exports.bequeathYourDataAndDie = function (logicalTerminationPointconfigurationStatus) {
  return new Promise(async function (resolve, reject) {
    let forwardingConstructAutomationList = [];
    try {
      /***********************************************************************************
       * forwardings for application layer topology
       ************************************************************************************/
      let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputAsync(
        logicalTerminationPointconfigurationStatus,
        undefined
      );

      if (applicationLayerTopologyForwardingInputList) {
        for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
          let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
          forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
        }
      }

      resolve(forwardingConstructAutomationList);
    } catch (error) {
      reject(error);
    }
  });
}

exports.OAMLayerRequest = function (uuid) {
  return new Promise(async function (resolve, reject) {
    let forwardingConstructAutomationList = [];
    try {

      /***********************************************************************************
       * forwardings for application layer topology
       ************************************************************************************/
      let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputForOamRequestAsync(
        uuid
      );

      if (applicationLayerTopologyForwardingInputList) {
        for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
          let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
          forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
        }
      }

      resolve(forwardingConstructAutomationList);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * @description This function automates the forwarding construct by calling the appropriate call back operations based on the fcPort input and output directions.
 * @param {String} forwardingKindName forwarding Name
 * @param {list}   attributeList list of attributes required during forwarding construct automation(to send in the request body)
 * @param {String} user user who initiates this request
 * @param {string} originator originator of the request
 * @param {string} xCorrelator flow id of this request
 * @param {string} traceIndicator trace indicator of the request
 * @param {string} customerJourney customer journey of the request
 * @param {Boolean} isMethodGET true if method of the request is GET
 * @param {Object} params path and query params
 **/
exports.forwardRequest = async function (forwardingKindName, attributeList, user, xCorrelator, traceIndicator, customerJourney, isMethodGET, params) {
  let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingKindName);
  let operationClientUuid = (getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance))[0];
  let result = await eventDispatcher.dispatchEvent(
    operationClientUuid,
    attributeList,
    user,
    xCorrelator,
    traceIndicator,
    customerJourney,
    isMethodGET,
    params,
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
if (fcPortPortDirection == FcPort.portDirectionEnum.OUTPUT) {
  let fclogicalTerminationPoint = fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT];
  fcPortOutputLogicalTerminationPointList.push(fclogicalTerminationPoint);
}
}
return fcPortOutputLogicalTerminationPointList;
}