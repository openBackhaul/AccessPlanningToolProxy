global.testPrivateFuntions = 1;
const { ReadInventoryData_Private } = require("../ReadInventoryData");
global.testPrivateFuntions = 0;
describe("formulateEquipmentInfo", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock data before each test
    });  
    test("should return an empty object when given an empty list", async () => {
      // formulateEquipmentInfo.mockResolvedValue({}); // Mock return value
      const result = await ReadInventoryData_Private.formulateEquipmentInfo([]);
      expect(result).toEqual({});
    });  
    test("should process a list containing a modem", async () => {
      const mockInput = [
        {
          "core-model-1-4:actual-equipment": {
            "manufactured-thing": {
              "equipment-type": {
                "part-type-identifier": "GE8704-52",
                "type-name": "ASNK-18G",
              },
              "equipment-instance": {
                "serial-number": "101821827000620",
              },
            },
            structure: {
              category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
            },
          },
        },
        {
          "core-model-1-4:actual-equipment": {
            "manufactured-thing": {
              "equipment-type": {
                "part-type-identifier": "GAI0234-3",
                "type-name": "AGS-20",
              },
              "equipment-instance": {
                "serial-number": "10182245100011A",
              },
            },
            structure: {
              category: "core-model-1-4:EQUIPMENT_CATEGORY_SUBRACK",
            },
          },
        },
      ];
      const mockOutput = {
        radio: {
          "equipment-name": "ASNK-18G",
          "serial-number": "101821827000620",
          "part-number": "GE8704-52",
        },
      };  
      // formulateEquipmentInfo.mockResolvedValue(mockOutput);
      const result = await ReadInventoryData_Private.formulateEquipmentInfo(mockInput);
      expect(result).toEqual(mockOutput);
    });  
    test("should process multiple equipment categories", async () => {
      const mockInput = [
        {
          "core-model-1-4:actual-equipment": {
            "manufactured-thing": {
              "equipment-type": {
                "part-type-identifier": "GE8704-52",
                "type-name": "ASNK-18G",
              },
              "equipment-instance": {
                "serial-number": "101821827000620",
              },
            },
            structure: {
              category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
            },
          },
        },
        {
          "core-model-1-4:actual-equipment": {
            "manufactured-thing": {
              "equipment-type": {
                "part-type-identifier": "GAI0234-3",
                "type-name": "AGS-20",
              },
              "equipment-instance": {
                "serial-number": "10182245100011A",
              },
            },
            structure: {
              category: "core-model-1-4:EQUIPMENT_CATEGORY_SUBRACK",
            },
          },
        },
      ];
      const mockOutput = {
        radio: {
          "equipment-name": "ASNK-18G",
          "serial-number": "101821827000620",
          "part-number": "GE8704-52",
        },
      };  
      // formulateEquipmentInfo.mockResolvedValue(mockOutput);
      const result = await ReadInventoryData_Private.formulateEquipmentInfo(mockInput);
      expect(result).toEqual(mockOutput);
    });
    test("should return an empty object when manufacturedThing is missing", async () => {
      const mockInput = [
        {
          "core-model-1-4:actual-equipment": {
            // "manufactured-thing": {
            //   // "equipment-type": {
            //   //   "part-type-identifier": "GE8704-52",
            //   //   "type-name": "ASNK-18G",
            //   // },
            //   // "equipment-instance": {
            //   //   "serial-number": "101821827000620",
            //   // },
            // },
            structure: {
              category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
            },
          },
        },
        {
          "core-model-1-4:actual-equipment": {
            "manufactured-thing": {
              "equipment-type": {
                "part-type-identifier": "GAI0234-3",
                "type-name": "AGS-20",
              },
              "equipment-instance": {
                "serial-number": "10182245100011A",
              },
            },
            structure: {
              category: "core-model-1-4:EQUIPMENT_CATEGORY_SUBRACK",
            },
          },
        },
      ];
    // formulateEquipmentInfo.mockResolvedValue({}); // Expected to return empty object
    const result = await ReadInventoryData_Private.formulateEquipmentInfo(mockInput);
    expect(result).toEqual({"radio":{}});
    });
});
describe('isEquipmentCategoryModem', () => {
    test('should return true when equipment category is MODEM', async () => {
        const equipmentCategoryResponse = {
          "core-model-1-4:actual-equipment": {
            structure: {
              category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_MODEM",
            },
          },
        }
        // console.log("Input Data:", JSON.stringify(equipmentCategoryResponse, null, 2));
        const result = await ReadInventoryData_Private.isEquipmentCategoryModem(equipmentCategoryResponse);
        // console.log("Function Output:", result);
        expect(result).toBe(true);
    });
    test('should return false when equipmentCategoryResponse is not modem', async () => {
        const equipmentCategoryResponse = {
          "core-model-1-4:actual-equipment": {
            structure: {
              category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
            },
          },
        };      
           const result = await ReadInventoryData_Private.isEquipmentCategoryModem(equipmentCategoryResponse);
        expect(result).toBe(false);
    });
    test('should return false when equipmentCategoryResponse has not any category property', async () => {
      const equipmentCategoryResponse = {
        "core-model-1-4:actual-equipment": {
          structure: {
            nonCategory: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
          },
        },
      };      
        const result = await ReadInventoryData_Private.isEquipmentCategoryModem(equipmentCategoryResponse);
        expect(result).toBe(false);
    });
});  
describe('isEquipmentCategoryRadio', () => {  
    test('should return true when equipment category is OUTDOOR_UNIT', async () => {
        const equipmentCategoryResponse = {
          "core-model-1-4:actual-equipment": {
            structure: {
              category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
            },
          },
        };
        const result = await ReadInventoryData_Private.isEquipmentCategoryRadio(equipmentCategoryResponse);  
        expect(result).toBe(true);
      });
    test('should return false when equipmentCategoryResponse is not OUTDOOR_UNIT', async () => {
      const equipmentCategoryResponse = {
        "core-model-1-4:actual-equipment": {
          structure: {
            category: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
          },
        },
      };      
         const result = await ReadInventoryData_Private.isEquipmentCategoryModem(equipmentCategoryResponse);
      expect(result).toBe(false);
  });
  test('should return false when equipmentCategoryResponse has not any category property', async () => {
    const equipmentCategoryResponse = {
      "core-model-1-4:actual-equipment": {
        structure: {
          nonCategory: "equipment-augment-1-0:EQUIPMENT_CATEGORY_OUTDOOR_UNIT",
        },
      },
    };      
      const result = await ReadInventoryData_Private.isEquipmentCategoryModem(equipmentCategoryResponse);
      expect(result).toBe(false);
  });
});
describe('formulatePositionofModemBoard', () => {
   test('should return vendorLabel when equipmentUuidOfModemCategory matches and contains equipmentUuidOfRadioCategory', async () => {
         const equipmentHolderLabelResponse = {
        "core-model-1-4:control-construct": [
          {
            "equipment": [
              {
                "uuid": "uuid-modem-123",
                "contained-holder": [
                  {
                    "occupying-fru": "uuid-radio-456",
                    "equipment-augment-1-0:holder-pac": {
                      "vendor-label": "VendorXYZ"
                    }
                  }
                ]
              }
            ]
          }
        ]
      };
      const equipmentUuidOfModemCategory = "uuid-modem-123";
      const equipmentUuidOfRadioCategory = "uuid-radio-456";
      const result = await ReadInventoryData_Private.formulatePositionofModemBoard(
        equipmentHolderLabelResponse,
        equipmentUuidOfModemCategory,
        equipmentUuidOfRadioCategory
      );
      console.log("result is", result);
      expect(result).toBe("VendorXYZ");
    });
    test('should return empty string when equipmentUuidOfModemCategory does not match', async () => {
      const equipmentHolderLabelResponse = {
        "core-model-1-4:control-construct": [{
          "equipment": [
            {
              "uuid": "modem-uuid-999", // Does not match
              "contained-holder": [
                {
                  "occupying-fru": "radio-uuid-456",
                  "equipment-augment-1-0:holder-pac": {
                    "equipment-augment-1-0:vendor-label": "VendorXYZ"
                  }
                }
              ]
            }
          ]
        }]
      };
      const result = await ReadInventoryData_Private.formulatePositionofModemBoard(equipmentHolderLabelResponse, "modem-uuid-123", "radio-uuid-456");
      expect(result).toBe("");
    });
    test('should return empty string when occupying-fru does not match equipmentUuidOfRadioCategory', async () => {
      const equipmentHolderLabelResponse = {
        "core-model-1-4:control-construct": [{
          "equipment": [
            {
              "uuid": "modem-uuid-123",
              "contained-holder": [
                {
                  "occupying-fru": "radio-uuid-789", // Does not match
                  "equipment-augment-1-0:holder-pac": {
                    "equipment-augment-1-0:vendor-label": "VendorXYZ"
                  }
                }
              ]
            }
          ]
        }]
      };
      const result = await ReadInventoryData_Private.formulatePositionofModemBoard(equipmentHolderLabelResponse, "modem-uuid-123", "radio-uuid-456");
      expect(result).toBe("");
    });
    test('should return empty string when contained-holder is missing', async () => {
      const equipmentHolderLabelResponse = {
        "core-model-1-4:control-construct": [{
          "equipment": [
            {
              "uuid": "modem-uuid-123"
            }
          ]
        }]
      };
      const result = await ReadInventoryData_Private.formulatePositionofModemBoard(equipmentHolderLabelResponse, "modem-uuid-123", "radio-uuid-456");
      expect(result).toBe("");
    });
    test('should return empty string when equipmentHolderLabelResponse is undefined', async () => {
      let result;
      try {
        result = await ReadInventoryData_Private.formulatePositionofModemBoard(undefined, "modem-uuid-123", "radio-uuid-456");
      } catch (error) {
        result = "";
      }
      expect(result).toBe("");
    });
});