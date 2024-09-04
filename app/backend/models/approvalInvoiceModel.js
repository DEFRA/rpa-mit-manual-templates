const commonModel = require('./commonModel')
const external_request = require('../custom_requests/external_requests')
const constant_model = require('../app_constants/app_constant')

const getAllInvoices = async (request) => {
  const success_message = request.yar.flash('success_message')
  const data = await external_request.sendExternalRequestPost(`${process.env.REQUEST_HOST}/approvals/getmyapprovals`, {})
  request.yar.flash('success_message', '')
  return { pageTitle: constant_model.approveInvoiceListTitle, invoices: modifyInvoiceResponse(data?.invoices || []), success_message }
}

const approveInvoice = async (request) => {
  await external_request.sendExternalRequestPost(`${process.env.REQUEST_HOST}/approvals/approve`, {
    id: request.params.id
  })
  request.yar.flash('success_message', constant_model.invoiceApproveSuccess)
  return request.params.id
}

const rejectInvoice = async (request) => {
  const payload = request.payload
  await external_request.sendExternalRequestPost(`${process.env.REQUEST_HOST}/approvals/reject`, {
    id: payload.invoice_id,
    reason: payload.reason
  })
  request.yar.flash('success_message', constant_model.invoiceRejectSuccess)
  return request.params.id
}

const modifyInvoiceResponse = (invoice_list, action = true) => {
  return invoice_list.map((item) => {
    return {
      head: 'Invoice Id',
      actions: action
        ? [
            { link: `/viewApprovalInvoice/${item.id}`, name: 'View' }
          ]
        : [],
      id: item.id,
      rows: commonModel.modifyForSummary(item)
    }
  })
}

const invoiceSummary = async (request, h) => {
  const data = await external_request.sendExternalRequestPost(`${process.env.REQUEST_HOST}/approvals/getinvoiceforapproval`, { invoiceId: request.params.id })
  const invoiceRequests = data?.invoice?.invoiceRequests.map((invRequest, ind) => {
    return {
      id: invRequest.invoiceRequestId,
      invid: invRequest.invoiceId,
      index: (ind + 1),
      summary_data: commonModel.BulkHeadData(invRequest, false),
      lines_data: commonModel.BulkLineData(invRequest.invoiceLines, false)
    }
  })
  return h.view('app_views/approval_invoice_summary', {
    pageTitle: constant_model.approval_invoice_summary,
    invoices: modifyInvoiceResponse([data?.invoice], action = false),
    invoiceRequests,
    invoiceId: data?.invoice?.id,
    approveUrl: `/approveInvoice/${data?.invoice?.id}`
  })
}

module.exports = { getAllInvoices, modifyInvoiceResponse, invoiceSummary, approveInvoice, rejectInvoice }
