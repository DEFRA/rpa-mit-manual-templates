const commonModel = require('./commonModel')
const externalRequest = require('../custom_requests/externalRequests')
const constantModel = require('../app_constants/appConstant')
const paymentModel = require('./paymentModel')
const Path = require('path')
const {setGlobal} = require('../hooks/custom_hook')

const getAllInvoices = async (request) => {
  const successMessage = request.yar.flash('successMessage')
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoices/getall`, {}, {}, request)
  request.yar.flash('successMessage', '')
  let username = ''
  try {
    username = request.yar.get('account')?.username || ''
  } catch {
    username = ''
  }
  return { pageTitle: constantModel.invoiceListTitle, invoices: modifyInvoiceResponse(data?.invoices || []), successMessage, userName: username }
}

const createInvoice = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`, {}, {}, request)
  const accountType = commonModel.modifyResponseRadio(optionsData.referenceData.accountCodes)
  const deliveryBody = optionsData.referenceData.initialDeliveryBodies
  const invoiceTemplate = optionsData.referenceData.schemeTypes
  const invoiceTemplateSecondary = optionsData.referenceData.schemeInvoiceTemplateSecondaryQuestions
  const paymentType = commonModel.modifyResponseRadio(optionsData.referenceData.paymentTypes)
  return {
    pageTitle: constantModel.invoiceAddTitle,
    accountType,
    deliveryBody,
    invoiceTemplate,
    invoiceTemplateSecondary,
    paymentType
  }
}

const createBulk = async (request) => {
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`, {}, {}, request)
  const accountType = commonModel.modifyResponseRadio(optionsData.referenceData.accountCodes)
  const deliveryBody = optionsData.referenceData.initialDeliveryBodies
  const invoiceTemplate = optionsData.referenceData.schemeTypes
  return {
    pageTitle: constantModel.bulkUpload,
    accountType,
    deliveryBody,
    invoiceTemplate
  }
}


const groupByKeys =function (data, key) {
  return data.reduce((acc, item) => {
    const keyValue = item[key]
    if (!acc[keyValue]) {
      acc[keyValue] = []
    }
    acc[keyValue].push(item)
    return acc
  }, {})
}

const updateDeliveryBody = function(acty, db, org, scid)
{
  if(acty == "AP")
  {
  if(scid == "LS")
   {
    return `${org}LS`
   }
   else if(scid == "CS")
   {
      if(org == "RDT")
        return `${org}CP`
      else if(org == "EA")
       return `EA`
      else 
       return `${org}CS`
   }
   else if(scid == "P1")
   {
    return "P1"
   }
  }
  else if(acty == "AR")
  {
      if(scid == "LS")
      {
      return `${org}LS`
      }
      else if(scid == "CS")
      {
        if(org == "RDT")
          return `${org}CP`
        else if(org == "EA")
         return `EA`
        else 
         return `${org}CS`
      }
      else if(scid == "P1")
      {
        if(org == "RDT")
          return `${org}Dom`
        else
         return `${org}P1`
      }
      else if(scid == "LSDom")
      {
      return `${org}LSDom`
      }
      else if(scid == "CSDom")
      {
          if(org == "RDT")
             return `${org}CPDom`
          else 
             return `${org}CSDom`
       
      }
      else if(scid == "ExNRDPE")
      {
       return "RDTEXQ"
      }
    }
  
    if(scid == "BK")
    {
      return "BK"
    }
    else if(scid == "DA")
    {
     return "DA"
    }
    else if(scid == "DF")
    {
     return "DF"
    }
    else if(scid == "HP")
    {
      return "HP"  
    }
    else if(scid == "IP")
    {
      return "IP"    
    }
    else if(scid == "IT")
    {
      return "IT"       
    }
    else if(scid == "OPA")
    {
      return "OPA"        
    }
    else if(scid == "SPS")
    {
      return "SPS"           
    }
    else if(scid == "TR")
    {
      return "TR"            
    }
    else if(scid == "XG")
    {
      return "XG"             
    }
  return db;
}

const invoiceStore = async (request) => {
  const payload = request.payload
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`, {}, {}, request)
  const deliveryBody = groupByKeys(optionsData.referenceData.initialDeliveryBodies, 'code')
  const invoiceTemplate = groupByKeys(optionsData.referenceData.schemeTypes, 'code')
  const orgGet = deliveryBody[payload.deliveryBody][0].org;
  const schemeid = invoiceTemplate[payload.invoiceTemplate][0].id;
  const repdata = await externalRequest.sendExternalRequestPost(`${constantModel.requestHost}/invoices/add`, {
    AccountType: payload.accountType,
    DeliveryBody:updateDeliveryBody(payload.accountType, payload.deliveryBody,orgGet,schemeid),
    SchemeType: payload.invoiceTemplate,
    SecondaryQuestion: payload.invoice_template_secondary,
    PaymentType: payload.paymentType

  }, {}, request)
  setGlobal(repdata.invoice.id,repdata.dropdowns)
  request.yar.flash('successMessage', constantModel.invoiceCreationSuccess)
}

const invoiceSummary = async (request) => {
  const successMessage = request.yar.flash('successMessage')
  const data = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/invoices/getbyid`, { invoiceId: request.params.id }, {}, request)
  const summaryData = data?.invoice || []
  const getAllPayments = await paymentModel.getAllPayments(request.params.id, request)
  summaryData.invoiceRequests = getAllPayments
  const summaryBox = { head: 'Invoice Id', actions: [], id: summaryData.id, rows: await modifyForSummaryBox(summaryData) }
  const summaryHeader = [{ text: 'Account Type' }, { text: 'Delivery Body' }, { text: 'Scheme Type' }, { text: 'Payment Type' }]
  const summaryTable = commonModel.modifyResponseTable(commonModel.removeForSummaryTable(summaryData))
  request.yar.flash('successMessage', '')
  request.yar.set({
    deliverbody: data?.invoice?.deliveryBody,
    schemetemplate: data?.invoice?.schemeType,
    accounttype: data?.invoice?.accountType,
    invid:data?.invoice?.id
  })
  return {
    pageTitle: constantModel.invoiceSummaryTitle,
    summaryTable,
    summaryBox,
    paymentLink: `/createPayment/${request.params.id}`,
    total_requests: (getAllPayments?.length || 0),
    summaryHeader,
    allPayments: getAllPayments,
    successMessage
  }
}

const modifyForSummaryBox = async (summaryData) => {
  console.log(summaryData)
  const summaryBoxData = []
  summaryBoxData.push({ name: 'Status', value: `<strong class="govuk-tag">${summaryData.status.toUpperCase()}</strong>` })
  summaryBoxData.push({ name: 'Created On', value: commonModel.formatTimestamp(summaryData.created) })
  summaryBoxData.push({ name: 'Number Of Invoice Requests', value: (summaryData?.invoiceRequests?.length || 0).toString() })
  summaryBoxData.push({ name: 'Total Value', value: (summaryData?.value || 0).toString() })
  return commonModel.modifyResponseSummary(summaryBoxData)
}

const modifyInvoiceResponse = (invoiceList, action = true) => {
  return invoiceList.map((item) => {
    return {
      head: 'Invoice Id',
      actions: action
        ? [
            { link: `/viewInvoice/${item.id}`, name: 'View' },
            { link: `/deleteInvoice/${item.id}`, name: 'Delete' }
          ]
        : [],
      id: item.id,
      rows: commonModel.modifyForSummary(item)
    }
  })
}

const deleteInvoice = async (request) => {
  await externalRequest.sendExternalRequestDelete(`${constantModel.requestHost}/invoices/delete`, {
    invoiceId: request.params.id
  }, {}, request)
  request.yar.flash('successMessage', constantModel.invoiceDeletionSuccess)
  return request.params.id
}

const downloadFile = async (request, h) => {
  const filePath = Path.join(__dirname, 'sample_files', 'sample.xlsx')
  return h.file(filePath)
}

const BulkDataUpload = async (request) => {
  const { payload } = request
  const bulkData = JSON.parse(payload.bulkData)
  await externalRequest.sendExternalRequestPost(`${constantModel.requestHost}/bulkuploads/confirm`, {
    invoiceId: bulkData.bulkUploadInvoice.id,
    confirmUpload: true,
    confirm: true
  }, {}, request)
  request.yar.flash('successMessage', constantModel.invoiceLineBulkUploadSuccess)
}

const uploadBulk = async (request, h) => {
  const { payload } = request
  const optionsData = await externalRequest.sendExternalRequestGet(`${constantModel.requestHost}/referencedata/getall`, {}, {}, request)
  const orgget = optionsData.referenceData.initialDeliveryBodies?.find(data => (data.code === payload.deliveryBody))?.org || ''
  payload.deliveryBody = orgget
  const bulkData = await commonModel.processUploadedCSV(payload.bulk_file, payload, request)
  if (!bulkData) {
    request.yar.flash('errorMessage', constantModel.invoiceLineBulkUploadFailed)
    return h.redirect('/').temporary()
  } else if (payload.accountType === 'AP') {
    const invoiceRequests = bulkData?.bulkUploadInvoice?.bulkUploadApHeaderLines.map((invRequest, ind) => {
      return {
        id: invRequest.invoiceRequestId,
        invid: invRequest.invoiceId,
        index: (ind + 1),
        summary_data: commonModel.BulkHeadData(invRequest, true),
        lines_data: commonModel.BulkLineData(invRequest.bulkUploadApDetailLines, true)
      }
    })
    const errorMessage = request.yar.flash('errorm')
    request.yar.flash('errorm', '')
    return h.view('app_views/bulkViewAp', {
      pageTitle: constantModel.bulkUploadAp,
      invoices: modifyInvoiceResponse([bulkData?.bulkUploadInvoice], false),
      invoiceRequests,
      errorExist: errorMessage,
      bulkData: JSON.stringify(bulkData)
    })
  } else {
    const invoiceRequests = bulkData?.bulkUploadInvoice?.bulkUploadArHeaderLines.map((invRequest, ind) => {
      return {
        id: invRequest.invoiceRequestId,
        invid: invRequest.invoiceId,
        index: (ind + 1),
        summary_data: commonModel.BulkHeadDataAr(invRequest, true),
        lines_data: commonModel.BulkLineDataAr(invRequest.bulkUploadArDetailLines, true)
      }
    })
    const errorMessage = request.yar.flash('errorm')
    request.yar.flash('errorm', '')
    return h.view('app_views/bulkViewAr', {
      pageTitle: constantModel.bulkUploadAr,
      invoices: modifyInvoiceResponse([bulkData?.bulkUploadInvoice], false),
      invoiceRequests,
      errorExist: errorMessage,
      bulkData: JSON.stringify(bulkData)
    })
  }
}

module.exports = { createBulk, modifyInvoiceResponse, modifyForSummaryBox, downloadFile, BulkDataUpload, uploadBulk, getAllInvoices, deleteInvoice, createInvoice, invoiceStore, invoiceSummary }
