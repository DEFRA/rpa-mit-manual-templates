const moment = require('moment')
const crypto = require('crypto')
const FormData = require('form-data')
const externalRequest = require('../custom_requests/externalRequests')
const constantModel = require('../app_constants/appConstant')

const generateID = () => {
  return crypto.randomUUID().toString()
}

const formatTimestamp = (timestamp) => {
  const createdAtMoment = moment(timestamp)
  const formattedTime = createdAtMoment.format('MMMM Do YYYY, h:mm a')
  return formattedTime
}

const removeForSummaryTable = (summaryData) => {
  return {
    'Account Type': summaryData.accountType,
    'Delivery Body': summaryData.deliveryBody,
    'Invoice Template': summaryData.schemeType,
    'Payment Type': summaryData.paymentType
  }
}

const modifyResponseRadio = (respData, selected) => {
  const respDataUpdated = respData.map((item) => {
    return { text: item.description, value: item.code, checked: (selected === item.code) }
  })
  return respDataUpdated
}

const modifyResponseSelect = (respData, selected) => {
  const respDataUpdated = respData.map((item) => {
    return { text: item.code.toUpperCase(), value: item.code, selected: (selected === item.code) }
  })
  return respDataUpdated
}

const BulkHeadDataAr = (dataPack, bulk) => {
  const summaryData = []
  if (bulk) {
    summaryData.push({ name: 'Claim Reference', value: dataPack.claimReference })
    summaryData.push({ name: 'Claim Reference Number', value: dataPack.claimReferenceNumber })
    summaryData.push({ name: 'Currency', value: dataPack.paymentType })
    summaryData.push({ name: 'Total Amount', value: dataPack.totalAmount?.toString() })
    summaryData.push({ name: 'Description', value: dataPack.description })
    summaryData.push({ name: 'Claim Reference Original', value: dataPack.originalClaimReference })
    summaryData.push({ name: 'Invoice Settlemnet Date', value: dataPack.originalAPInvoiceSettlementDate })
    summaryData.push({ name: 'Possible Recovery', value: dataPack.earliestDatePossibleRecovery })
    summaryData.push({ name: 'Ledger', value: dataPack.ledger })
  } else {
    summaryData.push({ name: 'FRN', value: dataPack.frn })
    summaryData.push({ name: 'Currency', value: dataPack.currency })
    summaryData.push({ name: 'Description', value: dataPack.description })
    summaryData.push({ name: 'Value', value: dataPack.value.toString() })
  }
  return {
    head: 'Request Id',
    actions: [],
    id: dataPack.invoiceRequestId,
    rows: modifyResponseSummary(summaryData)
  }
}

const BulkLineDataAr = (dataPack, bulk) => {
  const lineDetail = [{ text: 'Line Value' }, { text: 'Description' }, { text: 'Delivery Body' }, { text: 'Fund Code' }, { text: 'Main Account' }, { text: 'Scheme Code' }, { text: 'Marketing Year' }, { text: 'Debt Type' }]
  const lineTable = addForSummaryTableLineCSVTwoAr(dataPack)
  return { lineDetail, lineTable }
}

const BulkLineData = (dataPack, bulk) => {
  const lineDetail = [{ text: 'Line Value' }, { text: 'Description' }, { text: 'Delivery Body' }, { text: 'Fund Code' }, { text: 'Main Account' }, { text: 'Scheme Code' }, { text: 'Marketing Year' }]
  const lineTable = addForSummaryTableLineCSVTwo(dataPack)
  return { lineDetail, lineTable }
}

const BulkHeadData = (dataPack, bulk) => {
  const summaryData = []
  if (bulk) {
    summaryData.push({ name: 'Claim Reference', value: dataPack.claimReference })
    summaryData.push({ name: 'Claim Reference Number', value: dataPack.claimReferenceNumber })
    summaryData.push({ name: 'Currency', value: dataPack.paymentType })
    summaryData.push({ name: 'Total Amount', value: dataPack.totalAmount?.toString() })
    summaryData.push({ name: 'Description', value: dataPack.description })
    summaryData.push({ name: 'Ledger', value: dataPack.ledger })
  } else {
    summaryData.push({ name: 'FRN', value: dataPack.frn })
    summaryData.push({ name: 'Currency', value: dataPack.currency })
    summaryData.push({ name: 'Description', value: dataPack.description })
    summaryData.push({ name: 'Value', value: dataPack.value.toString() })
  }
  return {
    head: 'Request Id',
    actions: [],
    id: dataPack.invoiceRequestId,
    rows: modifyResponseSummary(summaryData)
  }
}

const modifyForSummary = (invoice) => {
  const summaryData = []
  summaryData.push({ name: 'Account Type', value: invoice.accountType })
  summaryData.push({ name: 'Delivery Body', value: invoice.deliveryBody })
  summaryData.push({ name: 'Invoice Template', value: invoice.schemeType })
  summaryData.push({ name: 'Invoice Template Secondary', value: invoice.secondaryQuestion })
  summaryData.push({ name: 'Payment Type', value: invoice.paymentType })
  return modifyResponseSummary(summaryData)
}

const modifyResponseSummary = (items) => {
  return items.map((item) => {
    return {
      key: {
        text: item.name
      },
      value: {
        html: item.value
      },
      actions: { items: [] }
    }
  })
}

const modifyResponseTable = (items) => {
  return [Object.values(items).map((item) => {
    return {
      text: item
    }
  })]
}

const addForSummaryTableLine = (items) => {
  return items.map((item) => {
    return [
      {
        text: item.fundCode
      },
      {
        text: item.mainAccount
      },
      {
        text: item.schemeCode
      },
      {
        text: item.marketingYear
      },
      {
        text: item.deliveryBodyCode
      },
      {
        text: item.value
      },
      {
        text: item.description
      },
      {
        html: `<div class="action-flex action-flex-other">
               <a href="/viewInvoiceLine/${item.id}/${item.invoiceRequestId}" class="govuk-heading-s remove-margin govuk-link govuk-link--no-visited-state">View</a>
               <a href="/editInvoiceLine/${item.id}/${item.invoiceRequestId}" class="govuk-heading-s remove-margin govuk-link govuk-link--no-visited-state">Edit</a>
               <a href="/deleteInvoiceLine/${item.id}/${item.invoiceRequestId}" class="govuk-heading-s remove-margin govuk-link govuk-link--no-visited-state">Delete</a>
               </div>`
      }
    ]
  })
}

const addForSummaryTableLineCSV = (items) => {
  return items.map((item) => {
    return [
      {
        text: item.claimReference
      },
      {
        text: item.claimReferenceNumber
      },
      {
        text: item.paymentType
      },
      {
        text: item.totalAmount
      },
      {
        text: item.description
      }
    ]
  })
}

const addForSummaryTableLineCSVTwoAr = (items) => {
  return items.map((item) => {
    return [
      {
        text: item.value
      },
      {
        text: item.description
      },
      {
        text: item.deliveryBodyCode
      },
      {
        text: item.fundCode
      },
      {
        text: item.mainAccount
      },
      {
        text: item.schemeCode
      },
      {
        text: item.marketingYear
      },
      {
        text: item.debtType
      }
    ]
  })
}

const addForSummaryTableLineCSVTwo = (items) => {
  return items.map((item) => {
    return [
      {
        text: item.value
      },
      {
        text: item.description
      },
      {
        text: item.deliveryBodyCode
      },
      {
        text: item.fundCode
      },
      {
        text: item.mainAccount
      },
      {
        text: item.schemeCode
      },
      {
        text: item.marketingYear
      }
    ]
  })
}

async function processUploadedCSV (file, payload) {
  if (!file) return null
  const extension = file.hapi.filename.split('.').pop().toLowerCase()
  const validExtensions = ['csv', 'xlsx']
  if (!validExtensions.includes(extension)) return null
  const form = new FormData()
  form.append('file', file, file.hapi.filename)
  form.append('org', payload.deliveryBody)
  form.append('schemeInvoiceTemplate', payload.invoiceTemplate)
  const results = await externalRequest.sendExternalRequestPost(`${constantModel.requestHost}/bulkuploads/add${payload.accountType.toLowerCase()}`, form, {})
  if (payload.accountType === 'AP') {
    return (results?.bulkUploadApDataset || null)
  } else {
    return (results?.bulkUploadArDataset || null)
  }
}

module.exports = { BulkHeadDataAr, BulkLineDataAr, BulkLineData, BulkHeadData, modifyForSummary, addForSummaryTableLineCSV, addForSummaryTableLineCSVTwo, processUploadedCSV, addForSummaryTableLine, modifyResponseRadio, modifyResponseSelect, modifyResponseSummary, modifyResponseTable, generateID, formatTimestamp, removeForSummaryTable }
