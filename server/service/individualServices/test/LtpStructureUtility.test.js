'use strict';

const LtpStructureUtility = require('../LtpStructureUtility');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');

describe('LtpStructureUtility', () => {
  const mockLtpStructure = {
    "core-model-1-4:control-construct": [
      {
        [onfAttributes.CONTROL_CONSTRUCT.LOGICAL_TERMINATION_POINT]: [
          {
            [onfAttributes.GLOBAL_CLASS.UUID]: "uuid-1",
            [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
              { [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "protocolA" }
            ],
            [onfAttributes.LOGICAL_TERMINATION_POINT.CLIENT_LTP]: ["uuid-2"]
          },
          {
            [onfAttributes.GLOBAL_CLASS.UUID]: "uuid-2",
            [onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]: [
              { [onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME]: "protocolB" }
            ],
            [onfAttributes.LOGICAL_TERMINATION_POINT.CLIENT_LTP]: []
          }
        ]
      }
    ]
  };

  describe('getLtpsOfLayerProtocolNameFromLtpStructure', () => {
    test('should return LTPs that match the given layer protocol name', async () => {
      const result = await LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(
        "protocolA",
        mockLtpStructure
      );

      expect(result).toHaveLength(1);
      expect(result[0][onfAttributes.GLOBAL_CLASS.UUID]).toBe("uuid-1");
    });

    test('should return an empty list if no LTP matches the given layer protocol name', async () => {
      const result = await LtpStructureUtility.getLtpsOfLayerProtocolNameFromLtpStructure(
        "protocolC",
        mockLtpStructure
      );

      expect(result).toEqual([]);
    });
  });

  describe('getLtpForUuidFromLtpStructure', () => {
    test('should return the LTP that matches the given UUID', async () => {
      const result = await LtpStructureUtility.getLtpForUuidFromLtpStructure(
        "uuid-1",
        mockLtpStructure
      );

      expect(result).toBeDefined();
      expect(result[onfAttributes.GLOBAL_CLASS.UUID]).toBe("uuid-1");
    });

    test('should return an empty object if no LTP matches the given UUID', async () => {
      const result = await LtpStructureUtility.getLtpForUuidFromLtpStructure(
        "non-existent-uuid",
        mockLtpStructure
      );

      console.log('result is',result);
      expect(result).toBeUnDefined;
    });
  });

  describe('getHierarchicalClientLtpForInterfaceListFromLtpStructure', () => 
  {
    test('should return the expected client LTP for the given layer protocol list', async () => {
      const result = await LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure(
        mockLtpStructure["core-model-1-4:control-construct"][0][onfAttributes.CONTROL_CONSTRUCT.LOGICAL_TERMINATION_POINT][0],
        [["protocolB"]],
        mockLtpStructure
      );

      expect(result).toBeDefined();
      expect(result[onfAttributes.GLOBAL_CLASS.UUID]).toBe("uuid-2");
    });

    test('should return an empty object if no matching client LTP is found', async () => {
      const result = await LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure(
        mockLtpStructure["core-model-1-4:control-construct"][0][onfAttributes.CONTROL_CONSTRUCT.LOGICAL_TERMINATION_POINT][0],
        [["protocolC"]],
        mockLtpStructure
      );

      expect(result).toEqual({});
    });

    test('should return an empty object if the initial LTP instance is undefined', async () => {
      const result = await LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure(
        undefined,
        [["protocolB"]],
        mockLtpStructure
      );

      expect(result).toEqual({});
    });

    test('should handle exceptions gracefully and return an empty object', async () => {
      jest.spyOn(LtpStructureUtility, 'getLtpForUuidFromLtpStructure').mockImplementationOnce(() => {
        throw new Error('Mock error');
      });

      const result = await LtpStructureUtility.getHierarchicalClientLtpForInterfaceListFromLtpStructure(
        mockLtpStructure["core-model-1-4:control-construct"][0][onfAttributes.CONTROL_CONSTRUCT.LOGICAL_TERMINATION_POINT][0],
        [["protocolB"]],
        mockLtpStructure
      );

      expect(result).toEqual({});
    });
  });
});
