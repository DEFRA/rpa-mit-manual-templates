const invoiceController = require('../backend/controllers/invoiceController')
const paymentController = require('../backend/controllers/paymentController')
const invoiceLineController = require('../backend/controllers/invoiceLineController')
const approvalInvoiceController = require('../backend/controllers/approvalInvoiceController')
const authProvider = require('../backend/auth/AuthProvider')
module.exports = [
  {
    method: 'GET',
    path: '/',
    options: {
      handler: invoiceController.invoiceList
    }
  },
  {
    method: 'GET',
    path: '/createInvoice',
    options: {
      handler: invoiceController.invoiceCreate
    }
  },
  {
    method: 'POST',
    path: '/createInvoice',
    options: {
      handler: invoiceController.invoiceStore
    }
  },
  {
    method: 'GET',
    path: '/viewInvoice/{id}',
    options: {
      handler: invoiceController.invoiceSummary
    }
  },
  {
    method: 'GET',
    path: '/deleteInvoice/{id}',
    options: {
      handler: invoiceController.invoiceDelete
    }
  },
  {
    method: 'GET',
    path: '/createPayment/{id}',
    options: {
      handler: paymentController.paymentCreate
    }
  },
  {
    method: 'POST',
    path: '/createPayment',
    options: {
      handler: paymentController.paymentStore
    }
  },
  {
    method: 'GET',
    path: '/viewPayment/{id}/{invoiceid}',
    options: {
      handler: paymentController.paymentView
    }
  },
  {
    method: 'GET',
    path: '/editPayment/{id}/{invoiceid}',
    options: {
      handler: paymentController.paymentEdit
    }
  },
  {
    method: 'GET',
    path: '/deletePayment/{id}/{invoiceid}',
    options: {
      handler: paymentController.paymentDelete
    }
  },
  {
    method: 'GET',
    path: '/viewPaymentLine/{id}',
    options: {
      handler: invoiceLineController.invoiceLineAll
    }
  },
  {
    method: 'GET',
    path: '/createInvoiceLine/{id}',
    options: {
      handler: invoiceLineController.invoiceLineCreate
    }
  },
  {
    method: 'POST',
    path: '/createInvoiceLine',
    options: {
      handler: invoiceLineController.invoiceLineStore
    }
  },
  {
    method: 'GET',
    path: '/viewInvoiceLine/{id}/{invoiceid}',
    options: {
      handler: invoiceLineController.invoiceLineView
    }
  },
  {
    method: 'GET',
    path: '/editInvoiceLine/{id}/{invoiceid}',
    options: {
      handler: invoiceLineController.invoiceLineEdit
    }
  },
  {
    method: 'GET',
    path: '/deleteInvoiceLine/{id}/{invoiceid}',
    options: {
      handler: invoiceLineController.invoiceLineDelete
    }
  },
  {
    method: 'GET',
    path: '/sample_download',
    options: {
      handler: invoiceController.downloadSample
    }
  },
  {
    method: 'GET',
    path: '/bulkView',
    options: {
      handler: invoiceController.Bulkview
    }
  },
  {
    method: 'POST',
    path: '/bulkUpload',
    handler: invoiceController.uploadBulk,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
        maxBytes: 10485760,
        multipart: true
      }
    }
  },
  {
    method: 'POST',
    path: '/bulk_data_upload',
    options: {
      handler: invoiceController.BulkDataUpload
    }
  },
  {
    method: 'GET',
    path: '/approvelist',
    options: {
      handler: approvalInvoiceController.approveInvoiceList
    }
  },
  {
    method: 'GET',
    path: '/viewApprovalInvoice/{id}',
    options: {
      handler: approvalInvoiceController.approvalInvoiceSummary
    }
  },
  {
    method: 'GET',
    path: '/approveInvoice/{id}',
    options: {
      handler: approvalInvoiceController.approveInvoice
    }
  },
  {
    method: 'POST',
    path: '/rejectInvoice',
    options: {
      handler: approvalInvoiceController.rejectInvoice
    }
  },
  {
    method: 'GET',
    path: '/login',
    handler: authProvider.login.bind(authProvider)
  },
  {
    method: 'GET',
    path: '/acquire-token',
    handler: authProvider.acquireToken.bind(authProvider)
  },
  {
    method: 'POST',
    path: '/redirect',
    handler: authProvider.handleRedirect.bind(authProvider)
  },
  {
    method: 'GET',
    path: '/logout',
    handler: authProvider.logout.bind(authProvider)
  }

]
