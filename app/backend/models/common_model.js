const moment = require('moment'); 
const crypto = require('crypto');
const { parse } = require('csv-parse');
const generateID = ()=> {
  return crypto.randomUUID().toString();
}

const formatTimestamp = (timestamp)=>{
  const createdAtMoment = moment(timestamp);
  const formattedTime = createdAtMoment.format('MMMM Do YYYY, h:mm a');
  return formattedTime;
}

const removeForSummaryTable = (summaryData)=>{
  delete summaryData["generated_id"];
  delete summaryData["status"];
  delete summaryData["created_at"];
  delete summaryData["invoice_template_secondary"];
  delete summaryData["total_requests"];
  return summaryData;
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
        text: item.fundcode
      },
      {
        text: item.mainaccount
      },
      {
        text: item.schemecode
      },
      {
        text: item.marketingyear
      },
      {
        text: item.deliverybody
      },
      {
        text: item.value
      },
      {
        text: item.schemetypes
      },
      {
        html : `<div class="action-flex action-flex-other">
               <a href="/viewInvoiceLine/${item.id}" class="govuk-heading-s remove-margin govuk-link govuk-link--no-visited-state">View</a>
               <a href="/editInvoiceLine/${item.id}" class="govuk-heading-s remove-margin govuk-link govuk-link--no-visited-state">Edit</a>
               <a href="/deleteInvoiceLine/${item.id}" class="govuk-heading-s remove-margin govuk-link govuk-link--no-visited-state">Delete</a>
               </div>`
      }
    ]
  })

}

const addForSummaryTableLineCSV = (items)=>{
  return items.map((item) => {
    return [
      {
        text: item[0]
      },
      {
        text:item[1]
      },
      {
        text: item[2]
      },
      {
        text: item[3]
      },
      {
        text: item[4]
      },
      {
        text: item[5]
      },
      {
        text: item[6]
      }
    ]
  })

}

async function processUploadedCSV(file) {
  if(!file) return null
  const extension = file.hapi.filename.split('.').pop().toLowerCase();
  const validExtensions = ['csv'];
  if (!validExtensions.includes(extension)) return null 
  const parser = parse({ delimiter: ',' }); 
  const results = [];
  const stream = file.pipe(parser);
  for await (const row of stream) {
    results.push(row);
  }
  return results; 
}

module.exports = {addForSummaryTableLineCSV, processUploadedCSV, addForSummaryTableLine, modify_Response_Radio, modify_Response_Select, modify_Response_Summary, modify_Response_Table, generateID, formatTimestamp, removeForSummaryTable};