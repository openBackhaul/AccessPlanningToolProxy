var traceIndicatorIncrementer = 1;

exports.readAirInterfaceData = function (mountName, linkId, ltpStructure, user, xCorrelator, traceIndicator, customerJourney, _traceIndicatorIncrementer) {
  return new Promise(async function (resolve, reject) {
    try {
      traceIndicatorIncrementer = _traceIndicatorIncrementer;

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