//const ReadLtpStructure = require('../ReadLtpStructure');
const { readLtpStructure } = require('../ReadLtpStructure'); // Adjust the path
 
const IndividualServiceUtility = require('../IndividualServiceUtility'); // Adjust path
const createHttpError = require('http-errors');
 
jest.mock('../IndividualServiceUtility');
 
describe('readLtpStructure', () => {
  const mountName = 'testMount';
  const requestHeaders = { user: 'testUser', originator: 'testOriginator' };
  let traceIndicatorIncrementer = 1;
 
  afterEach(() => {
    jest.clearAllMocks();
  });
 
  test('should successfully fetch and return LTP structure', async () => {
    const mockConsequentParams = { someKey: 'someValue' };
    const mockLtpStructure = { ltp: 'testLtpStructure' };
 
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue(mockConsequentParams);
    IndividualServiceUtility.forwardRequest.mockResolvedValue(mockLtpStructure);
 
    const result = await readLtpStructure(mountName, requestHeaders, traceIndicatorIncrementer);
 
    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalledWith(
      'RequestForProvidingAcceptanceDataCausesReadingLtpStructure',
      'RequestForProvidingAcceptanceDataCausesReadingLtpStructure.LtpStructure'
    );
 
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledWith(
      mockConsequentParams,
      [mountName],
      requestHeaders,
      traceIndicatorIncrementer
    );
 
    expect(result).toEqual({
      ltpStructure: mockLtpStructure,
      traceIndicatorIncrementer: traceIndicatorIncrementer + 1,
    });
  });
 
 test('should throw an error when LTP structure is empty', async () => {
    const mockConsequentParams = { someKey: 'someValue' };
 
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockResolvedValue(mockConsequentParams);
    IndividualServiceUtility.forwardRequest.mockResolvedValue({});
 
    await expect(
      readLtpStructure(mountName, requestHeaders, traceIndicatorIncrementer)
    ).rejects.toThrow(createHttpError.InternalServerError);
 
    expect(IndividualServiceUtility.forwardRequest).toHaveBeenCalledWith(
      mockConsequentParams,
      [mountName],
      requestHeaders,
      traceIndicatorIncrementer
    );
  });
 
  test('should throw an error when getConsequentOperationClientAndFieldParams fails', async () => {
    const mockError = new Error('Failed to get consequent params');
 
    IndividualServiceUtility.getConsequentOperationClientAndFieldParams.mockRejectedValue(mockError);
 
    await expect(
      readLtpStructure(mountName, requestHeaders, traceIndicatorIncrementer)
    ).rejects.toThrow(mockError);
 
    expect(IndividualServiceUtility.getConsequentOperationClientAndFieldParams).toHaveBeenCalledWith(
      'RequestForProvidingAcceptanceDataCausesReadingLtpStructure',
      'RequestForProvidingAcceptanceDataCausesReadingLtpStructure.LtpStructure'
    );
  });
});