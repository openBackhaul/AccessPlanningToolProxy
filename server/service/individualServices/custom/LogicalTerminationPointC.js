/**
 * The LogicalTerminationPoint (LTP) class encapsulates the termination and adaptation functions of one or more technology specific layers 
 * represented by instances of LayerProtocol. 
 * This class provides 
 *      - stub to instantiate and generate a JSON object for a LogicalTerminationPoint. 
 *      - functionality to read the currently configured attribute values of the /core-model-1-4:control-construct/logical-termination-point
 **/
'use strict';
const LogicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');

const onfPaths = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfPaths');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const controlConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ControlConstruct');
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');

class LogicalTerminationPointC extends LogicalTerminationPoint {
    constructor(uuid, ltpDirection, clientLtp, serverLtp, layerProtocol, additionalProperty) {
        super(uuid, ltpDirection, clientLtp, serverLtp, layerProtocol);    
      }

     /**
     * @description This function returns the layer-protocol list for the given logical-termination-point uuid
     * @param {String} ltpUuid : the value should be a valid string in the pattern
     * '-\d+-\d+-\d+-(http|tcp|op)-(server|client)-\d+$'
     * @returns {Promise<Array>}
     **/
    static async getLayerLtpListAsync(ltpUuid) {
        let ltp = await controlConstruct.getLogicalTerminationPointAsync(ltpUuid);
        if (ltp != undefined) {
            return ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL];
        }
        return [];
    }

    /**
     * @description This function modifies the layer-protocol for the given logical-termination-point uuid.
     * @param {String} ltpUuid : uuid of the logical-termination-point in the pattern
     * '-\d+-\d+-\d+-(http|tcp|op)-(server|client)-\d+$'
     * @param {Array} layerProtolUuid : layer Protol that needs to be updated.  
     * @returns {Promise<Boolean>}
     **/
    static async setLayerProtolLtpAsync(ltpUuid, layerProtolUuid) {
        let isUpdated = false;
        let layerProtolPath = onfPaths.LAYER_PROTOCOL.replace("{uuid}", ltpUuid);
        await fileOperation.deletefromDatabaseAsync(layerProtolPath);
        
        isUpdated = await fileOperation.writeToDatabaseAsync(
                layerProtolPath,
                layerProtolUuid,
                true);
        
        return isUpdated;
    }

    /**
     * @description This function modifies the remote address in layer-protocol for the given logical-termination-point uuid.
     * @param {String} ltpUuid : uuid of the logical-termination-point in the pattern
     * '-\d+-\d+-\d+-(http|tcp|op)-(server|client)-\d+$'
     * @param {String} remoteAddress : remote address that needs to be updated.  
     * @returns {Promise<Boolean>}
     **/
    static async setLayerProtolRemoteProtocolLtpAsync(ltpUuid, remoteAddress) {
        let isUpdated = false;
        let layerProtolPath = onfPaths.TCP_CLIENT_REMOTE_PROTOCOL.replace("{uuid}", ltpUuid);
        await fileOperation.deletefromDatabaseAsync(layerProtolPath);
            isUpdated = await fileOperation.writeToDatabaseAsync(
                layerProtolPath,
                remoteAddress,
                false);
        
        return isUpdated;
    }
    
    /**
     * @description This function modifies the remote port in layer-protocol for the given logical-termination-point uuid.
     * @param {String} ltpUuid : uuid of the logical-termination-point in the pattern
     * '-\d+-\d+-\d+-(http|tcp|op)-(server|client)-\d+$'
     * @param {String} remotePort :remote port that needs to be updated.  
     * @returns {Promise<Boolean>}
     **/
    static async setLayerProtolRemotePortLtpAsync(ltpUuid, remotePort) {
        let isUpdated = false;
        let layerProtolPath = onfPaths.TCP_CLIENT_REMOTE_PORT.replace("{uuid}", ltpUuid);
        await fileOperation.deletefromDatabaseAsync(layerProtolPath);
            isUpdated = await fileOperation.writeToDatabaseAsync(
                layerProtolPath,
                remotePort,
                false);
        
        return isUpdated;
    }

    /**
     * @description This function modifies the release number in layer-protocol for the given logical-termination-point uuid.
     * @param {String} ltpUuid : uuid of the logical-termination-point in the pattern
     * '-\d+-\d+-\d+-(http|tcp|op)-(server|client)-\d+$'
     * @param {String} releaseNumber : release number that needs to be updated.  
     * @returns {Promise<Boolean>}
     **/
    static async setLayerProtolReleaseNumberLtpAsync(ltpUuid, releaseNumber) {
        let isUpdated = false;
        let layerProtolPath = onfPaths.HTTP_CLIENT_RELEASE_NUMBER.replace("{uuid}", ltpUuid);
        await fileOperation.deletefromDatabaseAsync(layerProtolPath);
            isUpdated = await fileOperation.writeToDatabaseAsync(
                layerProtolPath,
                releaseNumber,
                false);
        
        return isUpdated;
    }

    /**
     * @description This function modifies the operation name in layer-protocol for the given logical-termination-point uuid.
     * @param {String} ltpUuid : uuid of the logical-termination-point in the pattern
     * '-\d+-\d+-\d+-(http|tcp|op)-(server|client)-\d+$'
     * @param {String} operationName : operationName that needs to be updated.  
     * @returns {Promise<Boolean>}
     **/
    static async setLayerProtolOperationNameLtpAsync(ltpUuid, operationName) {
        let isUpdated = false;
        let layerProtolPath = onfPaths.OPERATION_CLIENT_OPERATION_NAME.replace("{uuid}", ltpUuid);
        await fileOperation.deletefromDatabaseAsync(layerProtolPath);
            isUpdated = await fileOperation.writeToDatabaseAsync(
                layerProtolPath,
                operationName,
                false);
        
        return isUpdated;
    }

    /**
     * @description This function modifies the layer-protocol remote Address for the given logical-termination-point uuid.
     * @param {String} ltpUuid : uuid of the logical-termination-point in the pattern
     * '-\d+-\d+-\d+-(http|tcp|op)-(server|client)-\d+$'
     * @param {Array} remoteAddress : remote Address that needs to be updated.  
     * @returns {Promise<Boolean>}
     **/
    static async setLayerProtolRemoteAddressLtpAsync(ltpUuid, remoteAddress) {
        let isUpdated = false;
        let layerProtolPath = onfPaths.TCP_CLIENT_ADDRESS.replace("{uuid}", ltpUuid);
        await fileOperation.deletefromDatabaseAsync(layerProtolPath);
        
        isUpdated = await fileOperation.writeToDatabaseAsync(
                layerProtolPath,
                remoteAddress,
                false);
        
        return isUpdated;
    }       

  }

  module.exports = LogicalTerminationPointC;

