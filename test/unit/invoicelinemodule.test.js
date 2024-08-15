const { getTotalInvoiceLines, modifyPaymentResponse, deleteInvoiceLine, getAllInvoiceLines, viewInvoiceLine, createInvoiceLine, updateInvoiceLine, invoiceLineStore } = require('../../app/backend/models/invoice_line_model');
const external_request = require('../../app/backend/custom_requests/external_requests');
const constant_model = require('../../app/backend/app_constants/app_constant');
const common_model = require('../../app/backend/models/common_model');
const payment_model = require('../../app/backend/models/payment_model');

jest.mock('../../app/backend/custom_requests/external_requests');
jest.mock('../../app/backend/app_constants/app_constant');
jest.mock('../../app/backend/models/common_model');

describe('Invoice Line Management', () => {
  const mockRequest = (params = {}, payload = {}) => ({
    params: params,
    payload: payload,
    yar: {
      flash: jest.fn()
    }
  });

  const mockResponse = (data) => ({
    data: data
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('getTotalInvoiceLines should return the correct number of lines', async () => {
    const mockData = { invoiceLines: [{}, {}] };
    external_request.sendExternalRequestGet.mockResolvedValue(mockData);

    const id = '123';
    const result = await getTotalInvoiceLines(id);

    expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(`${constant_model.request_host}/invoicelines/getbyinvoicerequestid`, { invoiceRequestId: id });
    expect(result).toBe(2);
  });

  test('deleteInvoiceLine should delete a line and flash a success message', async () => {
    const request = mockRequest({ id: '1', invoiceid: '123' });
    external_request.sendExternalRequestDelete.mockResolvedValue({});

    await deleteInvoiceLine(request);

    expect(external_request.sendExternalRequestDelete).toHaveBeenCalledWith(`${constant_model.request_host}/invoicelines/delete`, { invoiceLineId: '1' });
    expect(request.yar.flash).toHaveBeenCalledWith('success_message', constant_model.invoiceline_deletion_success);
    expect(request.yar.flash).toHaveBeenCalledWith('success_message', 'Invoice Line Deleted Successfully');
  });

  test('getAllInvoiceLines should return formatted invoice lines and messages', async () => {
    const mockData = { invoiceLines: [{}] };
    const mockPayment = {
        head: 'Invoice Request Id',
        actions: [{ link: '/editPayment/undefined/undefined', name: 'Edit' }],
        id: undefined,
        rows: undefined 
    };

    external_request.sendExternalRequestGet.mockResolvedValueOnce(mockData);
    common_model.addForSummaryTableLine.mockReturnValue([]);

    const request = mockRequest({ id: '_NLXI8VL7' });

    const result = await getAllInvoiceLines(request);

    expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(`${constant_model.request_host}/invoicelines/getbyinvoicerequestid`, { invoiceRequestId: '_NLXI8VL7' });
    expect(common_model.addForSummaryTableLine).toHaveBeenCalledWith(mockData.invoiceLines);

    const paymentResponse = await modifyPaymentResponse('_NLXI8VL7', true);
    expect(paymentResponse).toEqual(mockPayment);

    expect(result).toEqual({
        pageTitle: constant_model.invoiceline_summary_title,
        payment_id: '_NLXI8VL7',
        lineLink: `/createInvoiceLine/_NLXI8VL7`,
        summaryTable: [],
        summaryHeader: [
            { text: "Fund Code" }, { text: "Main Account" }, { text: "Scheme Code" }, { text: "Marketing Year" },
            { text: "Delivery Body" }, { text: "Line Value" }, { text: "Description" }, { text: "Action" }
        ],
        success_message: undefined,
        error_message: undefined,
        summaryPayment:mockPayment
    });
  });


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
    };
    const mockOptionsData = { referenceData: {} };
    external_request.sendExternalRequestGet.mockImplementation((url) => {
      if (url.includes('/referencedata/getall')) return mockOptionsData;
      return mockData;
    });

    const request = mockRequest({ id: '1' });
    common_model.modify_Response_Select.mockImplementation((data, value) => value);

    const result = await viewInvoiceLine(request);

    expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(`${constant_model.request_host}/referencedata/getall`);
    expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(`${constant_model.request_host}/invoicelines/getbyinvoicelineid`, { invoiceLineId: '1' });
    expect(result).toEqual({
      pageTitle: constant_model.invoiceline_view_title,
      summaryPayment: { head: 'Invoice Request Id', actions: [], id: undefined, rows: undefined},
      payment_id: '123',
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
    });
  });

  test('createInvoiceLine should return initial values for creating a new line', async () => {
    const mockOptionsData = { referenceData: {} };
    external_request.sendExternalRequestGet.mockResolvedValue(mockOptionsData);
    const mockPayment = { head: 'Invoice Request Id', actions: [], id: undefined, rows: undefined };
    const paymentResponse = await modifyPaymentResponse('_NLXI8VL7', false);

    const request = mockRequest({ id: '123' });

    const result = await createInvoiceLine(request);

    expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(`${constant_model.request_host}/referencedata/getall`);
    expect(paymentResponse).toEqual(mockPayment);
    expect(result).toEqual({
      pageTitle: constant_model.invoiceline_add_title,
      summaryPayment: mockPayment,
      payment_id: '123',
      paymentvalue: '0.00',
      description: undefined,
      fundcode: undefined,
      mainaccount:undefined,
      schemecode: undefined,
      marketingyear: undefined,
      deliverybody: undefined,
      disableditem: false,
      attributesitem: {},
      view_type: 'create'
    });
  });

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
    };
    const mockOptionsData = { referenceData: {} };
    external_request.sendExternalRequestGet.mockImplementation((url) => {
      if (url.includes('/referencedata/getall')) return mockOptionsData;
      return mockData;
    });
    const mockPayment = { head: 'Invoice Request Id', actions: [], id: undefined, rows: undefined };
    const paymentResponse = await modifyPaymentResponse('_NLXI8VL7', false);
    expect(paymentResponse).toEqual(mockPayment);

    const request = mockRequest({ id: '1' });

    const result = await updateInvoiceLine(request);

    expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(`${constant_model.request_host}/referencedata/getall`);
    expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(`${constant_model.request_host}/invoicelines/getbyinvoicelineid`, { invoiceLineId: '1' });
    expect(result).toEqual({
      pageTitle: constant_model.invoiceline_edit_title,
      summaryPayment: mockPayment,
      payment_id: '123',
      line_id: '1',
      paymentvalue: '100',
      description: undefined,
      fundcode: undefined,
      mainaccount: undefined,
      schemecode:undefined,
      marketingyear: undefined,
      deliverybody: undefined,
      disableditem: false,
      attributesitem: {},
      view_type: 'edit'
    });
  });

  test('invoiceLineStore should handle creating and updating invoice lines', async () => {
    const mockPayload = {
      line_id: '1',
      paymentvalue: '200',
      payment_id: '123',
      description: 'desc',
      fundcode: 'fund1',
      mainaccount: 'acc1',
      schemecode: 'scheme1',
      marketingyear: '2024',
      deliverybody: 'body1'
    };

    const requestUpdate = mockRequest({}, mockPayload);
    external_request.sendExternalRequestPut.mockResolvedValue({});
    await invoiceLineStore(requestUpdate);
    expect(external_request.sendExternalRequestPut).toHaveBeenCalledWith(`${constant_model.request_host}/invoicelines/update`, {
      Value: '200',
      InvoiceRequestId: '123',
      Description: 'desc',
      FundCode: 'fund1',
      MainAccount: 'acc1',
      SchemeCode: 'scheme1',
      MarketingYear: '2024',
      DeliveryBody: 'body1',
      Id: '1'
    });
    expect(requestUpdate.yar.flash).toHaveBeenCalledWith('success_message', constant_model.invoiceline_update_success);

    const requestCreate = mockRequest({}, { ...mockPayload, line_id: undefined });
    external_request.sendExternalRequestPost.mockResolvedValue({});
    await invoiceLineStore(requestCreate);
    expect(external_request.sendExternalRequestPost).toHaveBeenCalledWith(`${constant_model.request_host}/invoicelines/add`, {
      Value: '200',
      InvoiceRequestId: '123',
      Description: 'desc',
      FundCode: 'fund1',
      MainAccount: 'acc1',
      SchemeCode: 'scheme1',
      MarketingYear: '2024',
      DeliveryBody: 'body1'
    });
    expect(requestCreate.yar.flash).toHaveBeenCalledWith('success_message', constant_model.invoiceline_creation_success);
  });
});
