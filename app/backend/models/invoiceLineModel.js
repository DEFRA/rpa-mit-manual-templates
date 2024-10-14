const commonModel = require('./commonModel')
const externalRequest = require('../custom_requests/externalRequests')
const paymentModel = require('./paymentModel')
const constantModel = require('../app_constants/appConstant')

const getTotalInvoiceLines = async (ID) => {
  const totalLines = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoicelines/getbyinvoicerequestid`, {
    invoiceRequestId: ID
  })
  return (totalLines?.invoiceLines.length || 0)
}

const deleteInvoiceLine = async (request) => {
  await externalRequest.sendExternalRequestDelete(`${constantModel.requestHost}/invoicelines/delete`, {
    invoiceLineId: request.params.id
  })
  request.yar.flash('successMessage', constantModel.invoiceLineDeletionSuccess)
  return request.params.invoiceid
}

const getAllInvoiceLines = async (request) => {
  const successMessage = request.yar.flash('successMessage')
  const errorMessage = request.yar.flash('errorMessage')
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoicelines/getbyinvoicerequestid`, {
    invoiceRequestId: request.params.id
  })
  const lineData = data?.invoiceLines || []
  const lineHeader = [{ text: 'Fund Code' }, { text: 'Main Account' }, { text: 'Scheme Code' }, { text: 'Marketing Year' }, { text: 'Delivery Body' }, { text: 'Line Value' }, { text: 'Description' }, { text: 'Action' }]
  const lineTable = commonModel.addForSummaryTableLine(lineData)
  const summaryPayment = await modifyPaymentResponse(request.params.id, true)
  request.yar.flash('successMessage', '')
  request.yar.flash('errorMessage', '')
  return {
    pageTitle: constantModel.invoiceLineSummaryTitle,
    paymentId: request.params.id,
    lineLink: `/createInvoiceLine/${request.params.id}`,
    summaryTable: lineTable,
    summaryHeader: lineHeader,
    successMessage,
    errorMessage,
    summaryPayment
  }
}

const viewInvoiceLine = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`)
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoicelines/getbyinvoicelineid`, { invoiceLineId: request.params.id })
  const lineData = data?.invoiceLine || []
  const summaryPayment = await modifyPaymentResponse(lineData.invoiceRequestId, false)
  return {
    pageTitle: constantModel.invoiceLineViewTitle,
    summaryPayment,
    paymentId: lineData.invoiceRequestId,
    line_id: request.params.id,
    paymentvalue: lineData.value,
    description: commonModel.modifyResponseSelect(optionsData.referenceData.schemeTypes, lineData.description),
    fundcode: commonModel.modifyResponseSelect(optionsData.referenceData.fundCodes, lineData.fundCode),
    mainaccount: commonModel.modifyResponseSelect(optionsData.referenceData.accountAps, lineData.mainAccount),
    schemecode: commonModel.modifyResponseSelect(optionsData.referenceData.schemeCodes, lineData.schemeCode),
    marketingyear: commonModel.modifyResponseSelect(optionsData.referenceData.marketingYears, lineData.marketingYear),
    deliverybody: commonModel.modifyResponseSelect(optionsData.referenceData.deliveryBodies, lineData.deliveryBody),
    disableditem: true,
    attributesitem: { readonly: 'readonly' },
    view_type: 'view'
  }
}

const createInvoiceLine = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`)
  const summaryPayment = await modifyPaymentResponse(request.params.id, false)
  return {
    pageTitle: constantModel.invoiceLineAddTitle,
    summaryPayment,
    paymentId: request.params.id,
    paymentvalue: '0.00',
    description: commonModel.modifyResponseSelect(optionsData.referenceData.schemeTypes),
    fundcode: commonModel.modifyResponseSelect(optionsData.referenceData.fundCodes),
    mainaccount: commonModel.modifyResponseSelect(optionsData.referenceData.accountAps),
    schemecode: commonModel.modifyResponseSelect(optionsData.referenceData.schemeCodes),
    marketingyear: commonModel.modifyResponseSelect(optionsData.referenceData.marketingYears),
    deliverybody: commonModel.modifyResponseSelect(optionsData.referenceData.deliveryBodies),
    disableditem: false,
    attributesitem: {},
    view_type: 'create'
  }
}

const updateInvoiceLine = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`)
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoicelines/getbyinvoicelineid`, { invoiceLineId: request.params.id })
  const lineData = data?.invoiceLine || []
  const summaryPayment = await modifyPaymentResponse(lineData.invoiceRequestId, false)
  return {
    pageTitle: constantModel.invoiceLineEditTitle,
    summaryPayment,
    paymentId: lineData.invoiceRequestId,
    line_id: request.params.id,
    paymentvalue: lineData.value,
    description: commonModel.modifyResponseSelect(optionsData.referenceData.schemeTypes, lineData.description),
    fundcode: commonModel.modifyResponseSelect(optionsData.referenceData.fundCodes, lineData.fundCode),
    mainaccount: commonModel.modifyResponseSelect(optionsData.referenceData.accountAps, lineData.mainAccount),
    schemecode: commonModel.modifyResponseSelect(optionsData.referenceData.schemeCodes, lineData.schemeCodes),
    marketingyear: commonModel.modifyResponseSelect(optionsData.referenceData.marketingYears, lineData.marketingYears),
    deliverybody: commonModel.modifyResponseSelect(optionsData.referenceData.deliveryBodies, lineData.deliveryBodies),
    disableditem: false,
    attributesitem: {},
    view_type: 'edit'
  }
}

const invoiceLineStore = async (request) => {
  const payload = request.payload
  if (payload.line_id) {
    await externalRequest.sendExternalRequestPut(`${constantModel.requestHost}/invoicelines/update`, {
      Value: payload.paymentvalue,
      InvoiceRequestId: payload.paymentId,
      Description: payload.description,
      FundCode: payload.fundcode,
      MainAccount: payload.mainaccount,
      SchemeCode: payload.schemecode,
      MarketingYear: payload.marketingyear,
      DeliveryBody: payload.deliverybody,
      Id: payload.line_id
    })
    request.yar.flash('successMessage', constantModel.invoiceLineUpdateSuccess)
  } else {
    await externalRequest.sendExternalRequestPost(`${constantModel.requestHost}/invoicelines/addap`, {
      Value: payload.paymentvalue,
      InvoiceRequestId: payload.paymentId,
      Description: payload.description,
      FundCode: payload.fundcode,
      MainAccount: payload.mainaccount,
      SchemeCode: payload.schemecode,
      MarketingYear: payload.marketingyear,
      DeliveryBody: payload.deliverybody
    })
    request.yar.flash('successMessage', constantModel.invoiceLineCreationSuccess)
  }
  return payload.paymentId
}

const modifyPaymentResponse = async (id, showActions) => {
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoicerequests/getbyid`, { invoiceRequestId: id })
  const payment = data?.invoiceRequest || []
  return {
    head: 'Invoice Request Id',
    actions: showActions
      ? [
          { link: `/editPayment/${payment.invoiceRequestId}/${payment.invoiceId}`, name: 'Edit' }
        ]
      : [],
    id: payment.invoiceRequestId,
    rows: paymentModel.modifyForPaymentSummary(payment)
  }
}

module.exports = { getTotalInvoiceLines, modifyPaymentResponse, getAllInvoiceLines, viewInvoiceLine, invoiceLineStore, updateInvoiceLine, deleteInvoiceLine, createInvoiceLine }
