const { errorMessage } = require('../../app/backend/models/common_error');
const h = require('@hapi/hapi');

describe('errorMessage', () => {
  it('should return a 500 response with an error message', async () => {
    const mockResponse = jest.fn().mockReturnValue({
      code: jest.fn().mockReturnValue({
        statusCode: 500,
        payload: { message: 'An internal server error occurred. Please try again later.' },
      }),
    });

    const hMock = { response: mockResponse };
    
    const result = await errorMessage(new Error('Test error'), hMock);

    expect(mockResponse).toHaveBeenCalledWith({ message: 'An internal server error occurred. Please try again later.' });
    expect(mockResponse().code).toHaveBeenCalledWith(500);
    expect(result.statusCode).toBe(500);
    expect(result.payload).toEqual({ message: 'An internal server error occurred. Please try again later.' });
  });

  it('should handle errors thrown during response creation', async () => {
    const hMock = { response: () => { throw new Error('Response creation error'); } };

    const result = await errorMessage(new Error('Test error'), hMock);

    expect(result.message).toBe('Response creation error');
  });
});
