const commonModel = require('./commonModel')
const externalRequest = require('../custom_requests/externalRequests')
const paymentModel = require('./paymentModel')
const constantModel = require('../app_constants/appConstant')
const {getGlobal} = require('../hooks/custom_hook')

const deleteInvoiceLine = async (request) => {
  await externalRequest.sendExternalRequestDelete(`${constantModel.requestHost}/invoicelines/delete`, {
    invoiceLineId: request.params.id
  }, {}, request)
  request.yar.flash('successMessage', constantModel.invoiceLineDeletionSuccess)
  return request.params.invoiceid
}

const getAllInvoiceLines = async (request) => {
  const successMessage = request.yar.flash('successMessage')
  const errorMessage = request.yar.flash('errorMessage')
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoicelines/getbyinvoicerequestid`, {
    invoiceRequestId: request.params.id
  }, {}, request)
  const lineData = data?.invoiceLines || []
  const lineHeader = [{ text: 'Fund Code' }, { text: 'Main Account' }, { text: 'Scheme Code' }, { text: 'Marketing Year' }, { text: 'Delivery Body' }, { text: 'Line Value' }, { text: 'Description' }, { text: 'Action' }]
  const lineTable = commonModel.addForSummaryTableLine(lineData)
  const summaryPayment = await modifyPaymentResponse(request.params.id, true, request)
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
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`, {}, {}, request)
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoicelines/getbyinvoicelineid`, { invoiceLineId: request.params.id }, {}, request)
  const lineData = data?.invoiceLine || []
  const summaryPayment = await modifyPaymentResponse(lineData.invoiceRequestId, false, request)
  const DeliverBody = request.yar.get('deliverbody') || ''
  const schemetemplate = request.yar.get('schemetemplate') || ''
  let orgget = ''
  if (DeliverBody === 'rpa') { orgget = schemetemplate } else { orgget = optionsData.referenceData.initialDeliveryBodies?.find(data => (data.code === DeliverBody))?.org || '' }

  return {
    pageTitle: constantModel.invoiceLineViewTitle,
    summaryPayment,
    paymentId: lineData.invoiceRequestId,
    line_id: request.params.id,
    paymentvalue: lineData.value,
    description: lineData.description,
    fundcode: commonModel.modifyResponseSelect(optionsData.referenceData.fundCodes?.filter(data => ((data?.org || orgget).includes(orgget))), lineData.fundCode),
    mainaccount: commonModel.modifyResponseSelect(optionsData.referenceData.accountCodes?.filter(data => ((data?.org || orgget).includes(orgget))), lineData.mainAccount),
    schemecode: commonModel.modifyResponseSelect(optionsData.referenceData.schemeCodes?.filter(data => ((data?.org || orgget).includes(orgget))), lineData.schemeCode),
    marketingyear: commonModel.modifyResponseSelect(optionsData.referenceData.marketingYears, lineData.marketingYear),
    deliverybody: commonModel.modifyResponseSelect(optionsData.referenceData.deliveryBodies?.filter(data => ((data?.org || orgget).includes(orgget))), lineData.deliveryBody),
    disableditem: true,
    optionsData,
    attributesitem: { readonly: 'readonly' },
    attributesitem2: { readonly: 'readonly' },
    view_type: 'view'
  }
}

const createInvoiceLine = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`, {}, {}, request)
  let dropdownData = null
  if(getGlobal(request.yar.get('invid')))
  {
    dropdownData = getGlobal(request.yar.get('invid'))
  }
  else
  dropdownData = (await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/dropdowns/getall`, {}, {}, request))?.Dropdowns|| []
  const summaryPayment = await modifyPaymentResponse(request.params.id, false, request)
  const DeliverBody = request.yar.get('deliverbody') || ''
  const schemetemplate = request.yar.get('schemetemplate') || ''
  let orgget = ''
  console.log('createInvoiceLine')
  console.log('DeliverBody')
  console.log(DeliverBody)
  console.log('schemetemplate')
  console.log(schemetemplate)
  console.log('schemeCode')
  if (DeliverBody === 'RPA') {
    orgget = schemetemplate
    console.log('orgget')
    console.log(orgget)
    return {
      pageTitle: constantModel.invoiceLineAddTitle,
      summaryPayment,
      paymentId: request.params.id,
      paymentvalue: '0.00',
      description: '',
      fundcode: commonModel.modifyResponseSelect(dropdownData.funds.split(",")),
      mainaccount: commonModel.modifyResponseSelect(dropdownData.accounts.split(",")),
      schemecode: commonModel.modifyResponseSelect(dropdownData.schemeTypes.split(",")),
      marketingyear: commonModel.modifyResponseSelect(dropdownData.marketingYears.split(",")),
      deliverybody: commonModel.modifyResponseSelect(dropdownData.deliveryBodies.split(",")),
      disableditem: false,
      attributesitem: {},
      optionsData,
      accountType:(request.yar.get('accounttype') || ''),
      attributesitem2: { readonly: 'readonly' },
      view_type: 'create'
    }
  } else {
    orgget = optionsData.referenceData.initialDeliveryBodies?.find(data => (data.code === DeliverBody))?.org || ''
  }
  return {
    pageTitle: constantModel.invoiceLineAddTitle,
    summaryPayment,
    paymentId: request.params.id,
    paymentvalue: '0.00',
    description: '',
    fundcode: commonModel.modifyResponseSelect(dropdownData.funds.split(",")),
    mainaccount: commonModel.modifyResponseSelect(dropdownData.accounts.split(",")),
    schemecode: commonModel.modifyResponseSelect(dropdownData.schemeTypes.split(",")),
    marketingyear: commonModel.modifyResponseSelect(dropdownData.marketingYears.split(",")),
    deliverybody: commonModel.modifyResponseSelect(dropdownData.deliveryBodies.split(",")),
    disableditem: false,
    attributesitem: {},
    optionsData,
    accountType:(request.yar.get('accounttype') || ''),
    attributesitem2: { readonly: 'readonly' },
    view_type: 'create'
  }
}

const updateInvoiceLine = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`, {}, {}, request)
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoicelines/getbyinvoicelineid`, { invoiceLineId: request.params.id }, {}, request)
  const lineData = data?.invoiceLine || []
  const summaryPayment = await modifyPaymentResponse(lineData.invoiceRequestId, false, request)
  const DeliverBody = request.yar.get('deliverbody') || ''
  const schemetemplate = request.yar.get('schemetemplate') || ''
  let orgget = ''
  if (DeliverBody === 'rpa') { orgget = schemetemplate } else { orgget = optionsData.referenceData.initialDeliveryBodies?.find(data => (data.code === DeliverBody))?.org || '' }
  return {
    pageTitle: constantModel.invoiceLineEditTitle,
    summaryPayment,
    paymentId: lineData.invoiceRequestId,
    line_id: request.params.id,
    paymentvalue: lineData.value,
    description: '',
    fundcode: commonModel.modifyResponseSelect(optionsData.referenceData.fundCodes?.filter(data => ((data?.org || orgget).includes(orgget))), lineData.fundCode),
    mainaccount: commonModel.modifyResponseSelect(optionsData.referenceData.accountAps?.filter(data => ((data?.org || orgget).includes(orgget))), lineData.mainAccount),
    schemecode: commonModel.modifyResponseSelect(optionsData.referenceData.schemeCodes?.filter(data => ((data?.org || orgget).includes(orgget))), lineData.schemeCodes),
    marketingyear: commonModel.modifyResponseSelect(optionsData.referenceData.marketingYears, lineData.marketingYears),
    deliverybody: commonModel.modifyResponseSelect(optionsData.referenceData.deliveryBodies?.filter(data => ((data?.org || orgget).includes(orgget))), lineData.deliveryBodies),
    disableditem: false,
    attributesitem: {},
    optionsData,
    dropdownAll:null,
    accountType:(request.yar.get('accounttype') || ''),
    attributesitem2: { readonly: 'readonly' },
    view_type: 'edit'
  }
}

// const getDescription = async (payload) => {
//   const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`)
//   const description =
//   optionsData.referenceData.chartOfAccounts?.find(data => ((data?.code || '') === (payload.mainaccount + '/' + payload.schemecode + '/' + payload.deliverybody)))?.description || ''
//   if (description) { return description } else {
//     return `${(optionsData.referenceData.accountCodes?.find(data => ((data?.code || '') === payload.mainaccount))?.description || '')} ${(optionsData.referenceData.schemeCodes?.find(data => ((data?.code || '') === payload.schemecode))?.description || '')} ${(optionsData.referenceData.deliveryBodies?.find(data => ((data?.code || '') === payload.deliverybody))?.description || '')}`
//   }
// }

const invoiceLineStore = async (request) => {
  const payload = request.payload
  // const descriptionGet = await getDescription(payload)
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
    }, {}, request)
    request.yar.flash('successMessage', constantModel.invoiceLineUpdateSuccess)
  } else {
    await externalRequest.sendExternalRequestPost(`${constantModel.requestHost}/invoicelines/${(request.yar.get('accounttype') || '').toUpperCase().includes('AP') ? 'addap' : 'addar'}`, {
      Value: payload.paymentvalue,
      InvoiceRequestId: payload.paymentId,
      Description: payload.description,
      FundCode: payload.fundcode,
      MainAccount: payload.mainaccount,
      SchemeCode: payload.schemecode,
      MarketingYear: payload.marketingyear,
      DeliveryBody: payload.deliverybody
    }, {}, request)
    request.yar.flash('successMessage', constantModel.invoiceLineCreationSuccess)
  }
  return payload.paymentId
}

const modifyPaymentResponse = async (id, showActions, request) => {
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoicerequests/getapbyid`, { invoiceRequestId: id }, {}, request)
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

module.exports = { modifyPaymentResponse, getAllInvoiceLines, viewInvoiceLine, invoiceLineStore, updateInvoiceLine, deleteInvoiceLine, createInvoiceLine }
