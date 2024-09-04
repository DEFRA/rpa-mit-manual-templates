const common_model = require('./common_model')
const external_request = require('../custom_requests/external_requests')
const payment_model = require('./payment_model')
const constant_model = require('../app_constants/app_constant')

const getTotalInvoiceLines = async (ID) => {
  const total_lines = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoicelines/getbyinvoicerequestid`, {
    invoiceRequestId: ID
  })
  return (total_lines?.invoiceLines.length || 0)
}

const deleteInvoiceLine = async (request) => {
  await external_request.sendExternalRequestDelete(`${process.env.REQUEST_HOST}/invoicelines/delete`, {
    invoiceLineId: request.params.id
  })
  request.yar.flash('success_message', constant_model.invoiceLineDeletionSuccess)
  return request.params.invoiceid
}

const getAllInvoiceLines = async (request) => {
  const success_message = request.yar.flash('success_message')
  const error_message = request.yar.flash('error_message')
  const data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoicelines/getbyinvoicerequestid`, {
    invoiceRequestId: request.params.id
  })
  const lineData = data?.invoiceLines || []
  const lineHeader = [{ text: 'Fund Code' }, { text: 'Main Account' }, { text: 'Scheme Code' }, { text: 'Marketing Year' }, { text: 'Delivery Body' }, { text: 'Line Value' }, { text: 'Description' }, { text: 'Action' }]
  const lineTable = common_model.addForSummaryTableLine(lineData)
  const summaryPayment = await modifyPaymentResponse(request.params.id, true)
  request.yar.flash('success_message', '')
  request.yar.flash('error_message', '')
  return {
    pageTitle: constant_model.invoiceLineSummaryTitle,
    payment_id: request.params.id,
    lineLink: `/createInvoiceLine/${request.params.id}`,
    summaryTable: lineTable,
    summaryHeader: lineHeader,
    success_message,
    error_message,
    summaryPayment
  }
}

const viewInvoiceLine = async (request) => {
  const options_data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/referencedata/getall`)
  const data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoicelines/getbyinvoicelineid`, { invoiceLineId: request.params.id })
  const lineData = data?.invoiceLine || []
  const summaryPayment = await modifyPaymentResponse(lineData.invoiceRequestId, false)
  return {
    pageTitle: constant_model.invoiceLineViewTitle,
    summaryPayment,
    payment_id: lineData.invoiceRequestId,
    line_id: request.params.id,
    paymentvalue: lineData.value,
    description: common_model.modify_Response_Select(options_data.referenceData.schemeTypes, lineData.description),
    fundcode: common_model.modify_Response_Select(options_data.referenceData.fundCodes, lineData.fundCode),
    mainaccount: common_model.modify_Response_Select(options_data.referenceData.accountCodes, lineData.mainAccount),
    schemecode: common_model.modify_Response_Select(options_data.referenceData.schemeCodes, lineData.schemeCode),
    marketingyear: common_model.modify_Response_Select(options_data.referenceData.marketingYears, lineData.marketingYear),
    deliverybody: common_model.modify_Response_Select(options_data.referenceData.deliveryBodies, lineData.deliveryBody),
    disableditem: true,
    attributesitem: { readonly: 'readonly' },
    view_type: 'view'
  }
}

const createInvoiceLine = async (request) => {
  const options_data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/referencedata/getall`)
  const summaryPayment = await modifyPaymentResponse(request.params.id, false)
  return {
    pageTitle: constant_model.invoiceLineAddTitle,
    summaryPayment,
    payment_id: request.params.id,
    paymentvalue: '0.00',
    description: common_model.modify_Response_Select(options_data.referenceData.schemeTypes),
    fundcode: common_model.modify_Response_Select(options_data.referenceData.fundCodes),
    mainaccount: common_model.modify_Response_Select(options_data.referenceData.accountCodes),
    schemecode: common_model.modify_Response_Select(options_data.referenceData.schemeCodes),
    marketingyear: common_model.modify_Response_Select(options_data.referenceData.marketingYears),
    deliverybody: common_model.modify_Response_Select(options_data.referenceData.deliveryBodies),
    disableditem: false,
    attributesitem: {},
    view_type: 'create'
  }
}

const updateInvoiceLine = async (request) => {
  const options_data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/referencedata/getall`)
  const data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoicelines/getbyinvoicelineid`, { invoiceLineId: request.params.id })
  const lineData = data?.invoiceLine || []
  const summaryPayment = await modifyPaymentResponse(lineData.invoiceRequestId, false)
  return {
    pageTitle: constant_model.invoiceline_edit_title,
    summaryPayment,
    payment_id: lineData.invoiceRequestId,
    line_id: request.params.id,
    paymentvalue: lineData.value,
    description: common_model.modify_Response_Select(options_data.referenceData.schemeTypes, lineData.description),
    fundcode: common_model.modify_Response_Select(options_data.referenceData.fundCodes, lineData.fundCode),
    mainaccount: common_model.modify_Response_Select(options_data.referenceData.accountCodes, lineData.mainAccount),
    schemecode: common_model.modify_Response_Select(options_data.referenceData.schemeCodes, lineData.schemeCodes),
    marketingyear: common_model.modify_Response_Select(options_data.referenceData.marketingYears, lineData.marketingYears),
    deliverybody: common_model.modify_Response_Select(options_data.referenceData.deliveryBodies, lineData.deliveryBodies),
    disableditem: false,
    attributesitem: {},
    view_type: 'edit'
  }
}

const invoiceLineStore = async (request) => {
  const payload = request.payload
  if (payload.line_id) {
    await external_request.sendExternalRequestPut(`${process.env.REQUEST_HOST}/invoicelines/update`, {
      Value: payload.paymentvalue,
      InvoiceRequestId: payload.payment_id,
      Description: payload.description,
      FundCode: payload.fundcode,
      MainAccount: payload.mainaccount,
      SchemeCode: payload.schemecode,
      MarketingYear: payload.marketingyear,
      DeliveryBody: payload.deliverybody,
      Id: payload.line_id
    })
    request.yar.flash('success_message', constant_model.invoiceLineUpdateSuccess)
  } else {
    await external_request.sendExternalRequestPost(`${process.env.REQUEST_HOST}/invoicelines/add`, {
      Value: payload.paymentvalue,
      InvoiceRequestId: payload.payment_id,
      Description: payload.description,
      FundCode: payload.fundcode,
      MainAccount: payload.mainaccount,
      SchemeCode: payload.schemecode,
      MarketingYear: payload.marketingyear,
      DeliveryBody: payload.deliverybody
    })
    request.yar.flash('success_message', constant_model.invoiceLineCreationSuccess)
  }
  return payload.payment_id
}

const modifyPaymentResponse = async (id, show_actions) => {
  const data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoicerequests/getbyid`, { invoiceRequestId: id })
  const payment = data?.invoiceRequest || []
  return {
    head: 'Invoice Request Id',
    actions: show_actions
      ? [
          { link: `/editPayment/${payment.invoiceRequestId}/${payment.invoiceId}`, name: 'Edit' }
        ]
      : [],
    id: payment.invoiceRequestId,
    rows: payment_model.modifyForPaymentSummary(payment)
  }
}

module.exports = { getTotalInvoiceLines, modifyPaymentResponse, getAllInvoiceLines, deleteInvoiceLine, viewInvoiceLine, invoiceLineStore, updateInvoiceLine, viewInvoiceLine, deleteInvoiceLine, createInvoiceLine }
