const commonModel = require('./commonModel')
const externalRequest = require('../custom_requests/externalRequests')
const constantModel = require('../app_constants/appConstant')

const getAllInvoices = async (request) => {
  const successMessage = request.yar.flash('successMessage')
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/approvals/getmyapprovals`, {})
  request.yar.flash('successMessage', '')
  return { pageTitle: constantModel.approveInvoiceListTitle, invoices: modifyInvoiceResponse(data?.invoices || []), successMessage }
}

const approveInvoice = async (request) => {
  await externalRequest.sendExternalRequestPost(`${constantModel.requestHost}/approvals/approve`, {
    id: request.params.id
  })
  request.yar.flash('successMessage', constantModel.invoiceApproveSuccess)
  return request.params.id
}

const rejectInvoice = async (request) => {
  const payload = request.payload
  await externalRequest.sendExternalRequestPost(`${constantModel.requestHost}/approvals/reject`, {
    id: payload.invoiceId,
    reason: payload.reason
  })
  request.yar.flash('successMessage', constantModel.invoiceRejectSuccess)
  return request.params.id
}

const modifyInvoiceResponse = (invoiceList, action = true) => {
  return invoiceList.map((item) => {
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
  const data = await externalRequest.sendExternalRequestPost(`${constantModel.requestHost}/approvals/getinvoiceforapproval`, { invoiceId: request.params.id })
  const invoiceRequests = data?.invoice?.invoiceRequests.map((invRequest, ind) => {
    return {
      id: invRequest.invoiceRequestId,
      invid: invRequest.invoiceId,
      index: (ind + 1),
      summary_data: commonModel.BulkHeadData(invRequest, false),
      lines_data: commonModel.BulkLineData(invRequest.invoiceLines, false)
    }
  })
  const modifiedInvoiceResponse = modifyInvoiceResponse([data?.invoice], false)

  return h.view('app_views/approvalInvoiceSummary', {
    pageTitle: constantModel.approvalInvoiceSummary,
    invoices: modifiedInvoiceResponse,
    invoiceRequests,
    invoiceId: data?.invoice?.id,
    approveUrl: `/approveInvoice/${data?.invoice?.id}`
  })
}

module.exports = { getAllInvoices, modifyInvoiceResponse, invoiceSummary, approveInvoice, rejectInvoice }
