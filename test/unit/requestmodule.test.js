const axios = require('axios')
const { sendExternalRequestGet, sendExternalRequestPost, sendExternalRequestPut, sendExternalRequestDelete } = require('../../app/backend/custom_requests/externalRequests')

jest.mock('axios')

describe('External Requests', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('sendExternalRequestGet should return data on success', async () => {
    const mockData = { message: 'Success' }
    axios.get.mockResolvedValue({ data: mockData })

    const url = 'https://dummyurl.com/get'
    const params = { key: 'value' }
    const headers = undefined

    const result = await sendExternalRequestGet(url, params, headers)

    expect(axios.get).toHaveBeenCalledWith(url, { params, headers, scopes: 'api://442bf74f-8332-4b81-9335-8d4d45b24eb6/referencedata.getall' })
    expect(result).toEqual(mockData)
  })

  test('sendExternalRequestGet should handle errors', async () => {
    const error = { response: { data: 'Error', status: 500, headers: {} } }
    axios.get.mockRejectedValue(error)

    const url = 'https://dummyurl.com/get'
    const params = { key: 'value' }
    const headers = undefined

    await expect(sendExternalRequestGet(url, params, headers)).rejects.toEqual(error)
  })

  test('sendExternalRequestPost should return data on success', async () => {
    const mockData = { message: 'Success' }
    axios.post.mockResolvedValue({ data: mockData })

    const url = 'https://dummyurl.com/post'
    const data = { key: 'value' }
    const headers = undefined

    const result = await sendExternalRequestPost(url, data, headers)

    expect(axios.post).toHaveBeenCalledWith(url, data, { headers })
    expect(result).toEqual(mockData)
  })

  test('sendExternalRequestPost should handle errors', async () => {
    const error = { response: { data: 'Error', status: 500, headers: {} } }
    axios.post.mockRejectedValue(error)

    const url = 'https://dummyurl.com/post'
    const data = { key: 'value' }
    const headers = undefined

    await expect(sendExternalRequestPost(url, data, headers)).rejects.toEqual(error)
  })

  test('sendExternalRequestPut should return data on success', async () => {
    const mockData = { message: 'Success' }
    axios.put.mockResolvedValue({ data: mockData })

    const url = 'https://dummyurl.com/put'
    const data = { key: 'value' }
    const headers = undefined

    const result = await sendExternalRequestPut(url, data, headers)

    expect(axios.put).toHaveBeenCalledWith(url, data, { headers })
    expect(result).toEqual(mockData)
  })

  test('sendExternalRequestPut should handle errors', async () => {
    const error = { response: { data: 'Error', status: 500, headers: {} } }
    axios.put.mockRejectedValue(error)

    const url = 'https://dummyurl.com/put'
    const data = { key: 'value' }
    const headers = undefined

    await expect(sendExternalRequestPut(url, data, headers)).rejects.toEqual(error)
  })

  test('sendExternalRequestDelete should return data on success', async () => {
    const mockData = { message: 'Success' }
    axios.delete.mockResolvedValue({ data: mockData })

    const url = 'https://dummyurl.com/delete'
    const data = { key: 'value' }
    const headers = undefined

    const result = await sendExternalRequestDelete(url, data, headers)

    expect(axios.delete).toHaveBeenCalledWith(url, { headers, data })
    expect(result).toEqual(mockData)
  })

  test('sendExternalRequestDelete should handle errors', async () => {
    const error = { response: { data: 'Error', status: 500, headers: {} } }
    axios.delete.mockRejectedValue(error)

    const url = 'https://dummyurl.com/delete'
    const data = { key: 'value' }
    const headers = undefined

    await expect(sendExternalRequestDelete(url, data, headers)).rejects.toEqual(error)
  })
})
