const invoiceController = require('../../../app/backend/controllers/invoiceController')
const paymentController = require('../../../app/backend/controllers/paymentController')
const invoiceLineController = require('../../../app/backend/controllers/invoiceLineController')
const approvalInvoiceController = require('../../../app/backend/controllers/approvalInvoiceController')

describe('Route Handlers', () => {
  let mockH

  beforeEach(() => {
    mockH = {
      view: jest.fn(),
      response: jest.fn(() => ({
        code: jest.fn().mockReturnThis()
      })),
      redirect: jest.fn()
    }
    jest.clearAllMocks()
  })

  const testCases = [
    { path: '/', handler: invoiceController.invoiceList },
    { path: '/createInvoice', method: 'GET', handler: invoiceController.invoiceCreate },
    { path: '/createInvoice', method: 'POST', handler: invoiceController.invoiceStore },
    { path: '/viewInvoice/{id}', handler: invoiceController.invoiceSummary },
    { path: '/deleteInvoice/{id}', handler: invoiceController.invoiceDelete },
    { path: '/createPayment/{id}', handler: paymentController.paymentCreate },
    { path: '/createPayment', method: 'POST', handler: paymentController.paymentStore },
    { path: '/viewPayment/{id}/{invoiceid}', handler: paymentController.paymentView },
    { path: '/editPayment/{id}/{invoiceid}', handler: paymentController.paymentEdit },
    { path: '/deletePayment/{id}/{invoiceid}', handler: paymentController.paymentDelete },
    { path: '/viewPaymentLine/{id}', handler: invoiceLineController.invoiceLineAll },
    { path: '/createInvoiceLine/{id}', handler: invoiceLineController.invoiceLineCreate },
    { path: '/createInvoiceLine', method: 'POST', handler: invoiceLineController.invoiceLineStore },
    { path: '/viewInvoiceLine/{id}/{invoiceid}', handler: invoiceLineController.invoiceLineView },
    { path: '/editInvoiceLine/{id}/{invoiceid}', handler: invoiceLineController.invoiceLineEdit },
    { path: '/deleteInvoiceLine/{id}/{invoiceid}', handler: invoiceLineController.invoiceLineDelete },
    { path: '/sample_download', handler: invoiceController.downloadSample },
    { path: '/bulkView', handler: invoiceController.Bulkview },
    {
      path: '/bulk_upload',
      method: 'POST',
      handler: invoiceController.uploadBulk,
      payload: { file: 'test-file' }
    },
    { path: '/bulk_data_upload', method: 'POST', handler: invoiceController.BulkDataUpload },
    { path: '/approvelist', handler: approvalInvoiceController.approveInvoiceList },
    { path: '/viewApprovalInvoice/{id}', handler: approvalInvoiceController.approvalInvoiceSummary },
    { path: '/approveInvoice/{id}', handler: approvalInvoiceController.approveInvoice },
    { path: '/rejectInvoice', method: 'POST', handler: approvalInvoiceController.rejectInvoice }
  ]

  testCases.forEach(({ path, method = 'GET', handler, payload }) => {
    test(`${method} ${path} should call the appropriate handler`, async () => {
      const mockRequest = { payload }
      await handler(mockRequest, mockH)

      if (method === 'GET' || method === 'POST') {
        const isViewRenderingHandler = path.includes('/bulkView')

        if (isViewRenderingHandler || (path === '/createInvoice' && method === 'GET')) {
          expect(mockH.view).toHaveBeenCalled()
          expect(mockH.response).not.toHaveBeenCalled()
        } else {
          expect(mockH.view).toHaveBeenCalledTimes(0)
          expect(mockH.response).toHaveBeenCalled()
        }
      }
    })
  })
})
