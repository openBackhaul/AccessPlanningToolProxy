const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');


exports.getLtpsOfLayerProtocolNameFromLtpStructure = async function (LayerProtocolName, ltpStructure) {
  let ltpsOfLayerProtocolName = [];
  let ltpList = ltpStructure["core-model-1-4:control-construct"][onfAttributes.CONTROL_CONSTRUCT.LOGICAL_TERMINATION_POINT];
  if (ltpList != undefined) {
    ltpsOfLayerProtocolName = ltpList.filter(ltp =>
      ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL].find(layerProtocol =>
        layerProtocol[onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME] === LayerProtocolName))
  }
  return ltpsOfLayerProtocolName;
}