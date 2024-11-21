const commonModel = require('./commonModel')
const externalRequest = require('../custom_requests/externalRequests')
const constantModel = require('../app_constants/appConstant')

const getAll = async (request) => {
  const successMessage = request.yar.flash('successMessage')
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`, {}, {}, request)
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/admin/approvers/getall`, {}, {}, request)
  request.yar.flash('successMessage', '')
  optionsData.referenceData.schemeCodes.unshift({ code: ' ', description: ' ' })
  optionsData.referenceData.deliveryBodies.unshift({ code: ' ', description: ' ' })
  return { schemecode: commonModel.modifyResponseSelect(optionsData.referenceData.schemeCodes), deliverybody: commonModel.modifyResponseSelect(optionsData.referenceData.deliveryBodies), pageTitle: constantModel.adminApproverList, invoices: modifyInvoiceResponse(data?.adminApprovers || []), successMessage }
}

const getAllSearch = async (request) => {
  const successMessage = request.yar.flash('successMessage')
  const payload = request.payload
  const filter = {}
  if (payload.email) {
    filter.email = payload.email
  }
  if (payload.threshold) {
    filter.threshold = payload.threshold
  }
  if (payload.deliverybody) {
    filter.deliveryBody = payload.deliverybody
  }
  if (payload.schemecode) {
    filter.schemeCode = payload.schemecode
  }
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`, filter, {}, request)
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/admin/approvers/${Object.keys(filter).length == 4 ? 'getbyall' : 'getbyall'}`, filter, {}, request)
  request.yar.flash('successMessage', '')
  optionsData.referenceData.schemeCodes.unshift({ code: ' ', description: ' ' })
  optionsData.referenceData.deliveryBodies.unshift({ code: ' ', description: ' ' })
  return { schemecode: commonModel.modifyResponseSelect(optionsData.referenceData.schemeCodes), deliverybody: commonModel.modifyResponseSelect(optionsData.referenceData.deliveryBodies), pageTitle: constantModel.adminApproverList, invoices: modifyInvoiceResponse(data?.adminApprovers || []), successMessage }
}

const deleteAdminApprover = async (request) => {
  await externalRequest.sendExternalRequestDelete(`${constantModel.requestHost}/admin/approvers/delete`, {
    email: Buffer.from(request.params.email, 'base64').toString('utf-8'),
    deliverybody: Buffer.from(request.params.deliverybody, 'base64').toString('utf-8')
  }, {}, request)
  request.yar.flash('successMessage', constantModel.adminApproverDeletionSuccess)
  return request.params.invoiceid
}

const createAdminApprover = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`, {}, {}, request)
  return {
    pageTitle: constantModel.adminApproverAddTitle,
    email: '',
    threshold: '',
    schemecode: commonModel.modifyResponseSelect(optionsData.referenceData.schemeCodes),
    deliverybody: commonModel.modifyResponseSelect(optionsData.referenceData.deliveryBodies),
    deliverybodyData: optionsData.referenceData.deliveryBodies,
    schemecodeData: optionsData.referenceData.schemeCodes,
    disableditem: false,
    attributesitem: {},
    view_type: 'create'
  }
}

const updateAdminApprover = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`, {}, {}, request)
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/admin/approvers/getall`, {}, {}, request)
  const filterData = (data?.adminApprovers || [])?.find(data => (data.email == Buffer.from(request.params.email, 'base64').toString('utf-8') && data.deliveryBody == Buffer.from(request.params.deliverybody, 'base64').toString('utf-8')))
  return {
    pageTitle: constantModel.adminApproverEditTitle,
    email: filterData ? filterData.email : '',
    threshold: filterData ? filterData.threshold : '',
    schemecode: commonModel.modifyResponseSelect(optionsData.referenceData.schemeCodes, filterData.schemeCode),
    deliverybody: commonModel.modifyResponseSelect(optionsData.referenceData.deliveryBodies, filterData.deliveryBody),
    deliverybodyData: optionsData.referenceData.deliveryBodies,
    schemecodeData: optionsData.referenceData.schemeCodes,
    disableditem: false,
    attributesitem: {},
    view_type: 'edit'
  }
}

const adminApproverStore = async (request) => {
  const payload = request.payload
  if (payload.view_type == 'edit') {
    await externalRequest.sendExternalRequestPut(`${constantModel.requestHost}/admin/approvers/update`, {
      Email: payload.email,
      DeliveryBody: payload.deliverybody,
      SchemeCode: payload.schemecode,
      Threshold: payload.threshold
    }, {}, request)
    request.yar.flash('successMessage', constantModel.adminApproverUpdateSuccess)
  } else {
    await externalRequest.sendExternalRequestPost(`${constantModel.requestHost}/admin/approvers/add`, {
      Email: payload.email,
      DeliveryBody: payload.deliverybody,
      SchemeCode: payload.schemecode,
      Threshold: payload.threshold
    }, {}, request)
    request.yar.flash('successMessage', constantModel.adminApproverCreationSuccess)
  }
  return payload.email
}

const modifyInvoiceResponse = (invoiceList, action = true) => {
  return invoiceList.map((item) => {
    return {
      head: 'Approver Email',
      actions: action
        ? [
            { link: `/editAdminApprover/${Buffer.from(item.email).toString('base64')}/${Buffer.from(item.deliveryBody).toString('base64')}`, name: 'Edit' },
            { link: `/deleteAdminApprover/${Buffer.from(item.email).toString('base64')}/${Buffer.from(item.deliveryBody).toString('base64')}`, name: 'Delete' }
          ]
        : [],
      id: item.email,
      rows: commonModel.modifyForSummaryApprover(item)
    }
  })
}

module.exports = { getAll, getAllSearch, deleteAdminApprover, adminApproverStore, createAdminApprover, updateAdminApprover }
