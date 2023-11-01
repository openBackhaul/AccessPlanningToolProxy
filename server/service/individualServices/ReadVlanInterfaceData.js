const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const IndividualServiceUtility = require('./IndividualServiceUtility');
const LtpStructureUtility = require('./LtpStructureUtility');
const createHttpError = require('http-errors');

const VLAN_INTERFACE = { MODULE: "vlan-interface-1-0:", CONFIGURATION: "vlan-interface-configuration", INTERFACE_KIND: "interface-kind", LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER" };
const LTP_AUGMENT = { MODULE: "ltp-augment-1-0:", PAC: "ltp-augment-pac", ORIGINAL_LTP_NAME: "original-ltp-name" };
const ETHERNET_CONTAINER = { MODULE: "ethernet-container-2-0:", STATUS: "ethernet-container-status", INTERFACE_STATUS: "interface-status", LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER" };
const WIRE_INTERFACE = { MODULE: "wire-interface-2-0:", LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER" };
const AIR_INTERFACE = { MODULE: "air-interface-2-0:", LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER" };
const PURE_ETHERNET_STRUCTURE = { MODULE: "pure-ethernet-structure-2-0:", LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER" };
const MAC_INTERFACE = { MODULE: "mac-interface-1-0:", LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER" };
const HYBRID_MW_STRUCTURE = { MODULE: "hybrid-mw-structure-2-0:", LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_HYBRID_MW_STRUCTURE_LAYER" };

/**
 * This method performs the set of procedure to gather the vlanInterface data
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} ltpStructure ControlConstruct provided from cache
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
   @returns {Object} result which contains the vlanInterface data and traceIndicatorIncrementer
* **/
exports.readVlanInterfaceData = function (mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer) {
  return new Promise(async function (resolve, reject) {
    try {
      /****************************************************************************************
      * Declaring required variables
      ****************************************************************************************/
      let vlanInterfaceResult = {};
      let configuredLanPortRoleList = [];
      let configuredWanPortRoleList = [];

      /****************************************************************************************
       *  Fetching configured-lan-port-role-list
       ****************************************************************************************/
      let configuredLanPortRoleListResponse = await RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer);
      if (Object.keys(configuredLanPortRoleListResponse).length != 0) {
        if (configuredLanPortRoleListResponse.configuredLanPortRoleList != undefined) {
          configuredLanPortRoleList = configuredLanPortRoleListResponse.configuredLanPortRoleList;
        }
        traceIndicatorIncrementer = configuredLanPortRoleListResponse.traceIndicatorIncrementer;
      }
      /****************************************************************************************
       *  Fetching configured-wan-port-role-list
       ****************************************************************************************/
      let configuredWanPortRoleListResponse = await RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer);
      if (Object.keys(configuredWanPortRoleListResponse).length != 0) {
        if (configuredWanPortRoleListResponse.configuredWanPortRoleList != undefined) {
          configuredWanPortRoleList = configuredWanPortRoleListResponse.configuredWanPortRoleList;
        }
        traceIndicatorIncrementer = configuredWanPortRoleListResponse.traceIndicatorIncrementer;
      }
      /****************************************************************************************
       *  Forming vlan-interface object for response-body
       ****************************************************************************************/
      vlanInterfaceResult = {
        vlanInterface: {
          configuredLanPortRoleList: configuredLanPortRoleList,
          configuredWanPortRoleList: configuredWanPortRoleList
        },
        traceIndicatorIncrementer: traceIndicatorIncrementer
      };
      resolve(vlanInterfaceResult);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Prepare attributes and automate the following forwarding-constructs to gather configured-lan-port-role-list of vlan-interface
 * 1. RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole.OriginalLtpName
 * 2. RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole.VlanInterfaceKind
 * 3. RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole.EthernetContainerStatus
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} ltpStructure ControlConstruct provided from cache
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return values of configured-lan-port-role-list and traceIndicatorIncrementer
 */
async function RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer) {
  let configuredLanPortRoleListResponse = {};
  let configuredLanPortRoleList = [];
  const originalLtpNameCallback = "RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole.OriginalLtpName";
  const vlanInterfaceKindCallback = "RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole.VlanInterfaceKind";
  const ethernetContainerStatusCallback = "RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole.EthernetContainerStatus";
  try {
    /****************************************************************************************
     * extracting operationName and stringValue for callbacks
     ****************************************************************************************/
    let clientAndFieldParamsForOriginalLtpName = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(originalLtpNameCallback);
    let clientAndFieldParamsForVlanInterfaceKind = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(vlanInterfaceKindCallback);
    let clientAndFieldParamsForEthernetContainerStatus = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(ethernetContainerStatusCallback);

    /****************************************************************************************
     * extract configured-lan-port-role-list
     ****************************************************************************************/
    let wireInterfaceLtpList = await LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(WIRE_INTERFACE.MODULE + WIRE_INTERFACE.LAYER_PROTOCOL_NAME, ltpStructure);
    for (let i = 0; i < wireInterfaceLtpList.length; i++) {
      let configuredLanPortRole = {};
      let wireInterfaceLtp = wireInterfaceLtpList[i];
      let wireInterfaceUuid = wireInterfaceLtp[onfAttributes.GLOBAL_CLASS.UUID];

      /****************************************************************************************************
        * process OriginalLtpName for each wire_interface
        *   RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole.OriginalLtpName
        *     MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
        *       /logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac?fields=original-ltp-name
        *****************************************************************************************************/
      let firstLayerToReachEthernetContainer = [PURE_ETHERNET_STRUCTURE.MODULE + PURE_ETHERNET_STRUCTURE.LAYER_PROTOCOL_NAME];
      let secondLayerToReachEthernetContainer = [ETHERNET_CONTAINER.MODULE + ETHERNET_CONTAINER.LAYER_PROTOCOL_NAME];
      let interfaceListToReachEthernetContainer = [firstLayerToReachEthernetContainer, secondLayerToReachEthernetContainer];
      let originalLtpNameResponse = await fetchOriginalLtpNameOfEthernetContainer(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer, wireInterfaceLtp, clientAndFieldParamsForOriginalLtpName, interfaceListToReachEthernetContainer);
      let clientContainerLtp = originalLtpNameResponse.clientContainerLtp;
      if (clientContainerLtp != undefined) {
        if (originalLtpNameResponse.interfaceName != undefined) {
          configuredLanPortRole.interfaceName = originalLtpNameResponse.interfaceName;
        }
        traceIndicatorIncrementer = originalLtpNameResponse.traceIndicatorIncrementer;
      } else {
        console.log(`${originalLtpNameCallback} for ${wireInterfaceUuid} is not success`);
        continue;
      }

      /****************************************************************************************************
        * process VlanInterfaceKind for each wire_interface
        *   RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole.VlanInterfaceKind
        *     MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
        *       /logical-termination-point={uuid}/layer-protocol={local-id}
        *         /vlan-interface-1-0:vlan-interface-pac/vlan-interface-configuration?fields=interface-kind
        *****************************************************************************************************/
      let firstLayerToReachVlanInterface = [MAC_INTERFACE.MODULE + MAC_INTERFACE.LAYER_PROTOCOL_NAME];
      let secondLayerToReachVlanInterface = [VLAN_INTERFACE.MODULE + VLAN_INTERFACE.LAYER_PROTOCOL_NAME];
      let interfaceListToReachVlanInterface = [firstLayerToReachVlanInterface, secondLayerToReachVlanInterface];
      let vlanInterfaceKindResponse = await fetchVlanInterfaceKind(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer, clientContainerLtp, clientAndFieldParamsForVlanInterfaceKind, interfaceListToReachVlanInterface);
      if (Object.keys(vlanInterfaceKindResponse).length != 0) {
        if (vlanInterfaceKindResponse.vlanInterfaceKind != undefined) {
          configuredLanPortRole.vlanInterfaceKind = vlanInterfaceKindResponse.vlanInterfaceKind;
        }
        traceIndicatorIncrementer = vlanInterfaceKindResponse.traceIndicatorIncrementer;
      } else {
        console.log(`${vlanInterfaceKindCallback} for ${wireInterfaceUuid} is not success`);
      }

      /****************************************************************************************************
        * process EthernetContainerStatus for each wire_interface
        *   RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole.EthernetContainerStatus
        *     MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
        *       /logical-termination-point={uuid}/layer-protocol={local-id}
        *         /ethernet-container-2-0:ethernet-container-pac/ethernet-container-status?fields=interface-status
        *****************************************************************************************************/
      let ethernetContainerStatusResponse = await fetchServingEthernetContainerStatus(mountName, requestHeaders, traceIndicatorIncrementer, clientContainerLtp, clientAndFieldParamsForEthernetContainerStatus, traceIndicatorIncrementer);
      if (Object.keys(ethernetContainerStatusResponse).length != 0) {
        if (ethernetContainerStatusResponse.servingEthernetContainerStatus != undefined) {
          configuredLanPortRole.servingEthernetContainerStatus = ethernetContainerStatusResponse.servingEthernetContainerStatus;
        }
        traceIndicatorIncrementer = ethernetContainerStatusResponse.traceIndicatorIncrementer;
      } else {
        console.log(`${ethernetContainerStatusCallback} for ${wireInterfaceUuid} is not success`);
      }
      configuredLanPortRoleList.push(configuredLanPortRole);
    }
    configuredLanPortRoleListResponse = {
      configuredLanPortRoleList: configuredLanPortRoleList,
      traceIndicatorIncrementer: traceIndicatorIncrementer
    };
    return configuredLanPortRoleListResponse;
  } catch (error) {
    console.log(error);
    return new createHttpError.InternalServerError();
  }
}

/**
 * Prepare attributes and automate the following forwarding-constructs to gather configured-lan-port-role-list of vlan-interface
 * 1. RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole.OriginalLtpName
 * 2. RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole.VlanInterfaceKind
 * 3. RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole.EthernetContainerStatus
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} ltpStructure ControlConstruct provided from cache
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return values of configured-wan-port-role-list and traceIndicatorIncrementer
 */
async function RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer) {
  let configuredWanPortRoleListResponse = {};
  let configuredWanPortRoleList = [];
  const originalLtpNameCallback = "RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole.OriginalLtpName";
  const vlanInterfaceKindCallback = "RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole.VlanInterfaceKind";
  const ethernetContainerStatusCallback = "RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole.EthernetContainerStatus";
  try {
    /****************************************************************************************
     * extracting operationName and stringValue for callbacks
     ****************************************************************************************/
    let clientAndFieldParamsForOriginalLtpName = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(originalLtpNameCallback);
    let clientAndFieldParamsForVlanInterfaceKind = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(vlanInterfaceKindCallback);
    let clientAndFieldParamsForEthernetContainerStatus = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(ethernetContainerStatusCallback);

    /****************************************************************************************
     * extract configured-wan-port-role-list
     ****************************************************************************************/
    let airInterfaceLtpList = await LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(AIR_INTERFACE.MODULE + AIR_INTERFACE.LAYER_PROTOCOL_NAME, ltpStructure);
    for (let i = 0; i < airInterfaceLtpList.length; i++) {
      let configuredWanPortRole = {};
      let airInterfaceLtp = airInterfaceLtpList[i];
      let airInterfaceUuid = airInterfaceLtp[onfAttributes.GLOBAL_CLASS.UUID];

      /****************************************************************************************************
        * process OriginalLtpName for each air_interface
        *   RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole.OriginalLtpName
        *     MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
        *       /logical-termination-point={uuid}/ltp-augment-1-0:ltp-augment-pac?fields=original-ltp-name
        *****************************************************************************************************/
      let firstLayerToReachEthernetContainer = [PURE_ETHERNET_STRUCTURE.MODULE + PURE_ETHERNET_STRUCTURE.LAYER_PROTOCOL_NAME, HYBRID_MW_STRUCTURE.MODULE + HYBRID_MW_STRUCTURE.LAYER_PROTOCOL_NAME];
      let secondLayerToReachEthernetContainer = [ETHERNET_CONTAINER.MODULE + ETHERNET_CONTAINER.LAYER_PROTOCOL_NAME];
      let interfaceListToReachEthernetContainer = [firstLayerToReachEthernetContainer, secondLayerToReachEthernetContainer];
      let originalLtpNameResponse = await fetchOriginalLtpNameOfEthernetContainer(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer, airInterfaceLtp, clientAndFieldParamsForOriginalLtpName, interfaceListToReachEthernetContainer);
      let clientContainerLtp = originalLtpNameResponse.clientContainerLtp;
      if (clientContainerLtp != undefined) {
        if (originalLtpNameResponse.interfaceName != undefined) {
          configuredWanPortRole.interfaceName = originalLtpNameResponse.interfaceName;
        }
        traceIndicatorIncrementer = originalLtpNameResponse.traceIndicatorIncrementer;
      } else {
        console.log(`${originalLtpNameCallback} for ${airInterfaceUuid} is not success`);
        continue;
      }
      /****************************************************************************************************
        * process VlanInterfaceKind for each air_interface
        *   RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole.VlanInterfaceKind
        *     MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
        *       /logical-termination-point={uuid}/layer-protocol={local-id}
        *         /vlan-interface-1-0:vlan-interface-pac/vlan-interface-configuration?fields=interface-kind
        *****************************************************************************************************/
      let firstLayerToReachVlanInterface = [MAC_INTERFACE.MODULE + MAC_INTERFACE.LAYER_PROTOCOL_NAME];
      let secondLayerToReachVlanInterface = [VLAN_INTERFACE.MODULE + VLAN_INTERFACE.LAYER_PROTOCOL_NAME];
      let interfaceListToReachVlanInterface = [firstLayerToReachVlanInterface, secondLayerToReachVlanInterface];
      let vlanInterfaceKindResponse = await fetchVlanInterfaceKind(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer, clientContainerLtp, clientAndFieldParamsForVlanInterfaceKind, interfaceListToReachVlanInterface);
      if (Object.keys(vlanInterfaceKindResponse).length != 0) {
        if (vlanInterfaceKindResponse.vlanInterfaceKind != undefined) {
          configuredWanPortRole.vlanInterfaceKind = vlanInterfaceKindResponse.vlanInterfaceKind;
        }
        traceIndicatorIncrementer = vlanInterfaceKindResponse.traceIndicatorIncrementer;
      } else {
        console.log(`${vlanInterfaceKindCallback} for ${airInterfaceUuid} is not success`);
      }
      /****************************************************************************************************
      * process EthernetContainerStatus for each air_interface
      *   RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole.EthernetContainerStatus
      *     MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
      *       /logical-termination-point={uuid}/layer-protocol={local-id}
      *         /ethernet-container-2-0:ethernet-container-pac/ethernet-container-status?fields=interface-status
      *****************************************************************************************************/
      let ethernetContainerStatusResponse = await fetchServingEthernetContainerStatus(mountName, requestHeaders, traceIndicatorIncrementer, clientContainerLtp, clientAndFieldParamsForEthernetContainerStatus);
      if (Object.keys(ethernetContainerStatusResponse).length != 0) {
        if (ethernetContainerStatusResponse.servingEthernetContainerStatus != undefined) {
          configuredWanPortRole.servingEthernetContainerStatus = ethernetContainerStatusResponse.servingEthernetContainerStatus;
        }
        traceIndicatorIncrementer = ethernetContainerStatusResponse.traceIndicatorIncrementer;
      } else {
        console.log(`${ethernetContainerStatusCallback} for ${airInterfaceUuid} is not success`);
      }
      configuredWanPortRoleList.push(configuredWanPortRole);
    }
    configuredWanPortRoleListResponse = {
      configuredWanPortRoleList: configuredWanPortRoleList,
      traceIndicatorIncrementer: traceIndicatorIncrementer
    };
    return configuredWanPortRoleListResponse;
  } catch (error) {
    console.log(error);
    return new createHttpError.InternalServerError();
  }
}

/**
 * Fetches original-ltp-name for ethernet-container ltp associated to chosen wire/air layer
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} ltpStructure ControlConstruct provided from cache
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @param {Object} ltp chosen ltp instance of wire/air layer
 * @param {Object} clientAndFieldParams Holds information of the query and field parameters to use in request url
 * @returns {Object} returns original-ltp-name value and traceIndicatorIncrementer
 */
async function fetchOriginalLtpNameOfEthernetContainer(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer, ltp, clientAndFieldParams, interfaceListForOriginalLtpName) {
  let originalLtpNameResponse = {};
  let pathParamList = [];
  let clientContainerLtp = await LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure(ltp, interfaceListForOriginalLtpName, ltpStructure);
  if (Object.keys(clientContainerLtp).length > 0) {
    originalLtpNameResponse.clientContainerLtp = clientContainerLtp;
    let clientContainerUuid = clientContainerLtp[onfAttributes.GLOBAL_CLASS.UUID];
    pathParamList.push(mountName, clientContainerUuid);
    let response = await IndividualServiceUtility.forwardRequest(clientAndFieldParams, pathParamList, requestHeaders, traceIndicatorIncrementer++);
    if (Object.keys(response).length > 0) {
      originalLtpNameResponse.interfaceName = response[LTP_AUGMENT.MODULE + LTP_AUGMENT.PAC][LTP_AUGMENT.ORIGINAL_LTP_NAME];
    }
    originalLtpNameResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  }
  return originalLtpNameResponse;
}

/**
 * Fetches vlan-interface-kind for client vlan ltp associated to chosen wire/air layer
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} ltpStructure ControlConstruct provided from cache
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @param {Object} clientContainerltp derived ethernet-container ltp instance associated to wire/air layer
 * @param {Object} clientAndFieldParams Holds information of the query and field parameters to use in request url
 * @returns {Object} returns vlan-interface-kind value and traceIndicatorIncrementer
 */
async function fetchVlanInterfaceKind(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer, clientContainerltp, clientAndFieldParams, interfaceListForVlanInterfaceKind) {
  let vlanInterfaceKindResponse = {};
  let pathParamList = [];
  let clientVlanInterfaceLtp = await LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure(clientContainerltp, interfaceListForVlanInterfaceKind, ltpStructure);
  if (Object.keys(clientVlanInterfaceLtp).length > 0) {
    let clientVlanInterfaceUuid = clientVlanInterfaceLtp[onfAttributes.GLOBAL_CLASS.UUID];
    let clientVlanInterfaceLocalId = clientVlanInterfaceLtp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LOCAL_CLASS.LOCAL_ID];
    pathParamList.push(mountName, clientVlanInterfaceUuid, clientVlanInterfaceLocalId);
    let response = await IndividualServiceUtility.forwardRequest(clientAndFieldParams, pathParamList, requestHeaders, traceIndicatorIncrementer++);
    if (Object.keys(response).length > 0) {
      vlanInterfaceKindResponse.vlanInterfaceKind = response[VLAN_INTERFACE.MODULE + VLAN_INTERFACE.CONFIGURATION][VLAN_INTERFACE.INTERFACE_KIND];
    }
    vlanInterfaceKindResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  }
  return vlanInterfaceKindResponse;
}

/**
 * Fetches serving-ethernet-container-status for client ethernet-container ltp associated to chosen wire/air layer
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @param {Object} clientContainerltp derived ethernet-container ltp instance associated to wire/air layer
 * @param {Object} clientAndFieldParams Holds information of the query and field parameters to use in request url
 * @returns {Object} returns serving-ethernet-container-status value and traceIndicatorIncrementer
 */
async function fetchServingEthernetContainerStatus(mountName, requestHeaders, traceIndicatorIncrementer, clientContainerLtp, clientAndFieldParams) {
  let ethernetContainerStatusResponse = {};
  let pathParamList = [];
  let clientContainerUuid = clientContainerLtp[onfAttributes.GLOBAL_CLASS.UUID];
  let clientContainerLocalId = clientContainerLtp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LOCAL_CLASS.LOCAL_ID];
  pathParamList.push(mountName, clientContainerUuid, clientContainerLocalId);
  let response = await IndividualServiceUtility.forwardRequest(clientAndFieldParams, pathParamList, requestHeaders, traceIndicatorIncrementer++);
  if (Object.keys(response).length > 0) {
    ethernetContainerStatusResponse.servingEthernetContainerStatus = response[ETHERNET_CONTAINER.MODULE + ETHERNET_CONTAINER.STATUS][ETHERNET_CONTAINER.INTERFACE_STATUS];
  }
  ethernetContainerStatusResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
  return ethernetContainerStatusResponse;
}