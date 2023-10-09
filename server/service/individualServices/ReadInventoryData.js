var traceIndicatorIncrementer = 1;
var mountName = "";
var ltpStructure = {};
var requestHeaders = {};

exports.readInventoryData = function (_mountName, _ltpStructure, _requestHeaders, _traceIndicatorIncrementer) {
    return new Promise(async function (resolve, reject) {
      try {
        traceIndicatorIncrementer = _traceIndicatorIncrementer;
        mountName = _mountName;
        ltpStructure = _ltpStructure;
        requestHeaders = _requestHeaders;
  
        // code to be implemented
  
  
        let result = {
          inventory: {},
          traceIndicatorIncrementer: traceIndicatorIncrementer
        };
  
        resolve(result);
  
      } catch (error) {
        reject(error);
      }
    });
  }