const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const LogicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const httpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const FcPort = require('onf-core-model-ap/applicationPattern/onfModel/models/FcPort');
const LogicalTerminationPointC = require('./custom/LogicalTerminationPointC');
const LayerProtocol = require('onf-core-model-ap/applicationPattern/onfModel/models/LayerProtocol');
const controlConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ControlConstruct');
const tcpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpClientInterface');
const RequestHeader = require('onf-core-model-ap/applicationPattern/rest/client/RequestHeader');
const onfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const axios = require('axios');

var procedureIsRunning = false;
var cyclicTimerId = 0;
let coreModelPrefix = '';
let refreshTime = 0;


async function resolveApplicationNameAndHttpClientLtpUuidFromForwardingName(forwardingName) {
  
    const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
    if (forwardingConstruct === undefined) {
        return null;
    }

    let fcPortOutputDirectionLogicalTerminationPointList = [];
    const fcPortList = forwardingConstruct[onfAttributes.FORWARDING_CONSTRUCT.FC_PORT];
    for (const fcPort of fcPortList) {
        const portDirection = fcPort[onfAttributes.FC_PORT.PORT_DIRECTION];
        if (FcPort.portDirectionEnum.OUTPUT === portDirection) {
            fcPortOutputDirectionLogicalTerminationPointList.push(fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT]);
        }
    }

    if (fcPortOutputDirectionLogicalTerminationPointList.length !== 1) {
        return null;
    }

    const opLtpUuid = fcPortOutputDirectionLogicalTerminationPointList[0];
    const httpLtpUuidList = await LogicalTerminationPoint.getServerLtpListAsync(opLtpUuid);

    const httpClientLtpUuid = httpLtpUuidList[0];
    const applicationName = await httpClientInterface.getApplicationNameAsync(httpClientLtpUuid);

    return applicationName === undefined ? {
        applicationName: null,
        httpClientLtpUuid
    } : {
        applicationName,
        httpClientLtpUuid
    };
}


async function resolveOperationNameAndOperationKeyFromForwardingName(forwardingName) {

    const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
    if (forwardingConstruct === undefined) {
        return null;
    }

    let fcPortOutputDirectionLogicalTerminationPointList = [];
    const fcPortList = forwardingConstruct[onfAttributes.FORWARDING_CONSTRUCT.FC_PORT];
    for (const fcPort of fcPortList) {
        const portDirection = fcPort[onfAttributes.FC_PORT.PORT_DIRECTION];
        if (FcPort.portDirectionEnum.OUTPUT === portDirection) {
            fcPortOutputDirectionLogicalTerminationPointList.push(fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT]);
        }
    }

    if (fcPortOutputDirectionLogicalTerminationPointList.length !== 1) {
        return null;
    }

    const opLtpUuid = fcPortOutputDirectionLogicalTerminationPointList[0];
    const logicalTerminationPointLayer = await LogicalTerminationPointC.getLayerLtpListAsync(opLtpUuid);

    let clientPac;
    let pacConfiguration;
    let operationName;
    let operationKey;
    for (const layer of logicalTerminationPointLayer) {
        let layerProtocolName = layer[onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME];
        if (LayerProtocol.layerProtocolNameEnum.OPERATION_CLIENT === layerProtocolName) {
            clientPac = layer[onfAttributes.LAYER_PROTOCOL.OPERATION_CLIENT_INTERFACE_PAC];
            pacConfiguration = clientPac[onfAttributes.OPERATION_CLIENT.CONFIGURATION];
            operationName = pacConfiguration[onfAttributes.OPERATION_CLIENT.OPERATION_NAME];
            operationKey = pacConfiguration[onfAttributes.OPERATION_CLIENT.OPERATION_KEY];
        }
        else if (LayerProtocol.layerProtocolNameEnum.ES_CLIENT == layerProtocolName) {
            clientPac = layer[onfAttributes.LAYER_PROTOCOL.ES_CLIENT_INTERFACE_PAC];
            pacConfiguration = clientPac[onfAttributes.ES_CLIENT.CONFIGURATION];
            operationName = pacConfiguration[onfAttributes.ES_CLIENT.AUTH];
            operationKey = pacConfiguration[onfAttributes.ES_CLIENT.INDEX_ALIAS];
        }
    }

    return operationName === undefined ? {
        operationName: null,
        operationKey
    } : {
        operationName,
        operationKey
    };
}

async function updateConnectedDeviceList(finalUrl, httpRequestHeaderAuth) {
    try {
        let response = await axios.post(finalUrl, {}, {
          headers: httpRequestHeaderAuth
        });
        console.log('Response: ' + response.data)
        global.connectedDeviceList = response.data
    } catch (error) {
        console.log("An error has occurred retrieving connected device list (" + error + ")");
    }
}

module.exports.start = async function start(user, originator, xCorrelator, traceIndicator, customerJourney) {
  
    if (procedureIsRunning) {
        return;
    }
    procedureIsRunning = true;

    this.user = user
    this.originator = originator
    this.xCorrelator = xCorrelator
    this.traceIndicator = traceIndicator
    this.customerJourney = customerJourney

    async function extractProfileConfiguration(uuid) {
        const profileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');
        let profile = await profileCollection.getProfileAsync(uuid);
        let objectKey = Object.keys(profile)[2];
        profile = profile[objectKey];
        return profile["integer-profile-configuration"]["integer-value"];
    }

    // Get the refresh interval time
    const forwardingName = "PromptForEmbeddingCausesRequestForBequeathingData";
    const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
    console.log(forwardingConstruct)
    coreModelPrefix = forwardingConstruct.name[0].value.split(':')[0];
    let prefix = forwardingConstruct.uuid.split('op')[0];
    refreshTime = await extractProfileConfiguration(prefix + 'integer-p-003')
    refreshTime = refreshTime * 60 * 1000       // convert it in milliseconds
    console.log(refreshTime)

    // Test cyclic engine
    let applicationNameAndHttpClient =
        await resolveApplicationNameAndHttpClientLtpUuidFromForwardingName('PromptForEmbeddingCausesCyclicLoadingOfDevicesFromMwdi');

    let operationNameAndOperationKey =
        await resolveOperationNameAndOperationKeyFromForwardingName('PromptForEmbeddingCausesCyclicLoadingOfDevicesFromMwdi');

    let httpClientLtpUuid = applicationNameAndHttpClient.httpClientLtpUuid;
    let applicationName = applicationNameAndHttpClient.applicationName;
    let operationName = operationNameAndOperationKey.operationName;
    let operationKey = operationNameAndOperationKey.operationKey;

    let logicalTerminationPointListTCP = await controlConstruct.getLogicalTerminationPointListAsync(LayerProtocol.layerProtocolNameEnum.TCP_CLIENT);
    let ltpTcpUuid;
    for (const ltp of logicalTerminationPointListTCP) {
      const clientLtp = ltp[onfAttributes.LOGICAL_TERMINATION_POINT.CLIENT_LTP];
      if (applicationNameAndHttpClient.httpClientLtpUuid === clientLtp[0]) {
        ltpTcpUuid = ltp[onfAttributes.GLOBAL_CLASS.UUID];
      }
    }

    let remoteTcpAddress = await tcpClientInterface.getRemoteAddressAsync(ltpTcpUuid);
    let remoteTcpPort = await tcpClientInterface.getRemotePortAsync(ltpTcpUuid);

    let finalUrl = "http://" + remoteTcpAddress["ip-address"]["ipv-4-address"] + ":" + remoteTcpPort + operationName;
    console.log("url = " + finalUrl);


    let httpRequestHeader = new RequestHeader(
      user,
      originator,
      xCorrelator,
      traceIndicator,
      customerJourney,
      operationKey
    );

    let httpRequestHeaderAuth = {
      "content-type": httpRequestHeader['contentType'],
      "user": httpRequestHeader['user'],
      "originator": httpRequestHeader['originator'],
      "x-correlator": httpRequestHeader['xCorrelator'],
      "trace-indicator": httpRequestHeader['traceIndicator'],
      "customer-journey": httpRequestHeader['customerJourney'],
      "operation-key": httpRequestHeader['operationKey'],
    };

    httpRequestHeader = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(httpRequestHeaderAuth);
    updateConnectedDeviceList(finalUrl, httpRequestHeaderAuth)
    cyclicTimerId = setInterval(updateConnectedDeviceList, refreshTime, finalUrl, httpRequestHeaderAuth);
}

module.exports.stop = async function stop() {
    procedureIsRunning = false;
    clearInterval(cyclicTimerId);
}
