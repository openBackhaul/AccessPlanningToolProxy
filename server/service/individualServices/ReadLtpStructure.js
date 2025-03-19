'use strict';

const IndividualServiceUtility = require('./IndividualServiceUtility');
const createHttpError = require('http-errors');
const logger = require('../LoggingService').getLogger();

/**
 * This method performs the set of procedure to gather the ltp structure of given mount name
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * RequestForProvidingAcceptanceDataCausesReadingLtpStructure fc is used to get ltp-structure of a mountName
 * @returns {Object} ltpStructure ControlConstruct provided from cache
* **/
exports.readLtpStructure = async function (mountName, requestHeaders, traceIndicatorIncrementer) {
  return new Promise(async function (resolve, reject) {
    const readingLtpStructureFcName = "RequestForProvidingAcceptanceDataCausesReadingLtpStructure";
    const readingLtpStructureStringName = "RequestForProvidingAcceptanceDataCausesReadingLtpStructure.LtpStructure";
    try {
      let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(readingLtpStructureFcName, readingLtpStructureStringName);
      let pathParamList = [];
      pathParamList.push(mountName);
      /****************************************************************************************************
      * RequestForProvidingAcceptanceDataCausesReadingLtpStructure
      *   MWDI://core-model-1-4:network-control-domain=cache/control-construct={mount-name}
      *      ?fields=logical-termination-point(uuid;server-ltp;client-ltp;layer-protocol(local-id;layer-protocol-name))
      *****************************************************************************************************/
      let ltpStructure = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParamList, requestHeaders, traceIndicatorIncrementer++);
      if (Object.keys(ltpStructure).length > 0) {
        let result = {
          ltpStructure: ltpStructure,
          traceIndicatorIncrementer: traceIndicatorIncrementer
        }
        resolve(result);
      } else {
        throw new createHttpError.InternalServerError(`unable to fetch ltpStructure for mountName ${mountName}`);
      }
    } catch (error) {
      logger.error(error)
      reject(error);
    }
  });
}