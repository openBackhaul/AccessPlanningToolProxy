'use strict';
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const onfPaths = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfPaths');

/**
 * Returns the Datatype of the Field
 *
 * uuid String 
 * returns inline_response_200_14
 **/
exports.getGenericResponseProfileDatatype = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "response-profile-1-0:datatype": value
  };
}

/**
 * Returns the Description of the Field
 *
 * uuid String 
 * returns inline_response_200_13
 **/
exports.getGenericResponseProfileDescription = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "response-profile-1-0:description": value
  };
}

/**
 * Returns the name of the Field
 *
 * uuid String 
 * returns inline_response_200_12
 **/
exports.getGenericResponseProfileFieldName = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "response-profile-1-0:field-name": value
  };
}

/**
 * Returns the name of the Operation
 *
 * uuid String 
 * returns inline_response_200_11
 **/
exports.getGenericResponseProfileOperationName = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "response-profile-1-0:operation-name": value
  };
}

/**
 * Returns the Value of the Field
 *
 * uuid String 
 * returns inline_response_200_15
 **/
exports.getGenericResponseProfileValue = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "response-profile-1-0:value": value
  };
}

/**
 * Configures the Value of the Field
 *
 * body Responseprofileconfiguration_value_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putGenericResponseProfileValue = async function (body, url, uuid) {
  let isInputHasValueReference = "value-reference" in body["response-profile-1-0:value"];
  let isValueReferenceExist = await fileOperation.readFromDatabaseAsync(
    onfPaths.RESPONSE_PROFILE_VALUE_REFERENCE.replace("{profileUuid}", uuid));
  if (isInputHasValueReference) {
    if (isValueReferenceExist != undefined) {
      await fileOperation.writeToDatabaseAsync(url, body, false);
    } else {
      let isDeleted = await fileOperation.deletefromDatabaseAsync(
        onfPaths.RESPONSE_PROFILE_STATIC_VALUE.replace(
          "{profileUuid}", uuid));
      if (isDeleted) {
        await fileOperation.writeToDatabaseAsync(url, body, false);
      }
    }
  } else {
    if (isValueReferenceExist != undefined) {
      let isDeleted = await fileOperation.deletefromDatabaseAsync(
        onfPaths.RESPONSE_PROFILE_VALUE_REFERENCE.replace(
          "{profileUuid}", uuid));
      if (isDeleted) {
        await fileOperation.writeToDatabaseAsync(url, body, false);
      }
    } else {
      await fileOperation.writeToDatabaseAsync(url, body, false);
    }
  }
}
