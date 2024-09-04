const invoiceModel = require('../models/invoiceModel ')
const errorModel = require('../models/commonError')
const invoiceList = async (request, h) => {
  try {
    const res = await invoiceModel.getAllInvoices(request)
    return h.view('app_views/invoiceList', res)
  } catch (error) {
    return errorModel.errorMessage(error, h)
  }
}

const invoiceCreate = async (request, h) => {
  try {
    const res = await invoiceModel.createInvoice(request)
    // console.log(res);
    return h.view('app_views/createInvoice', res)
  } catch (error) {
    return errorModel.errorMessage(error, h)
  }
}

const invoiceSummary = async (request, h) => {
  try {
    const res = await invoiceModel.invoiceSummary(request)
    return h.view('app_views/invoiceSummary', res)
  } catch (error) {
    return errorModel.errorMessage(error, h)
  }
}

const invoiceStore = async (request, h) => {
  try {
    await invoiceModel.invoiceStore(request)
    return h.redirect('/').temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h)
  }
}

const invoiceDelete = async (request, h) => {
  try {
    await invoiceModel.deleteInvoice(request)
    return h.redirect('/').temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h)
  }
}

const downloadSample = async (request, h) => {
  try {
    return await invoiceModel.downloadFile(request, h)
  } catch (error) {
    return errorModel.errorMessage(error, h)
  }
}

const uploadBulk = async (request, h) => {
  try {
    return await invoiceModel.uploadBulk(request, h)
  } catch (error) {
    return errorModel.errorMessage(error, h)
  }
}

const BulkDataUpload = async (request, h) => {
  try {
    await invoiceModel.BulkDataUpload(request)
    return h.redirect('/').temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h)
  }
}

const Bulkview = async (request, h) => {
  try {
    const res = await invoiceModel.createBulk(request)
    return h.view('app_views/bulkUpload', res)
  } catch (error) {
    return errorModel.errorMessage(error, h)
  }
}

module.exports = { downloadSample, Bulkview, BulkDataUpload, uploadBulk, invoiceList, invoiceCreate, invoiceStore, invoiceSummary, invoiceDelete }
