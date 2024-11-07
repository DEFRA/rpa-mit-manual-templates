const invoiceLineModel = require('../models/invoiceLineModel')
const errorModel = require('../models/commonError')

const invoiceLineAll = async (request, h) => {
  try {
    const res = await invoiceLineModel.getAllInvoiceLines(request)
    const errorMessage = request.yar.flash('errorm')
    request.yar.flash('errorm', '')
    res['errorExist']=errorMessage;
    return h.view('app_views/paymentSummary', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const invoiceLineCreate = async (request, h) => {
  try {
    const res = await invoiceLineModel.createInvoiceLine(request)
    const errorMessage = request.yar.flash('errorm')
    request.yar.flash('errorm', '')
    res['errorExist']=errorMessage;
    return h.view('app_views/createInvoiceLine', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const invoiceLineView = async (request, h) => {
  try {
    const res = await invoiceLineModel.viewInvoiceLine(request)
    const errorMessage = request.yar.flash('errorm')
    request.yar.flash('errorm', '')
    res['errorExist']=errorMessage;
    return h.view('app_views/createInvoiceLine', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const invoiceLineEdit = async (request, h) => {
  try {
    const res = await invoiceLineModel.updateInvoiceLine(request)
    const errorMessage = request.yar.flash('errorm')
    request.yar.flash('errorm', '')
    res['errorExist']=errorMessage;
    return h.view('app_views/createInvoiceLine', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const invoiceLineDelete = async (request, h) => {
  try {
    const paymentId = await invoiceLineModel.deleteInvoiceLine(request)
    return h.redirect(`/viewPaymentLine/${paymentId}`).temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const invoiceLineStore = async (request, h) => {
  try {
    const paymentId = await invoiceLineModel.invoiceLineStore(request)
    return h.redirect(`/viewPaymentLine/${paymentId}`).temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

module.exports = { invoiceLineAll, invoiceLineCreate, invoiceLineStore, invoiceLineEdit, invoiceLineView, invoiceLineDelete }
