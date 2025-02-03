const rewire = require('rewire');
const readLiveEquipmentDataRewire = rewire('../readLiveEquipmentData');
const readLiveEquipmentData = require('../ReadLiveEquipmentData');
const ltpStructureUtility = require('../LtpStructureUtility');
const IndividualServiceUtility = require('../IndividualServiceUtility');

jest.mock('../LtpStructureUtility', () => ({
  getLtpsOfLayerProtocolNameFromLtpStructure: jest.fn(),
}));

jest.mock('../IndividualServiceUtility', () => ({
  getConsequentOperationClientAndFieldParams: jest.fn(),
  forwardRequest: jest.fn(),
}));

describe('ReadLiveEquipmentData', () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('readLiveEquipmentData', () => {
    let mockRequestForProvidingEquipmentInfo;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      // Save original function
      mockRequestForProvidingEquipmentInfo =
        readLiveEquipmentData.RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache;
  
      // Mock RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache
      readLiveEquipmentData.RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache = jest
        .fn()
        .mockResolvedValue({
          radio: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
          modem: { 'equipment-name': 'ModemType', 'serial-number': 'SN12345', 'part-number': 'PN54321' },
          device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        });
    });
  
    afterEach(() => {
      // Restore the original function
      readLiveEquipmentData.RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache =
        mockRequestForProvidingEquipmentInfo;
    });
  
    it('should process the response correctly when all functions return valid data', async () => {
      const mountName = 'Device1';
      const linkId = 'Link123';
      const ltpStructure = {};
      const requestHeaders = {};
      const traceIndicatorIncrementer = 1;
  
      // Rewire the private function
      const mockRequestForProvidingEquipment = jest.fn().mockResolvedValue({
        uuidUnderTest: 'uuid1',
        pathParams: ['Device1', 'uuid1', 'localId1'],
        externalLabel: 'Link123-suffix',
        traceIndicatorIncrementer: traceIndicatorIncrementer + 1,
      });
  
      readLiveEquipmentDataRewire.__set__(
        'RequestForProvidingEquipmentForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest',
        mockRequestForProvidingEquipment
      );
  
      // Mock RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache
      const mockRequestForProvidingEquipmentInfo = jest.fn().mockResolvedValue({
        radio: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        modem: { 'equipment-name': 'ModemType', 'serial-number': 'SN12345', 'part-number': 'PN54321' },
        device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
      });
  
      readLiveEquipmentDataRewire.__set__(
        'exports.RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache',
        mockRequestForProvidingEquipmentInfo
      );
  
      const result = await readLiveEquipmentDataRewire.readLiveEquipmentData(
        mountName,
        linkId,
        ltpStructure,
        requestHeaders,
        traceIndicatorIncrementer
      );
  
      // Assertions for the rewire mock
      expect(mockRequestForProvidingEquipment).toHaveBeenCalledWith(
        ltpStructure,
        mountName,
        linkId,
        requestHeaders,
        traceIndicatorIncrementer
      );
  
      expect(mockRequestForProvidingEquipmentInfo).toHaveBeenCalledWith(
        ['Device1', 'uuid1', 'localId1'],
        requestHeaders,
        traceIndicatorIncrementer + 1
      );
  
      // Assertions for the result
      expect(result).toEqual({
        radio: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        modem: { 'equipment-name': 'ModemType', 'serial-number': 'SN12345', 'part-number': 'PN54321' },
        device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
      });
    });
  
    it('should return undefined when RequestForProvidingEquipmentForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest fails', async () => {
      const mountName = 'Device1';
      const linkId = 'Link123';
      const ltpStructure = {};
      const requestHeaders = {};
      const traceIndicatorIncrementer = 1;
  
      ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValue(
        new Error('Error in ltpStructureUtility')
      );
  
      const result = await readLiveEquipmentData.readLiveEquipmentData(
        mountName,
        linkId,
        ltpStructure,
        requestHeaders,
        traceIndicatorIncrementer
      );
  
      // Assertions
      expect(result).toBeUndefined();
      expect(ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure).toHaveBeenCalled();
    });
  
    it('should return undefined when no UUID is determined', async () => {
      const mountName = 'Device1';
      const linkId = 'Link123';
      const ltpStructure = {};
      const requestHeaders = {};
      const traceIndicatorIncrementer = 1;
  
      ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([]);
  
      const result = await readLiveEquipmentData.readLiveEquipmentData(
        mountName,
        linkId,
        ltpStructure,
        requestHeaders,
        traceIndicatorIncrementer
      );
  
      // Assertions
      expect(result).toBeUndefined();
      expect(ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure).toHaveBeenCalled();
    });
  });
  
  describe('RequestForProvidingEquipmentForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest', () => {
    let originalRequestForProvidingEquipmentInfo;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      // Save the original function
      originalRequestForProvidingEquipmentInfo =
        readLiveEquipmentData.RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache;
  
      // Mock `RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache`
      readLiveEquipmentData.RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache = jest
        .fn()
        .mockResolvedValue({
          radio: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
          modem: { 'equipment-name': 'ModemType', 'serial-number': 'SN12345', 'part-number': 'PN54321' },
          device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        });
    });
  
    afterEach(() => {
      // Restore the original function
      readLiveEquipmentData.RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache =
        originalRequestForProvidingEquipmentInfo;
    });
  
    it('should call RequestForProvidingEquipmentForLivenetviewCausesDeterminingAirInterfaceUuidUnderTest and process the response correctly', async () => {
      const mountName = 'Device1';
      const linkId = 'Link123';
      const ltpStructure = {
        logicalTerminationPoints: [
          {
            uuid: 'uuid1',
            'layer-protocol': [{ 'local-id': 'localId1' }],
          },
        ],
      };
      const requestHeaders = {};
      const traceIndicatorIncrementer = 1;
  
      // Mock `getLtpsOfLayerProtocolNameFromLtpStructure` to return valid data
      ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([
        {
          'core-model-1-4:uuid': 'uuid1',
          'layer-protocol': [{ 'local-id': 'localId1' }],
        },
      ]);
  
      // Mock `getConsequentOperationClientAndFieldParams` to return dummy parameters
      IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
  
      // Mock `forwardRequest` to simulate external label fetching
      IndividualServiceUtility.forwardRequest
        .mockResolvedValueOnce({
          'ltp-augment-1-0:ltp-augment-pac': { 'external-label': 'Link123' },
        });
  
      // Call the function under test
      const result = await readLiveEquipmentData.readLiveEquipmentData(
        mountName,
        linkId,
        ltpStructure,
        requestHeaders,
        traceIndicatorIncrementer
      );
  
      // Assertions for mocked calls
      expect(ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure).toHaveBeenCalledWith(
        'air-interface-2-0:LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER',
        ltpStructure
      );
      expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(1);
      // Assertions for result
      expect(result).toEqual({
        radio: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        modem: { 'equipment-name': 'ModemType', 'serial-number': 'SN12345', 'part-number': 'PN54321' },
        device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
      });
    });
  
    // it('should return undefined when no UUID is determined', async () => {
    //   const mountName = 'Device1';
    //   const linkId = 'Link123';
    //   const ltpStructure = {};
    //   const requestHeaders = {};
    //   const traceIndicatorIncrementer = 1;
  
    //   // Mock `getLtpsOfLayerProtocolNameFromLtpStructure` to return an empty array
    //   ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockResolvedValue([]);
  
    //   // Call the function
    //   const result = await readLiveEquipmentData.readLiveEquipmentData(
    //     mountName,
    //     linkId,
    //     ltpStructure,
    //     requestHeaders,
    //     traceIndicatorIncrementer
    //   );
  
    //   // Assertions
    //   expect(result).toBeUndefined();
    //   expect(ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure).toHaveBeenCalled();
    // });
  
    // it('should return undefined when internal calls fail', async () => {
    //   const mountName = 'Device1';
    //   const linkId = 'Link123';
    //   const ltpStructure = {};
    //   const requestHeaders = {};
    //   const traceIndicatorIncrementer = 1;
  
    //   // Mock `getLtpsOfLayerProtocolNameFromLtpStructure` to throw an error
    //   ltpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure.mockRejectedValue(
    //     new Error('Mocked error')
    //   );
  
    //   // Call the function
    //   const result = await readLiveEquipmentData.readLiveEquipmentData(
    //     mountName,
    //     linkId,
    //     ltpStructure,
    //     requestHeaders,
    //     traceIndicatorIncrementer
    //   );
  
    //   // Assertions
    //   expect(result).toBeUndefined();
    // });
  });

  describe('RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should process equipment UUIDs and add them to the structure correctly', async () => {
      const pathParams = ['Device1', 'uuid1', 'localId1'];
      const requestHeaders = {};
      const traceIndicatorIncrementer = 1;
  
      // Mock `getConsequentOperationClientAndFieldParams`
      IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
  
      // Mock `forwardRequest` for equipment UUID list
      IndividualServiceUtility.forwardRequest
        .mockResolvedValueOnce({
          'ltp-augment-1-0:ltp-augment-pac': {
            equipment: ['Equipment1', 'Equipment2'],
          },
        })
        .mockResolvedValueOnce({
          'core-model-1-4:actual-equipment': {
            structure: { category: 'equipment-augment-1-0:EQUIPMENT_CATEGORY_MODEM' },
            'manufactured-thing': {
              'equipment-type': { 'type-name': 'Modem1', 'part-type-identifier': 'M123' },
              'equipment-instance': { 'serial-number': 'S123' },
            },
          },
        })
        .mockResolvedValueOnce({
          'core-model-1-4:actual-equipment': {
            structure: { category: 'equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT' },
            'manufactured-thing': {
              'equipment-type': { 'type-name': 'Radio1', 'part-type-identifier': 'R123' },
              'equipment-instance': { 'serial-number': 'RS123' },
            },
          },
        });
  
      const result = await readLiveEquipmentData.RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache(
        pathParams,
        requestHeaders,
        traceIndicatorIncrementer
      );
  
      // Assertions for mocked calls
      expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledTimes(3);
  
      // Assertions for the final structure
      expect(result).toEqual({
        radio: { 'equipment-name': 'Radio1', 'serial-number': 'RS123', 'part-number': 'R123' },
        modem: { 'equipment-name': 'Modem1', 'serial-number': 'S123', 'part-number': 'M123' },
        device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
      });
    });
  
    it('should return an empty structure when no equipment UUIDs are found', async () => {
      const pathParams = ['Device1', 'uuid1', 'localId1'];
      const requestHeaders = {};
      const traceIndicatorIncrementer = 1;
  
      IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
      IndividualServiceUtility.forwardRequest.mockResolvedValueOnce({
        'ltp-augment-1-0:ltp-augment-pac': { equipment: [] },
      });
  
      const result = await readLiveEquipmentData.RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache(
        pathParams,
        requestHeaders,
        traceIndicatorIncrementer
      );
  
      expect(result).toEqual({
        radio: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        modem: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
      });
    });
  
    it('should handle errors and return an empty structure', async () => {
      const pathParams = ['Device1', 'uuid1', 'localId1'];
      const requestHeaders = {};
      const traceIndicatorIncrementer = 1;
  
      IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValue(new Error('Mocked error'));
  
      const result = await readLiveEquipmentData.RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache(
        pathParams,
        requestHeaders,
        traceIndicatorIncrementer
      );
  
      expect(result).toEqual({
        radio: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        modem: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
      });
    });
  
    it('should skip processing if the response from forwardRequest is empty', async () => {
      const pathParams = ['Device1', 'uuid1', 'localId1'];
      const requestHeaders = {};
      const traceIndicatorIncrementer = 1;
  
      IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
      IndividualServiceUtility.forwardRequest.mockResolvedValueOnce({});
  
      const result = await readLiveEquipmentData.RequestForProvidingEquipmentInfoForLivenetviewCausesReadingEquipmentInfoFromCache(
        pathParams,
        requestHeaders,
        traceIndicatorIncrementer
      );
  
      expect(result).toEqual({
        radio: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        modem: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
      });
    });
  });
  
  describe('addToStructure', () => {
    let addToStructure;
  
    beforeEach(() => {
      // Access the private function
      addToStructure = readLiveEquipmentDataRewire.__get__('addToStructure');
    });
  
    it('should add data to the modem structure if category is EQUIPMENT_CATEGORY_MODEM', () => {
      const mockData = {
        structure: { category: 'equipment-augment-1-0:EQUIPMENT_CATEGORY_MODEM' },
        'manufactured-thing': {
          'equipment-type': { 'type-name': 'Modem1', 'part-type-identifier': 'M123' },
          'equipment-instance': { 'serial-number': 'S123' },
        },
      };
      const structure = {
        modem: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        radio: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
      };
  
      addToStructure(mockData, structure);
  
      expect(structure.modem).toEqual({
        'equipment-name': 'Modem1',
        'serial-number': 'S123',
        'part-number': 'M123',
      });
    });
  
    it('should add data to the radio structure if category is EQUIPMENT_CATEGORY_OUTDOOR_UNIT', () => {
      const mockData = {
        structure: { category: 'equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT' },
        'manufactured-thing': {
          'equipment-type': { 'type-name': 'Radio1', 'part-type-identifier': 'R123' },
          'equipment-instance': { 'serial-number': 'RS123' },
        },
      };
      const structure = {
        modem: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        radio: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
      };
  
      addToStructure(mockData, structure);
  
      expect(structure.radio).toEqual({
        'equipment-name': 'Radio1',
        'serial-number': 'RS123',
        'part-number': 'R123',
      });
    });
  
    it('should add data to the device structure if category is EQUIPMENT_CATEGORY_FULL_OUTDOOR_UNIT', () => {
      const mockData = {
        structure: { category: 'equipment-augment-1-0:EQUIPMENT_CATEGORY_FULL_OUTDOOR_UNIT' },
        'manufactured-thing': {
          'equipment-type': { 'type-name': 'Device1', 'part-type-identifier': 'D123' },
          'equipment-instance': { 'serial-number': 'DS123' },
        },
      };
      const structure = {
        modem: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        radio: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
      };
  
      addToStructure(mockData, structure);
  
      expect(structure.device).toEqual({
        'equipment-name': 'Device1',
        'serial-number': 'DS123',
        'part-number': 'D123',
      });
    });
  
    it('should not modify the structure if category is not recognized', () => {
      const mockData = {
        structure: { category: 'unknown-category' },
        'manufactured-thing': {
          'equipment-type': { 'type-name': 'Unknown', 'part-type-identifier': 'U123' },
          'equipment-instance': { 'serial-number': 'US123' },
        },
      };
      const structure = {
        modem: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        radio: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
      };
  
      addToStructure(mockData, structure);
  
      expect(structure).toEqual({
        modem: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        radio: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
        device: { 'equipment-name': '', 'serial-number': '', 'part-number': '' },
      });
    });
  });
})

