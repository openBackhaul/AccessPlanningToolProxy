const IndividualServiceUtility = require('./IndividualServiceUtility');
const ltpStructureUtility = require('./LtpStructureUtility');
const createHttpError = require('http-errors');

const AIR_INTERFACE_LAYER_NAME = "air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER";
const AIR_INTERFACE_CONFIGURATION = "air-interface-2-0:air-interface-configuration";
const AIR_INTERFACE_CAPABILITY = "air-interface-2-0:air-interface-capability";
const AIR_INTERFACE_STATUS = "air-interface-2-0:air-interface-status"

var traceIndicatorIncrementer = 1;
var mountName = "";
var linkId = "";
var ltpStructure = {};
var requestHeaders = {};

exports.readAirInterfaceData = async function (_mountName, _linkId, _ltpStructure, _requestHeaders, _traceIndicatorIncrementer) {
  traceIndicatorIncrementer = _traceIndicatorIncrementer;
  mountName = _mountName;
  linkId = _linkId;
  ltpStructure = _ltpStructure;
  requestHeaders = _requestHeaders;
  let uuidUnderTest = "";
  let airInterface = {};

  let uuidUnderTestAndPathParams = await RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest();

  if (Object.keys(uuidUnderTestAndPathParams).length !== 0) {
    uuidUnderTest = uuidUnderTestAndPathParams.uuidUnderTest;
    pathParams = uuidUnderTestAndPathParams.pathParams;

    let airInterfaceConfiguration = await RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(pathParams);
    let airInterfaceCapabilities = await RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(pathParams);
    let airInterfaceStatus = await RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive(pathParams);

    airInterface = await formulateAirInterfaceResponseBody(airInterfaceConfiguration, airInterfaceCapabilities, airInterfaceStatus)
  }

  let result = {
    uuidUnderTest: uuidUnderTest,
    airInterface: airInterface,
    traceIndicatorIncrementer: traceIndicatorIncrementer
  };

  return result;
}


async function RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest() {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest";
  const stringName = "RequestForProvidingAcceptanceDataCausesDeterminingAirInterfaceUuidUnderTest.AirInterfaceName";
  try {
    let pathParamList = [];
    let uuidUnderTestAndPathParams = {};

    let ltpList = await ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(AIR_INTERFACE_LAYER_NAME, ltpStructure)
    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    for (let i = 0; i < ltpList.length; i++) {
      for (let j = 0; j < ltpList[i]["layer-protocol"].length; j++) {
        let uuid = ltpList[i]["uuid"];
        let localId = ltpList[i]["layer-protocol"][j]["local-id"]
        pathParamList = [];
        pathParamList.push(mountName);
        pathParamList.push(uuid);
        pathParamList.push(localId);
        let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
        let response = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParamList, requestHeaders,_traceIndicatorIncrementer);
        if (Object.keys(response).length === 0) {
          console.log(`${forwardingName} is not success`);
          return new createHttpError.InternalServerError();
        } else {
          if (response[AIR_INTERFACE_CONFIGURATION]["air-interface-name"] === linkId) {
            uuidUnderTestAndPathParams.uuidUnderTest = uuid;
            uuidUnderTestAndPathParams.pathParams = pathParamList;
          }
        }
      }
    }
    return uuidUnderTestAndPathParams;
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
}

async function RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache(pathParams) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache";
  const stringName = "RequestForProvidingAcceptanceDataCausesReadingConfigurationFromCache.ConfigurationFromCache" 
  try {
    let airInterfaceConfiguration = {};

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let response = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(response).length === 0) {
      console.log(`${forwardingName} is not success`);
      return new createHttpError.InternalServerError();
    } else {
      airInterfaceConfiguration = response[AIR_INTERFACE_CONFIGURATION]
    }

    return airInterfaceConfiguration;
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
}

async function RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache(pathParams) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesReadingCapabilitiesFromCache";
  const stringName = "RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive.StatusFromLive"
  try {
    let airInterfaceCapabilities = {};

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let response = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(response).length === 0) {
      console.log(`${forwardingName} is not success`);
      return new createHttpError.InternalServerError();
    } else {
      airInterfaceCapabilities = response[AIR_INTERFACE_CAPABILITY]
    }
    return airInterfaceCapabilities;
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
}

async function RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive(pathParams) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive";
  const stringName = "RequestForProvidingAcceptanceDataCausesReadingDedicatedStatusValuesFromLive.StatusFromLive";
  try {
    let airInterfaceStatus = {};

    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let response = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (Object.keys(response).length === 0) {
      console.log(`${forwardingName} is not success`);
      return new createHttpError.InternalServerError();
    } else {
      airInterfaceStatus = response[AIR_INTERFACE_STATUS];
    }
    return airInterfaceStatus;
  } catch (error) {
    console.log(`${forwardingName} is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
}

async function formulateAirInterfaceResponseBody(airInterfaceConfiguration, airInterfaceCapabilities, airInterfaceStatus) {
  try {
    let airInterface = {};
    airInterface["configured-tx-power"] = airInterfaceConfiguration["tx-power"];
    airInterface["current-tx-power"] = airInterfaceStatus["tx-level-cur"];
    airInterface["current-rx-level"] = airInterfaceStatus["rx-level-cur"];
    airInterface["configured-tx-frequency"] = airInterfaceConfiguration["tx-frequency"];
    airInterface["configured-rx-frequency"] = airInterfaceConfiguration["rx-frequency"];
    airInterface["configured-transmitted-radio-signal-id"] = airInterfaceConfiguration["transmitted-radio-signal-id"];
    airInterface["configured-expected-radio-signal-id"] = airInterfaceConfiguration["expected-radio-signal-id"];
    airInterface["configured-atpc-is-on"] = airInterfaceConfiguration["atpc-is-on"];
    airInterface["configured-atpc-threshold-upper"] = airInterfaceConfiguration["atpc-thresh-upper"];
    airInterface["configured-atpc-threshold-lower"] = airInterfaceConfiguration["atpc-thresh-lower"];
    airInterface["configured-atpc-tx-power-min"] = airInterfaceConfiguration["atpc-tx-power-min"];
    airInterface["configured-adaptive-modulation-is-on"] = airInterfaceConfiguration["adaptive-modulation-is-on"];
    airInterface["current-cross-polarization-discrimination"] = airInterfaceStatus["xpd-cur"];
    airInterface["configured-performance-monitoring-is-on"] = airInterfaceConfiguration["performance-monitoring-is-on"];
    airInterface["configured-xpic-is-on"] = airInterfaceConfiguration["xpic-is-on"];
    airInterface["current-signal-to-noise-ratio"] = airInterfaceStatus["snir-cur"];
    let MinTransmissionMode = await getConfiguredModulation(
      airInterfaceCapabilities,
      airInterfaceConfiguration["transmission-mode-min"]);
    let MaxTransmissionMode = await getConfiguredModulation(
      airInterfaceCapabilities,
      airInterfaceConfiguration["transmission-mode-max"]);
    let CurTransmissionMode = await getConfiguredModulation(
      airInterfaceCapabilities,
      airInterfaceStatus["transmission-mode-cur"]);
    airInterface["configured-modulation-minimum"] = {
      "number-of-states": MinTransmissionMode["modulation-scheme"],
      "name-at-lct": MinTransmissionMode["modulation-scheme-name-at-lct"]
    }
    airInterface["configured-modulation-maximum"] = {
      "number-of-states": MaxTransmissionMode["modulation-scheme"],
      "name-at-lct": MaxTransmissionMode["modulation-scheme-name-at-lct"]
    }
    airInterface["current-modulation"] = {
      "number-of-states": CurTransmissionMode["modulation-scheme"],
      "name-at-lct": CurTransmissionMode["modulation-scheme-name-at-lct"]
    }
    airInterface["configured-channel-bandwidth-min"] = MinTransmissionMode["channel-bandwidth"],
      airInterface["configured-channel-bandwidth-max"] = MaxTransmissionMode["channel-bandwidth"]
    return airInterface;
  } catch (error) {
    console.log(`formulateAirInterfaceResponseBody is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
}

async function getConfiguredModulation(airInterfaceCapabilities, transmissioModeType) {
  try {

    let transmissionModeList = airInterfaceCapabilities["transmission-mode-list"];
    let transmissionModeFromtransmissionModeList = {};
    if (transmissionModeList != undefined) {
      transmissionModeFromtransmissionModeList = transmissionModeList.find(transmissionMode =>
        transmissionMode["transmission-mode-name"] === transmissioModeType)
    }
    return transmissionModeFromtransmissionModeList;
  } catch (error) {
    console.log(`getConfiguredModulation is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
} 