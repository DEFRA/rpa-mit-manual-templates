const moment = require('moment'); 
const crypto = require('crypto');
const { parse } = require('csv-parse');
const FormData = require('form-data');
const external_request = require('../custom_requests/external_requests')
const constant_model = require('../app_constants/app_constant')

const generateID = ()=> {
  return crypto.randomUUID().toString();
}

const formatTimestamp = (timestamp)=>{
  const createdAtMoment = moment(timestamp);
  const formattedTime = createdAtMoment.format('MMMM Do YYYY, h:mm a');
  return formattedTime;
}

const removeForSummaryTable = (summaryData)=>{
  return {
    'Account Type':summaryData.accountType,
    'Delivery Body':summaryData.deliveryBody,
    'Invoice Template':summaryData.schemeType,
    'Payment Type':summaryData.paymentType
  };
}


const modify_Response_Radio = (resp_data, selected)=>{
    const resp_data_updated = resp_data.map((item) => {
        return { text: item.description, value: item.code,checked: (selected==item.code)};
      });
    return resp_data_updated;
}

const modify_Response_Select = (resp_data,selected)=>{
    const resp_data_updated = resp_data.map((item) => {
        return { text: item.code.toUpperCase(), value: item.code,selected: (selected==item.code)};
      });
    return resp_data_updated;
}

const BulkLineData = (data_pack,bulk) =>
  {
      const lineDetail = [ {text: "Line Value"}, {text: "Description"}, {text: "Delivery Body"}, {text: "Fund Code"}, {text: "Main Account"}, {text: "Scheme Code"}, {text: "Marketing Year"}];
      const lineTable = addForSummaryTableLineCSVTwo(data_pack);  
      return {lineDetail:lineDetail, lineTable: lineTable};
  }
  
  const BulkHeadData = (data_pack,bulk) =>
  {
      const summaryData = [];
      if(bulk)
      {
      summaryData.push({name:'Claim Reference',value:data_pack.claimReference})
      summaryData.push({name:'Claim Reference Number',value:data_pack.claimReferenceNumber})
      summaryData.push({name:'Currency',value:data_pack.paymentType})
      summaryData.push({name:'Total Amount',value:data_pack.totalAmount?.toString()})
      summaryData.push({name:'Description',value:data_pack.description})
      }
      else
      {
      summaryData.push({name:'FRN',value:data_pack.frn})
      summaryData.push({name:'Currency',value:data_pack.currency})
      summaryData.push({name:'Description',value:data_pack.description})
      summaryData.push({name:'Value',value:data_pack.value.toString()})  
      }
      return {
          head:'Request Id',
          actions :[],
          id : data_pack.invoiceRequestId,
          rows: modify_Response_Summary(summaryData)
      }
  }

  const modifyForSummary = (invoice)=>{
    const summaryData = [];
    summaryData.push({name:'Account Type',value:invoice.accountType})
    summaryData.push({name:'Delivery Body',value:invoice.deliveryBody})
    summaryData.push({name:'Invoice Template',value:invoice.schemeType})
    summaryData.push({name:'Invoice Template Secondary',value:invoice.secondaryQuestion})
    summaryData.push({name:'Payment Type',value:invoice.paymentType})
    return modify_Response_Summary(summaryData);
}

const modify_Response_Summary = (items)=>{
        return items.map((item) => {
            return {
                key: {
                  text: item.name
                },
                value: {
                  html: item.value
                },
                actions: {items: []}
            }
          }); 
}

const modify_Response_Table = (items)=>{
  return [Object.values(items).map((item) => {
      return {
        text: item
      }
    })]; 
}

const addForSummaryTableLine = (items)=>{
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
        text: item.deliveryBody
      },
      {
        text: item.value
      },
      {
        text: item.schemetypes
      },
      {
        html : `<div class="action-flex action-flex-other">
               <a href="/viewInvoiceLine/${item.id}/${item.invoiceRequestId}" class="govuk-heading-s remove-margin govuk-link govuk-link--no-visited-state">View</a>
               <a href="/editInvoiceLine/${item.id}/${item.invoiceRequestId}" class="govuk-heading-s remove-margin govuk-link govuk-link--no-visited-state">Edit</a>
               <a href="/deleteInvoiceLine/${item.id}/${item.invoiceRequestId}" class="govuk-heading-s remove-margin govuk-link govuk-link--no-visited-state">Delete</a>
               </div>`
      }
    ]
  })

}

const addForSummaryTableLineCSV = (items)=>{
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
        text:  item.totalAmount
      },
      {
        text:  item.description
      }
    ]
  })

}


const addForSummaryTableLineCSVTwo = (items)=>{
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

async function processUploadedCSV(file) {
  if(!file) return null
  const extension = file.hapi.filename.split('.').pop().toLowerCase();
  const validExtensions = ['csv','xlsx'];
  if (!validExtensions.includes(extension)) return null 
  const form = new FormData();
  form.append('file', file, file.hapi.filename);
  const results = await external_request.sendExternalRequestPost(`${constant_model.request_host}/bulkuploads/add`,form,{});
  return (results?.bulkUploadApDataset || null); 
}

module.exports = {BulkLineData, BulkHeadData, modifyForSummary, addForSummaryTableLineCSV, addForSummaryTableLineCSVTwo, processUploadedCSV, addForSummaryTableLine, modify_Response_Radio, modify_Response_Select, modify_Response_Summary, modify_Response_Table, generateID, formatTimestamp, removeForSummaryTable};