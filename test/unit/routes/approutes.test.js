const invoice_controller = require('../../../app/backend/controllers/invoice_controller');
const payment_controller = require('../../../app/backend/controllers/payment_controller');
const invoice_line_controller = require('../../../app/backend/controllers/invoice_line_controller');
const approval_invoice_controller = require('../../../app/backend/controllers/approval_invoice_controller');

describe('Route Handlers', () => {
  let mockH;

  beforeEach(() => {
    mockH = {
      view: jest.fn(),
      response: jest.fn(() => ({
        code: jest.fn().mockReturnThis(),
      })),
      redirect: jest.fn(),
    };
    jest.clearAllMocks();
  });

  const testCases = [
    { path: '/', handler: invoice_controller.invoiceList },
    { path: '/createInvoice', method: 'GET', handler: invoice_controller.invoiceCreate },
    { path: '/createInvoice', method: 'POST', handler: invoice_controller.invoiceStore },
    { path: '/viewInvoice/{id}', handler: invoice_controller.invoiceSummary },
    { path: '/deleteInvoice/{id}', handler: invoice_controller.invoiceDelete },
    { path: '/createPayment/{id}', handler: payment_controller.paymentCreate },
    { path: '/createPayment', method: 'POST', handler: payment_controller.paymentStore },
    { path: '/viewPayment/{id}/{invoiceid}', handler: payment_controller.paymentView },
    { path: '/editPayment/{id}/{invoiceid}', handler: payment_controller.paymentEdit },
    { path: '/deletePayment/{id}/{invoiceid}', handler: payment_controller.paymentDelete },
    { path: '/viewPaymentLine/{id}', handler: invoice_line_controller.invoiceLineAll },
    { path: '/createInvoiceLine/{id}', handler: invoice_line_controller.invoiceLineCreate },
    { path: '/createInvoiceLine', method: 'POST', handler: invoice_line_controller.invoiceLineStore },
    { path: '/viewInvoiceLine/{id}/{invoiceid}', handler: invoice_line_controller.invoiceLineView },
    { path: '/editInvoiceLine/{id}/{invoiceid}', handler: invoice_line_controller.invoiceLineEdit },
    { path: '/deleteInvoiceLine/{id}/{invoiceid}', handler: invoice_line_controller.invoiceLineDelete },
    { path: '/sample_download', handler: invoice_controller.downloadSample },
    { path: '/bulkView', handler: invoice_controller.Bulkview },
    {
      path: '/bulk_upload',
      method: 'POST',
      handler: invoice_controller.uploadBulk,
      payload: { file: 'test-file' },
    },
    { path: '/bulk_data_upload', method: 'POST', handler: invoice_controller.BulkDataUpload },
    { path: '/approvelist', handler: approval_invoice_controller.approveInvoiceList },
    { path: '/viewApprovalInvoice/{id}', handler: approval_invoice_controller.approvalInvoiceSummary },
    { path: '/approveInvoice/{id}', handler: approval_invoice_controller.approveInvoice },
    { path: '/rejectInvoice', method: 'POST', handler: approval_invoice_controller.rejectInvoice },
  ];

  testCases.forEach(({ path, method = 'GET', handler, payload }) => {
    test(`${method} ${path} should call the appropriate handler`, async () => {
      const mockRequest = { payload };
      await handler(mockRequest, mockH);

      if (method === 'GET' || method === 'POST') {
        const isViewRenderingHandler = path.includes('/bulkView'); 
        
        if (isViewRenderingHandler || (path == '/createInvoice' && method == 'GET')) {
          expect(mockH.view).toHaveBeenCalled(); 
          expect(mockH.response).not.toHaveBeenCalled(); 
        } else {
          expect(mockH.view).toHaveBeenCalledTimes(0); 
          expect(mockH.response).toHaveBeenCalled();
        }
      }
    });
  });
});