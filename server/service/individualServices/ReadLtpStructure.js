const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const ForwardingConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct')
const eventDispatcher = require('./EventDispatcherWithResponse');
const StringProfile = require('./StringProfileUtility');

var traceIndicatorIncrementer = 1;

exports.readLtpStructure = async function (mountName, user, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function (resolve, reject) {
    let ltpStructure = {};
    try {

      ltpStructure = await RequestForProvidingAcceptanceDataCausesReadingLtpStructure(mountName, user, xCorrelator, traceIndicator, customerJourney);
      
      let result = {
        ltpStructure: ltpStructure, 
        traceIndicatorIncrementer: traceIndicatorIncrementer
      };
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

async function RequestForProvidingAcceptanceDataCausesReadingLtpStructure(mountName, user, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function (resolve, reject) {
    try {

      /***********************************************************************************
      * Preparing request
      ************************************************************************************/

      /* extracting forwarding construct based data */

      let readingLtpStructureFcName = "RequestForProvidingAcceptanceDataCausesReadingLtpStructure";

      let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(readingLtpStructureFcName);
      let operationClientUuid = ForwardingConstruct.getOutputFcPortsAsync(forwardingConstructInstance["uuid"])[0]["logical-termination-point"];

      let operationName = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
      let pathParamMatches = operationName.match(/\{(.*?)\}/g);
      let pathParams = new Map([[pathParamMatches[0], mountName]]);

      /* extracting string-profile based data */
      let readingLtpStructureStringName = "RequestForProvidingAcceptanceDataCausesReadingLtpStructure.LtpStructure";
      let fields = await StringProfile.getStringProfileInstanceValue(readingLtpStructureStringName);

      /* preparing request */
      let queryParams = {
        "fields": fields
      }
      let params = {
        "query": queryParams,
        "path": pathParams
      }

      /* forwarding the request */
      response = await eventDispatcher.dispatchEvent(
        operationClientUuid,
        {},
        user,
        xCorrelator,
        traceIndicator + "." + traceIndicatorIncrementer++,
        customerJourney,
        "GET",
        params
      );

      let responseCode = response.status;
      if (!responseCode.toString().startsWith("2")) {
        throw readingLtpStructureFcName + "forwarding is not success";
      }
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
}