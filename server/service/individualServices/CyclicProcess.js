const FcPort = require('onf-core-model-ap/applicationPattern/onfModel/models/FcPort');
const RequestHeader = require('onf-core-model-ap/applicationPattern/rest/client/RequestHeader');
const LayerProtocol = require('onf-core-model-ap/applicationPattern/onfModel/models/LayerProtocol');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const controlConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ControlConstruct');
const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const profileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');
const onfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const LogicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const tcpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpClientInterface');
const httpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');

const axios = require('axios');

const LogicalTerminationPointC = require('./custom/LogicalTerminationPointC');
const logger = require('../LoggingService').getLogger();

var procedureIsRunning = false;
var cyclicTimerId = 0;
let coreModelPrefix = '';
let refreshTime = 0;


async function resolveApplicationNameAndHttpClientLtpUuidFromForwardingName(forwardingName) {
  logger.debug(`CyclicProcess - resolveApplicationNameAndHttpClientLtpUuidFromForwardingName forwardingName: ${forwardingName}`);
  const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
  if (forwardingConstruct === undefined) {
    logger.warn("CyclicProcess - resolveApplicationNameAndHttpClientLtpUuidFromForwardingName forwardingConstruct is undefined");
    return null;
  }

  let fcPortOutputDirectionLogicalTerminationPointList = [];
  const fcPortList = forwardingConstruct[onfAttributes.FORWARDING_CONSTRUCT.FC_PORT];
  for (const fcPort of fcPortList) {
    const portDirection = fcPort[onfAttributes.FC_PORT.PORT_DIRECTION];
    if (FcPort.portDirectionEnum.OUTPUT === portDirection) {
      logger.trace("CyclicProcess - Pushing fcPort attribute to array");
      fcPortOutputDirectionLogicalTerminationPointList.push(fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT]);
    }
  }

  if (fcPortOutputDirectionLogicalTerminationPointList.length !== 1) {
    logger.warn("CyclicProcess - resolveApplicationNameAndHttpClientLtpUuidFromForwardingName fcPortOutputDirectionLogicalTerminationPointList is != 1 so return null");
    return null;
  }

  const opLtpUuid = fcPortOutputDirectionLogicalTerminationPointList[0];
  logger.info(`CyclicProcess - Get Server LTP List from UUID: ${opLtpUuid}`);
  const httpLtpUuidList = await LogicalTerminationPoint.getServerLtpListAsync(opLtpUuid);

  const httpClientLtpUuid = httpLtpUuidList[0];
  logger.info(`CyclicProcess - Get Application name from UUID: ${httpClientLtpUuid}`);
  const applicationName = await httpClientInterface.getApplicationNameAsync(httpClientLtpUuid);

  logger.info(`CyclicProcess - Application name is: ${applicationName}`);
  return applicationName === undefined ? {
    applicationName: null,
    httpClientLtpUuid
  } : {
    applicationName,
    httpClientLtpUuid
  };
}


async function resolveOperationNameAndOperationKeyFromForwardingName(forwardingName) {
  logger.debug(`CyclicProcess - resolveOperationNameAndOperationKeyFromForwardingName forwardingName: ${forwardingName}`);
  const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
  if (forwardingConstruct === undefined) {
    logger.warn("CyclicProcess - resolveOperationNameAndOperationKeyFromForwardingName forwardingConstruct is undefined");
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
    logger.warn("CyclicProcess - resolveOperationNameAndOperationKeyFromForwardingName fcPortOutputDirectionLogicalTerminationPointList is != 1 so return null");
    return null;
  }

  const opLtpUuid = fcPortOutputDirectionLogicalTerminationPointList[0];
  logger.info(`CyclicProcess - Get Layer of LTP List from UUID ${opLtpUuid}`);
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

  logger.info(`CyclicProcess - Operation name is: ${operationName}`);
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

    let mountNameSize = 0;
    if (response && response.data && response.data['mount-name-list']) {
      mountNameSize = response.data['mount-name-list'].length;
    }
    logger.info(`CyclicProcess - Get connected MountName list with size of ${mountNameSize} entries`);
    logger.debug(response.data, "CyclicProcess - Lost of Mountname connected");
    global.connectedDeviceList = response.data
  } catch (error) {
    logger.error(error, "CyclicProcess - Error occurred retrieving connected device list");
  }
}

module.exports.start = async function start(user, originator, xCorrelator, traceIndicator, customerJourney) {
  logger.info("CyclicProcess - Request to start Cycle process");
  if (procedureIsRunning) {
    logger.warn("CyclicProcess - Already running, not need to run again. Returning without doing nothing");
    return;
  }
  procedureIsRunning = true;

  this.user = user
  this.originator = originator
  this.xCorrelator = xCorrelator
  this.traceIndicator = traceIndicator
  this.customerJourney = customerJourney

  async function extractProfileConfiguration(uuid) {
    let profile = await profileCollection.getProfileAsync(uuid);
    let objectKey = Object.keys(profile)[2];
    profile = profile[objectKey];
    return profile["integer-profile-configuration"]["integer-value"];
  }

  // Get the refresh interval time
  const forwardingName = "PromptForEmbeddingCausesRequestForBequeathingData";
  const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
  logger.info(`CyclicProcess - Forwarding Construct ${forwardingConstruct}`);
  coreModelPrefix = forwardingConstruct.name[0].value.split(':')[0];
  let prefix = forwardingConstruct.uuid.split('op')[0];
  refreshTime = await extractProfileConfiguration(prefix + 'integer-p-003')
  refreshTime = refreshTime * 60 * 1000       // convert it in milliseconds
  logger.debug(`CyclicProcess - Refreshing time (ms): ${refreshTime}`);

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
      logger.trace(`CyclicProcess - assigning to ltpTcpUuid: ${ltp[onfAttributes.GLOBAL_CLASS.UUID]}`);
      ltpTcpUuid = ltp[onfAttributes.GLOBAL_CLASS.UUID];
    }
  }

  let remoteTcpAddress = await tcpClientInterface.getRemoteAddressAsync(ltpTcpUuid);
  let remoteTcpPort = await tcpClientInterface.getRemotePortAsync(ltpTcpUuid);

  let finalUrl = "http://" + remoteTcpAddress["ip-address"]["ipv-4-address"] + ":" + remoteTcpPort + operationName;
  logger.debug(`CyclicProcess - Url to be query to retrieve data: ${finalUrl}`);

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
  logger.info("CyclicProcess - Trying to retrieving Connected Device list");
  updateConnectedDeviceList(finalUrl, httpRequestHeaderAuth)
  cyclicTimerId = setInterval(updateConnectedDeviceList, refreshTime, finalUrl, httpRequestHeaderAuth);
  let nextRefresh = new Date(Date.now() + refreshTime); // Calculate next time of cyclic process.
  logger.info(`CyclicProcess - Retrieving data will start ${nextRefresh.toISOString()}`);
}

module.exports.stop = async function stop() {
  procedureIsRunning = false;
  logger.info("CyclicProcess - Request to STOP");
  clearInterval(cyclicTimerId);
}
