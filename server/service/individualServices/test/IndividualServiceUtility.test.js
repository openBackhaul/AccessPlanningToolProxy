'use strict';

const IndividualServiceUtility = require('../IndividualServiceUtility');
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const onfPaths = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfPaths');

const fileSystem = require('fs');
const AsyncLock = require('async-lock');
const lock = new AsyncLock();

jest.mock('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver'); // Mock the fileOperation module
//jest.mock('async-lock');
jest.mock('fs'); // Mock the fs module

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
