'use strict';
const ReadAirInterfaceData = require('./individualServices/ReadAirInterfaceData');
const ReadLtpStructure = require('./individualServices/ReadLtpStructure');
const ReadVlanInterfaceData = require('./individualServices/ReadVlanInterfaceData');
const ReadInventoryData = require('./individualServices/ReadInventoryData');
const ReadAlarmsData = require('./individualServices/ReadAlarmsData');
const ReadLiveAlarmsData = require('./individualServices/ReadLiveAlarmsData');
const ReadLiveEquipmentData = require('./individualServices/ReadLiveEquipmentData');
const ReadLiveStatusData = require('./individualServices/ReadLiveStatusData');
const ReadConfigurationAirInterfaceData = require('./individualServices/ReadConfigurationAirInterfaceData');
const onfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const createHttpError = require('http-errors');
const IndividualServiceUtility = require('./individualServices/IndividualServiceUtility');
const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const ReadHistoricalData = require('./individualServices/ReadHistoricalData');
const softwareUpgrade = require('./individualServices/SoftwareUpgrade');
const HttpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const LogicalTerminationPointC = require('./individualServices/custom/LogicalTerminationPointC');
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const onfPaths = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfPaths');
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
exports.bequeathYourDataAndDie = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {

  let newApplicationDetails = body;
  let currentReleaseNumber = await HttpServerInterface.getReleaseNumberAsync();
  let newReleaseNumber = body["new-application-release"];

  if (newReleaseNumber !== currentReleaseNumber) {

    softwareUpgrade.upgradeSoftwareVersion(user, xCorrelator, traceIndicator, customerJourney, newApplicationDetails)
      .catch(err => console.log(`upgradeSoftwareVersion failed with error: ${err}`));
  }
}


/**
 * Checks wheter a mountName is registered in the APTP-internal list of Connected devices and returns a boolean
 *
 * body V1_checkregisteredavailabilityofdevice_body 
 * returns inline_response_200
 **/
exports.checkRegisteredAvailabilityOfDevice = function (body) {
  return new Promise(async function (resolve, reject) {
    var result = {};
    try {
      const forwardingName = "RequestForProvidingConfigurationForLivenetviewCausesReadingLtpStructure";
      const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
      let prefix = forwardingConstruct.uuid.split('op')[0];
      let maxNumberOfParallelOperations = await IndividualServiceUtility.extractProfileConfiguration(prefix + "integer-p-002");
      counter = counter + 1;
      if (counter > maxNumberOfParallelOperations) {
        throw new createHttpError.TooManyRequests("Too many requests");
      }
      let mountName = body['mount-name'];
      
       if (undefined != global.connectedDeviceList["mount-name-list"] && global.connectedDeviceList["mount-name-list"].includes(mountName)) {
        result['application/json'] = {
          "device-is-available": true
        };
      } else {
        result['application/json'] = {
          "device-is-available": false
        };
      }

      resolve(Object.values(result)[0]);
    } catch (error) {

      reject(error);
      resolve(error);
    } finally {
      if (counter > 0) {
        counter = counter - 1;
      }
      
    }
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
exports.provideAcceptanceDataOfLinkEndpoint = function (body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function (resolve, reject) {
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
      let ltpStructure = {};
      try {
        let ltpStructureResult = await ReadLtpStructure.readLtpStructure(mountName, requestHeaders, traceIndicatorIncrementer)
        ltpStructure = ltpStructureResult.ltpStructure;
        traceIndicatorIncrementer = ltpStructureResult.traceIndicatorIncrementer;
      } catch (err) {
        throw new createHttpError.InternalServerError(`${err}`)
      };


      /****************************************************************************************
       * Collect air-interface data
       ****************************************************************************************/
      let airInterfaceResult = await ReadAirInterfaceData.readAirInterfaceData(mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer)
        .catch(err => console.log(` ${err}`));

      let uuidUnderTest = "";
      if (airInterfaceResult) {
        if (airInterfaceResult.uuidUnderTest) {
          uuidUnderTest = airInterfaceResult.uuidUnderTest;
        }
        if (Object.keys(airInterfaceResult.airInterface).length != 0) {
          acceptanceDataOfLinkEndPoint.airInterface = airInterfaceResult.airInterface;
        }
        traceIndicatorIncrementer = airInterfaceResult.traceIndicatorIncrementer;
      }

      /****************************************************************************************
       * Collect vlan-interface data
       ****************************************************************************************/
      let vlanInterfaceResult = await ReadVlanInterfaceData.readVlanInterfaceData(mountName, ltpStructure, requestHeaders, traceIndicatorIncrementer)
        .catch(err => console.log(` ${err}`));

      if (Object.keys(vlanInterfaceResult.vlanInterface).length != 0) {
        acceptanceDataOfLinkEndPoint.vlanInterface = vlanInterfaceResult.vlanInterface;
      }
      traceIndicatorIncrementer = vlanInterfaceResult.traceIndicatorIncrementer;

      /****************************************************************************************
       * Collect inventory data
       ****************************************************************************************/
      let inventoryResult = await ReadInventoryData.readInventoryData(mountName, ltpStructure, uuidUnderTest, requestHeaders, traceIndicatorIncrementer)
        .catch(err => console.log(` ${err}`));

      if (Object.keys(inventoryResult.inventory).length != 0) {
        acceptanceDataOfLinkEndPoint.inventory = inventoryResult.inventory;
      }
      traceIndicatorIncrementer = inventoryResult.traceIndicatorIncrementer;

      /****************************************************************************************
       * Collect alarms data
       ****************************************************************************************/
      let alarmsResult = await ReadAlarmsData.readAlarmsData(mountName, requestHeaders, traceIndicatorIncrementer)
        .catch(err => console.log(` ${err}`));
      if (alarmsResult) {
        if (Object.keys(alarmsResult.alarms).length != 0) {
          if (alarmsResult.alarms) {
            acceptanceDataOfLinkEndPoint.alarms = alarmsResult.alarms;
          }
        }
        traceIndicatorIncrementer = alarmsResult.traceIndicatorIncrementer;
      }

      acceptanceDataOfLinkEndPoint = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(acceptanceDataOfLinkEndPoint);
      resolve(acceptanceDataOfLinkEndPoint);

    } catch (error) {
      console.log(error)
      reject(error);
    }

  });
}

/**
 * Provides the current alarms in a device for display at the section \"LiveView aktuell\" in LinkVis
 *
 * body V1_providealarmsforlivenetview_body
 * returns inline_response_200_4
 **/
exports.provideAlarmsForLiveNetView = function (body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function (resolve, reject) {
    try {
      let traceIndicatorIncrementer = 1;
      let mountName = body["mount-name"];
      const forwardingName = "RequestForProvidingAlarmsForLivenetviewCausesReadingCurrentAlarmsFromLive";
      const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
      let prefix = forwardingConstruct.uuid.split('op')[0];
      let maxNumberOfParallelOperations = await IndividualServiceUtility.extractProfileConfiguration(prefix + "integer-p-005");
      counterAlarms = counterAlarms + 1;
      if (counterAlarms > maxNumberOfParallelOperations) {
        throw new createHttpError.TooManyRequests("Too many requests");
      }

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

      let alarmsResult = await ReadLiveAlarmsData.readLiveAlarmsData(mountName, requestHeaders, traceIndicatorIncrementer)
        .catch(err => console.log(` ${err}`));
      if (alarmsResult) {
        if (Object.keys(alarmsResult.alarms).length != 0) {
          if (alarmsResult.alarms) {
            alarmsResult = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(alarmsResult);
            resolve(alarmsResult.alarms);
          }
        }
      } else {
        resolve();
      }
    }
    catch (error) {
      reject(error);
    }
    finally {
      counterAlarms--;
    }
  });
}

/*
 * Provides information about the radio component identifiers at the link endpoint for display at the section \"LiveView aktuell\" in LinkVis
 *
 * body V1_provideequipmentinfoforlivenetview_body
 * returns inline_response_200_2
 **/
exports.provideEquipmentInfoForLiveNetView = function (body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function (resolve, reject) {
    try {
      let traceIndicatorIncrementer = 1;
      let equipmentForLiveNetView = {};

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
      let ltpStructure = {};
      try {
        let ltpStructureResult = await ReadLtpStructure.readLtpStructure(mountName, requestHeaders, traceIndicatorIncrementer)
        ltpStructure = ltpStructureResult.ltpStructure;
        traceIndicatorIncrementer = ltpStructureResult.traceIndicatorIncrementer;
      } catch (err) {
        throw new createHttpError.InternalServerError(`${err}`)
      };


      /****************************************************************************************
       * Collect equipment data
       ****************************************************************************************/
      let equipmentResult = await ReadLiveEquipmentData.readLiveEquipmentData(mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer)
        .catch(err => console.log(` ${err}`));

      if (equipmentResult == undefined) {
        throw new createHttpError.NotFound("Empty Equiment not found");
      } else {
        resolve(equipmentResult);
      }

    } catch (error) {
      console.log(error)
      reject(error);
    }

  });
}

/**
 * Provides the historical performance data, together with some relevant configurations and capabilities, of air-interfaces and ethernet-containers found in the device
 *
 * body V1_providehistoricalpmdataofdevice_body 
 * returns inline_response_202_1
 **/
exports.provideHistoricalPmDataOfDevice = function (body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function (resolve, reject) {
    try {
      let historicalPmDataOfDevice = [];
      let traceIndicatorIncrementer = 1;

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

      const forwardingName = "RequestForProvidingConfigurationForLivenetviewCausesReadingLtpStructure";
      const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
      let prefix = forwardingConstruct.uuid.split('op')[0];
      let maxNumberOfParallelOperations = await IndividualServiceUtility.extractProfileConfiguration(prefix + "integer-p-001");
      counterStatusHistoricalPMDataCall = counterStatusHistoricalPMDataCall + 1;
      if (counterStatusHistoricalPMDataCall > maxNumberOfParallelOperations) {
        throw new createHttpError.TooManyRequests("Too many requests");
      }

      /****************************************************************************************
       * Loop through each request in the body array
       ****************************************************************************************/
      for(let i=0; i<body.length; i++){
              let mountName = body[i]["mount-name"]; 
              let timeStamp = body[i]["time-stamp"];

          /****************************************************************************************
           * Collect complete ltp structure of mount-name in request bodys
           ****************************************************************************************/
          let ltpStructure = {};
          try {
            let ltpStructureResult = await ReadLtpStructure.readLtpStructure(mountName, requestHeaders, traceIndicatorIncrementer)
            ltpStructure = ltpStructureResult.ltpStructure;
            traceIndicatorIncrementer = ltpStructureResult.traceIndicatorIncrementer;
          } catch (err) {
            throw new createHttpError.InternalServerError(`${err}`)
          };
          
          /****************************************************************************************
           * Collect history data
           ****************************************************************************************/
          
          let historicalDataResult = await ReadHistoricalData.readHistoricalData(mountName, timeStamp, ltpStructure, requestHeaders, traceIndicatorIncrementer)
            .catch(err => console.log(` ${err}`));

            historicalPmDataOfDevice["air-interface-list"].push(historicalDataResult["air-interface-list"]);
            historicalPmDataOfDevice["ethernet-container-list"].push(historicalDataResult["ethernet-container-list"]);
      }
      if (historicalPmDataOfDevice == undefined || historicalPmDataOfDevice === "[]" ) {
        throw new createHttpError.NotFound("Empty : data not found");
      } else {
        resolve(historicalPmDataOfDevice);
      }
    } catch (error) {
      console.log(error)
      reject(error);
    }finally {
      counterStatusHistoricalPMDataCall--;
    }
  });
}

/**
 * Provides information about the radio component identifiers at the link endpoint for display at the section \"LiveView aktuell\" in LinkVis
 *
 * body V1_providestatusforlivenetview_body
 * returns inline_response_200_3
 **/
exports.provideStatusForLiveNetView = function (body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function (resolve, reject) {
    try {
      let traceIndicatorIncrementer = 1;
      const forwardingName = "RequestForProvidingConfigurationForLivenetviewCausesReadingLtpStructure";
      const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
      let prefix = forwardingConstruct.uuid.split('op')[0];
      let maxNumberOfParallelOperations = await IndividualServiceUtility.extractProfileConfiguration(prefix + "integer-p-006");
      counterStatus = counterStatus + 1;
      if (counterStatus > maxNumberOfParallelOperations) {
        throw new createHttpError.TooManyRequests("Too many requests");
      }

      let statusForLiveNetView = {};

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
      let ltpStructure = {};
      try {
        let ltpStructureResult = await ReadLtpStructure.readLtpStructure(mountName, requestHeaders, traceIndicatorIncrementer)
        ltpStructure = ltpStructureResult.ltpStructure;
        traceIndicatorIncrementer = ltpStructureResult.traceIndicatorIncrementer;
      } catch (err) {
        throw new createHttpError.InternalServerError(`${err}`)
      };


      /****************************************************************************************
       * Collect status data
       ****************************************************************************************/
      let statusResult = await ReadLiveStatusData.readStatusInterfaceData(mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer)
        .catch(err => console.log(` ${err}`));

      let uuidUnderTest = "";
      if (statusResult) {
        if (statusResult.uuidUnderTest) {
          uuidUnderTest = statusResult.uuidUnderTest;
        }
        if (Object.keys(statusResult.airInterface).length != 0) {
          statusForLiveNetView.airInterface = statusResult.airInterface; //airInterfaceResult.airInterface;
        }
        traceIndicatorIncrementer = statusResult.traceIndicatorIncrementer; //airInterfaceResult.traceIndicatorIncrementer;
      }

      // let acceptanecstatusForLiveNetView = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(statusForLiveNetView.airInterface);
      if (statusForLiveNetView.airInterface == undefined) {
        throw new createHttpError.NotFound("Empty Equiment not found");
      } else {
        resolve(statusForLiveNetView.airInterface);
      }
    } catch (error) {
      console.log(error)
      reject(error);
    } finally {
      counterStatus--;
    }

  });
}

/**
 * Provides the configurations at link endpoint for display at the section \"LiveView aktuell\" in LinkVis
 *
 * body V1_provideconfigurationforlivenetview_body
 * returns inline_response_200_1
 **/
exports.provideConfigurationForLiveNetView = function (body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function (resolve, reject) {
    try {
      let configurationData = {};
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
      let ltpStructure = {};
      try {
        let ltpStructureResult = await ReadLtpStructure.readLtpStructure(mountName, requestHeaders, traceIndicatorIncrementer)
        ltpStructure = ltpStructureResult.ltpStructure;
        traceIndicatorIncrementer = ltpStructureResult.traceIndicatorIncrementer;
      } catch (err) {
        throw new createHttpError.InternalServerError(`${err}`)
      };

      /****************************************************************************************
       * Collect air-interface data
       ****************************************************************************************/
      let airInterfaceResult = await ReadConfigurationAirInterfaceData.readConfigurationAirInterfaceData(mountName, linkId, ltpStructure, requestHeaders, traceIndicatorIncrementer)
        .catch(err => console.log(` ${err}`));

      let uuidUnderTest = "";
      if (airInterfaceResult) {
        if (airInterfaceResult.uuidUnderTest) {
          uuidUnderTest = airInterfaceResult.uuidUnderTest;
        }
        if (Object.keys(airInterfaceResult.airInterface).length != 0) {
          configurationData.airInterface = airInterfaceResult.airInterface;
        }
        traceIndicatorIncrementer = airInterfaceResult.traceIndicatorIncrementer;
      }
      let airInterface = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(configurationData.airInterface);
      resolve(airInterface);

    } catch (error) {
      console.log(error)
      reject(error);
    }
  });
}

/**
 * Allows updating connection data of the AccessPlanningTool
 * 'Enables updating the TCP/IP addresses of existing APT-Interfaces. After successful execution of this service, a minimum time stated in [/core-model-1-4:control-construct/profile-collection/profile=aptp-1-1-0-integer-p-001/integer-profile-1-0:integer-profile-pac/integer-profile-configuration/integer-value] must elapse before a processing of this service is permitted again'
 *
 * body V1_updateaptclient_body
 * no response value expected for this operation
 **/
exports.updateAptClient = function(body) {
  return new Promise(async function (resolve, reject) {
    var result = {};
    try {
        let future_release_number = body["future-release-number"];
        let future_apt_protocol = body["future-apt-protocol"] ==="HTTP"  ? "tcp-client-interface-1-0:PROTOCOL_TYPE_HTTP" : "tcp-client-interface-1-0:PROTOCOL_TYPE_HTTPS";
        let future_apt_address = body["future-apt-address"];
        let future_apt_tcp_port = body["future-apt-tcp-port"];
        let future_acceptance_data_receive_operation = body["future-acceptance-data-receive-operation"];
        let future_performance_data_receive_operation = body["future-performance-data-receive-operation"];
        let coreModelJsonObject = undefined;
    		const forwardingName = "RequestForProvidingConfigurationForLivenetviewCausesReadingLtpStructure";
        const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
        let prefix = forwardingConstruct.uuid.split('op')[0];
        let minimumTime = await IndividualServiceUtility.extractProfileConfiguration(prefix + "integer-p-004");
        let currentTime = Date.now();
        minimumTime = minimumTime*60*60*1000;
        if (counterTime + minimumTime > currentTime) {
          throw new createHttpError.TooEarly("Too early");
        }

        
        try{
        coreModelJsonObject  = await fileOperation.readFromDatabaseAsync("");
        let uuidReleaseNumber = prefix + "http-c-apt-24-5-0-000";
        if(!await LogicalTerminationPointC.setLayerProtolReleaseNumberLtpAsync(uuidReleaseNumber,future_release_number)){
          throw new createHttpError.InternalServerError("Updation of Release Number Failed");
        }

        let uuidProtocolAddressPort = prefix + "tcp-c-apt-24-5-0-000";
        if(!await LogicalTerminationPointC.setLayerProtolRemoteProtocolLtpAsync(uuidProtocolAddressPort,future_apt_protocol)){
          throw new createHttpError.InternalServerError("Updation of Protocol Failed");
        }

        if(!await LogicalTerminationPointC.setLayerProtolRemotePortLtpAsync(uuidProtocolAddressPort,future_apt_tcp_port)){
          throw new createHttpError.InternalServerError("Updation of Remote Port Failed");
        }

        if(!await LogicalTerminationPointC.setLayerProtolRemoteAddressLtpAsync(uuidProtocolAddressPort,future_apt_address)){
          throw new createHttpError.InternalServerError("Updation of Remote Address Failed");
        }

        let uuidAcceptanceDataReceive = prefix + "op-c-is-apt-24-5-0-000";
        if(!await LogicalTerminationPointC.setLayerProtolOperationNameLtpAsync(uuidAcceptanceDataReceive,future_acceptance_data_receive_operation)){
          throw new createHttpError.InternalServerError("Updation of Operation Name Failed");
        }

        let uuidPerformanceDataReceive = prefix + "op-c-is-apt-24-5-0-001";
        if(!await LogicalTerminationPointC.setLayerProtolOperationNameLtpAsync(uuidPerformanceDataReceive,future_performance_data_receive_operation)){
          throw new createHttpError.InternalServerError("Updation of Operation Name Failed");
        }
      }
      catch(error){
        try{
          console.log(error);
          let originalFileRestored =  await IndividualServiceUtility.resetCompleteFile(coreModelJsonObject);
        }
        catch(error){
          console.log(error)
        }
        throw new createHttpError.InternalServerError("Internal Server Error");
      }
      counterTime = currentTime;
      resolve(result);

    } catch (error) {
      console.log(error)
      reject(error);
    }
  });
}
