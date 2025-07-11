'use strict';

const IndividualServiceUtility = require('./IndividualServiceUtility');
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
exports.readAlarmsData = async function (mountName, requestHeaders, traceIndicatorIncrementer) {
  try {

    let alarms = {};
    let alarmsFromLiveResponse = await RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive(mountName, requestHeaders, traceIndicatorIncrementer);

    if (Object.keys(alarmsFromLiveResponse).length !== 0) {
      let alarmsFromLive = alarmsFromLiveResponse.alarmsFromLive;
      traceIndicatorIncrementer = alarmsFromLiveResponse.traceIndicatorIncrementer;
      if (Object.keys(alarmsFromLive).length !== 0) {
        alarms = await formulateResponseBodyForAlarms(alarmsFromLive);
      } else {
        logger.warn(`alarmsFromLive is empty for MountName: ${mountName}`);
      }
    } else {
      logger.warn(`alarmsFromLiveResponse is empty for MountName: ${mountName}`);
    }

    let alarmsData = {
      alarms: alarms,
      traceIndicatorIncrementer: traceIndicatorIncrementer
    };

    return alarmsData;

  } catch (error) {
    logger.error(error, "readAlarmsData is not success");
  }
}

/**
 * Prepare attributes and automate the RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive forwarding-construct 
 *    to get live alarm information of given mount-name
 * @param {String} mountName Identifier of the device at the Controller
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} return live alarm list and traceIndicatorIncrementer
 */
async function RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive(mountName, requestHeaders, traceIndicatorIncrementer) {
  const forwardingName = "RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive";
  const stringName = "RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive.AlarmsFromLive";
  let alarmsFromLive = {};
  let alarms = {};
  try {
    let pathParams = [];

    /****************************************************************************************************
     * RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive
     *   MWDI://core-model-1-4:network-control-domain=live/control-construct={mountName}
     *           /alarms-1-0:alarm-pac/current-alarms
     *****************************************************************************************************/
    pathParams.push(mountName);
    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let alarmsFromLiveResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (alarmsFromLiveResponse) {
      if (Object.keys(alarmsFromLiveResponse).length === 0) {
        logger.error(`${forwardingName} is not success for mountName ${mountName}`);
      } else {
        logger.info(`${forwardingName} for mountName ${mountName} successed`);
        alarms = alarmsFromLiveResponse;
      }
    } else {
      logger.error(`${forwardingName} is not success for mountName ${mountName}, alarmsFromLiveResponse is empty`);
    }
  } catch (error) {
    logger.error(error, `${forwardingName} is not success for mountName: ${mountName}`);
    console.log(`${forwardingName} is not success with ${error}`);
  }

  alarmsFromLive.traceIndicatorIncrementer = traceIndicatorIncrementer;
  alarmsFromLive.alarmsFromLive = alarms;
  return alarmsFromLive;
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
    let currentAlarms = alarmsFromLive[ALARMS.MODULE + ":" + ALARMS.CURRENT_ALARMS];
    if (currentAlarms) {
      if (Object.keys(currentAlarms).length !== 0) {
        let numberOfCurrentAlarms = alarmsFromLive[ALARMS.MODULE + ":" + ALARMS.CURRENT_ALARMS][ALARMS.NUMBER_OF_CURRENT_ALARMS];
        let alarmList = [];
        if (numberOfCurrentAlarms != 0) {
          let currentAlarmList = alarmsFromLive[ALARMS.MODULE + ":" + ALARMS.CURRENT_ALARMS][ALARMS.CURRENT_ALARM_LIST];
          for (let i = 0; i < currentAlarmList.length; i++) {
            let alarm = {};
            alarm[ALARMS.ALARM_SEVERITY] = currentAlarmList[i][ALARMS.ALARM_SEVERITY];
            alarm[ALARMS.ALARM_TYPE_QUALIFIER] = currentAlarmList[i][ALARMS.ALARM_TYPE_QUALIFIER];
            alarm[ALARMS.ALARM_TYPE_ID] = currentAlarmList[i][ALARMS.ALARM_TYPE_ID];
            logger.trace(alarm, `formulateResponseBodyForAlarms - Pushing alarm to alarmlist`);
            alarmList.push(alarm);
          }
        } else {
          logger.warn("formulateResponseBodyForAlarms - numberOfCurrentAlarms is 0");
        }
        logger.debug(`formulateResponseBodyForAlarms - number of current alarm is ${numberOfCurrentAlarms}`);
        alarms[ALARMS.CURRENT_ALARMS][ALARMS.NUMBER_OF_CURRENT_ALARMS] = numberOfCurrentAlarms;
        alarms[ALARMS.CURRENT_ALARMS][ALARMS.CURRENT_ALARM_LIST] = alarmList;
      } else {
        logger.warn("formulateResponseBodyForAlarms - currentAlarms seems empty")
      }
    } else {
      logger.warn("formulateResponseBodyForAlarms - currentAlarms is empty");
    }
  }

  return alarms;
}