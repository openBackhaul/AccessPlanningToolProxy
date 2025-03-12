'use strict';

const IndividualServiceUtility = require('../IndividualServiceUtility');
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const onfPaths = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfPaths');

const ProfileCollection = require("onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection");
const ForwardingDomain = require("onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain");
const ForwardingConstruct = require("onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct");
const OperationClientInterface = require("onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface");
const eventDispatcher = require("../EventDispatcherWithResponse");
const onfAttributes = require("onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes");

const fileSystem = require('fs');
const AsyncLock = require('async-lock');
const lock = new AsyncLock();

jest.mock('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver'); // Mock the fileOperation module
//jest.mock('async-lock');
jest.mock('fs'); // Mock the fs module

jest.mock("onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection");
jest.mock("onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain");
jest.mock("onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct");
jest.mock("onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface");
jest.mock("../EventDispatcherWithResponse");

describe('resetCompleteFile', () => {
  let coreModelJsonObject;
  //let mockLockInstance;

  beforeEach(() => {
    // Initialize test data
    coreModelJsonObject = { key: 'value' };

    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock the lock instance
//     mockLockInstance = { acquire: jest.fn() };
//     lock.mockImplementationOnce(() => mockLockInstance);
  });

  it('should delete the existing file data and write the new data', async () => {
    // Arrange: Mock the behavior of delete and file write
    fileOperation.deletefromDatabaseAsync.mockResolvedValue(true); // Mock successful delete
//    mockLockInstance.acquire.mockImplementationOnce(async (path, callback) => callback()); // Mock successful lock and callback execution
    fileSystem.writeFileSync.mockReturnValue(undefined); // Mock successful file write (no return value)

    // Act: Call the method
    const result = await IndividualServiceUtility.resetCompleteFile(coreModelJsonObject);

    // Assert: Check if the expected result was returned
    expect(result).toBe(true);
    expect(fileOperation.deletefromDatabaseAsync).toHaveBeenCalledWith(onfPaths.CONTROL_CONSTRUCT);
    //expect(mockLockInstance.acquire).toHaveBeenCalledWith(global.databasePath, expect.any(Function)); // Ensure lock is acquired
    expect(fileSystem.writeFileSync).toHaveBeenCalledWith(global.databasePath, JSON.stringify(coreModelJsonObject));
  });

  it('should return false if file write fails', async () => {
    // Arrange: Mock the behavior of delete and file write failure
    fileOperation.deletefromDatabaseAsync.mockResolvedValue(true); // Mock successful delete
    //mockLockInstance.acquire.mockImplementationOnce(async (path, callback) => callback()); // Mock successful lock and callback execution
    fileSystem.writeFileSync.mockImplementationOnce(() => { throw new Error('Write failed'); }); // Mock write failure

    // Act: Call the method
    const result = await IndividualServiceUtility.resetCompleteFile(coreModelJsonObject);

    // Assert: Check if the expected result was returned
    expect(result).toBe(false);
    expect(fileOperation.deletefromDatabaseAsync).toHaveBeenCalledWith(onfPaths.CONTROL_CONSTRUCT);
    //expect(mockLockInstance.acquire).toHaveBeenCalledWith(global.databasePath, expect.any(Function)); // Ensure lock is acquired
    expect(fileSystem.writeFileSync).toHaveBeenCalledWith(global.databasePath, JSON.stringify(coreModelJsonObject));
  });

  it('should return false if delete operation fails', async () => {
    // Arrange: Mock the behavior of failed delete
    fileOperation.deletefromDatabaseAsync.mockResolvedValue(false); // Mock failed delete
    //mockLockInstance.acquire.mockImplementationOnce(async (path, callback) => callback()); // Mock lock behavior
    fileSystem.writeFileSync.mockReturnValue(undefined); // Mock successful file write (shouldn't be called)

    // Act: Call the method
    const result = await IndividualServiceUtility.resetCompleteFile(coreModelJsonObject);

    // Assert: Check if the expected result was returned
    expect(result).toBe(false);
    expect(fileOperation.deletefromDatabaseAsync).toHaveBeenCalledWith(onfPaths.CONTROL_CONSTRUCT);
    //expect(mockLockInstance.acquire).not.toHaveBeenCalled(); // Lock should not be acquired if delete fails
    expect(fileSystem.writeFileSync).not.toHaveBeenCalled(); // Write should not be attempted if delete fails
  });
});


describe("getStringProfileInstanceValue", () => {
  it("should return the correct string value when found", async () => {
    ProfileCollection.getProfileListForProfileNameAsync.mockResolvedValue([
      {
        [onfAttributes.STRING_PROFILE.PAC]: {
          [onfAttributes.STRING_PROFILE.CAPABILITY]: {
            [onfAttributes.STRING_PROFILE.STRING_NAME]: "TestName"
          },
          [onfAttributes.STRING_PROFILE.CONFIGURATION]: {
            [onfAttributes.STRING_PROFILE.STRING_VALUE]: "TestValue"
          }
        }
      }
    ]);
 
    const result = await IndividualServiceUtility.getStringProfileInstanceValue("TestName");
    expect(result).toBe("TestValue");
  });
 
  it("should return an empty string if profile is not found", async () => {
    ProfileCollection.getProfileListForProfileNameAsync.mockResolvedValue([]);
    const result = await IndividualServiceUtility.getStringProfileInstanceValue("NonExistentName");
    expect(result).toBe("");
  });
 
  it("should handle and log 'Database Error' gracefully", async () => {
    const errorMessage = "Database Error";
    const spyConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
    ProfileCollection.getProfileListForProfileNameAsync.mockRejectedValue(new Error(errorMessage));
 
    const result = await IndividualServiceUtility.getStringProfileInstanceValue("TestName");  
 
    expect(result).toBeInstanceOf(Error); // Ensure the returned value is an Error instance
    expect(result.message).toContain(errorMessage); // Ensure the error message matches
    expect(spyConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining(`getStringProfileInstanceValue is not success with Error: ${errorMessage}`)
    );
 
    // Cleanup
    spyConsoleLog.mockRestore();
  });
 
});
 
describe("getQueryAndPathParameter", () => {
  it("should correctly formulate query and path parameters", async () => {
    const result = await IndividualServiceUtility.getQueryAndPathParameter("/test/{id}", ["123"], "field=value");
    expect(result.path.get("{id}")) .toBe("123");
    expect(result.query.fields).toBe("field=value");
  });
 
  it("should return only path parameters when fields are empty", async () => {
    const result = await IndividualServiceUtility.getQueryAndPathParameter("/test/{id}", ["456"], "");
    expect(result.path.get("{id}")) .toBe("456");
    expect(result.query).toBeUndefined();
  });
 
  it("should return empty params when no inputs are provided", async () => {
    const result = await IndividualServiceUtility.getQueryAndPathParameter("/test", [], "");
    expect(result).toEqual({});
  });
});
 
describe("getConsequentOperationClientAndFieldParams", () => {
  it("should return operation details correctly", async () => {
    ForwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockResolvedValue({ [onfAttributes.GLOBAL_CLASS.UUID]: "fc-uuid" });
    ForwardingConstruct.getOutputFcPortsAsync.mockResolvedValue([{ [onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT]: "ltp-uuid" }]);
    OperationClientInterface.getOperationNameAsync.mockResolvedValue("operation-name");
    IndividualServiceUtility.getStringProfileInstanceValue = jest.fn().mockResolvedValue("field-value");
 
    const result = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams("testFC", "testString");
    expect(result.operationClientUuid).toBe("ltp-uuid");
    expect(result.operationName).toBe("operation-name");
    expect(result.fields).toBe("field-value");
  });
 
  it("should handle errors gracefully", async () => {      
    const errorMessage = "FC Error";
    const spyConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
    ForwardingDomain.getForwardingConstructForTheForwardingNameAsync.mockRejectedValue(new Error(errorMessage));
 
    const result = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams("testFC", "testString");
 
    expect(result).toBeInstanceOf(Error); // Ensure the result is an Error instance
    expect(result.message).toContain(errorMessage); // Check the error message
    expect(spyConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining(`getConsequentOperationClientAndFieldParams is not success with Error: ${errorMessage}`)
    );
 
    // Cleanup
    spyConsoleLog.mockRestore();
  });
});
 
describe("forwardRequest", () => {
  it("should forward the request and return response data", async () => {
    eventDispatcher.dispatchEvent.mockResolvedValue({ success: true });
    const requestHeaders = { user: "user1", xCorrelator: "xc1", traceIndicator: "1", customerJourney: "journey1" };
    const operationParams = { operationName: "operation", fields: "", operationClientUuid: "uuid" };
    const result = await IndividualServiceUtility.forwardRequest(operationParams, [], requestHeaders, 1);
    expect(result).toEqual({ success: true });
  });
 
it("should handle errors gracefully", async () => {
  const errorMessage = "Dispatch Error";
  const spyConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
  eventDispatcher.dispatchEvent.mockRejectedValue(new Error(errorMessage));
 
  const result = await IndividualServiceUtility.forwardRequest({}, [], {}, 1);
 
  expect(result).toBeInstanceOf(Error); // Ensure the result is an Error instance
  expect(result.message).toContain(errorMessage); // Check the error message
  expect(spyConsoleLog).toHaveBeenCalledWith(
    expect.stringContaining(`forwardRequest is not success with Error: ${errorMessage}`)
  );
  spyConsoleLog.mockRestore();
});
});
 
describe("extractProfileConfiguration", () => {
    it("should return the correct integer value when profile is found", async () => {
      ProfileCollection.getProfileAsync.mockResolvedValue({
        uuid: "profile-uuid",
        "some-other-key": {}, // Mock other properties to simulate real data structure
        "expected-key": { "integer-profile-configuration": { "integer-value": 42 } },
      });
 
      const result = await IndividualServiceUtility.extractProfileConfiguration("profile-uuid");
      expect(result).toBe(42);
    });
 
    it("should handle missing integer value gracefully", async () => {
      ProfileCollection.getProfileAsync.mockResolvedValue({
        uuid: "profile-uuid",
        "some-other-key": {},
        "expected-key": { "integer-profile-configuration": {} },
      });
 
      const result = await IndividualServiceUtility.extractProfileConfiguration("profile-uuid");
      expect(result).toBeUndefined();
    });
 
    it("should handle errors gracefully", async () => {
      ProfileCollection.getProfileAsync.mockRejectedValue(new Error("Profile Error"));
      await expect(IndividualServiceUtility.extractProfileConfiguration("profile-uuid")).rejects.toThrow("Profile Error");
    });
 });
 