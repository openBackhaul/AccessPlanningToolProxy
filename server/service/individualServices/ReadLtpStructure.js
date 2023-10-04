const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const FcPort = require('onf-core-model-ap/applicationPattern/onfModel/models/FcPort');
const eventDispatcher = require('./EventDispatcherWithResponse');
const ProfileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');
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
      let operationClientUuid = getFcPortOutputLogicalTerminationPoint(forwardingConstructInstance);

      let operationName = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
      let pathParamMatches = operationName.match(/\{(.*?)\}/g);
      let pathParams = new Map([[pathParamMatches[0], mountName]]);

      /* extracting string-profile based data */
      let readingLtpStructureStringName = "RequestForProvidingAcceptanceDataCausesReadingLtpStructure.LtpStructure";
      let fields = await getStringProfileInstanceValue(readingLtpStructureStringName);

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

function getFcPortOutputLogicalTerminationPoint(forwardingConstructInstance) {
  let fclogicalTerminationPoint = "";
  let fcPortList = forwardingConstructInstance[
    onfAttributes.FORWARDING_CONSTRUCT.FC_PORT];
  for (let i = 0; i < fcPortList.length; i++) {
    let fcPort = fcPortList[i];
    let fcPortPortDirection = fcPort[onfAttributes.FC_PORT.PORT_DIRECTION];
    if (fcPortPortDirection == FcPort.portDirectionEnum.OUTPUT) {
      fclogicalTerminationPoint = fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT];
      break;
    }
  }
  return fclogicalTerminationPoint;

}

async function getStringProfileInstanceValue(expectedStringName) {
  let stringValue = "";
  try {
    let stringProfileName = "string-profile-1-0:PROFILE_NAME_TYPE_STRING_PROFILE";
    let stringProfileInstanceList = await ProfileCollection.getProfileListForProfileNameAsync(stringProfileName);

    for (let i = 0; i < stringProfileInstanceList.length; i++) {
      let stringProfileInstance = stringProfileInstanceList[i];
      let stringProfilePac = stringProfileInstance[onfAttributes.STRING_PROFILE.PAC];
      let stringProfileCapability = stringProfilePac[onfAttributes.STRING_PROFILE.CAPABILITY];
      let stringName = stringProfileCapability[onfAttributes.STRING_PROFILE.STRING_NAME];
      if (stringName == expectedStringName) {
        let stringProfileConfiguration = stringProfilePac[onfAttributes.STRING_PROFILE.CONFIGURATION];
        stringValue = stringProfileConfiguration[onfAttributes.STRING_PROFILE.STRING_VALUE];
        break;
      }
    }
    return stringValue;

  } catch (error) {
    console.log(error);
  }

}