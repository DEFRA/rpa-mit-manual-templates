const approvalInvoiceModel  = require('../models/approvalInvoiceModel ')
const errorModel  = require('../models/commonError')
const approveInvoiceList = async (request, h) => {
  try {
    const res = await approvalInvoiceModel .getAllInvoices(request)
    return h.view('app_views/approval_invoice_list', res)
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

const approvalInvoiceSummary = async (request, h) => {
  try {
    return await approvalInvoiceModel .invoiceSummary(request, h)
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

const approveInvoice = async (request, h) => {
  try {
    await approvalInvoiceModel .approveInvoice(request)
    return h.redirect('/approvelist').temporary()
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

const rejectInvoice = async (request, h) => {
  try {
    await approvalInvoiceModel .rejectInvoice(request)
    return h.redirect('/approvelist').temporary()
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

module.exports = { approveInvoiceList, approvalInvoiceSummary, approveInvoice, rejectInvoice }
