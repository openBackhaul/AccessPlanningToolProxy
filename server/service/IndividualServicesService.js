'use strict';
const ReadAirInterfaceData = require('./individualServices/ReadAirInterfaceData');
const ReadLtpStructure = require('./individualServices/ReadLtpStructure');
const ReadVlanInterfaceData = require('./individualServices/ReadVlanInterfaceData');
const ReadInventoryData = require('./individualServices/ReadInventoryData');
const ReadAlarmsData = require('./individualServices/ReadAlarmsData');
const onfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');


/**
 * Initiates process of embedding a new release
 *
 * body V1_bequeathyourdataanddie_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.bequeathYourDataAndDie = function(body,user,originator,xCorrelator,traceIndicator,customerJourney) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Provides the data required for the acceptance of a device
 *
 * body V1_provideacceptancedataoflinkendpoint_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_200
 **/
exports.provideAcceptanceDataOfLinkEndpoint = function(body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function(resolve, reject) {
    try {

      let acceptanceDataOfLinkEndPoint = {};
      let traceIndicatorIncrementer = 1;

      /****************************************************************************************
       * Setting up required local variables from the request body
       ****************************************************************************************/
      let mountName = body["mount-name"];
      let linkId = body["link-id"];

      /****************************************************************************************
       * Setting up request header object
       ****************************************************************************************/
      let requestHeaders = {
        user: user, 
        originator: originator,
        xCorrelator: xCorrelator, 
        traceIndicator: traceIndicator, 
        customerJourney: customerJourney
      };

      /****************************************************************************************
       * Collect complete ltp structure of mount-name in request bodys
       ****************************************************************************************/
      let ltpStructureResult = await ReadLtpStructure.readLtpStructure(mountName, requestHeaders)
       .catch(err => console.log(` ${err}`));

      let ltpStructure = ltpStructureResult.ltpStructure;
      traceIndicatorIncrementer = ltpStructureResult.traceIndicatorIncrementer;

      /****************************************************************************************
       * Collect air-interface data
       ****************************************************************************************/
      let airInterfaceResult = await ReadAirInterfaceData.readAirInterfaceData(mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer)
      .catch(err => console.log(` ${err}`));

      let uuidUnderTest = airInterfaceResult.uuidUnderTest;
      if(Object.keys(airInterfaceResult.airInterface).length !=0 ) {
        acceptanceDataOfLinkEndPoint.airInterface = airInterfaceResult.airInterface;
      }
      traceIndicatorIncrementer = airInterfaceResult.traceIndicatorIncrementer;  

      /****************************************************************************************
       * Collect vlan-interface data
       ****************************************************************************************/
      let vlanInterfaceResult = await ReadVlanInterfaceData.readVlanInterfaceData(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer)
      .catch(err => console.log(` ${err}`));

      if(Object.keys(vlanInterfaceResult.vlanInterface).length !=0 ) {
        acceptanceDataOfLinkEndPoint.vlanInterface = vlanInterfaceResult.vlanInterface;
      }
      traceIndicatorIncrementer = vlanInterfaceResult.traceIndicatorIncrementer;

      /****************************************************************************************
       * Collect inventory data
       ****************************************************************************************/
      let inventoryResult = await ReadInventoryData.readInventoryData(mountName, ltpStructure, uuidUnderTest, requestHeaders, traceIndicatorIncrementer)
      .catch(err => console.log(` ${err}`));

      if(Object.keys(inventoryResult.inventory).length !=0 ) {
        acceptanceDataOfLinkEndPoint.inventory = inventoryResult.inventory;
      }
      traceIndicatorIncrementer = inventoryResult.traceIndicatorIncrementer;

      /****************************************************************************************
       * Collect alarms data
       ****************************************************************************************/
      let alarmsResult = await ReadAlarmsData.readAlarmsData(mountName, requestHeaders, traceIndicatorIncrementer)
      .catch(err => console.log(` ${err}`));
      
      if(Object.keys(alarmsResult.alarms).length !=0 ) {
        acceptanceDataOfLinkEndPoint.alarms = alarmsResult.alarms;
      }
      traceIndicatorIncrementer = alarmsResult.traceIndicatorIncrementer;

      acceptanceDataOfLinkEndPoint = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(acceptanceDataOfLinkEndPoint);
      resolve(acceptanceDataOfLinkEndPoint);

    } catch (error) {
      console.log(error)
      reject(error);
    }
    
  });
}

