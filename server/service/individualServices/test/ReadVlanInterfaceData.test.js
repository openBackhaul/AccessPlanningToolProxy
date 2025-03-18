global.testPrivateFuntions = 1;
const { readVlanInterfaceData_private } = require('../ReadVlanInterfaceData');
const IndividualServiceUtility = require('../IndividualServiceUtility');
const LtpStructureUtility = require('../LtpStructureUtility');
const a = require('../ReadVlanInterfaceData');
global.testPrivateFuntions = 0;

jest.mock('../IndividualServiceUtility', () => ({
  getConsequentOperationClientAndFieldParams: jest.fn(),
  forwardRequest: jest.fn(),
}));

jest.mock('../LtpStructureUtility', () => ({
  getLtpsOfLayerProtocolNameFromLtpStructure: jest.fn(),
  getHierarchicalClientLtpForInterfaceListFromLtpStructure: jest.fn(),
}));

describe('RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole', () => {
  let mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer;

  beforeEach(() => {
    jest.clearAllMocks();
    mountName = '513250006';
    ltpStructure = {
        'core-model-1-4:control-construct': [
          {
            'logical-termination-point': [{
              uuid: 'LTP-ETC-TTP-LAN-1-XG-SFP',
              'client-ltp': ['LTP-MAC-TTP-LAN-1-XG-SFP'],
              'server-ltp': ['LTP-MWS-LAN-1-XG-SFP'],
              'layer-protocol': { 'local-id': 'LP-ETC-TTP-LAN-1-XG-SFP', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER' }
            },
            {
              uuid: 'LTP-ETC-TTP-LAN-2-XG-SFP',
              'client-ltp': ['LTP-MAC-TTP-LAN-2-XG-SFP'],
              'server-ltp': ['LTP-MWS-LAN-2-XG-SFP'],
              'layer-protocol': [{ 'local-id': 'LP-ETC-TTP-LAN-2-XG-SFP', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER' }]
            }
            ]
          }
        ]
      };
    requestHeaders = { user: 'nms5ux', originator: 'AccessPlanningToolProxy', xCorrelator: 'cc56eEbb-FE94-dDec-BD67-2418F6ABe5a1', traceIndicator: '1', customerJourney: 'unknown' };
    traceIndicatorIncrementer = 7;
  });

  it('should return configured LAN port role list with valid data', async () => {
    // Mock wire interface list
    LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([
        {    uuid: 'LTP-ETY-TTP-LAN-2-RJ45', 
            'client-ltp': ['LTP-MWS-LAN-2-COMBO'], 
            'layer-protocol': [{'local-id': 'LP-ETY-TTP-LAN-2-RJ45', 'layer-protocol-name': 'wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER'}]
        },
        {    uuid: 'LTP-ETY-TTP-LAN-2-SFP', 
            'client-ltp': ['LTP-MWS-LAN-2-COMBO'], 
            'layer-protocol': [{'local-id': 'LP-ETY-TTP-LAN-2-SFP', 'layer-protocol-name': 'wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER'}]
        },
        {    uuid: 'LTP-ETY-TTP-LAN-1-XG-SFP', 
            'client-ltp': ['LTP-MWS-LAN-1-XG-SFP'], 
            'layer-protocol': [{'local-id': 'LP-ETY-TTP-LAN-1-XG-SFP', 'layer-protocol-name': 'wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER'}]
        }
    ]);

    // Mock hierarchical client LTP for Ethernet container
    LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure
        .mockResolvedValueOnce({	
            uuid: 'LTP-ETC-TTP-LAN-2-COMBO', 
            'client-ltp': ['LTP-MAC-TTP-LAN-2-COMBO'], 
            'server-ltp': ['LTP-MWS-LAN-2-COMBO'], 
            'layer-protocol': [{'local-id': 'LP-ETC-TTP-LAN-2-COMBO', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER'}]
        })
        .mockResolvedValueOnce({	
             uuid: 'LTP-VLAN-TTP-LAN-2-COMBO', 
            'server-ltp': ['LTP-MAC-TTP-LAN-2-COMBO'], 
            'layer-protocol': [{'local-id': 'LP-VLAN-TTP-LAN-2-COMBO', 'layer-protocol-name': 'vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER'}]
        });
    

    // Mock IndividualServiceUtility for OriginalLtpName, VlanInterfaceKind, and EthernetContainerStatus
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});

    IndividualServiceUtility.forwardRequest
      .mockResolvedValueOnce({'ltp-augment-1-0:ltp-augment-pac': {'original-ltp-name': 'LAN-2-COMBO'}}) // OriginalLtpName
      .mockResolvedValueOnce({'vlan-interface-1-0:vlan-interface-configuration': {'interface-kind': 'vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT'}})  // VlanInterfaceKind
      .mockResolvedValueOnce({'ethernet-container-2-0:ethernet-container-status': {'interface-status': 'ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP'}});   // EthernetContainerStatus

    const result = await readVlanInterfaceData_private.RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      configuredLanPortRoleList: [
        {   interfaceName: 'LAN-2-COMBO', 
            vlanInterfaceKind: 'vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT', 
            servingEthernetContainerStatus: 'ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP'
        }
      ],
      traceIndicatorIncrementer: traceIndicatorIncrementer + 3, // Increments per forwardRequest call
    });

    expect(LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure).toHaveBeenCalled();
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(3);
  });

  it('should return empty list when no wire interfaces found', async () => {
    LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([]);

    const result = await readVlanInterfaceData_private.RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      configuredLanPortRoleList: [],
      traceIndicatorIncrementer: traceIndicatorIncrementer,
    });

    expect(LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure).toHaveBeenCalledTimes(1);
    expect(IndividualServiceUtility.forwardRequest).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValue(new Error('Mocked error'));

    const result = await readVlanInterfaceData_private.RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      configuredLanPortRoleList: [],
      traceIndicatorIncrementer: traceIndicatorIncrementer,
    });

    expect(LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure).toHaveBeenCalledTimes(1);
  });
});

describe('RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole', () => {
  let mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer;

  beforeEach(() => {
    jest.clearAllMocks();
    mountName = '513250006';
    ltpStructure = {
        'core-model-1-4:control-construct': [
          {
            'logical-termination-point': [{
              uuid: 'LTP-ETC-TTP-LAN-1-XG-SFP',
              'client-ltp': ['LTP-MAC-TTP-LAN-1-XG-SFP'],
              'server-ltp': ['LTP-MWS-LAN-1-XG-SFP'],
              'layer-protocol': { 'local-id': 'LP-ETC-TTP-LAN-1-XG-SFP', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER' }
            },
            {
              uuid: 'LTP-ETC-TTP-LAN-2-XG-SFP',
              'client-ltp': ['LTP-MAC-TTP-LAN-2-XG-SFP'],
              'server-ltp': ['LTP-MWS-LAN-2-XG-SFP'],
              'layer-protocol': [{ 'local-id': 'LP-ETC-TTP-LAN-2-XG-SFP', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER' }]
            }
            ]
          }
        ]
      };
    requestHeaders = { user: 'nms5ux', originator: 'AccessPlanningToolProxy', xCorrelator: 'cc56eEbb-FE94-dDec-BD67-2418F6ABe5a1', traceIndicator: '1', customerJourney: 'unknown' };
    traceIndicatorIncrementer = 1;
  });

  it('should return configured WAN port role list with valid data', async () => {
    LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([
        {    uuid: 'LTP-MWPS-TTP-ODU-B', 
            'client-ltp': ['LTP-MWS-ODU-B'], 
            'layer-protocol': [{'local-id': 'LP-MWPS-TTP-ODU-B', 'layer-protocol-name': 'air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER'}]
        },
        {    uuid: 'LTP-MWPS-TTP-ODU-A', 
            'client-ltp': ['LTP-MWS-ODU-A'], 
            'layer-protocol': [{'local-id': 'LP-MWPS-TTP-ODU-A', 'layer-protocol-name': 'air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER'}]
        }
    ]);

    LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure
        .mockResolvedValueOnce({
                uuid: "LTP-ETC-TTP-ODU-A",
                "client-ltp": ["LTP-MAC-TTP-ODU-A"],
                "server-ltp": ["LTP-MWS-ODU-A", "LTP-MWS-ODU-B"],
                "layer-protocol": [{ "local-id": "LP-ETC-TTP-ODU-A", "layer-protocol-name": "ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER"}],
        })
        .mockResolvedValueOnce({
                uuid: "LTP-VLAN-TTP-ODU-A",
                "server-ltp": ["LTP-MAC-TTP-ODU-A"],
                "layer-protocol": [{"local-id": "LP-VLAN-TTP-ODU-A", "layer-protocol-name": "vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER"}],
        });

    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});

    IndividualServiceUtility.forwardRequest
      .mockResolvedValueOnce({"ltp-augment-1-0:ltp-augment-pac": {"original-ltp-name": "ODU A"}}) // OriginalLtpName
      .mockResolvedValueOnce({ "vlan-interface-1-0:vlan-interface-configuration": {"interface-kind": "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT"} })  // VlanInterfaceKind
      .mockResolvedValueOnce({"ethernet-container-2-0:ethernet-container-status": {"interface-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP"}});   // EthernetContainerStatus

    const result = await readVlanInterfaceData_private.RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      configuredWanPortRoleList: [
        {
            interfaceName: "ODU A",
            vlanInterfaceKind: "vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT",
            servingEthernetContainerStatus: "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP"
        }],
      traceIndicatorIncrementer: traceIndicatorIncrementer + 3,
    });

    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(3);
  });

  it('should return empty list when no air interfaces found', async () => {
    LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([]);

    const result = await readVlanInterfaceData_private.RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      configuredWanPortRoleList: [],
      traceIndicatorIncrementer,
    });

    expect(IndividualServiceUtility.forwardRequest).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValue(new Error('Mocked error'));

    const result = await readVlanInterfaceData_private.RequestForProvidingAcceptanceDataCausesDeterminingTheWanPortRole(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      configuredWanPortRoleList: [],
      traceIndicatorIncrementer,
    });

    expect(LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure).toHaveBeenCalledTimes(1);
  });
});

describe('fetchOriginalLtpNameOfEthernetContainer', () => {
  let mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer, ltp, clientAndFieldParams, interfaceList;

  beforeEach(() => {
    jest.clearAllMocks();
    mountName = '513250006';
    ltpStructure = {
      'core-model-1-4:control-construct': [
        {
          'logical-termination-point': [{
            uuid: 'LTP-ETC-TTP-LAN-1-XG-SFP',
            'client-ltp': ['LTP-MAC-TTP-LAN-1-XG-SFP'],
            'server-ltp': ['LTP-MWS-LAN-1-XG-SFP'],
            'layer-protocol': { 'local-id': 'LP-ETC-TTP-LAN-1-XG-SFP', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER' }
          },
          {
            uuid: 'LTP-ETC-TTP-LAN-2-XG-SFP',
            'client-ltp': ['LTP-MAC-TTP-LAN-2-XG-SFP'],
            'server-ltp': ['LTP-MWS-LAN-2-XG-SFP'],
            'layer-protocol': [{ 'local-id': 'LP-ETC-TTP-LAN-2-XG-SFP', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER' }]
          }
          ]
        }
      ]
    };
    requestHeaders = { user: 'nms5ux', originator: 'AccessPlanningToolProxy', xCorrelator: 'cc56eEbb-FE94-dDec-BD67-2418F6ABe5a1', traceIndicator: '1', customerJourney: 'unknown' };
    traceIndicatorIncrementer = 7;
    ltp = {
      uuid: 'LTP-ETY-TTP-LAN-2-RJ45',
      'client-ltp': ['LTP-MWS-LAN-2-COMBO'],
      'layer-protocol': [{ 'local-id': 'LP-ETY-TTP-LAN-2-RJ45', 'layer-protocol-name': 'wire-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER' }]
    };
    clientAndFieldParams = { operationClientUuid: 'aptp-1-1-0-op-c-is-mwdi-1-1-2-201', operationName: '/core-model-1-4:network-control-domain=ca…nt={uuid}/ltp-augment-1-0:ltp-augment-pac', fields: 'original-ltp-name' };
    interfaceList = [['pure-ethernet-structure-2-0:LAYER_PROTOCOL_NAME_TYPE_PURE_ETHERNET_STRUCTURE_LAYER'],
    ['ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER']];
  });

  it('should return valid original-ltp-name and incremented traceIndicator', async () => {
    const clientContainerLtpMock = {	uuid: 'LTP-ETC-TTP-LAN-2-COMBO', 
      'client-ltp': ['LTP-MAC-TTP-LAN-2-COMBO'], 
      'server-ltp': ['LTP-MWS-LAN-2-COMBO'], 
      'layer-protocol': [{'local-id': 'LP-ETC-TTP-LAN-2-COMBO', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER'}]
    };

    // Mock getHierarchicalClientLtp
    LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure.mockResolvedValue(clientContainerLtpMock);

    // Mock forwardRequest
    IndividualServiceUtility.forwardRequest.mockResolvedValue({'ltp-augment-1-0:ltp-augment-pac': {'original-ltp-name': 'LAN-2-COMBO'}});

    const result = await readVlanInterfaceData_private.fetchOriginalLtpNameOfEthernetContainer(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer,
      ltp,
      clientAndFieldParams,
      interfaceList
    );

    expect(result).toEqual({
      interfaceName: 'LAN-2-COMBO',
      clientContainerLtp: clientContainerLtpMock,
      traceIndicatorIncrementer: 8,
    });

    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledWith(
      clientAndFieldParams,
      ['513250006', 'LTP-ETC-TTP-LAN-2-COMBO'],
      requestHeaders,
      traceIndicatorIncrementer
    );
  });

  it('should return only clientContainerLtp if response does not contain original-ltp-name', async () => {
    const clientContainerLtpMock = {	uuid: 'LTP-ETC-TTP-LAN-2-COMBO', 
        'client-ltp': ['LTP-MAC-TTP-LAN-2-COMBO'], 
        'server-ltp': ['LTP-MWS-LAN-2-COMBO'], 
        'layer-protocol': [{'local-id': 'LP-ETC-TTP-LAN-2-COMBO', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER'}]
    };

    LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure.mockResolvedValue(clientContainerLtpMock);

    IndividualServiceUtility.forwardRequest.mockResolvedValue({
      'ltp-augment-1-0:ltp-augment-pac': {}
    });

    const result = await readVlanInterfaceData_private.fetchOriginalLtpNameOfEthernetContainer(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer,
      ltp,
      clientAndFieldParams,
      interfaceList
    );

    expect(result).toEqual({
      clientContainerLtp: clientContainerLtpMock,
      traceIndicatorIncrementer: traceIndicatorIncrementer + 1,
    });
  });

  it('should return only incremented traceIndicator if clientContainerLtp not found', async () => {
    LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure.mockResolvedValue({});

    const result = await readVlanInterfaceData_private.fetchOriginalLtpNameOfEthernetContainer(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer,
      ltp,
      clientAndFieldParams,
      interfaceList
    );

    expect(result).toEqual({
      traceIndicatorIncrementer: traceIndicatorIncrementer,
    });

    expect(IndividualServiceUtility.forwardRequest).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully and return traceIndicator', async () => {
    LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure.mockRejectedValue(new Error('Mock error'));

    const result = await readVlanInterfaceData_private.fetchOriginalLtpNameOfEthernetContainer(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer,
      ltp,
      clientAndFieldParams,
      interfaceList
    );

    expect(result).toEqual({
      traceIndicatorIncrementer: traceIndicatorIncrementer
    });

    expect(IndividualServiceUtility.forwardRequest).not.toHaveBeenCalled();
  });
});

describe('fetchVlanInterfaceKind', () => {
  let mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer, clientContainerLtp, clientAndFieldParams, interfaceList;

  beforeEach(() => {
    jest.clearAllMocks();
    mountName = '513250006';
    ltpStructure = {
      'core-model-1-4:control-construct': [
        {
          'logical-termination-point': [{
            uuid: 'LTP-ETC-TTP-LAN-1-XG-SFP',
            'client-ltp': ['LTP-MAC-TTP-LAN-1-XG-SFP'],
            'server-ltp': ['LTP-MWS-LAN-1-XG-SFP'],
            'layer-protocol': { 'local-id': 'LP-ETC-TTP-LAN-1-XG-SFP', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER' }
          },
          {
            uuid: 'LTP-ETC-TTP-LAN-2-XG-SFP',
            'client-ltp': ['LTP-MAC-TTP-LAN-2-XG-SFP'],
            'server-ltp': ['LTP-MWS-LAN-2-XG-SFP'],
            'layer-protocol': [{ 'local-id': 'LP-ETC-TTP-LAN-2-XG-SFP', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER' }]
          }
          ]
        }
      ]
    };
    requestHeaders = { user: 'nms5ux', originator: 'AccessPlanningToolProxy', xCorrelator: 'cc56eEbb-FE94-dDec-BD67-2418F6ABe5a1', traceIndicator: '1', customerJourney: 'unknown' };
    traceIndicatorIncrementer = 8;
    clientContainerltp = {	uuid: 'LTP-ETC-TTP-LAN-2-COMBO', 
                            'client-ltp': ['LTP-MAC-TTP-LAN-2-COMBO'], 
                            'server-ltp': ['LTP-MWS-LAN-2-COMBO'], 
                            'layer-protocol': [{'local-id': 'LP-ETC-TTP-LAN-2-COMBO', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER'}]
                        }
    clientAndFieldParams = { operationClientUuid: 'aptp-1-1-0-op-c-is-mwdi-1-1-2-201', operationName: '/core-model-1-4:network-control-domain=ca…nt={uuid}/ltp-augment-1-0:ltp-augment-pac', fields: 'original-ltp-name' };
    interfaceListForVlanInterfaceKind = [	['mac-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_MAC_LAYER']
                                            ['vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER']
                                        ]
  });

  it('should return vlanInterfaceKind and incremented traceIndicator', async () => {
    const vlanLtpMock = {	uuid: 'LTP-VLAN-TTP-LAN-2-COMBO', 
        'server-ltp': ['LTP-MAC-TTP-LAN-2-COMBO'], 
        'layer-protocol': [{'local-id': 'LP-VLAN-TTP-LAN-2-COMBO', 'layer-protocol-name': 'vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER'}]
    };

    // Mock LTP traversal
    LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure.mockResolvedValue(vlanLtpMock);

    // Mock response from forwardRequest
    IndividualServiceUtility.forwardRequest.mockResolvedValue(
        {'vlan-interface-1-0:vlan-interface-configuration': 
            {'interface-kind': 'vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT'}
        });

    const result = await readVlanInterfaceData_private.fetchVlanInterfaceKind(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer,
      clientContainerLtp,
      clientAndFieldParams,
      interfaceList
    );

    expect(result).toEqual({
      vlanInterfaceKind: 'vlan-interface-1-0:INTERFACE_KIND_TYPE_C_VLAN_BRIDGE_PORT',
      traceIndicatorIncrementer: 9
    });

    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledWith(
      clientAndFieldParams,
      ['513250006', 'LTP-VLAN-TTP-LAN-2-COMBO', 'LP-VLAN-TTP-LAN-2-COMBO'],
      requestHeaders,
      traceIndicatorIncrementer
    );
  });

  it('should return only traceIndicator if no vlan LTP found', async () => {
    LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure.mockResolvedValue({});

    const result = await readVlanInterfaceData_private.fetchVlanInterfaceKind(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer,
      clientContainerLtp,
      clientAndFieldParams,
      interfaceList
    );

    expect(result).toEqual({ traceIndicatorIncrementer });

    expect(IndividualServiceUtility.forwardRequest).not.toHaveBeenCalled();
  });

  it('should return only traceIndicator if response is empty', async () => {
    const vlanLtpMock = {	uuid: 'LTP-VLAN-TTP-LAN-2-COMBO', 
        'server-ltp': ['LTP-MAC-TTP-LAN-2-COMBO'], 
        'layer-protocol': [{'local-id': 'LP-VLAN-TTP-LAN-2-COMBO', 'layer-protocol-name': 'vlan-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_VLAN_LAYER'}]
    };

    LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure.mockResolvedValue(vlanLtpMock);
    IndividualServiceUtility.forwardRequest.mockResolvedValue({});

    const result = await readVlanInterfaceData_private.fetchVlanInterfaceKind(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer,
      clientContainerLtp,
      clientAndFieldParams,
      interfaceList
    );

    expect(result).toEqual({ traceIndicatorIncrementer: traceIndicatorIncrementer + 1 });
  });

  it('should handle errors gracefully and return traceIndicator', async () => {
    LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure.mockRejectedValue(new Error('mock error'));

    const result = await readVlanInterfaceData_private.fetchVlanInterfaceKind(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer,
      clientContainerLtp,
      clientAndFieldParams,
      interfaceList
    );

    expect(result).toEqual({ traceIndicatorIncrementer });

    expect(IndividualServiceUtility.forwardRequest).not.toHaveBeenCalled();
  });
});

describe('fetchServingEthernetContainerStatus', () => {
  let mountName, requestHeaders, traceIndicatorIncrementer, clientContainerltp, clientAndFieldParams;

  beforeEach(() => {
      jest.clearAllMocks();
      mountName = '513250006';
      requestHeaders = { user: 'nms5ux', originator: 'AccessPlanningToolProxy', xCorrelator: 'cc56eEbb-FE94-dDec-BD67-2418F6ABe5a1', traceIndicator: '1', customerJourney: 'unknown' };
      traceIndicatorIncrementer = 9;
      clientContainerltp = {
          uuid: 'LTP-ETC-TTP-LAN-2-COMBO',
          'client-ltp': ['LTP-MAC-TTP-LAN-2-COMBO'],
          'server-ltp': ['LTP-MWS-LAN-2-COMBO'],
          'layer-protocol': [{ 'local-id': 'LP-ETC-TTP-LAN-2-COMBO', 'layer-protocol-name': 'ethernet-container-2-0:LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER' }]
      };
      clientAndFieldParams = { operationClientUuid: 'aptp-1-1-0-op-c-is-mwdi-1-1-2-222', operationName: '/core-model-1-4:network-control-domain=ca…t-container-pac/ethernet-container-status', fields: 'interface-status' };
  });

  it('should return servingEthernetContainerStatus with incremented traceIndicator', async () => {
      IndividualServiceUtility.forwardRequest.mockResolvedValue(
          { 'ethernet-container-2-0:ethernet-container-status': { 'interface-status': 'ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP' } 
      });

      const result = await readVlanInterfaceData_private.fetchServingEthernetContainerStatus(
          mountName,
          requestHeaders,
          traceIndicatorIncrementer,
          clientContainerltp,
          clientAndFieldParams
      );

      expect(result).toEqual({
          servingEthernetContainerStatus: 'ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP',
          traceIndicatorIncrementer: 10
      });

      expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledWith(
          clientAndFieldParams,
          ['513250006', 'LTP-ETC-TTP-LAN-2-COMBO', 'LP-ETC-TTP-LAN-2-COMBO'],
          requestHeaders,
          traceIndicatorIncrementer
      );
  });

  it('should return only traceIndicator if response is empty', async () => {
      IndividualServiceUtility.forwardRequest.mockResolvedValue({});

      const result = await readVlanInterfaceData_private.fetchServingEthernetContainerStatus(
          mountName,
          requestHeaders,
          traceIndicatorIncrementer,
          clientContainerltp,
          clientAndFieldParams
      );

      expect(result).toEqual({ traceIndicatorIncrementer: 10 });
  });

  it('should return only traceIndicator if ethernet-container-status is missing', async () => {
      IndividualServiceUtility.forwardRequest.mockResolvedValue({
          'ethernet-container-2-0:ethernet-container-status': {}
      });

      const result = await readVlanInterfaceData_private.fetchServingEthernetContainerStatus(
          mountName,
          requestHeaders,
          traceIndicatorIncrementer,
          clientContainerltp,
          clientAndFieldParams
      );

      expect(result).toEqual({ traceIndicatorIncrementer: 10 });
  });

  it('should handle errors gracefully and return only traceIndicator', async () => {
      IndividualServiceUtility.forwardRequest.mockRejectedValue(new Error('Network error'));

      const result = await readVlanInterfaceData_private.fetchServingEthernetContainerStatus(
          mountName,
          requestHeaders,
          traceIndicatorIncrementer,
          clientContainerltp,
          clientAndFieldParams
      );

      expect(result).toEqual({ traceIndicatorIncrementer: 10 });
  });
});
