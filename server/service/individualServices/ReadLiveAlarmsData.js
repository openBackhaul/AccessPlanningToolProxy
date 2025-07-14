'use strict';

const IndividualServiceUtility = require('./IndividualServiceUtility');
const createHttpError = require('http-errors');
const logger = require('../LoggingService').getLogger();

let ALARMS = {
  MODULE: "alarms-1-0",
  CURRENT_ALARMS: "current-alarms",
  NUMBER_OF_CURRENT_ALARMS: "number-of-current-alarms",
  CURRENT_ALARM_LIST: "current-alarm-list",
  ALARM_SEVERITY: "alarm-severity",
  ALARM_TYPE_QUALIFIER: "alarm-type-qualifier",
  ALARM_TYPE_ID: "alarm-type-id"
}

/**
 * This method performs the set of procedure to gather the live alarms data
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * The following are the list of forwarding-construct that will be automated to gather the airInterface data 
 * 1. RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive
   @returns {Object} result which contains the live alarms data and traceIndicatorIncrementer
 **/
exports.readLiveAlarmsData = async function (mountName, requestHeaders, traceIndicatorIncrementer) {
  let alarms = {};
  try {

    logger.info(`readLiveAlarmsData - Retrieving Alarms from Live for MountName: ${mountName}`);
    let alarmsFromLiveResponse = await RequestForProvidingAlarmsForLivenetviewCausesReadingCurrentAlarmsFromLive(mountName, requestHeaders, traceIndicatorIncrementer);

    if (alarmsFromLiveResponse && Object.keys(alarmsFromLiveResponse).length !== 0) {
      let alarmsFromLive = alarmsFromLiveResponse.alarmsFromLive;
      traceIndicatorIncrementer = alarmsFromLiveResponse.traceIndicatorIncrementer;
      if (Object.keys(alarmsFromLive).length !== 0) {
        logger.info("readLiveAlarmsData - Alarms in the list, processing it");
        alarms = await formulateResponseBodyForAlarms(alarmsFromLive);
        let alarmsData = {
          alarms: alarms,
          traceIndicatorIncrementer: traceIndicatorIncrementer
        };
        return alarmsData;
      } else {
        logger.debug("readLiveAlarmsData - Alarms are == 0");
      }
    }

  } catch (error) {
    logger.error(error, "readLiveAlarmsData fails");
  }

  if (Object.keys(alarms).length === 0) {
    logger.error("readLiveAlarmsData - Alarms not retrieved, throwing 502 - Bad Gateway");
    throw new createHttpError(502, "Bad Gateway");
  }
}

/**
 * Prepare attributes and automate the RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive forwarding-construct 
 *    to get live alarm information of given mount-name
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return live alarm list and traceIndicatorIncrementeRequestForProvidingAlarmsForLivenetviewCausesReadingCurrentAlarmsFromLiver
 */
async function RequestForProvidingAlarmsForLivenetviewCausesReadingCurrentAlarmsFromLive(mountName, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingAlarmsForLivenetviewCausesReadingCurrentAlarmsFromLive";
  const stringName = "RequestForProvidingAlarmsForLivenetviewCausesReadingCurrentAlarmsFromLive.AlarmsFromLive";
  let alarmsFromLive = {};
  let alarms = {};
  try {
    let pathParams = [];

    /****************************************************************************************************
     * RequestForProvidingAlarmsForLivenetviewCausesReadingCurrentAlarmsFromLive
     *   MWDI://core-model-1-4:network-control-domain=live/control-construct={mountName}
     *           /alarms-1-0:alarm-pac/current-alarms
     *****************************************************************************************************/
    pathParams.push(mountName);
    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    logger.debug(`RequestForProvidingAlarmsForLivenetviewCausesReadingCurrentAlarmsFromLive - increment traceIndicator: ${_traceIndicatorIncrementer}`);
    let alarmsFromLiveResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (alarmsFromLiveResponse && Object.keys(alarmsFromLiveResponse).length != 0) {
      if (Object.keys(alarmsFromLiveResponse).length === 0) {
        logger.warn(`${forwardingName} is not success, empty data`);
      } else {
        logger.debug(`RequestForProvidingAlarmsForLivenetviewCausesReadingCurrentAlarmsFromLive - Receiving list of alarms`);
        alarms = alarmsFromLiveResponse;
        alarmsFromLive.traceIndicatorIncrementer = traceIndicatorIncrementer;
        alarmsFromLive.alarmsFromLive = alarms;
        logger.trace(alarmsFromLive, "Returning data from RequestForProvidingAlarmsForLivenetviewCausesReadingCurrentAlarmsFromLive");
        return alarmsFromLive;
      }
    } else {
      logger.warn(`${forwardingName} is not success`);
    }
  } catch (error) {
    logger.error(error, `${forwardingName} is not success`);
    console.log(`${forwardingName} is not success with ${error}`);
  }
  
}


/**
 * Formulate response body for alarms from fetched live alarms.
 * @param {list} alarmsFromLive List of equipment information
 * @returns {Object} return classified equipment info 
 */
async function formulateResponseBodyForAlarms(alarmsFromLive) {
  let alarms = {
    "current-alarms": {}
  };

  if (alarmsFromLive) {
    logger.debug("formulateResponseBodyForAlarms - Checking current alarms");
    let currentAlarms = alarmsFromLive[ALARMS.MODULE + ":" + ALARMS.CURRENT_ALARMS];
    if (currentAlarms) {
      if (Object.keys(currentAlarms).length !== 0) {
        logger.debug("formulateResponseBodyForAlarms - Current alarms are present");
        let numberOfCurrentAlarms = alarmsFromLive[ALARMS.MODULE + ":" + ALARMS.CURRENT_ALARMS][ALARMS.NUMBER_OF_CURRENT_ALARMS];
        let alarmList = [];
        if (numberOfCurrentAlarms != 0) {
          let currentAlarmList = alarmsFromLive[ALARMS.MODULE + ":" + ALARMS.CURRENT_ALARMS][ALARMS.CURRENT_ALARM_LIST];
          for (let i = 0; i < currentAlarmList.length; i++) {
            let alarm = {};
            alarm[ALARMS.ALARM_SEVERITY] = currentAlarmList[i][ALARMS.ALARM_SEVERITY];
            alarm[ALARMS.ALARM_TYPE_QUALIFIER] = currentAlarmList[i][ALARMS.ALARM_TYPE_QUALIFIER];
            alarm[ALARMS.ALARM_TYPE_ID] = currentAlarmList[i][ALARMS.ALARM_TYPE_ID];
            alarmList.push(alarm);
          }
        }
        alarms[ALARMS.CURRENT_ALARMS][ALARMS.NUMBER_OF_CURRENT_ALARMS] = numberOfCurrentAlarms;
        alarms[ALARMS.CURRENT_ALARMS][ALARMS.CURRENT_ALARM_LIST] = alarmList;
      } else {
        logger.debug("formulateResponseBodyForAlarms - Current alarms entry does't exists");
      }
    }
  }
  return alarms;
}