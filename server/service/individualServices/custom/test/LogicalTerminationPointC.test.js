'use strict';

const LogicalTerminationPointC = require('../LogicalTerminationPointC');
const onfPaths = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfPaths');
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');

jest.mock('onf-core-model-ap/applicationPattern/onfModel/constants/OnfPaths');
jest.mock('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');

describe('LogicalTerminationPointC', () => {
   
  
    describe('setLayerProtolRemoteAddressLtpAsync', () => {
        const ltpUuid = '12345';
        const remoteAddress = '192.168.1.1';
        const layerProtolPath = onfPaths.TCP_CLIENT_ADDRESS.replace("{uuid}", ltpUuid);

        beforeEach(() => {
            jest.clearAllMocks();
          });

        it('should update the layer protocol with remote address successfully', async () => {
            // Arrange: Mock the functions
            //fileOperation.deletefromDatabaseAsync.mockResolvedValue(true);  // Simulate successful deletion
            fileOperation.writeToDatabaseAsync.mockResolvedValue(true);   // Simulate successful write
            // Act: Call the method
            const result = await LogicalTerminationPointC.setLayerProtolRemoteAddressLtpAsync(ltpUuid, remoteAddress);

            // Assert: Check if the result is true
            expect(result).toBe(true);
            //expect(fileOperation.deletefromDatabaseAsync).toHaveBeenCalledWith(layerProtolPath);
            expect(fileOperation.writeToDatabaseAsync).toHaveBeenCalledWith(layerProtolPath, remoteAddress, false);
        });

        it('should return false if write operation fails', async () => {
            // Arrange: Mock the functions
            //fileOperation.deletefromDatabaseAsync.mockResolvedValue(true);  // Simulate successful deletion
            fileOperation.writeToDatabaseAsync.mockResolvedValue(false);   // Simulate failed write

            // Act: Call the method
            const result = await LogicalTerminationPointC.setLayerProtolRemoteAddressLtpAsync(ltpUuid, remoteAddress);

            // Assert: Check if the result is false
            expect(result).toBe(false);
            //expect(fileOperation.deletefromDatabaseAsync).toHaveBeenCalledWith(layerProtolPath);
            expect(fileOperation.writeToDatabaseAsync).toHaveBeenCalledWith(layerProtolPath, remoteAddress, false);
        });

        // it('should handle errors gracefully', async () => {
        //     // Arrange: Mock the functions to throw errors
        //     fileOperation.deletefromDatabaseAsync.mockRejectedValue(new Error('Delete failed'));
        //     fileOperation.writeToDatabaseAsync.mockResolvedValue(false);  // Just in case the write is called

        //     // Act: Call the method and expect it to throw an error
        //     await expect(LogicalTerminationPointC.setLayerProtolRemoteAddressLtpAsync(ltpUuid, remoteAddress))
        //         .rejects
        //         .toThrow('Delete failed');

        //     // Ensure that writeToDatabaseAsync is not called if delete fails
        //     expect(fileOperation.writeToDatabaseAsync).not.toHaveBeenCalled();
        // });
    });
 
    describe('setLayerProtolOperationNameLtpAsync', () => {
        let ltpUuid;
        let operationName;
      
        beforeEach(() => {
          // Initialize test data
          ltpUuid = '123-abc';
          operationName = 'newOperationName';
          jest.clearAllMocks();
        });
      
        it('should return true if the operation is successfully updated', async () => {
          // Arrange: Mock the behavior of delete and write operations
          //fileOperation.deletefromDatabaseAsync.mockResolvedValue(true);  // Mock successful delete
          fileOperation.writeToDatabaseAsync.mockResolvedValue(true);    // Mock successful write
      
          // Act: Call the method
          const result = await LogicalTerminationPointC.setLayerProtolOperationNameLtpAsync(ltpUuid, operationName);
      
          // Assert: Check if the expected result was returned
          expect(result).toBe(true);
          //expect(fileOperation.deletefromDatabaseAsync).toHaveBeenCalledWith(onfPaths.OPERATION_CLIENT_OPERATION_NAME.replace("{uuid}", ltpUuid));
          expect(fileOperation.writeToDatabaseAsync).toHaveBeenCalledWith(onfPaths.OPERATION_CLIENT_OPERATION_NAME.replace("{uuid}", ltpUuid), operationName, false);
        });
      
        it('should return false if the write operation fails', async () => {
          // Arrange: Mock the behavior of delete and write operations
          //fileOperation.deletefromDatabaseAsync.mockResolvedValue(true);  // Mock successful delete
          fileOperation.writeToDatabaseAsync.mockResolvedValue(false);   // Mock failed write
      
          // Act: Call the method
          const result = await LogicalTerminationPointC.setLayerProtolOperationNameLtpAsync(ltpUuid, operationName);
      
          // Assert: Check if the expected result was returned
          expect(result).toBe(false);
          //expect(fileOperation.deletefromDatabaseAsync).toHaveBeenCalledWith(onfPaths.OPERATION_CLIENT_OPERATION_NAME.replace("{uuid}", ltpUuid));
          expect(fileOperation.writeToDatabaseAsync).toHaveBeenCalledWith(onfPaths.OPERATION_CLIENT_OPERATION_NAME.replace("{uuid}", ltpUuid), operationName, false);
        });
      
        // it('should handle errors gracefully', async () => {
        //   // Arrange: Mock the behavior of delete and write operations
        //   fileOperation.deletefromDatabaseAsync.mockRejectedValue(new Error('Delete failed')); // Mock failed delete
        //   fileOperation.writeToDatabaseAsync.mockResolvedValue(false);   // Mock failed write
      
        //   // Act: Call the method
        
        //   await expect(LogicalTerminationPointC.setLayerProtolOperationNameLtpAsync(ltpUuid, operationName))
        //   .rejects
        //   .toThrow('Delete failed');
      
        //   // Ensure that writeToDatabaseAsync is not called if delete fails
        //   expect(fileOperation.writeToDatabaseAsync).not.toHaveBeenCalled();
        // });
      });
      
    describe('setLayerProtolReleaseNumberLtpAsync', () => {
        let ltpUuid;
        let releaseNumber;
      
        beforeEach(() => {
          // Initialize test data
          ltpUuid = '123-abc';
          releaseNumber = '1.2.3';
          jest.clearAllMocks();
        });
      
        it('should return true if the release number is successfully updated', async () => {
          // Arrange: Mock the behavior of delete and write operations
          //fileOperation.deletefromDatabaseAsync.mockResolvedValue(true);  // Mock successful delete
          fileOperation.writeToDatabaseAsync.mockResolvedValue(true);    // Mock successful write
      
          // Act: Call the method
          const result = await LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync(ltpUuid, releaseNumber);
      
          // Assert: Check if the expected result was returned
          expect(result).toBe(true);
          //expect(fileOperation.deletefromDatabaseAsync).toHaveBeenCalledWith(onfPaths.HTTP_CLIENT_RELEASE_NUMBER.replace("{uuid}", ltpUuid));
          expect(fileOperation.writeToDatabaseAsync).toHaveBeenCalledWith(onfPaths.HTTP_CLIENT_RELEASE_NUMBER.replace("{uuid}", ltpUuid), releaseNumber, false);
        });
      
        it('should return false if the write operation fails', async () => {
          // Arrange: Mock the behavior of delete and write operations
          //fileOperation.deletefromDatabaseAsync.mockResolvedValue(true);  // Mock successful delete
          fileOperation.writeToDatabaseAsync.mockResolvedValue(false);   // Mock failed write
      
          // Act: Call the method
          const result = await LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync(ltpUuid, releaseNumber);
      
          // Assert: Check if the expected result was returned
          expect(result).toBe(false);
          //expect(fileOperation.deletefromDatabaseAsync).toHaveBeenCalledWith(onfPaths.HTTP_CLIENT_RELEASE_NUMBER.replace("{uuid}", ltpUuid));
          expect(fileOperation.writeToDatabaseAsync).toHaveBeenCalledWith(onfPaths.HTTP_CLIENT_RELEASE_NUMBER.replace("{uuid}", ltpUuid), releaseNumber, false);
        });
      
      //   it('should handle errors gracefully', async () => {
      //     // Arrange: Mock the behavior of delete and write operations
      //     fileOperation.deletefromDatabaseAsync.mockRejectedValue(new Error('Delete failed'));
      //     fileOperation.writeToDatabaseAsync.mockResolvedValue(false);   // Mock failed write
      
      //     // Act: Call the method and expect it to throw an error
      //     await expect(LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync(ltpUuid, releaseNumber))
      //     .rejects
      //     .toThrow('Delete failed');

      // // Ensure that writeToDatabaseAsync is not called if delete fails
      // expect(fileOperation.writeToDatabaseAsync).not.toHaveBeenCalled();
      //   });
      });
    
      describe('setLayerProtolRemotePortLtpAsync', () => {
        const ltpUuid = '12345';
        const remotePort = '3001';
        const layerRemotePath = onfPaths.TCP_CLIENT_REMOTE_PORT.replace("{uuid}", ltpUuid);

        beforeEach(() => {
            jest.clearAllMocks();
          });

        it('should update the layer protocol with remote port successfully', async () => {
            // Arrange: Mock the functions
            //fileOperation.deletefromDatabaseAsync.mockResolvedValue(true);  // Simulate successful deletion
            fileOperation.writeToDatabaseAsync.mockResolvedValue(true);   // Simulate successful write



            // Act: Call the method
            const result = await LogicalTerminationPointC.setLayerProtolRemotePortLtpAsync(ltpUuid, remotePort);

            // Assert: Check if the result is true
            expect(result).toBe(true);
            //expect(fileOperation.deletefromDatabaseAsync).toHaveBeenCalledWith(layerRemotePath);
            expect(fileOperation.writeToDatabaseAsync).toHaveBeenCalledWith(layerRemotePath, remotePort, false);
        });

        it('should return false if write operation fails', async () => {
            // Arrange: Mock the functions
            //fileOperation.deletefromDatabaseAsync.mockResolvedValue(true);  // Simulate successful deletion
            fileOperation.writeToDatabaseAsync.mockResolvedValue(false);   // Simulate failed write

            // Act: Call the method
            const result = await LogicalTerminationPointC.setLayerProtolRemotePortLtpAsync(ltpUuid, remotePort);

            // Assert: Check if the result is false
            expect(result).toBe(false);
            //expect(fileOperation.deletefromDatabaseAsync).toHaveBeenCalledWith(layerRemotePath);
            expect(fileOperation.writeToDatabaseAsync).toHaveBeenCalledWith(layerRemotePath, remotePort, false);
        });

        // it('should handle errors gracefully', async () => {
        //     // Arrange: Mock the functions to throw errors
        //     fileOperation.deletefromDatabaseAsync.mockRejectedValue(new Error('Delete failed'));
        //     fileOperation.writeToDatabaseAsync.mockResolvedValue(false);  // Just in case the write is called


        //     // Act: Call the method and expect it to throw an error
        //     await expect(LogicalTerminationPointC.setLayerProtolRemotePortLtpAsync(ltpUuid, remotePort))
        //         .rejects
        //         .toThrow('Delete failed');

        //     // Ensure that writeToDatabaseAsync is not called if delete fails
        //     expect(fileOperation.writeToDatabaseAsync).not.toHaveBeenCalled();
        // });
    });

    describe('setLayerProtolRemoteProtocolLtpAsync', () => {
        const ltpUuid = '12345';
        const remoteProtocol = 'tcp-client-interface-1-0:PROTOCOL_TYPE_HTTP';
        beforeEach(() => {
            jest.clearAllMocks();
          });

        it('should update the layer protocol with remote protocol successfully', async () => {
            // Arrange: Mock the functions
            //fileOperation.deletefromDatabaseAsync.mockResolvedValue(true);  // Simulate successful deletion
            fileOperation.writeToDatabaseAsync.mockResolvedValue(true);   // Simulate successful write

            // Act: Call the method
            const result = await LogicalTerminationPointC.setLayerProtolRemoteProtocolLtpAsync(ltpUuid, remoteProtocol);

            // Assert: Check if the result is true
            expect(result).toBe(true);
            //expect(fileOperation.deletefromDatabaseAsync).toHaveBeenCalledWith(onfPaths.TCP_CLIENT_REMOTE_PROTOCOL.replace("{uuid}", ltpUuid));
            expect(fileOperation.writeToDatabaseAsync).toHaveBeenCalledWith(onfPaths.TCP_CLIENT_REMOTE_PROTOCOL.replace("{uuid}", ltpUuid), remoteProtocol, false);
        });

        it('should return false if write operation fails', async () => {
            // Arrange: Mock the functions
            //fileOperation.deletefromDatabaseAsync.mockResolvedValue(true);  // Simulate successful deletion
            fileOperation.writeToDatabaseAsync.mockResolvedValue(false);   // Simulate failed write

            // Act: Call the method
            const result = await LogicalTerminationPointC.setLayerProtolRemoteProtocolLtpAsync(ltpUuid, remoteProtocol);

            // Assert: Check if the result is false
            expect(result).toBe(false);
            //expect(fileOperation.deletefromDatabaseAsync).toHaveBeenCalledWith(onfPaths.TCP_CLIENT_REMOTE_PROTOCOL.replace("{uuid}", ltpUuid));
            expect(fileOperation.writeToDatabaseAsync).toHaveBeenCalledWith(onfPaths.TCP_CLIENT_REMOTE_PROTOCOL.replace("{uuid}", ltpUuid), remoteProtocol, false);
        });

        // it('should handle errors gracefully', async () => {
        //     // Arrange: Mock the functions to throw errors
        //     fileOperation.deletefromDatabaseAsync.mockRejectedValue(new Error('Delete failed'));
        //     fileOperation.writeToDatabaseAsync.mockResolvedValue(false);  // Just in case the write is called


        //     // Act: Call the method and expect it to throw an error
        //     await expect(LogicalTerminationPointC.setLayerProtolRemoteProtocolLtpAsync(ltpUuid, remoteProtocol))
        //         .rejects
        //         .toThrow('Delete failed');

        //     // Ensure that writeToDatabaseAsync is not called if delete fails
        //     expect(fileOperation.writeToDatabaseAsync).not.toHaveBeenCalled();
        // });
    });
    
  });