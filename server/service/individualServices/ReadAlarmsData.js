'use strict';

const IndividualServiceUtility = require('./IndividualServiceUtility');
const createHttpError = require('http-errors');

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
      }
    }

    let alarmsData = {
      alarms: alarms,
      traceIndicatorIncrementer: traceIndicatorIncrementer
    };

    return alarmsData;

  } catch (error) {
    console.log(`readAlarmsData is not success with ${error}`);
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
     *   MWDI://core-model-1-4:network-control-domain=live/control-construct={mount-name}
     *           /alarms-1-0:alarm-pac/current-alarms
     *****************************************************************************************************/
    pathParams.push(mountName);
    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(forwardingName, stringName)
    let _traceIndicatorIncrementer = traceIndicatorIncrementer++;
    let alarmsFromLiveResponse = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParams, requestHeaders, _traceIndicatorIncrementer);
    if (alarmsFromLiveResponse) {
      if (Object.keys(alarmsFromLiveResponse).length === 0) {
        console.log(`${forwardingName} is not success`);
      } else {
        alarms = alarmsFromLiveResponse;
      }
    } else {
      console.log(`${forwardingName} is not success`);
    }
  } catch (error) {
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
            alarmList.push(alarm);
          }
        }
        alarms[ALARMS.CURRENT_ALARMS][ALARMS.NUMBER_OF_CURRENT_ALARMS] = numberOfCurrentAlarms;
        alarms[ALARMS.CURRENT_ALARMS][ALARMS.CURRENT_ALARM_LIST] = alarmList;
      }
    }
  }
  return alarms;
}