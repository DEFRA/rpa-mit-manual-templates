const {
  generateID,
  formatTimestamp,
  removeForSummaryTable,
  modifyResponseRadio,
  modifyResponseSelect,
  BulkLineData,
  BulkHeadData,
  modifyForSummary,
  modifyResponseSummary,
  modifyResponseTable,
  addForSummaryTableLineCSV,
  addForSummaryTableLineCSVTwo,
  processUploadedCSV
} = require('../../app/backend/models/commonModel')

const { sendExternalRequestPost } = require('../../app/backend/custom_requests/externalRequests')
const crypto = require('crypto')
const moment = require('moment')

jest.mock('crypto')
jest.mock('moment')
jest.mock('form-data')
jest.mock('../../app/backend/custom_requests/externalRequests')
jest.mock('csv-parse')
jest.mock('../../app/backend/app_constants/appConstant')

describe('Your Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('generateID should return a UUID string', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000'
    crypto.randomUUID.mockReturnValue(uuid)
    expect(generateID()).toBe(uuid)
  })

  test('formatTimestamp should format timestamp correctly', () => {
    const timestamp = '2024-08-10T15:30:00Z'
    const formattedTime = 'August 10th 2024, 3:30 pm'
    moment.mockReturnValue({ format: jest.fn().mockReturnValue(formattedTime) })
    expect(formatTimestamp(timestamp)).toBe(formattedTime)
  })

  test('removeForSummaryTable should return expected summary', () => {
    const summaryData = {
      accountType: 'Type1',
      deliveryBody: 'Body1',
      schemeType: 'Template1',
      paymentType: 'TypeA'
    }
    const result = removeForSummaryTable(summaryData)
    expect(result).toEqual({
      'Account Type': 'Type1',
      'Delivery Body': 'Body1',
      'Invoice Template': 'Template1',
      'Payment Type': 'TypeA'
    })
  })

  test('modify_Response_Radio should format response data correctly', () => {
    const respData = [{ code: 'code1', description: 'desc1' }]
    const selected = 'code1'
    const result = modifyResponseRadio(respData, selected)
    expect(result).toEqual([{ text: 'desc1', value: 'code1', checked: true }])
  })

  test('modify_Response_Select should format response data correctly', () => {
    const respData = [{ code: 'code1' }]
    const selected = 'code1'
    const result = modifyResponseSelect(respData, selected)
    expect(result).toEqual([{ text: 'CODE1', value: 'code1', selected: true }])
  })

  test('BulkLineData should return line details and table data', () => {
    const dataPack = [{/* data */}]
    const bulk = true
    const result = BulkLineData(dataPack, bulk)
    expect(result.lineDetail).toEqual([
      { text: 'Line Value' }, { text: 'Description' }, { text: 'Delivery Body' },
      { text: 'Fund Code' }, { text: 'Main Account' }, { text: 'Scheme Code' },
      { text: 'Marketing Year' }
    ])
    expect(result.lineTable).toBeDefined()
  })

  test('BulkHeadData should return correct header data', () => {
    const dataPack = { claimReference: 'ref1', claimReferenceNumber: 'ref2', paymentType: 'typeA', totalAmount: 100, description: 'desc1', frn: 'frn1', currency: 'USD', value: 200, invoiceRequestId: 'id1' }
    const result = BulkHeadData(dataPack, true)
    expect(result).toEqual({
      head: 'Request Id',
      actions: [],
      id: 'id1',
      rows: expect.any(Array)
    })
  })

  test('modifyForSummary should return modified summary data', () => {
    const invoice = {
      accountType: 'Type1',
      deliveryBody: 'Body1',
      schemeType: 'Template1',
      secondaryQuestion: 'Secondary',
      paymentType: 'TypeA'
    }
    const result = modifyForSummary(invoice)
    expect(result).toEqual(expect.any(Array))
  })

  test('modify_Response_Summary should format summary data correctly', () => {
    const items = [{ name: 'Account Type', value: 'Type1' }]
    const result = modifyResponseSummary(items)
    expect(result).toEqual([{
      key: { text: 'Account Type' },
      value: { html: 'Type1' },
      actions: { items: [] }
    }])
  })

  test('modify_Response_Table should format table data correctly', () => {
    const items = { key1: 'value1', key2: 'value2' }
    const result = modifyResponseTable(items)
    expect(result).toEqual([[
      { text: 'value1' },
      { text: 'value2' }
    ]])
  })

  test('addForSummaryTableLineCSV should format CSV table lines correctly', () => {
    const items = [{ claimReference: 'CR1', claimReferenceNumber: 'CRN1', paymentType: 'TypeA', totalAmount: 100, description: 'desc1' }]
    const result = addForSummaryTableLineCSV(items)
    expect(result).toEqual([[
      { text: 'CR1' }, { text: 'CRN1' }, { text: 'TypeA' },
      { text: 100 }, { text: 'desc1' }
    ]])
  })

  test('addForSummaryTableLineCSVTwo should format CSV table lines correctly', () => {
    const items = [{ value: 'V1', description: 'desc1', deliveryBodyCode: 'DB1', fundCode: 'FC1', mainAccount: 'MA1', schemeCode: 'SC1', marketingYear: '2024' }]
    const result = addForSummaryTableLineCSVTwo(items)
    expect(result).toEqual([[
      { text: 'V1' }, { text: 'desc1' }, { text: 'DB1' },
      { text: 'FC1' }, { text: 'MA1' }, { text: 'SC1' },
      { text: '2024' }
    ]])
  })

  test('processUploadedCSV should handle valid and invalid files', async () => {
    const file = { hapi: { filename: 'file.csv' } }
    const fileContent = { bulkUploadApDataset: 'data' }

    sendExternalRequestPost.mockResolvedValue(fileContent)
    const result = await processUploadedCSV(file)
    expect(result).toBe('data')

    file.hapi.filename = 'file.txt'
    const resultInvalid = await processUploadedCSV(file)
    expect(resultInvalid).toBeNull()
  })
})
