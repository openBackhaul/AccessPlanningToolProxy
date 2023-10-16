'use strict';

const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');

/**
 * This function fetches LTP list from LtpStructure if layerProtocolName is equal to given.
 * @param {String} LayerProtocolName name of the layer-protocol.
 * @param {Object} ltpStructure control construct.
 * @return {List} ltp list that matches the given layerProtocolName.
 */
exports.getLtpsOfLayerProtocolNameFromLtpStructure = async function (LayerProtocolName, ltpStructure) {
  let ltpsOfLayerProtocolName = [];
  let ltpList = ltpStructure["core-model-1-4:control-construct"][0][onfAttributes.CONTROL_CONSTRUCT.LOGICAL_TERMINATION_POINT];
  if (ltpList != undefined) {
    ltpsOfLayerProtocolName = ltpList.filter(ltp =>
      ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL].find(layerProtocol =>
        layerProtocol[onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME] === LayerProtocolName))
  }
  return ltpsOfLayerProtocolName;
}