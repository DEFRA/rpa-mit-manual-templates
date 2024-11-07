const invoiceModel = require('../models/invoiceModel')
const errorModel = require('../models/commonError')
const invoiceList = async (request, h) => {
  try {
    const res = await invoiceModel.getAllInvoices(request)
    const errorMessage = request.yar.flash('errorm')
    request.yar.flash('errorm', '')
    res['errorExist']=errorMessage;
    return h.view('app_views/invoiceList', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const invoiceCreate = async (request, h) => {
  try {
    const res = await invoiceModel.createInvoice(request)
    const errorMessage = request.yar.flash('errorm')
    request.yar.flash('errorm', '')
    res['errorExist']=errorMessage;
    return h.view('app_views/createInvoice', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const invoiceSummary = async (request, h) => {
  try {
    const res = await invoiceModel.invoiceSummary(request)
    const errorMessage = request.yar.flash('errorm')
    request.yar.flash('errorm', '')
    res['errorExist']=errorMessage;
    console.log(res)

    return h.view('app_views/invoiceSummary', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const invoiceStore = async (request, h) => {
  try {
    await invoiceModel.invoiceStore(request)
    return h.redirect('/').temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const invoiceDelete = async (request, h) => {
  try {
    await invoiceModel.deleteInvoice(request)
    return h.redirect('/').temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const downloadSample = async (request, h) => {
  try {
    return await invoiceModel.downloadFile(request, h)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const uploadBulk = async (request, h) => {
  try {
    return await invoiceModel.uploadBulk(request, h)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const BulkDataUpload = async (request, h) => {
  try {
    await invoiceModel.BulkDataUpload(request)
    return h.redirect('/').temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const Bulkview = async (request, h) => {
  try {
    const res = await invoiceModel.createBulk(request)
    const errorMessage = request.yar.flash('errorm')
    request.yar.flash('errorm', '')
    res['errorExist']=errorMessage;
    return h.view('app_views/bulkUpload', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

module.exports = { downloadSample, Bulkview, BulkDataUpload, uploadBulk, invoiceList, invoiceCreate, invoiceStore, invoiceSummary, invoiceDelete }
