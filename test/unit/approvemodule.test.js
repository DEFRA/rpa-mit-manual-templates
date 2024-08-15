const { getAllInvoices, invoiceSummary, approveInvoice, rejectInvoice , modifyInvoiceResponse} = require('../../app/backend/models/approval_invoice_model');
const external_request = require('../../app/backend/custom_requests/external_requests');
const constant_model = require('../../app/backend/app_constants/app_constant');
const common_model = require('../../app/backend/models/common_model');

jest.mock('../../app/backend/custom_requests/external_requests');
jest.mock('../../app/backend/app_constants/app_constant');
jest.mock('../../app/backend/models/common_model');

describe('Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllInvoices', () => {
    it('should return invoices with a success message', async () => {
      const mockData = { invoices: [{ id: '1' }] };
      external_request.sendExternalRequestPost.mockResolvedValue(mockData);

      const request = {
        yar: { flash: jest.fn() },
      };

      const result = await getAllInvoices(request);

      expect(external_request.sendExternalRequestPost).toHaveBeenCalledWith(`${constant_model.request_host}/approvals/getmyapprovals`, {});
      expect(request.yar.flash).toHaveBeenCalledWith('success_message', '');
      expect(result).toEqual({
        pageTitle: constant_model.approveinvoice_list_title,
        invoices: expect.any(Array)
      });
    });
  });

  describe('modifyInvoiceResponse', () => {
    it('should modify invoice response correctly', () => {
      const invoiceList = [{ id: '1' }];
      common_model.modifyForSummary.mockReturnValue([{ key: { text: 'Test' }, value: { html: 'Test' }, actions: { items: [] } }]);
      const result = modifyInvoiceResponse(invoiceList);

      expect(result).toEqual([{
        head: 'Invoice Id',
        actions: [{ link: `/viewApprovalInvoice/1`, name: 'View' }],
        id: '1',
        rows: [{ key: { text: 'Test' }, value: { html: 'Test' }, actions: { items: [] } }],
      }]);
    });
  });

  describe('approveInvoice', () => {
    it('should approve an invoice and flash a success message', async () => {
      const request = {
        params: { id: '1' },
        yar: { flash: jest.fn() },
      };

      await approveInvoice(request);

      expect(external_request.sendExternalRequestPost).toHaveBeenCalledWith(`${constant_model.request_host}/approvals/approve`, { id: '1' });
      expect(request.yar.flash).toHaveBeenCalledWith('success_message', constant_model.invoice_approve_success);
      expect(request.params.id).toBe('1');
    });
  });

  describe('rejectInvoice', () => {
    it('should reject an invoice and flash a success message', async () => {
      const request = {
        payload: { invoice_id: '1', reason: 'Not valid' },
        params: { id: '1' },
        yar: { flash: jest.fn() },
      };

      await rejectInvoice(request);

      expect(external_request.sendExternalRequestPost).toHaveBeenCalledWith(`${constant_model.request_host}/approvals/reject`, { id: '1', reason: 'Not valid' });
      expect(request.yar.flash).toHaveBeenCalledWith('success_message', constant_model.invoice_reject_success);
      expect(request.params.id).toBe('1');
    });
  });


  describe('invoiceSummary', () => {
    it('should return invoice summary view with data', async () => {
      const mockData = {
        invoice: {
          id: '1',
          invoiceRequests: [{ invoiceRequestId: 'IR1', invoiceId: '1', invoiceLines: [] }],
        },
      };

      external_request.sendExternalRequestPost.mockResolvedValue(mockData);
      common_model.BulkHeadData.mockReturnValue([{ name: 'Test', value: 'Test' }]);
      common_model.BulkLineData.mockReturnValue([{ text: 'Test' }]);

      const request = { params: { id: '1' } };
      const h = { view: jest.fn() };

      await invoiceSummary(request, h);

      expect(external_request.sendExternalRequestPost).toHaveBeenCalledWith(`${constant_model.request_host}/approvals/getinvoiceforapproval`, { invoiceId: '1' });
      expect(h.view).toHaveBeenCalledWith('app_views/approval_invoice_summary', {
        pageTitle: constant_model.approval_invoice_summary,
        invoices: expect.any(Array),
        invoiceRequests: expect.any(Array),
        invoiceId: '1',
        approveUrl: '/approveInvoice/1',
      });
    });
  });
});
