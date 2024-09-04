const invoiceLineModel  = require('../models/invoiceLineModel ')
const errorModel  = require('../models/commonError')

const invoiceLineAll = async (request, h) => {
  try {
    const res = await invoiceLineModel .getAllInvoiceLines(request)
    return h.view('app_views/paymentSummary', res)
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

const invoiceLineCreate = async (request, h) => {
  try {
    const res = await invoiceLineModel .createInvoiceLine(request)
    return h.view('app_views/createInvoiceLine', res)
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

const invoiceLineView = async (request, h) => {
  try {
    const res = await invoiceLineModel .viewInvoiceLine(request)
    return h.view('app_views/createInvoiceLine', res)
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

const invoiceLineEdit = async (request, h) => {
  try {
    const res = await invoiceLineModel .updateInvoiceLine(request)
    return h.view('app_views/createInvoiceLine', res)
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

const invoiceLineDelete = async (request, h) => {
  try {
    const paymentId = await invoiceLineModel .deleteInvoiceLine(request)
    return h.redirect(`/viewPaymentLine/${paymentId}`).temporary()
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

const invoiceLineStore = async (request, h) => {
  try {
    const paymentId = await invoiceLineModel .invoiceLineStore(request)
    return h.redirect(`/viewPaymentLine/${paymentId}`).temporary()
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

module.exports = { invoiceLineAll, invoiceLineCreate, invoiceLineStore, invoiceLineEdit, invoiceLineView, invoiceLineDelete }
