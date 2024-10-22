const commonModel = require('./commonModel')
const externalRequest = require('../custom_requests/externalRequests')
const constantModel = require('../app_constants/appConstant')

const getTotalPayments = async (invoiceID) => {
  const totalPayments = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoicerequests/getapbyinvoiceid`, {
    invoiceId: invoiceID
  })
  return (totalPayments?.invoiceRequests.length || 0)
}

const createPayment = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`)
  const paymentType = commonModel.modifyResponseSelect(optionsData.referenceData.paymentTypes)
  const invoiceData = await summaryPayments(request.params.id)
  return {
    pageTitle: constantModel.paymentAddTitle,
    paymentType,
    ...invoiceData,
    invoicetype: invoiceData.summaryTable[0][0].text,
    invoiceId: request.params.id,
    marketingyear: commonModel.modifyResponseSelect(optionsData.referenceData.marketingYears),
    frn: '',
    sbi: '',
    vendor: '',
    description: '',
    claimreferencenumber: '',
    claimreference: '',
    disableditem: false,
    attributesitem: {},
    view_type: 'create'
  }
}

const updatePayment = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`)
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoicerequests/getbyid`, { invoiceRequestId: request.params.id })
  const paymentData = data?.invoiceRequest || []
  const paymentType = commonModel.modifyResponseSelect(optionsData.referenceData.paymentTypes, paymentData.currency)
  const invoiceData = await summaryPayments(request.params.invoiceid)
  return {
    pageTitle: constantModel.paymentEditTitle,
    paymentType,
    ...invoiceData,
    invoiceId: request.params.invoiceid,
    frn: paymentData.frn,
    sbi: paymentData.sbi,
    vendor: paymentData.vendor,
    description: paymentData.description,
    marketingyear: commonModel.modifyResponseSelect(optionsData.referenceData.marketingYears, paymentData.marketingYear),
    claimreferencenumber: paymentData.claimReferenceNumber,
    claimreference: paymentData.claimReference,
    disableditem: false,
    paymentId: request.params.id,
    attributesitem: {},
    view_type: 'edit'
  }
}

const viewPayment = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`)
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoicerequests/getapbyid`, { invoiceRequestId: request.params.id })
  const paymentData = data?.invoiceRequest || []
  const paymentType = commonModel.modifyResponseSelect(optionsData.referenceData.paymentTypes, paymentData.currency)
  const invoiceData = await summaryPayments(request.params.invoiceid)
  return {
    pageTitle: constantModel.paymentViewTitle,
    paymentType,
    ...invoiceData,
    invoiceId: request.params.invoiceid,
    frn: paymentData.frn,
    sbi: paymentData.sbi,
    vendor: paymentData.vendor,
    description: paymentData.description,
    claimreferencenumber: paymentData.claimReferenceNumber,
    claimreference: paymentData.claimReference,
    marketingyear: commonModel.modifyResponseSelect(optionsData.referenceData.marketingYears, paymentData.marketingYear),
    disableditem: true,
    attributesitem: { readonly: 'readonly' },
    view_type: 'view'
  }
}

const paymentStore = async (request) => {
  const payload = request.payload
  if (payload.paymentId) {
    await externalRequest.sendExternalRequestPut(`${constantModel.requestHost}/invoicerequests/update`, {
      FRN: payload.frn,
      SBI: payload.sbi,
      Vendor: payload.vendor,
      Currency: payload.currency,
      Description: payload.description,
      InvoiceRequestId: payload.paymentId,
      ClaimReference: payload.claimreference,
      ClaimReferenceNumber: payload.claimreferencenumber,
      AgreementNumber: '',
      MarketingYear: payload.marketingyear,
      AccountType: ''
    })
    request.yar.flash('successMessage', constantModel.paymentUpdateSuccess)
  } else {
    await externalRequest.sendExternalRequestPost(`${constantModel.requestHost}/invoicerequests/${payload.invoicetype === 'AP' ? 'add' : 'addar'}`, {
      InvoiceId: payload.inv_id,
      FRN: payload.frn,
      SBI: payload.sbi,
      Vendor: payload.vendor,
      Currency: payload.currency,
      Description: payload.description,
      ClaimReference: payload.claimreference,
      ClaimReferenceNumber: payload.claimreferencenumber,
      AgreementNumber: '',
      MarketingYear: payload.marketingyear,
      AccountType: ''
    })
    request.yar.flash('successMessage', constantModel.paymentCreationSuccess)
  }
  return payload.inv_id
}

const summaryPayments = async (id) => {
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoices/getbyid`, { invoiceId: id })
  const summaryData = data?.invoice || []
  const summaryHeader = [{ text: 'Account Type' }, { text: 'Delivery Body' }, { text: 'Scheme Type' }, { text: 'Payment Type' }]
  const summaryTable = commonModel.modifyResponseTable(commonModel.removeForSummaryTable(summaryData))
  return { summaryTable, summaryHeader }
}

const getAllPayments = async (invoiceID) => {
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoicerequests/getapbyinvoiceid`, {
    invoiceId: invoiceID
  })
  return modifyPaymentResponse((data?.invoiceRequests || []))
}

const deletePayment = async (request) => {
  await externalRequest.sendExternalRequestDelete(`${constantModel.requestHost}/invoicerequests/delete`, {
    invoiceRequestId: request.params.id
  })
  request.yar.flash('successMessage', constantModel.paymentDeletionSuccess)
  return request.params.invoiceid
}

const modifyPaymentResponse = (paymentList) => {
  return paymentList.map((item) => {
    return {
      head: 'Invoice Request Id',
      actions: [
        { link: `/viewPayment/${item.invoiceRequestId}/${item.invoiceId}`, name: 'View' },
        { link: `/viewPaymentLine/${item.invoiceRequestId}`, name: 'Detail Line' },
        { link: `/deletePayment/${item.invoiceRequestId}/${item.invoiceId}`, name: 'Delete' }
      ],
      id: item.invoiceRequestId,
      rows: modifyForPaymentSummary(item)
    }
  })
}

const modifyForPaymentSummary = (payment) => {
  const paymentData = []
  paymentData.push({ name: 'FRN', value: payment.frn })
  paymentData.push({ name: 'Currency', value: payment.currency })
  paymentData.push({ name: 'Description', value: payment.description })
  paymentData.push({ name: 'Value', value: payment.value?.toString() })
  return commonModel.modifyResponseSummary(paymentData)
}

module.exports = { modifyForPaymentSummary, getTotalPayments, getAllPayments, createPayment, paymentStore, updatePayment, viewPayment, deletePayment }
