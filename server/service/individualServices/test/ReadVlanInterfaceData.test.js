global.testPrivateFuntions=1;
const { readVlanInterfaceData_private } = require('../ReadVlanInterfaceData');
const IndividualServiceUtility = require('../IndividualServiceUtility');
const LtpStructureUtility = require('../LtpStructureUtility');
const a = require('../ReadVlanInterfaceData');
global.testPrivateFuntions=0;

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
    mountName = 'Device1';
    ltpStructure = {};
    requestHeaders = { user: 'test-user', xCorrelator: '1234' };
    traceIndicatorIncrementer = 1;
  });

  it('should return configured LAN port role list with valid data', async () => {
    // Mock wire interface list
    LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([
      { 'uuid': 'wire-interface-uuid' },
    ]);
    
    // Mock hierarchical client LTP for Ethernet container
    LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure.mockResolvedValue({
      'uuid': 'client-container-ltp',
      'layer-protocol': [{ 'onf-core-model-ap:local-id': 'mockLocalId' }]
    });

    // Mock IndividualServiceUtility for OriginalLtpName, VlanInterfaceKind, and EthernetContainerStatus
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});

    IndividualServiceUtility.forwardRequest
      .mockResolvedValueOnce({ 'ltp-augment-1-0:ltp-augment-pac': { 'original-ltp-name': 'client-container-ltp' } }) // OriginalLtpName
      .mockResolvedValueOnce({ 'vlan-interface-1-0:vlan-interface-configuration': { 'interface-kind': 'ACCESS' } })  // VlanInterfaceKind
      .mockResolvedValueOnce({ 'ethernet-container-2-0:ethernet-container-status': { 'interface-status': 'UP' } });   // EthernetContainerStatus

    const result = await readVlanInterfaceData_private.RequestForProvidingAcceptanceDataCausesDeterminingTheLanPortRole(
      mountName,
      ltpStructure,
      requestHeaders,
      traceIndicatorIncrementer
    );

    expect(result).toEqual({
      configuredLanPortRoleList: [
        {
          interfaceName: 'client-container-ltp',
          vlanInterfaceKind: 'ACCESS',
          servingEthernetContainerStatus: 'UP',
        },
      ],
      traceIndicatorIncrementer: traceIndicatorIncrementer + 3, // Increments per forwardRequest call
    });

    expect(LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure).toHaveBeenCalled();
    expect(LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure).toHaveBeenCalled();
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


