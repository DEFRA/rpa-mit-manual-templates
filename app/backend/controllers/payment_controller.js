const paymentModel  = require('../models/paymentModel')
const errorModel  = require('../models/commonError')

const paymentCreate = async (request, h) => {
  try {
    const res = await payment_model.createPayment(request)
    return h.view('app_views/create_payment', res)
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

const paymentView = async (request, h) => {
  try {
    const res = await payment_model.viewPayment(request)
    return h.view('app_views/create_payment', res)
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

const paymentEdit = async (request, h) => {
  try {
    const res = await payment_model.updatePayment(request)
    return h.view('app_views/create_payment', res)
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

const paymentDelete = async (request, h) => {
  try {
    const invoice_id = await payment_model.deletePayment(request)
    return h.redirect(`/viewInvoice/${invoice_id}`).temporary()
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

const paymentStore = async (request, h) => {
  try {
    const invoice_id = await payment_model.paymentStore(request)
    return h.redirect(`/viewInvoice/${invoice_id}`).temporary()
  } catch (error) {
    return errorModel .errorMessage(error, h)
  }
}

module.exports = { paymentCreate, paymentStore, paymentEdit, paymentView, paymentDelete }
