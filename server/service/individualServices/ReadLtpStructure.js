const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const ForwardingConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const eventDispatcher = require('./EventDispatcherWithResponse');
const IndividualServiceUtility = require('./IndividualServiceUtility');

var traceIndicatorIncrementer = 1;
var requestHeaders = {};
var mountName = "";

exports.readLtpStructure = async function (_mountName, _requestHeaders) {
  return new Promise(async function (resolve, reject) {
    try {
      mountName = _mountName;
      requestHeaders = _requestHeaders;

      let ltpStructure = await RequestForProvidingAcceptanceDataCausesReadingLtpStructure();

      let result = {
        ltpStructure: ltpStructure,
        traceIndicatorIncrementer: traceIndicatorIncrementer
      };
      resolve(result);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

async function RequestForProvidingAcceptanceDataCausesReadingLtpStructure() {
  return new Promise(async function (resolve, reject) {
    try {

      /***********************************************************************************
      * Preparing request
      ************************************************************************************/

      /* extracting forwarding construct based data */

      let readingLtpStructureFcName = "RequestForProvidingAcceptanceDataCausesReadingLtpStructure";

      let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(readingLtpStructureFcName);
      let outputFcPortForFc = await ForwardingConstruct.getOutputFcPortsAsync(forwardingConstructInstance[onfAttributes.GLOBAL_CLASS.UUID]);
      let operationClientUuid = outputFcPortForFc[0][onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT];

      let operationName = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
      let pathParamList = [];
      pathParamList.push(mountName);

      /* extracting string-profile based data */
      let readingLtpStructureStringName = "RequestForProvidingAcceptanceDataCausesReadingLtpStructure.LtpStructure";
      let fields = await IndividualServiceUtility.getStringProfileInstanceValue(readingLtpStructureStringName);

      params = await IndividualServiceUtility.getQueryAndPathParameter(operationName, pathParamList, fields);
  
      /* forwarding the request */
      response = await eventDispatcher.dispatchEvent(
        operationClientUuid,
        {},
        requestHeaders.user,
        requestHeaders.xCorrelator,
        requestHeaders.traceIndicator + "." + traceIndicatorIncrementer++,
        requestHeaders.customerJourney,
        "GET",
        params
      );

      let responseCode = response.status;
      if (!responseCode.toString().startsWith("2")) {
        throw readingLtpStructureFcName + "forwarding is not success";
      }
      resolve(response.data);
    } catch (error) {
      console.log(error)
      reject(error);
    }
  });
}