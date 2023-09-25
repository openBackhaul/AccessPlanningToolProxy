// @ts-check
'use strict';

const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const ForwardingDomain = require("onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain");
const FcPort = require("onf-core-model-ap/applicationPattern/onfModel/models/FcPort");

exports.getFcPortOutputDirectionLogicalTerminationPointListForForwardingName = async function getFcPortOutputDirectionLogicalTerminationPointListForForwardingName(forwardingName) {
  let fcPortOutputDirectionLogicalTerminationPointList = [];
  const forwardingConstruct = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
  if (forwardingConstruct === undefined) {
    return fcPortOutputDirectionLogicalTerminationPointList;
  }

  const fcPortList = forwardingConstruct[onfAttributes.FORWARDING_CONSTRUCT.FC_PORT];
  for (const fcPort of fcPortList) {
    const portDirection = fcPort[onfAttributes.FC_PORT.PORT_DIRECTION];
    if (FcPort.portDirectionEnum.OUTPUT === portDirection) {
      fcPortOutputDirectionLogicalTerminationPointList.push(fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT]);
    }
  }
  return fcPortOutputDirectionLogicalTerminationPointList;
}