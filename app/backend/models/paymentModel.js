const commonModel = require('./commonModel')
const externalRequest = require('../custom_requests/externalRequests')
const constantModel = require('../app_constants/app_constant')

const getTotalPayments = async (invoiceID) => {
  const totalPayments = await externalRequest.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoicerequests/getbyinvoiceid`, {
    invoiceId: invoiceID
  })
  return (totalPayments?.invoiceRequests.length || 0)
}

const createPayment = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${process.env.REQUEST_HOST}/referencedata/getall`)
  const paymentType = commonModel.modifyResponseSelect(optionsData.referenceData.paymentTypes)
  const invoice_data = await summaryPayments(request.params.id)
  return {
    pageTitle: constantModel.paymentAddTitle,
    paymentType,
    ...invoice_data,
    invoiceId: request.params.id,
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
  const optionsData = await externalRequest.sendExternalRequestGet(`${process.env.REQUEST_HOST}/referencedata/getall`)
  const data = await externalRequest.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoicerequests/getbyid`, { invoiceRequestId: request.params.id })
  const paymentData = data?.invoiceRequest || []
  const paymentType = commonModel.modifyResponseSelect(optionsData.referenceData.paymentTypes, paymentData.currency)
  const invoice_data = await summaryPayments(request.params.invoiceid)
  return {
    pageTitle: constantModel.paymentEditTitle,
    paymentType,
    ...invoice_data,
    invoiceId: request.params.invoiceid,
    frn: paymentData.frn,
    sbi: paymentData.sbi,
    vendor: paymentData.vendor,
    description: paymentData.description,
    claimreferencenumber: paymentData.claimReferenceNumber,
    claimreference: paymentData.claimReference,
    disableditem: false,
    paymentId: request.params.id,
    attributesitem: {},
    view_type: 'edit'
  }
}

const viewPayment = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${process.env.REQUEST_HOST}/referencedata/getall`)
  const data = await externalRequest.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoicerequests/getbyid`, { invoiceRequestId: request.params.id })
  const paymentData = data?.invoiceRequest || []
  const paymentType = commonModel.modifyResponseSelect(optionsData.referenceData.paymentTypes, paymentData.currency)
  const invoice_data = await summaryPayments(request.params.invoiceid)
  return {
    pageTitle: constantModel.paymentViewTitle,
    paymentType,
    ...invoice_data,
    invoiceId: request.params.invoiceid,
    frn: paymentData.frn,
    sbi: paymentData.sbi,
    vendor: paymentData.vendor,
    description: paymentData.description,
    claimreferencenumber: paymentData.claimReferenceNumber,
    claimreference: paymentData.claimReference,
    disableditem: true,
    attributesitem: { readonly: 'readonly' },
    view_type: 'view'
  }
}

const paymentStore = async (request) => {
  const payload = request.payload
  if (payload.paymentId) {
    await externalRequest.sendExternalRequestPut(`${process.env.REQUEST_HOST}/invoicerequests/update`, {
      FRN: payload.frn,
      SBI: payload.sbi,
      Vendor: payload.vendor,
      Currency: payload.currency,
      Description: payload.description,
      InvoiceRequestId: payload.paymentId,
      ClaimReference: payload.claimreference,
      ClaimReferenceNumber: payload.claimreferencenumber,
      AgreementNumber: '',
      MarketingYear: '',
      AccountType: ''
    })
    request.yar.flash('successMessage', constantModel.paymentUpdateSuccess)
  } else {
    await externalRequest.sendExternalRequestPost(`${process.env.REQUEST_HOST}/invoicerequests/add`, {
      InvoiceId: payload.inv_id,
      FRN: payload.frn,
      SBI: payload.sbi,
      Vendor: payload.vendor,
      Currency: payload.currency,
      Description: payload.description,
      ClaimReference: payload.claimreference,
      ClaimReferenceNumber: payload.claimreferencenumber,
      AgreementNumber: '',
      MarketingYear: '',
      AccountType: ''
    })
    request.yar.flash('successMessage', constantModel.paymentCreationSuccess)
  }
  return payload.inv_id
}

const summaryPayments = async (id) => {
  const data = await externalRequest.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoices/getbyid`, { invoiceId: id })
  const summaryData = data?.invoice || []
  const summaryHeader = [{ text: 'Account Type' }, { text: 'Delivery Body' }, { text: 'Scheme Type' }, { text: 'Payment Type' }]
  const summaryTable = commonModel.modifyResponseTable(commonModel.removeForSummaryTable(summaryData))
  return { summaryTable, summaryHeader }
}

const getAllPayments = async (invoiceID) => {
  const data = await externalRequest.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoicerequests/getbyinvoiceid`, {
    invoiceId: invoiceID
  })
  return modifyPaymentResponse((data?.invoiceRequests || []))
}

const deletePayment = async (request) => {
  await externalRequest.sendExternalRequestDelete(`${process.env.REQUEST_HOST}/invoicerequests/delete`, {
    invoiceRequestId: request.params.id
  })
  request.yar.flash('successMessage', constantModel.paymentDeletionSuccess)
  return request.params.invoiceid
}

const modifyPaymentResponse = (payment_list) => {
  return payment_list.map((item) => {
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
