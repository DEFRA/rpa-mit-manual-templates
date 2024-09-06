/* global it */

const { errorMessage } = require('../../app/backend/models/commonError')

describe('errorMessage', () => {
  it('should return a 500 response with an error message including error details', async () => {
    const mockResponse = jest.fn().mockReturnValue({
      code: jest.fn().mockReturnValue({
        statusCode: 500,
        payload: { message: 'An internal server error occurred. Please try again later. Error: Error: Test error' }
      })
    })

    const hMock = { response: mockResponse }

    const result = await errorMessage(new Error('Test error'), hMock)

    expect(mockResponse).toHaveBeenCalledWith({ message: 'An internal server error occurred. Please try again later. Error: Test error' })
    expect(mockResponse().code).toHaveBeenCalledWith(500)
    expect(result.statusCode).toBe(500)
    expect(result.payload).toEqual({ message: 'An internal server error occurred. Please try again later. Error: Error: Test error' })
  })
})
