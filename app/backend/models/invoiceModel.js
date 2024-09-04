const commonModel = require('./commonModel')
const externalRequest = require('../custom_requests/externalRequests')
const constantModel = require('../app_constants/app_constant')
const paymentModel = require('./paymentModel')
const Path = require('path')

const getAllInvoices = async (request) => {
  const successMessage = request.yar.flash('successMessage')
  const data = await externalRequest.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoices/getall`)
  request.yar.flash('successMessage', '')
  return { pageTitle: constantModel.invoiceListTitle, invoices: modifyInvoiceResponse(data?.invoices || []), successMessage, userName: (request.yar.get('account')?.username || '') }
}

const createInvoice = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${process.env.REQUEST_HOST}/referencedata/getall`)
  const accountType = commonModel.modifyResponseRadio(optionsData.referenceData.accountCodes)
  const deliveryBody = optionsData.referenceData.initialDeliveryBodies
  const invoiceTemplate = optionsData.referenceData.schemeInvoiceTemplates
  const invoice_template_secondary = optionsData.referenceData.schemeInvoiceTemplateSecondaryQuestions
  const paymentType = commonModel.modifyResponseRadio(optionsData.referenceData.paymentTypes)
  return {
    pageTitle: constantModel.invoiceAddTitle,
    accountType,
    deliveryBody,
    invoiceTemplate,
    invoice_template_secondary,
    paymentType
  }
}

const createBulk = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${process.env.REQUEST_HOST}/referencedata/getall`)
  const accountType = commonModel.modifyResponseRadio(optionsData.referenceData.accountCodes)
  const deliveryBody = optionsData.referenceData.initialDeliveryBodies
  const invoiceTemplate = optionsData.referenceData.schemeInvoiceTemplates
  return {
    pageTitle: constantModel.bulkUpload,
    accountType,
    deliveryBody,
    invoiceTemplate
  }
}

const invoiceStore = async (request) => {
  const payload = request.payload
  await externalRequest.sendExternalRequestPost(`${process.env.REQUEST_HOST}/invoices/add`, {
    AccountType: payload.accountType,
    DeliveryBody: payload.deliveryBody,
    SchemeType: payload.invoiceTemplate,
    SecondaryQuestion: payload.invoice_template_secondary,
    PaymentType: payload.paymentType

  })
  request.yar.flash('successMessage', constantModel.invoiceCreationSuccess)
}

const invoiceSummary = async (request) => {
  const successMessage = request.yar.flash('successMessage')
  const data = await externalRequest.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoices/getbyid`, { invoiceId: request.params.id })
  const summaryData = data?.invoice || []
  const getAllPayments = await paymentModel.getAllPayments(request.params.id)
  summaryData.invoiceRequests = getAllPayments
  const summaryBox = { head: 'Invoice Id', actions: [], id: summaryData.id, rows: await modifyForSummaryBox(summaryData) }
  const update_Data = Object.assign({}, summaryData)
  const summaryHeader = [{ text: 'Account Type' }, { text: 'Delivery Body' }, { text: 'Scheme Type' }, { text: 'Payment Type' }]
  const summaryTable = commonModel.modifyResponseTable(commonModel.removeForSummaryTable(summaryData))
  request.yar.flash('successMessage', '')
  return {
    pageTitle: constantModel.invoiceSummaryTitle,
    summaryTable,
    summaryBox,
    paymentLink: `/createPayment/${request.params.id}`,
    total_requests: (getAllPayments?.length || 0),
    summaryHeader,
    allPayments: getAllPayments,
    successMessage
  }
}

const modifyForSummaryBox = async (summaryData) => {
  const summaryBoxData = []
  summaryBoxData.push({ name: 'Status', value: `<strong class="govuk-tag">${summaryData.status.toUpperCase()}</strong>` })
  summaryBoxData.push({ name: 'Created On', value: commonModel.formatTimestamp(summaryData.created) })
  summaryBoxData.push({ name: 'Number Of Invoice Requests', value: (summaryData?.invoiceRequests?.length || 0).toString() })
  return commonModel.modifyResponseSummary(summaryBoxData)
}

const modifyInvoiceResponse = (invoiceList, action = true) => {
  return invoiceList.map((item) => {
    return {
      head: 'Invoice Id',
      actions: action
        ? [
            { link: `/viewInvoice/${item.id}`, name: 'View' },
            { link: `/deleteInvoice/${item.id}`, name: 'Delete' }
          ]
        : [],
      id: item.id,
      rows: commonModel.modifyForSummary(item)
    }
  })
}

const deleteInvoice = async (request) => {
  await externalRequest.sendExternalRequestDelete(`${process.env.REQUEST_HOST}/invoices/delete`, {
    invoiceId: request.params.id
  })
  request.yar.flash('successMessage', constantModel.invoiceDeletionSuccess)
  return request.params.id
}

const downloadFile = async (request, h) => {
  const filePath = Path.join(__dirname, 'sample_files', 'sample.xlsx')
  return h.file(filePath)
}

const BulkDataUpload = async (request) => {
  const { payload } = request
  const bulkData = JSON.parse(payload.bulkData)
  await externalRequest.sendExternalRequestPost(`${process.env.REQUEST_HOST}/bulkuploads/confirm`, {
    invoiceId: bulkData.bulkUploadInvoice.id,
    confirmUpload: true,
    confirm: true
  })
  request.yar.flash('successMessage', constantModel.invoiceLineBulkUploadSuccess)
}

const uploadBulk = async (request, h) => {
  const { payload } = request
  const bulkData = await commonModel.processUploadedCSV(payload.bulk_file)
  if (!bulkData) {
    request.yar.flash('errorMessage', constantModel.invoiceLineBulkUploadFailed)
    return h.redirect(`/viewPaymentLine/${payload.paymentId}`).temporary()
  } else {
    const invoiceRequests = bulkData?.bulkUploadInvoice?.bulkUploadApHeaderLines.map((invRequest, ind) => {
      return {
        id: invRequest.invoiceRequestId,
        invid: invRequest.invoiceId,
        index: (ind + 1),
        summary_data: commonModel.BulkHeadData(invRequest, true),
        lines_data: commonModel.BulkLineData(invRequest.bulkUploadApDetailLines, true)
      }
    })
    return h.view('app_views/bulkView', {
      pageTitle: constantModel.bulkUpload,
      invoices: modifyInvoiceResponse([bulkData?.bulkUploadInvoice], action = false),
      invoiceRequests,
      bulkData: JSON.stringify(bulkData)
    })
  }
}

module.exports = { createBulk, modifyInvoiceResponse, modifyForSummaryBox, downloadFile, BulkDataUpload, uploadBulk, getAllInvoices, deleteInvoice, createInvoice, invoiceStore, invoiceSummary }
