const { getAllInvoices, createInvoice, createBulk, invoiceStore, invoiceSummary, modifyForSummaryBox, modifyInvoiceResponse, deleteInvoice, downloadFile, BulkDataUpload } = require('../../app/backend/models/invoiceModel')
const externalRequest = require('../../app/backend/custom_requests/externalRequests')
const commonModel = require('../../app/backend/models/commonModel')
const paymentModel = require('../../app/backend/models/paymentModel')
const constantModel = require('../../app/backend/app_constants/appConstant')
const Path = require('path')

jest.mock('../../app/backend/custom_requests/externalRequests')
jest.mock('../../app/backend/app_constants/appConstant')
jest.mock('../../app/backend/models/commonModel')
jest.mock('../../app/backend/models/paymentModel')

describe('Invoice Line Model Tests', () => {
  test('getAllInvoices should return formatted invoice list and messages', async () => {
    const mockInvoices = [{ id: '1' }, { id: '2' }]
    const mockFormattedInvoices = [{ head: 'Invoice Id', actions: [{ link: '/viewInvoice/1', name: 'View' }, { link: '/deleteInvoice/1', name: 'Delete' }], id: '1', rows: [] }, { head: 'Invoice Id', actions: [{ link: '/viewInvoice/2', name: 'View' }, { link: '/deleteInvoice/2', name: 'Delete' }], id: '2', rows: [] }]
    externalRequest.sendExternalRequestGet.mockResolvedValue({ invoices: mockInvoices })
    commonModel.modifyForSummary.mockReturnValue([])

    const request = {
      yar: {
        flash: jest.fn().mockReturnValue(null)
      }
    }

    const result = await getAllInvoices(request)

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(`${constantModel.requestHost}/invoices/getall`)
    expect(result).toEqual({
      pageTitle: constantModel.invoiceListTitle,
      invoices: mockFormattedInvoices,
      successMessage: null,
      userName: ''
    })
  })

  test('createInvoice should return invoice creation form data', async () => {
    const mockOptionsData = {
      referenceData: {
        accountCodes: [],
        initialDeliveryBodies: [],
        schemeInvoiceTemplates: [],
        schemeInvoiceTemplateSecondaryQuestions: [],
        paymentTypes: []
      }
    }
    externalRequest.sendExternalRequestGet.mockResolvedValue(mockOptionsData)
    commonModel.modifyResponseRadio.mockReturnValue([])

    const request = {}

    const result = await createInvoice(request)

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(`${constantModel.requestHost}/referencedata/getall`)
    expect(result).toEqual({
      pageTitle: constantModel.invoiceAddTitle,
      accountType: [],
      deliveryBody: [],
      invoiceTemplate: [],
      invoiceTemplateSecondary: [],
      paymentType: []
    })
  })

  test('createBulk should return bulk upload form data', async () => {
    const mockOptionsData = {
      referenceData: {
        accountCodes: [],
        initialDeliveryBodies: [],
        schemeInvoiceTemplates: []
      }
    }
    externalRequest.sendExternalRequestGet.mockResolvedValue(mockOptionsData)
    commonModel.modifyResponseRadio.mockReturnValue([])

    const request = {}

    const result = await createBulk(request)

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(`${constantModel.requestHost}/referencedata/getall`)
    expect(result).toEqual({
      pageTitle: constantModel.bulkUpload,
      accountType: [],
      deliveryBody: [],
      invoiceTemplate: []
    })
  })

  test('invoiceStore should store invoice and set flash message', async () => {
    const request = {
      payload: {
        accountType: 'type1',
        deliveryBody: 'body1',
        invoiceTemplate: 'template1',
        invoiceTemplateSecondary: 'secondary1',
        paymentType: 'payment1'
      },
      yar: {
        flash: jest.fn()
      }
    }

    await invoiceStore(request)

    expect(externalRequest.sendExternalRequestPost).toHaveBeenCalledWith(
            `${constantModel.requestHost}/invoices/add`,
            {
              AccountType: 'type1',
              DeliveryBody: 'body1',
              SchemeType: 'template1',
              SecondaryQuestion: undefined,
              PaymentType: 'payment1'
            }
    )
    expect(request.yar.flash).toHaveBeenCalledWith('successMessage', constantModel.invoiceCreationSuccess)
  })

  test('invoiceSummary should return invoice summary data', async () => {
    const mockInvoiceData = { id: '1', status: 'active', created: '2024-08-11' }
    const mockPayments = [{ id: 'payment1' }]
    const mockSummaryData = [{ name: 'Status', value: '<strong class="govuk-tag">ACTIVE</strong>' }]
    externalRequest.sendExternalRequestGet.mockResolvedValue({ invoice: mockInvoiceData })
    paymentModel.getAllPayments.mockResolvedValue(mockPayments)
    commonModel.modifyResponseSummary.mockReturnValue(mockSummaryData)
    commonModel.modifyResponseTable.mockReturnValue([])

    const request = {
      params: { id: '1' },
      yar: { flash: jest.fn().mockReturnValue(null) }
    }

    const result = await invoiceSummary(request)

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(`${constantModel.requestHost}/invoices/getbyid`, { invoiceId: '1' })
    expect(paymentModel.getAllPayments).toHaveBeenCalledWith('1')
    expect(result).toEqual({
      pageTitle: constantModel.invoiceSummaryTitle,
      summaryTable: [],
      summaryBox: {
        head: 'Invoice Id',
        actions: [],
        id: '1',
        rows: mockSummaryData
      },
      paymentLink: '/createPayment/1',
      total_requests: 1,
      summaryHeader: [
        { text: 'Account Type' },
        { text: 'Delivery Body' },
        { text: 'Scheme Type' },
        { text: 'Payment Type' }
      ],
      allPayments: mockPayments,
      successMessage: null
    })
  })

  test('modifyForSummaryBox should return formatted summary box data', async () => {
    const mockSummaryData = {
      status: 'active',
      created: '2024-08-11',
      invoiceRequests: [{ id: 'request1' }]
    }
    const mockFormattedData = [
      { name: 'Status', value: '<strong class="govuk-tag">ACTIVE</strong>' },
      { name: 'Created On', value: 'August 11, 2024' },
      { name: 'Number Of Invoice Requests', value: '1' }
    ]
    commonModel.formatTimestamp.mockReturnValue('August 11, 2024')
    commonModel.modifyResponseSummary.mockReturnValue(mockFormattedData)

    const result = await modifyForSummaryBox(mockSummaryData)

    expect(commonModel.formatTimestamp).toHaveBeenCalledWith('2024-08-11')
    expect(commonModel.modifyResponseSummary).toHaveBeenCalledWith([
      { name: 'Status', value: '<strong class="govuk-tag">ACTIVE</strong>' },
      { name: 'Created On', value: 'August 11, 2024' },
      { name: 'Number Of Invoice Requests', value: '1' }
    ])
    expect(result).toEqual(mockFormattedData)
  })

  test('modifyInvoiceResponse should format invoice response correctly', () => {
    const mockInvoiceList = [{ id: '1' }, { id: '2' }]
    const mockFormattedInvoices = [
      { head: 'Invoice Id', actions: [{ link: '/viewInvoice/1', name: 'View' }, { link: '/deleteInvoice/1', name: 'Delete' }], id: '1', rows: [] },
      { head: 'Invoice Id', actions: [{ link: '/viewInvoice/2', name: 'View' }, { link: '/deleteInvoice/2', name: 'Delete' }], id: '2', rows: [] }
    ]
    commonModel.modifyForSummary.mockReturnValue([])

    const result = modifyInvoiceResponse(mockInvoiceList)

    expect(result).toEqual(mockFormattedInvoices)
  })

  test('deleteInvoice should delete invoice and set flash message', async () => {
    const request = {
      params: { id: '1' },
      yar: {
        flash: jest.fn()
      }
    }

    await deleteInvoice(request)

    expect(externalRequest.sendExternalRequestDelete).toHaveBeenCalledWith(
            `${constantModel.requestHost}/invoices/delete`,
            { invoiceId: '1' }
    )
    expect(request.yar.flash).toHaveBeenCalledWith('successMessage', constantModel.invoiceDeletionSuccess)
  })

  test('BulkDataUpload should upload bulk data and set flash message', async () => {
    const request = {
      payload: {
        bulkData: JSON.stringify({
          bulkUploadInvoice: {
            id: '1'
          }
        })
      },
      yar: {
        flash: jest.fn()
      }
    }

    await BulkDataUpload(request)

    expect(externalRequest.sendExternalRequestPost).toHaveBeenCalledWith(
            `${constantModel.requestHost}/bulkuploads/confirm`,
            {
              invoiceId: '1',
              confirmUpload: true,
              confirm: true
            }
    )
    expect(request.yar.flash).toHaveBeenCalledWith('successMessage', constantModel.invoiceLineBulkUploadSuccess)
  })
})
