const common_model = require('./common_model')
const external_request = require('../custom_requests/external_requests')
const constant_model = require('../app_constants/app_constant')
const payment_model = require('./payment_model')
const Path = require('path')

const getAllInvoices = async (request) => {
  const success_message = request.yar.flash('success_message')
  const data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoices/getall`)
  request.yar.flash('success_message', '')
  return { pageTitle: constant_model.invoiceListTitle, invoices: modifyInvoiceResponse(data?.invoices || []), success_message, userName: (request.yar.get('account')?.username || '') }
}

const createInvoice = async (request) => {
  const options_data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/referencedata/getall`)
  const account_type = common_model.modify_Response_Radio(options_data.referenceData.accountCodes)
  const delivery_body = options_data.referenceData.initialDeliveryBodies
  const invoice_template = options_data.referenceData.schemeInvoiceTemplates
  const invoice_template_secondary = options_data.referenceData.schemeInvoiceTemplateSecondaryQuestions
  const payment_type = common_model.modify_Response_Radio(options_data.referenceData.paymentTypes)
  return {
    pageTitle: constant_model.invoice_add_title,
    account_type,
    delivery_body,
    invoice_template,
    invoice_template_secondary,
    payment_type
  }
}

const createBulk = async (request) => {
  const options_data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/referencedata/getall`)
  const account_type = common_model.modify_Response_Radio(options_data.referenceData.accountCodes)
  const delivery_body = options_data.referenceData.initialDeliveryBodies
  const invoice_template = options_data.referenceData.schemeInvoiceTemplates
  return {
    pageTitle: constant_model.bulk_upload,
    account_type,
    delivery_body,
    invoice_template
  }
}

const invoiceStore = async (request) => {
  const payload = request.payload
  await external_request.sendExternalRequestPost(`${process.env.REQUEST_HOST}/invoices/add`, {
    AccountType: payload.account_type,
    DeliveryBody: payload.delivery_body,
    SchemeType: payload.invoice_template,
    SecondaryQuestion: payload.invoice_template_secondary,
    PaymentType: payload.payment_type

  })
  request.yar.flash('success_message', constant_model.invoice_creation_success)
}

const invoiceSummary = async (request) => {
  const success_message = request.yar.flash('success_message')
  const data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoices/getbyid`, { invoiceId: request.params.id })
  const summaryData = data?.invoice || []
  const getAllPayments = await payment_model.getAllPayments(request.params.id)
  summaryData.invoiceRequests = getAllPayments
  const summaryBox = { head: 'Invoice Id', actions: [], id: summaryData.id, rows: await modifyForSummaryBox(summaryData) }
  const update_Data = Object.assign({}, summaryData)
  const summaryHeader = [{ text: 'Account Type' }, { text: 'Delivery Body' }, { text: 'Scheme Type' }, { text: 'Payment Type' }]
  const summaryTable = common_model.modify_Response_Table(common_model.removeForSummaryTable(summaryData))
  request.yar.flash('success_message', '')
  return {
    pageTitle: constant_model.invoice_summary_title,
    summaryTable,
    summaryBox,
    paymentLink: `/createPayment/${request.params.id}`,
    total_requests: (getAllPayments?.length || 0),
    summaryHeader,
    allPayments: getAllPayments,
    success_message
  }
}

const modifyForSummaryBox = async (summaryData) => {
  const summaryBoxData = []
  summaryBoxData.push({ name: 'Status', value: `<strong class="govuk-tag">${summaryData.status.toUpperCase()}</strong>` })
  summaryBoxData.push({ name: 'Created On', value: common_model.formatTimestamp(summaryData.created) })
  summaryBoxData.push({ name: 'Number Of Invoice Requests', value: (summaryData?.invoiceRequests?.length || 0).toString() })
  return common_model.modify_Response_Summary(summaryBoxData)
}

const modifyInvoiceResponse = (invoice_list, action = true) => {
  return invoice_list.map((item) => {
    return {
      head: 'Invoice Id',
      actions: action
        ? [
            { link: `/viewInvoice/${item.id}`, name: 'View' },
            { link: `/deleteInvoice/${item.id}`, name: 'Delete' }
          ]
        : [],
      id: item.id,
      rows: common_model.modifyForSummary(item)
    }
  })
}

const deleteInvoice = async (request) => {
  await external_request.sendExternalRequestDelete(`${process.env.REQUEST_HOST}/invoices/delete`, {
    invoiceId: request.params.id
  })
  request.yar.flash('success_message', constant_model.invoice_deletion_success)
  return request.params.id
}

const downloadFile = async (request, h) => {
  const filePath = Path.join(__dirname, 'sample_files', 'sample.xlsx')
  return h.file(filePath)
}

const BulkDataUpload = async (request) => {
  const { payload } = request
  const bulk_data = JSON.parse(payload.bulk_data)
  await external_request.sendExternalRequestPost(`${process.env.REQUEST_HOST}/bulkuploads/confirm`, {
    invoiceId: bulk_data.bulkUploadInvoice.id,
    confirmUpload: true,
    confirm: true
  })
  request.yar.flash('success_message', constant_model.invoiceline_bulkupload_success)
}

const uploadBulk = async (request, h) => {
  const { payload } = request
  const bulk_data = await common_model.processUploadedCSV(payload.bulk_file)
  if (!bulk_data) {
    request.yar.flash('error_message', constant_model.invoiceline_bulkupload_failed)
    return h.redirect(`/viewPaymentLine/${payload.payment_id}`).temporary()
  } else {
    const invoiceRequests = bulk_data?.bulkUploadInvoice?.bulkUploadApHeaderLines.map((invRequest, ind) => {
      return {
        id: invRequest.invoiceRequestId,
        invid: invRequest.invoiceId,
        index: (ind + 1),
        summary_data: common_model.BulkHeadData(invRequest, true),
        lines_data: common_model.BulkLineData(invRequest.bulkUploadApDetailLines, true)
      }
    })
    return h.view('app_views/bulk_view', {
      pageTitle: constant_model.bulk_upload,
      invoices: modifyInvoiceResponse([bulk_data?.bulkUploadInvoice], action = false),
      invoiceRequests,
      bulk_data: JSON.stringify(bulk_data)
    })
  }
}

module.exports = { createBulk, modifyInvoiceResponse, modifyForSummaryBox, downloadFile, BulkDataUpload, uploadBulk, getAllInvoices, deleteInvoice, createInvoice, invoiceStore, invoiceSummary }
