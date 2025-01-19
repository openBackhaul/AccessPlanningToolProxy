'use strict';

const ProfileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const ForwardingConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct');
const IndividualServiceUtility = require('./IndividualServiceUtility');
const eventDispatcher = require('./EventDispatcherWithResponse');
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const onfPaths = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfPaths');

const fileSystem = require('fs');
const AsyncLock = require('async-lock');
const lock = new AsyncLock();
  
/**
 * This function fetches the string value from the string profile based on the expected string name.
 * @param {String} expectedStringName string name of the string profile.
 * @return {String} string value of the string profile.
 */
exports.getStringProfileInstanceValue = async function (expectedStringName) {
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
    console.log(`getStringProfileInstanceValue is not success with ${error}`);
    return new createHttpError.InternalServerError(`${error}`);  
  }
}

/**
 * This function formulates the query and path parameters from operationName and fields.
 * @param {String} operationName name of the operation to fetch path parameters key .
 * @param {List} pathParamList path parameters value list.
 * @param {String} fields query parameters.
 * @return {Object} params that contains query and path parameters.
 */
exports.getQueryAndPathParameter = async function (operationName, pathParamList, fields) {
  try {
    let pathParams = new Map();
    let queryParams = {};
    let params = {};

    if (pathParamList && (pathParamList.length !== 0)) {
      let pathParamMatches = operationName.match(/\{(.*?)\}/g);
      for (let i = 0; i < pathParamList.length; i++) {
        pathParams.set(pathParamMatches[i], pathParamList[i]);
      }
      params.path = pathParams;
    }

    if (fields !== "") {
      queryParams.fields = fields;
      params.query = queryParams;
    }

    return params;

  } catch (error) {
    console.log(`getQueryAndPathParameter is not success with ${error}`);
    return new createHttpError.InternalServerError(`${error}`);    }
}


/**
 * This function gets the consequent operation details like op-c uuid , operation-name, field parameters.
 * @param {String} forwardingConstructName name of the forwarding construct to fetch consequent op-c uuid.
 * @param {String} stringName string name to fetch the field parameter.
 * @return {Object} consequentOperationClientAndFieldParams that contains op-c uuid , operation-name, field parameters.
 */
exports.getConsequentOperationClientAndFieldParams = async function(forwardingConstructName, stringName = forwardingConstructName) {
  let consequentOperationClientAndFieldParams = {};
  try {
    let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingConstructName);
    let outputFcPortForFc = await ForwardingConstruct.getOutputFcPortsAsync(forwardingConstructInstance[onfAttributes.GLOBAL_CLASS.UUID]);
    consequentOperationClientAndFieldParams.operationClientUuid = outputFcPortForFc[0][onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT]; 
    consequentOperationClientAndFieldParams.operationName = await OperationClientInterface.getOperationNameAsync(consequentOperationClientAndFieldParams.operationClientUuid);
    consequentOperationClientAndFieldParams.fields = await IndividualServiceUtility.getStringProfileInstanceValue(stringName);
  } catch(error) {
    console.log(`getConsequentOperationClientAndFieldParams is not success with ${error}`);
    return new createHttpError.InternalServerError(`${error}`);
  }
  return consequentOperationClientAndFieldParams;
}

/**
 * @description This function automates the forwarding of request with related pathParameters and consequent op-c.
 * @param {Object} operationClientAndFieldParams operationClientAndFieldParams that contains op-c uuid , operation-name, field parameters of the request.
 * @param {list}   pathParamList list of path parameters values to be sent in request.
 * @param {Integer} traceIndicatorIncrementer incrementer value to increment the trace indicator.
 * @returns {Object} response data fetched for the forwarded request
 **/
exports.forwardRequest = async function (operationClientAndFieldParams, pathParamList, requestHeaders, traceIndicatorIncrementer) {
  try {
    let operationName = operationClientAndFieldParams.operationName;
    let fields = operationClientAndFieldParams.fields;
    let operationClientUuid = operationClientAndFieldParams.operationClientUuid;
    let params = await IndividualServiceUtility.getQueryAndPathParameter(operationName, pathParamList, fields);
    let responseData = await eventDispatcher.dispatchEvent(
      operationClientUuid,
      {},
      requestHeaders.user,
      requestHeaders.xCorrelator,
      requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
      requestHeaders.customerJourney,
      "GET",
      params
    );
    return responseData;
  } catch (error) {
    console.log(`forwardRequest is not success with ${error}`);
    return new createHttpError.InternalServerError(`${error}`);
  }
}

exports.extractProfileConfiguration = async function (uuid) {
  const profileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');
  let profile = await profileCollection.getProfileAsync(uuid);
  let objectKey = Object.keys(profile)[2];
  profile = profile[objectKey];
  return profile["integer-profile-configuration"]["integer-value"];
}

exports.validatevalidateInputFieldsForUpdateAptClient = async function (future_release_number,future_apt_protocol,future_apt_address,future_apt_tcp_port,future_acceptance_data_receive_operation,future_performance_data_receive_operation) {
  let validate = true;
  let validateRelease = false;
  let validateProtocol = false;
  let validateAddress = false;
  let validateTcpPort = false;
  let validateAcceptenceData = false;
  let validatePerformanceData = false;
  
  if(undefined != future_release_number && future_release_number.length != 0){
  validateRelease = true;
  }
  if(undefined != future_apt_protocol && future_apt_protocol.length != 0){
    validateProtocol = true;
  }
  if(undefined != future_apt_address && future_apt_address.length != 0){
    validateAddress = true;
  }
  if(undefined != future_apt_tcp_port && future_apt_tcp_port.length != 0 && !isNaN(future_apt_tcp_port)
  &&(future_apt_tcp_port>=0 && future_apt_tcp_port<=65535)
  ){
    validateTcpPort = true;
  }
  if(undefined != future_acceptance_data_receive_operation && future_acceptance_data_receive_operation.length != 0){
    validateAcceptenceData = true;
  }
  if(undefined != future_performance_data_receive_operation && future_performance_data_receive_operation.length != 0){
    validatePerformanceData = true;
  }
 
  return validateRelease && 	validateProtocol && 	validateAddress && validateTcpPort && validateAcceptenceData && validatePerformanceData ;
}


/** 
 * Write to the filesystem.<br>
 * @param {JSON} coreModelJsonObject json object that needs to be updated
 * @returns {Boolean} return true if the value is updated, otherwise returns false
 **/
exports.resetCompleteFile = async function (coreModelJsonObject) { 
   let controlConstructPath = onfPaths.CONTROL_CONSTRUCT;
   await fileOperation.deletefromDatabaseAsync(controlConstructPath);
          
    return await lock.acquire(global.databasePath, async () => {
    let result = writeToFile(coreModelJsonObject);
    return result;
});
        

/** 
 * Write to the filesystem.<br>
 * @param {JSON} coreModelJsonObject json object that needs to be updated
 * @returns {Boolean} return true if the value is updated, otherwise returns false
 **/
function writeToFile(coreModelJsonObject) {
  try {
      fileSystem.writeFileSync(global.databasePath, JSON.stringify(coreModelJsonObject));
      return true;
  } catch (error) {
      console.log('write failed:', error)
      return false;
  }
}

}
