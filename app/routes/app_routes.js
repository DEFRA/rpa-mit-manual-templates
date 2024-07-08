const invoice_controller = require('../backend/controllers/invoice_controller')
const payment_controller = require('../backend/controllers/payment_controller')
const invoice_line_controller = require('../backend/controllers/invoice_line_controller')

module.exports = [
    {
      method: 'GET',
      path: '/',
      options: {
        handler: invoice_controller.invoiceList
      }, 
    },
    {
      method: 'GET',
      path: '/createInvoice',
      options: {
        handler: invoice_controller.invoiceCreate
      }, 
    },
    {
      method: 'POST',
      path: '/createInvoice',
      options: {
        handler: invoice_controller.invoiceStore
      }, 
    },
    {
      method: 'GET',
      path: '/viewInvoice/{id}',
      options: {
        handler: invoice_controller.invoiceSummary
      }, 
    },
    {
      method: 'GET',
      path: '/deleteInvoice/{id}',
      options: {
        handler: invoice_controller.invoiceDelete
      }, 
    },
    {
      method: 'GET',
      path: '/createPayment/{id}',
      options: {
        handler: payment_controller.paymentCreate
      }, 
    },
    {
      method: 'POST',
      path: '/createPayment',
      options: {
        handler: payment_controller.paymentStore
      }, 
    },
    {
      method: 'GET',
      path: '/viewPayment/{id}',
      options: {
        handler: payment_controller.paymentView
      }, 
    },
    {
      method: 'GET',
      path: '/editPayment/{id}',
      options: {
        handler: payment_controller.paymentEdit
      }, 
    },
    {
      method: 'GET',
      path: '/deletePayment/{id}',
      options: {
        handler: payment_controller.paymentDelete
      }, 
    },
    {
      method: 'GET',
      path: '/viewPaymentLine/{id}',
      options: {
        handler: invoice_line_controller.invoiceLineAll
      }, 
    },
    {
      method: 'GET',
      path: '/createInvoiceLine/{id}',
      options: {
        handler: invoice_line_controller.invoiceLineCreate
      }, 
    },
    {
      method: 'POST',
      path: '/createInvoiceLine',
      options: {
        handler: invoice_line_controller.invoiceLineStore
      }, 
    },
    {
      method: 'GET',
      path: '/viewInvoiceLine/{id}',
      options: {
        handler: invoice_line_controller.invoiceLineView
      }, 
    },
    {
      method: 'GET',
      path: '/editInvoiceLine/{id}',
      options: {
        handler: invoice_line_controller.invoiceLineEdit
      }, 
    },
    {
      method: 'GET',
      path: '/deleteInvoiceLine/{id}',
      options: {
        handler: invoice_line_controller.invoiceLineDelete
      }, 
    },
    {
      method: 'GET',
      path: '/sample_download',
      options: {
        handler: invoice_line_controller.downloadSample
      }, 
    },
    {
      method: 'POST',
      path: '/bulk_upload',
      handler: invoice_line_controller.uploadBulk,
      options: {
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data',
            maxBytes: 10485760, 
            multipart: true,
        }
      }
    },
    {
      method: 'POST',
      path: '/bulk_data_upload',
      options: {
        handler: invoice_line_controller.BulkDataUpload
      }, 
    },
  ]