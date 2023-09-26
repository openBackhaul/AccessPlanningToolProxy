'use strict';


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
 * returns inline_response_200
 **/
exports.provideAcceptanceDataOfLinkEndpoint = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "air-interface" : {
    "configured-tx-power" : 10,
    "current-tx-power" : 5,
    "current-rx-level" : -45,
    "configured-tx-frequency" : 38822000,
    "configured-rx-frequency" : 37562000,
    "configured-transmitted-radio-signal-id" : {
      "alphanumeric-radio-signal-id" : "513250010-v-down",
      "numeric-radio-signal-id" : -1
    },
    "configured-expected-radio-signal-id" : {
      "alphanumeric-radio-signal-id" : "513250010-v-up",
      "numeric-radio-signal-id" : -1
    },
    "configured-atpc-is-on" : true,
    "configured-atpc-threshold-upper" : -40,
    "configured-atpc-threshold-lower" : -45,
    "configured-atpc-tx-power-min" : -10,
    "configured-adaptive-modulation-is-on" : true,
    "configured-modulation-minimum" : {
      "number-of-states" : 4,
      "name-at-lct" : "4QAM-Strong"
    },
    "configured-modulation-maximum" : {
      "number-of-states" : 2048,
      "name-at-lct" : "2048QAM"
    },
    "current-modulation" : {
      "number-of-states" : 2048,
      "name-at-lct" : "2048QAM"
    },
    "configured-channel-bandwidth-min" : 112,
    "configured-channel-bandwidth-max" : 112,
    "current-cross-polarization-discrimination" : -99,
    "configured-performance-monitoring-is-on" : true,
    "configured-xpic-is-on" : false,
    "current-signal-to-noise-ratio" : 38
  },
  "vlan-interface" : {
    "configured-lan-port-role-list" : [ {
      "interface-name" : "LAN 1/7/3",
      "vlan-interface-kind" : "vlan-interface-1-0:INTERFACE_KIND_TYPE_CUSTOMER_EDGE_PORT",
      "serving-ethernet-container-status" : "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP"
    }, {
      "interface-name" : "LAN 1/7/1",
      "vlan-interface-kind" : "vlan-interface-1-0:INTERFACE_KIND_TYPE_CUSTOMER_EDGE_PORT",
      "serving-ethernet-container-status" : "ethernet-container-2-0:INTERFACE_STATUS_TYPE_DOWN"
    } ],
    "configured-wan-port-role-list" : [ {
      "interface-name" : "WAN 1/7/100",
      "vlan-interface-kind" : "vlan-interface-1-0:INTERFACE_KIND_TYPE_PROVIDER_NETWORK_PORT",
      "serving-ethernet-container-status" : "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP"
    }, {
      "interface-name" : "WAN 1/7/200",
      "vlan-interface-kind" : "vlan-interface-1-0:INTERFACE_KIND_TYPE_PROVIDER_NETWORK_PORT",
      "serving-ethernet-container-status" : "ethernet-container-2-0:INTERFACE_STATUS_TYPE_DOWN"
    } ]
  },
  "inventory" : {
    "radio" : {
      "equipment-name" : "RAU2 X 23/79",
      "serial-number" : "A231067NG8",
      "part-number" : "UKL40163/79"
    },
    "modem" : {
      "equipment-name" : "MMU3 A",
      "serial-number" : "A2310FXGLF",
      "part-number" : "ROJ 208 1311/1"
    },
    "device" : {
      "equipment-name" : "ASNK-18G",
      "serial-number" : "101821827000420",
      "part-number" : "GE8704-52"
    },
    "installed-firmware" : [ {
      "firmware-component-name" : "IDU Board Bench 2",
      "firmware-component-version" : "N31030  01.12.04",
      "firmware-component-status" : "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_STAND_BY"
    }, {
      "firmware-component-name" : "Web Server LCT",
      "firmware-component-version" : "N96121  01.12.03",
      "firmware-component-status" : "firmware-1-0:FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE"
    } ],
    "configured-group-of-air-interfaces" : [ {
      "link-id" : "513550010"
    }, {
      "interface-name" : "SITE-LAN 1/7/2"
    } ],
    "plugged-sfp-pmd-list" : [ {
      "interface-name" : "LAN 1/3/3",
      "supported-pmd-list" : [ "1000BASE-LX-10-SM", "NOT_YET_DEFINED" ],
      "currently-operated-pmd" : "1000BASE-LX-10-SM"
    }, {
      "supported-pmd-list" : [ "NOT_YET_DEFINED" ],
      "currently-operated-pmd" : "NOT_YET_DEFINED"
    } ],
    "position-of-modem-board" : "Slot 1/5.1",
    "connector-plugging-the-outdoor-unit" : 1
  },
  "alarms" : {
    "current-alarms" : {
      "number-of-current-alarms" : 2,
      "current-alarm-list" : [ {
        "alarm-type-id" : "alarms-ext-ericsson-mltn:ALARM_TYPE_ID_LOF",
        "alarm-type-qualifier" : "",
        "alarm-severity" : "alarms-1-0:SEVERITY_TYPE_CRITICAL"
      }, {
        "alarm-type-id" : "alarms-ext-ericsson-mltn:ALARM_TYPE_ID_ETHERNET_DOWN",
        "alarm-type-qualifier" : "",
        "alarm-severity" : "alarms-1-0:SEVERITY_TYPE_CRITICAL"
      } ]
    }
  }
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

