exports.readInventoryData = function (mountName, ltpStructure, user, xCorrelator, traceIndicator, customerJourney, _traceIndicatorIncrementer) {
    return new Promise(async function (resolve, reject) {
      try {
        traceIndicatorIncrementer = _traceIndicatorIncrementer;
  
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