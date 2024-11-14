const adminapproverModel = require('../models/adminapproversModel')
const errorModel = require('../models/commonError')
const adminapproverList = async (request, h) => {
  try {
    const res = await adminapproverModel.getAll(request)
    const errorMessage = request.yar.flash('errorm')
    const direction = request.yar.flash('direction')
    request.yar.flash('errorm', '')
    request.yar.flash('direction', '')
    res.errorExist = errorMessage
    res.direction = direction
    return h.view('app_views/adminApproverList', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const adminapproverSearch = async (request, h) => {
  try {
    const res = await adminapproverModel.getAllSearch(request)
    const errorMessage = request.yar.flash('errorm')
    const direction = request.yar.flash('direction')
    request.yar.flash('errorm', '')
    request.yar.flash('direction', '')
    res.errorExist = errorMessage
    res.direction = direction
    return h.view('app_views/adminApproverList', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const adminapproverDelete = async (request, h) => {
  try {
    await adminapproverModel.deleteAdminApprover(request)
    return h.redirect('/adminapprovers').temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const adminapproverCreate = async (request, h) => {
  try {
    const res = await adminapproverModel.createAdminApprover(request)
    const errorMessage = request.yar.flash('errorm')
    const direction = request.yar.flash('direction')
    request.yar.flash('errorm', '')
    request.yar.flash('direction', '')
    res.errorExist = errorMessage
    res.direction = direction
    return h.view('app_views/createAdminApprover', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const adminapproverEdit = async (request, h) => {
  try {
    const res = await adminapproverModel.updateAdminApprover(request)
    const errorMessage = request.yar.flash('errorm')
    const direction = request.yar.flash('direction')
    request.yar.flash('errorm', '')
    request.yar.flash('direction', '')
    res.errorExist = errorMessage
    res.direction = direction
    return h.view('app_views/createAdminApprover', res)
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

const adminapproverStore = async (request, h) => {
  try {
    await adminapproverModel.adminApproverStore(request)
    return h.redirect('/adminapprovers').temporary()
  } catch (error) {
    return errorModel.errorMessage(error, h, request)
  }
}

module.exports = { adminapproverList, adminapproverSearch, adminapproverDelete, adminapproverCreate, adminapproverEdit, adminapproverStore }
