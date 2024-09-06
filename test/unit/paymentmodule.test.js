const {
  modifyForPaymentSummary,
  getTotalPayments,
  getAllPayments,
  createPayment,
  paymentStore,
  updatePayment,
  viewPayment,
  deletePayment
} = require('../../app/backend/models/paymentModel')

const externalRequest = require('../../app/backend/custom_requests/externalRequests')
const constantModel = require('../../app/backend/app_constants/appConstant')
const commonModel = require('../../app/backend/models/commonModel')
jest.mock('../../app/backend/custom_requests/externalRequests')
jest.mock('../../app/backend/app_constants/appConstant')
jest.mock('../../app/backend/models/commonModel')

describe('Payment Model Tests', () => {
  test('modifyForPaymentSummary should format payment summary data', () => {
    const mockPayment = {
      frn: 'FRN123',
      currency: 'USD',
      description: 'Payment for services',
      value: 1000
    }
    const mockFormattedData = [
      { name: 'FRN', value: 'FRN123' },
      { name: 'Currency', value: 'USD' },
      { name: 'Description', value: 'Payment for services' },
      { name: 'Value', value: '1000' }
    ]
    commonModel.modifyResponseSummary.mockReturnValue(mockFormattedData)

    const result = modifyForPaymentSummary(mockPayment)

    expect(commonModel.modifyResponseSummary).toHaveBeenCalledWith([
      { name: 'FRN', value: 'FRN123' },
      { name: 'Currency', value: 'USD' },
      { name: 'Description', value: 'Payment for services' },
      { name: 'Value', value: '1000' }
    ])
    expect(result).toEqual(mockFormattedData)
  })

  test('getTotalPayments should return total number of payments', async () => {
    const mockTotalPayments = { invoiceRequests: [{}, {}] }
    externalRequest.sendExternalRequestGet.mockResolvedValue(mockTotalPayments)

    const result = await getTotalPayments('invoiceID')

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constantModel.requestHost}/invoicerequests/getbyinvoiceid`,
            { invoiceId: 'invoiceID' }
    )
    expect(result).toBe(2)
  })

  test('getAllPayments should return formatted list of payments', async () => {
    const mockPayments = [{ invoiceRequestId: '1', invoiceId: '2' }]
    const mockFormattedPayments = [{
      head: 'Invoice Request Id',
      actions: [
        { link: '/viewPayment/1/2', name: 'View' },
        { link: '/viewPaymentLine/1', name: 'Detail Line' },
        { link: '/deletePayment/1/2', name: 'Delete' }
      ],
      id: '1',
      rows: []
    }]
    externalRequest.sendExternalRequestGet.mockResolvedValue({ invoiceRequests: mockPayments })
    commonModel.modifyResponseSummary.mockReturnValue([])

    const result = await getAllPayments('invoiceID')

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constantModel.requestHost}/invoicerequests/getbyinvoiceid`,
            { invoiceId: 'invoiceID' }
    )
    expect(result).toEqual(mockFormattedPayments)
  })

  test('createPayment should return payment creation data', async () => {
    const mockOptionsData = {
      referenceData: {
        paymentTypes: []
      }
    }
    const mockInvoiceData = {
      summaryTable: undefined,
      summaryHeader: [
        { text: 'Account Type' },
        { text: 'Delivery Body' },
        { text: 'Scheme Type' },
        { text: 'Payment Type' }
      ]
    }
    externalRequest.sendExternalRequestGet
      .mockResolvedValueOnce(mockOptionsData)
      .mockResolvedValueOnce(mockInvoiceData)
    commonModel.modifyResponseSelect.mockReturnValue([])

    const request = { params: { id: 'invoiceID' } }

    const result = await createPayment(request)

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constantModel.requestHost}/referencedata/getall`
    )
    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constantModel.requestHost}/invoices/getbyid`,
            { invoiceId: 'invoiceID' }
    )
    expect(result).toEqual({
      pageTitle: constantModel.paymentAddTitle,
      paymentType: [],
      ...mockInvoiceData,
      invoiceId: 'invoiceID',
      frn: '',
      sbi: '',
      vendor: '',
      description: '',
      claimreferencenumber: '',
      claimreference: '',
      disableditem: false,
      attributesitem: {},
      view_type: 'create'
    })
  })

  test('updatePayment should return payment update data', async () => {
    const mockOptionsData = {
      referenceData: {
        paymentTypes: []
      }
    }
    const mockPaymentData = {
      invoiceRequest: {
        frn: 'FRN123',
        sbi: 'SBI123',
        vendor: 'VendorName',
        description: 'Payment description',
        claimReferenceNumber: 'ClaimRef123',
        claimReference: 'ClaimRef'
      }
    }
    const mockInvoiceData = {
      summaryTable: undefined,
      summaryHeader: [
        { text: 'Account Type' },
        { text: 'Delivery Body' },
        { text: 'Scheme Type' },
        { text: 'Payment Type' }
      ]
    }
    externalRequest.sendExternalRequestGet
      .mockResolvedValueOnce(mockOptionsData)
      .mockResolvedValueOnce(mockPaymentData)
      .mockResolvedValueOnce(mockInvoiceData)
    commonModel.modifyResponseSelect.mockReturnValue([])

    const request = { params: { id: 'paymentID', invoiceid: 'invoiceID' } }

    const result = await updatePayment(request)

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constantModel.requestHost}/referencedata/getall`
    )
    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constantModel.requestHost}/invoicerequests/getbyid`,
            { invoiceRequestId: 'paymentID' }
    )
    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constantModel.requestHost}/invoices/getbyid`,
            { invoiceId: 'invoiceID' }
    )
    expect(result).toEqual({
      pageTitle: constantModel.paymentEditTitle,
      paymentType: [],
      ...mockInvoiceData,
      invoiceId: 'invoiceID',
      frn: 'FRN123',
      sbi: 'SBI123',
      vendor: 'VendorName',
      description: 'Payment description',
      claimreferencenumber: 'ClaimRef123',
      claimreference: 'ClaimRef',
      disableditem: false,
      paymentId: 'paymentID',
      attributesitem: {},
      view_type: 'edit'
    })
  })

  test('viewPayment should return payment view data', async () => {
    const mockOptionsData = {
      referenceData: {
        paymentTypes: []
      }
    }
    const mockPaymentData = {
      invoiceRequest: {
        frn: 'FRN123',
        sbi: 'SBI123',
        vendor: 'VendorName',
        description: 'Payment description',
        claimReferenceNumber: 'ClaimRef123',
        claimReference: 'ClaimRef'
      }
    }
    const mockInvoiceData = {
      summaryTable: undefined,
      summaryHeader: [
        { text: 'Account Type' },
        { text: 'Delivery Body' },
        { text: 'Scheme Type' },
        { text: 'Payment Type' }
      ]
    }
    externalRequest.sendExternalRequestGet
      .mockResolvedValueOnce(mockOptionsData)
      .mockResolvedValueOnce(mockPaymentData)
      .mockResolvedValueOnce(mockInvoiceData)
    commonModel.modifyResponseSelect.mockReturnValue([])

    const request = { params: { id: 'paymentID', invoiceid: 'invoiceID' } }

    const result = await viewPayment(request)

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constantModel.requestHost}/referencedata/getall`
    )
    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constantModel.requestHost}/invoicerequests/getbyid`,
            { invoiceRequestId: 'paymentID' }
    )
    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constantModel.requestHost}/invoices/getbyid`,
            { invoiceId: 'invoiceID' }
    )
    expect(result).toEqual({
      pageTitle: constantModel.paymentViewTitle,
      paymentType: [],
      ...mockInvoiceData,
      invoiceId: 'invoiceID',
      frn: 'FRN123',
      sbi: 'SBI123',
      vendor: 'VendorName',
      description: 'Payment description',
      claimreferencenumber: 'ClaimRef123',
      claimreference: 'ClaimRef',
      disableditem: true,
      attributesitem: { readonly: 'readonly' },
      view_type: 'view'
    })
  })

  test('paymentStore should store payment and set flash message', async () => {
    const request = {
      payload: {
        frn: 'FRN123',
        sbi: 'SBI123',
        vendor: 'VendorName',
        currency: 'USD',
        description: 'Payment description',
        payment_id: 'paymentID',
        inv_id: 'invoiceID',
        claimreference: 'ClaimRef',
        claimreferencenumber: 'ClaimRef123'
      },
      yar: {
        flash: jest.fn()
      }
    }

    const mockSendExternalRequest = jest.fn()
    externalRequest.sendExternalRequestPut = mockSendExternalRequest
    externalRequest.sendExternalRequestPost = mockSendExternalRequest

    await paymentStore(request)

    const expectedUrl = `${constantModel.requestHost}/invoicerequests/${request.payload.payment_id ? 'add' : 'add'}`
    const expectedPayload = {
      FRN: 'FRN123',
      SBI: 'SBI123',
      Vendor: 'VendorName',
      Currency: 'USD',
      Description: 'Payment description',
      InvoiceId: 'invoiceID',
      ClaimReference: 'ClaimRef',
      ClaimReferenceNumber: 'ClaimRef123',
      AgreementNumber: '',
      MarketingYear: '',
      AccountType: ''
    }

    expect(mockSendExternalRequest).toHaveBeenCalledWith(expectedUrl, expectedPayload)

    expect(request.yar.flash).toHaveBeenCalledWith(
      'successMessage',
      request.payload.payment_id ? constantModel.paymentCreationSuccess : constantModel.paymentCreationSuccess
    )
  })

  test('deletePayment should delete a payment and set flash message', async () => {
    const request = {
      params: {
        id: 'paymentID',
        invoiceid: 'invoiceID'
      },
      yar: {
        flash: jest.fn()
      }
    }

    await deletePayment(request)

    expect(externalRequest.sendExternalRequestDelete).toHaveBeenCalledWith(
            `${constantModel.requestHost}/invoicerequests/delete`,
            {
              invoiceRequestId: 'paymentID'
            }
    )
    expect(request.yar.flash).toHaveBeenCalledWith(
      'successMessage',
      constantModel.paymentDeletionSuccess
    )
  })
})
