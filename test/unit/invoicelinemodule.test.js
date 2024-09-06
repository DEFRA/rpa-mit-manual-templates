const { getTotalInvoiceLines, modifyPaymentResponse, deleteInvoiceLine, getAllInvoiceLines, viewInvoiceLine, createInvoiceLine, updateInvoiceLine, invoiceLineStore } = require('../../app/backend/models/invoiceLineModel')
const externalRequest = require('../../app/backend/custom_requests/externalRequests')
const constantModel = require('../../app/backend/app_constants/appConstant')
const commonModel = require('../../app/backend/models/commonModel')

jest.mock('../../app/backend/custom_requests/externalRequests')
jest.mock('../../app/backend/app_constants/appConstant')
jest.mock('../../app/backend/models/commonModel')

describe('Invoice Line Management', () => {
  const mockRequest = (params = {}, payload = {}) => ({
    params,
    payload,
    yar: {
      flash: jest.fn()
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('getTotalInvoiceLines should return the correct number of lines', async () => {
    const mockData = { invoiceLines: [{}, {}] }
    externalRequest.sendExternalRequestGet.mockResolvedValue(mockData)

    const id = '123'
    const result = await getTotalInvoiceLines(id)

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(`${constantModel.requestHost}/invoicelines/getbyinvoicerequestid`, { invoiceRequestId: id })
    expect(result).toBe(2)
  })

  test('deleteInvoiceLine should delete a line and flash a success message', async () => {
    const request = mockRequest({ id: '1', invoiceid: '123' })
    externalRequest.sendExternalRequestDelete.mockResolvedValue({})

    await deleteInvoiceLine(request)

    expect(externalRequest.sendExternalRequestDelete).toHaveBeenCalledWith(`${constantModel.requestHost}/invoicelines/delete`, { invoiceLineId: '1' })
    expect(request.yar.flash).toHaveBeenCalledWith('successMessage', constantModel.invoiceLineDeletionSuccess)
    expect(request.yar.flash).toHaveBeenCalledWith('successMessage', 'Invoice Line Deleted Successfully')
  })

  test('getAllInvoiceLines should return formatted invoice lines and messages', async () => {
    const mockData = { invoiceLines: [{}] }
    const mockPayment = {
      head: 'Invoice Request Id',
      actions: [{ link: '/editPayment/undefined/undefined', name: 'Edit' }],
      id: undefined,
      rows: undefined
    }

    externalRequest.sendExternalRequestGet.mockResolvedValueOnce(mockData)
    commonModel.addForSummaryTableLine.mockReturnValue([])

    const request = mockRequest({ id: '_NLXI8VL7' })

    const result = await getAllInvoiceLines(request)

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(`${constantModel.requestHost}/invoicelines/getbyinvoicerequestid`, { invoiceRequestId: '_NLXI8VL7' })
    expect(commonModel.addForSummaryTableLine).toHaveBeenCalledWith(mockData.invoiceLines)

    const paymentResponse = await modifyPaymentResponse('_NLXI8VL7', true)
    expect(paymentResponse).toEqual(mockPayment)

    expect(result).toEqual({
      pageTitle: constantModel.invoiceLineSummaryTitle,
      paymentId: '_NLXI8VL7',
      lineLink: '/createInvoiceLine/_NLXI8VL7',
      summaryTable: [],
      summaryHeader: [
        { text: 'Fund Code' }, { text: 'Main Account' }, { text: 'Scheme Code' }, { text: 'Marketing Year' },
        { text: 'Delivery Body' }, { text: 'Line Value' }, { text: 'Description' }, { text: 'Action' }
      ],
      successMessage: undefined,
      errorMessage: undefined,
      summaryPayment: mockPayment
    })
  })

  test('viewInvoiceLine should return invoice line details', async () => {
    const mockData = {
      invoiceLine: {
        invoiceRequestId: '123',
        value: '100',
        description: 'desc',
        fundCode: 'fund1',
        mainAccount: 'acc1',
        schemeCode: 'scheme1',
        marketingYear: '2024',
        deliveryBody: 'body1'
      }
    }
    const mockOptionsData = { referenceData: {} }
    externalRequest.sendExternalRequestGet.mockImplementation((url) => {
      if (url.includes('/referencedata/getall')) return mockOptionsData
      return mockData
    })

    const request = mockRequest({ id: '1' })
    commonModel.modifyResponseSelect.mockImplementation((data, value) => value)

    const result = await viewInvoiceLine(request)

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(`${constantModel.requestHost}/referencedata/getall`)
    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(`${constantModel.requestHost}/invoicelines/getbyinvoicelineid`, { invoiceLineId: '1' })
    expect(result).toEqual({
      pageTitle: constantModel.invoiceLineViewTitle,
      summaryPayment: { head: 'Invoice Request Id', actions: [], id: undefined, rows: undefined },
      paymentId: '123',
      line_id: '1',
      paymentvalue: '100',
      description: 'desc',
      fundcode: 'fund1',
      mainaccount: 'acc1',
      schemecode: 'scheme1',
      marketingyear: '2024',
      deliverybody: 'body1',
      disableditem: true,
      attributesitem: { readonly: 'readonly' },
      view_type: 'view'
    })
  })

  test('createInvoiceLine should return initial values for creating a new line', async () => {
    const mockOptionsData = { referenceData: {} }
    externalRequest.sendExternalRequestGet.mockResolvedValue(mockOptionsData)
    const mockPayment = { head: 'Invoice Request Id', actions: [], id: undefined, rows: undefined }
    const paymentResponse = await modifyPaymentResponse('_NLXI8VL7', false)

    const request = mockRequest({ id: '123' })

    const result = await createInvoiceLine(request)

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(`${constantModel.requestHost}/referencedata/getall`)
    expect(paymentResponse).toEqual(mockPayment)
    expect(result).toEqual({
      pageTitle: constantModel.invoiceLineAddTitle,
      summaryPayment: mockPayment,
      paymentId: '123',
      paymentvalue: '0.00',
      description: undefined,
      fundcode: undefined,
      mainaccount: undefined,
      schemecode: undefined,
      marketingyear: undefined,
      deliverybody: undefined,
      disableditem: false,
      attributesitem: {},
      view_type: 'create'
    })
  })

  test('updateInvoiceLine should return updated values for an existing line', async () => {
    const mockData = {
      invoiceLine: {
        invoiceRequestId: '123',
        value: '100',
        description: 'desc',
        fundCode: 'fund1',
        mainAccount: 'acc1',
        schemeCode: 'scheme1',
        marketingYear: '2024',
        deliveryBody: 'body1'
      }
    }
    const mockOptionsData = { referenceData: {} }
    externalRequest.sendExternalRequestGet.mockImplementation((url) => {
      if (url.includes('/referencedata/getall')) return mockOptionsData
      return mockData
    })
    const mockPayment = { head: 'Invoice Request Id', actions: [], id: undefined, rows: undefined }
    const paymentResponse = await modifyPaymentResponse('_NLXI8VL7', false)
    expect(paymentResponse).toEqual(mockPayment)

    const request = mockRequest({ id: '1' })

    const result = await updateInvoiceLine(request)

    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(`${constantModel.requestHost}/referencedata/getall`)
    expect(externalRequest.sendExternalRequestGet).toHaveBeenCalledWith(`${constantModel.requestHost}/invoicelines/getbyinvoicelineid`, { invoiceLineId: '1' })
    expect(result).toEqual({
      pageTitle: constantModel.invoiceLineEditTitle,
      summaryPayment: mockPayment,
      paymentId: '123',
      line_id: '1',
      paymentvalue: '100',
      description: undefined,
      fundcode: undefined,
      mainaccount: undefined,
      schemecode: undefined,
      marketingyear: undefined,
      deliverybody: undefined,
      disableditem: false,
      attributesitem: {},
      view_type: 'edit'
    })
  })

  test('invoiceLineStore should handle creating and updating invoice lines', async () => {
    const mockPayload = {
      line_id: '1',
      paymentvalue: '200',
      paymentId: '123',
      description: 'desc',
      fundcode: 'fund1',
      mainaccount: 'acc1',
      schemecode: 'scheme1',
      marketingyear: '2024',
      deliverybody: 'body1'
    }

    const requestUpdate = mockRequest({}, mockPayload)
    externalRequest.sendExternalRequestPut.mockResolvedValue({})
    await invoiceLineStore(requestUpdate)
    expect(externalRequest.sendExternalRequestPut).toHaveBeenCalledWith(`${constantModel.requestHost}/invoicelines/update`, {
      Value: '200',
      InvoiceRequestId: '123',
      Description: 'desc',
      FundCode: 'fund1',
      MainAccount: 'acc1',
      SchemeCode: 'scheme1',
      MarketingYear: '2024',
      DeliveryBody: 'body1',
      Id: '1'
    })
    expect(requestUpdate.yar.flash).toHaveBeenCalledWith('successMessage', constantModel.invoiceLineUpdateSuccess)

    const requestCreate = mockRequest({}, { ...mockPayload, line_id: undefined })
    externalRequest.sendExternalRequestPost.mockResolvedValue({})
    await invoiceLineStore(requestCreate)
    expect(externalRequest.sendExternalRequestPost).toHaveBeenCalledWith(`${constantModel.requestHost}/invoicelines/add`, {
      Value: '200',
      InvoiceRequestId: '123',
      Description: 'desc',
      FundCode: 'fund1',
      MainAccount: 'acc1',
      SchemeCode: 'scheme1',
      MarketingYear: '2024',
      DeliveryBody: 'body1'
    })
    expect(requestCreate.yar.flash).toHaveBeenCalledWith('successMessage', constantModel.invoiceLineCreationSuccess)
  })
})
