const approvalInvoiceModel = require('../models/approvalInvoiceModel')
const errorModel = require('../models/commonError')
const approveInvoiceList = async (request, h) => {
  try {
    const res = await approvalInvoiceModel.getAllInvoices(request)
    const errorMessage = request.yar.flash('errorm')
    const direction = request.yar.flash('direction')
    request.yar.flash('errorm', '')
    request.yar.flash('direction', '')
    res.errorExist = errorMessage
    res.direction = direction
    return h.view('app_views/approvalInvoiceList', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const approvalInvoiceSummary = async (request, h) => {
  try {
    return await approvalInvoiceModel.invoiceSummary(request, h)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const approveInvoice = async (request, h) => {
  try {
    await approvalInvoiceModel.approveInvoice(request)
    return h.redirect('/approvelist').temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const rejectInvoice = async (request, h) => {
  try {
    await approvalInvoiceModel.rejectInvoice(request)
    return h.redirect('/approvelist').temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

module.exports = { approveInvoiceList, approvalInvoiceSummary, approveInvoice, rejectInvoice }
