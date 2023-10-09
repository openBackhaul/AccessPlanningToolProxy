var traceIndicatorIncrementer = 1;
var mountName = "";
var linkId = "";
var ltpStructure = {};
var requestHeaders = {};

exports.readAirInterfaceData = function (_mountName, _linkId, _ltpStructure, _requestHeaders, _traceIndicatorIncrementer) {
  return new Promise(async function (resolve, reject) {
    try {
      traceIndicatorIncrementer = _traceIndicatorIncrementer;
      mountName = _mountName;
      linkId = _linkId;
      ltpStructure = _ltpStructure;
      requestHeaders = _requestHeaders;

      // code to be implemented


      let result = {
        uuidUnderTest: "",
        airInterface: {},
        traceIndicatorIncrementer: traceIndicatorIncrementer
      };

      resolve(result);

    } catch (error) {
      reject(error);
    }
  });
}