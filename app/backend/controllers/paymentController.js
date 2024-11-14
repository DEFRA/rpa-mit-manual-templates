const paymentModel = require('../models/paymentModel')
const errorModel = require('../models/commonError')

const paymentCreate = async (request, h) => {
  try {
    const res = await paymentModel.createPayment(request)
    const errorMessage = request.yar.flash('errorm')
    const direction = request.yar.flash('direction')
    request.yar.flash('errorm', '')
    request.yar.flash('direction', '')
    res.errorExist = errorMessage
    res.direction = direction
    return h.view('app_views/createPayment', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const paymentView = async (request, h) => {
  try {
    const res = await paymentModel.viewPayment(request)
    const errorMessage = request.yar.flash('errorm')
    const direction = request.yar.flash('direction')
    request.yar.flash('errorm', '')
    request.yar.flash('direction', '')
    res.errorExist = errorMessage
    res.direction = direction
    return h.view('app_views/createPayment', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const paymentEdit = async (request, h) => {
  try {
    const res = await paymentModel.updatePayment(request)
    const errorMessage = request.yar.flash('errorm')
    const direction = request.yar.flash('direction')
    request.yar.flash('errorm', '')
    request.yar.flash('direction', '')
    res.errorExist = errorMessage
    res.direction = direction
    return h.view('app_views/createPayment', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const paymentDelete = async (request, h) => {
  try {
    const invoiceId = await paymentModel.deletePayment(request)
    return h.redirect(`/viewInvoice/${invoiceId}`).temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const paymentStore = async (request, h) => {
  try {
    const invoiceId = await paymentModel.paymentStore(request)
    return h.redirect(`/viewInvoice/${invoiceId}`).temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

module.exports = { paymentCreate, paymentStore, paymentEdit, paymentView, paymentDelete }
