const rewire = require('rewire');
const alarmsModuleRewire = rewire('../ReadAlarmsData');
const alarmsModule = require('../ReadAlarmsData');
const IndividualServiceUtility = require('../IndividualServiceUtility');

jest.mock('../IndividualServiceUtility', () => ({
  getConsequentOperationClientAndFieldParams: jest.fn(),
  forwardRequest: jest.fn(),
}));

describe('ReadAlarmsData', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('readAlarmsData', () => {
    let mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive;
    let mockFormulateResponseBodyForAlarms;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive = jest.fn();
      mockFormulateResponseBodyForAlarms = jest.fn();
  
      alarmsModuleRewire.__set__(
        'RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive',
        mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive
      );
      alarmsModuleRewire.__set__('formulateResponseBodyForAlarms', mockFormulateResponseBodyForAlarms);
    });
  
    it('should retrieve and format alarms data successfully', async () => {
      mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive.mockResolvedValue({
        alarmsFromLive: {
          'alarms-1-0:current-alarms': {
            'number-of-current-alarms': 2,
            'current-alarm-list': [
              { 'alarm-severity': 'critical', 'alarm-type-qualifier': 'hardware', 'alarm-type-id': '123' },
              { 'alarm-severity': 'major', 'alarm-type-qualifier': 'software', 'alarm-type-id': '456' },
            ],
          },
        },
        traceIndicatorIncrementer: 1,
      });
  
      mockFormulateResponseBodyForAlarms.mockResolvedValue({
        'current-alarms': {
          'number-of-current-alarms': 2,
          'current-alarm-list': [
            { 'alarm-severity': 'critical', 'alarm-type-qualifier': 'hardware', 'alarm-type-id': '123' },
            { 'alarm-severity': 'major', 'alarm-type-qualifier': 'software', 'alarm-type-id': '456' },
          ],
        },
      });
  
      const result = await alarmsModuleRewire.readAlarmsData('Device1', {}, 0);
  
      expect(mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive).toHaveBeenCalledWith(
        'Device1',
        {},
        0
      );
      expect(mockFormulateResponseBodyForAlarms).toHaveBeenCalledWith({
        'alarms-1-0:current-alarms': {
          'number-of-current-alarms': 2,
          'current-alarm-list': [
            { 'alarm-severity': 'critical', 'alarm-type-qualifier': 'hardware', 'alarm-type-id': '123' },
            { 'alarm-severity': 'major', 'alarm-type-qualifier': 'software', 'alarm-type-id': '456' },
          ],
        },
      });
      expect(result).toEqual({
        alarms: {
          'current-alarms': {
            'number-of-current-alarms': 2,
            'current-alarm-list': [
              { 'alarm-severity': 'critical', 'alarm-type-qualifier': 'hardware', 'alarm-type-id': '123' },
              { 'alarm-severity': 'major', 'alarm-type-qualifier': 'software', 'alarm-type-id': '456' },
            ],
          },
        },
        traceIndicatorIncrementer: 1,
      });
    });
  
    it('should handle empty alarms response gracefully', async () => {
      mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive.mockResolvedValue({
        alarmsFromLive: {},
        traceIndicatorIncrementer: 1,
      });
  
      const result = await alarmsModuleRewire.readAlarmsData('Device1', {}, 0);
  
      expect(mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive).toHaveBeenCalledWith(
        'Device1',
        {},
        0
      );
      expect(result).toEqual({
        alarms: {},
        traceIndicatorIncrementer: 1,
      });
    });    
  
    it('should handle no trace indicator increment', async () => {
      mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive.mockResolvedValue({
        alarmsFromLive: {
          'alarms-1-0:current-alarms': {
            'number-of-current-alarms': 0,
            'current-alarm-list': [],
          },
        },
        traceIndicatorIncrementer: 0,
      });
    
      mockFormulateResponseBodyForAlarms.mockResolvedValue({
        'current-alarms': {
          'number-of-current-alarms': 0,
          'current-alarm-list': [],
        },
      });
    
      const result = await alarmsModuleRewire.readAlarmsData('Device1', {}, 0);
    
      expect(result).toEqual({
        alarms: {
          'current-alarms': {
            'number-of-current-alarms': 0,
            'current-alarm-list': [],
          },
        },
        traceIndicatorIncrementer: 0,
      });
    });
    
    it('should handle invalid alarm structure in response', async () => {
      mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive.mockResolvedValue({
        alarmsFromLive: null,
        traceIndicatorIncrementer: 1,
      });
    
      const result = await alarmsModule.readAlarmsData('Device1', {}, 0);
    
      expect(result).toEqual({
        alarms: {},
        traceIndicatorIncrementer: 1,
      });
    });
  });
  
  describe("RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive", () => {
    afterEach(() => {
      jest.clearAllMocks();
    })
  
      it('should retrieve and format alarms data successfully', async () => {
        // Mock the utility functions
        IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
        IndividualServiceUtility.forwardRequest.mockResolvedValue({
          "alarms-1-0:current-alarms": {
            "number-of-current-alarms": 2,
            "current-alarm-list": [
              {
                "alarm-severity": "critical",
                "alarm-type-qualifier": "hardware",
                "alarm-type-id": "123",
              },
              {
                "alarm-severity": "major",
                "alarm-type-qualifier": "software",
                "alarm-type-id": "456",
              },
            ],
            "history-alarm-list": [
              {
                "alarm-severity": "critical",
                "alarm-type-qualifier": "hardware",
                "alarm-type-id": "123",
              },
              {
                "alarm-severity": "major",
                "alarm-type-qualifier": "software",
                "alarm-type-id": "456",
              },
            ]
          },
        });
  
        // Call the function
        const result = await alarmsModule.readAlarmsData('mountName', {}, 0);
  
        // Assertions
        expect(result).toEqual({
          alarms: {
            "current-alarms": {
              "number-of-current-alarms": 2,
              "current-alarm-list": [
                {
                  "alarm-severity": "critical",
                  "alarm-type-qualifier": "hardware",
                  "alarm-type-id": "123",
                },
                {
                  "alarm-severity": "major",
                  "alarm-type-qualifier": "software",
                  "alarm-type-id": "456",
                },
              ],
            },
          },
          traceIndicatorIncrementer: 1,
        });
      });
  
      it('should handle no alarms present', async () => {
        // Mock the utility functions to return no alarms
        IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
        IndividualServiceUtility.forwardRequest.mockResolvedValue({});
  
        // Call the function
        const result = await alarmsModule.readAlarmsData('mountName', {}, 0);
  
        // Assertions
        expect(result).toEqual({
          alarms: {},
          traceIndicatorIncrementer: 1,
        });
      });
  
      it('should handle errors gracefully', async () => {
        // Mock the utility function to throw an error
        IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
        IndividualServiceUtility.forwardRequest.mockRejectedValue(new Error('Test error'));
      
        // Spy on console.log to suppress error output during test
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
        // Call the function
        const result = await alarmsModule.readAlarmsData('mountName', {}, 0);
      
        // Assertions
        expect(result).toEqual({
          alarms: {},
          traceIndicatorIncrementer: 1, // Adjust this value based on your function's logic
        });
        expect(consoleSpy).toHaveBeenCalledWith('RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive is not success with Error: Test error');
      
        // Restore console.log
        consoleSpy.mockRestore();
      });  
      
      it('should handle valid response with complex alarm structure', async () => {
        // Mock valid response with multiple alarms
        IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
        IndividualServiceUtility.forwardRequest.mockResolvedValue({
          "alarms-1-0:current-alarms": {
            "number-of-current-alarms": 3,
            "current-alarm-list": [
              { "alarm-severity": "critical", "alarm-type-qualifier": "hardware", "alarm-type-id": "123" },
              { "alarm-severity": "major", "alarm-type-qualifier": "software", "alarm-type-id": "456" },
              { "alarm-severity": "minor", "alarm-type-qualifier": "network", "alarm-type-id": "789" },
            ],
          },
        });
      
        // Call the public function
        const result = await alarmsModule.readAlarmsData('Device1', {}, 0);
      
        // Assertions
        expect(result.alarms['current-alarms']['number-of-current-alarms']).toBe(3);
        expect(result.alarms['current-alarms']['current-alarm-list']).toEqual([
          { "alarm-severity": "critical", "alarm-type-qualifier": "hardware", "alarm-type-id": "123" },
          { "alarm-severity": "major", "alarm-type-qualifier": "software", "alarm-type-id": "456" },
          { "alarm-severity": "minor", "alarm-type-qualifier": "network", "alarm-type-id": "789" },
        ]);
        expect(result.traceIndicatorIncrementer).toBe(1);
      });
      
      it('should handle invalid response structure', async () => {
        // Mock invalid response (null or empty object)
        IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue({});
        IndividualServiceUtility.forwardRequest.mockResolvedValue(null);
      
        // Call the public function
        const result = await alarmsModule.readAlarmsData('Device1', {}, 0);
      
        // Assertions
        expect(result.alarms).toEqual({});
      });      
   });
  
   describe('formulateResponseBodyForAlarms', () => {
    let mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive;

    afterEach(() => {
      jest.clearAllMocks();
    });
  
    beforeEach(() => {
      mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive = async (mountName, requestHeaders, traceIndicatorIncrementer) => ({
        alarmsFromLive: {
          "alarms-1-0:current-alarms": {
            "number-of-current-alarms": 2,
            "current-alarm-list": [
              { "alarm-severity": "CRITICAL", "alarm-type-qualifier": "Type1", "alarm-type-id": "ID1" },
              { "alarm-severity": "MAJOR", "alarm-type-qualifier": "Type2", "alarm-type-id": "ID2" },
            ],
          },
        },
        traceIndicatorIncrementer: traceIndicatorIncrementer + 1,
      });
      alarmsModuleRewire.__set__(
        'RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive',
        mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive
      );
    });
  
    it('should handle an empty response gracefully', async () => {
      const mountName = 'Device1';
      const requestHeaders = {};
      const traceIndicatorIncrementer = 0;
  
      mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive = async () => ({});
      alarmsModuleRewire.__set__(
        'RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive',
        mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive
      );
  
      const result = await alarmsModuleRewire.readAlarmsData(mountName, requestHeaders, traceIndicatorIncrementer);
  
      expect(result.alarms).toEqual({});
      expect(result.traceIndicatorIncrementer).toBe(traceIndicatorIncrementer);
    });
  
    it('should return empty alarms when the response has no data structure', async () => {
      const mountName = 'Device1';
      const requestHeaders = {};
      const traceIndicatorIncrementer = 0;
  
      mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive = async (mountName, requestHeaders, traceIndicatorIncrementer) => ({
        alarmsFromLive: {},
        traceIndicatorIncrementer: traceIndicatorIncrementer+1,
      });
      alarmsModuleRewire.__set__(
        'RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive',
        mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive
      );
  
      const result = await alarmsModuleRewire.readAlarmsData(mountName, requestHeaders, traceIndicatorIncrementer);
  
      expect(result.alarms).toEqual({});
      expect(result.traceIndicatorIncrementer).toBe(traceIndicatorIncrementer+1);
    });
  
    it('should handle errors in RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive gracefully', async () => {
      mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive = async () => {
        throw new Error('Mocked error in fetching alarms');
      };
      alarmsModuleRewire.__set__(
        'RequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive',
        mockRequestForProvidingAcceptanceDataCausesReadingCurrentAlarmsFromLive
      );
  
      const mountName = 'Device1';
      const requestHeaders = {};
      const traceIndicatorIncrementer = 0;
  
      const result = await alarmsModuleRewire.readAlarmsData(mountName, requestHeaders, traceIndicatorIncrementer);
  
      expect(result).toBeUndefined(); // Expected undefined due to error handling
    });
  });
})