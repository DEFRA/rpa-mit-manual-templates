const invoice_model = require('../models/invoice_model')
const error_model = require('../models/common_error')
const invoiceList = async (request, h) => {
     try 
     {
      const res = await invoice_model.getAllInvoices(request);
      return h.view('app_views/invoice_list', res);
      } 
      catch (error) 
      {
      return error_model.errorMessage(error,h); 
      } 
}

const invoiceCreate = async (request, h) => {
      try 
      {
       const res = await invoice_model.createInvoice(request);
       //console.log(res);
       return h.view('app_views/create_invoice', res);
       } 
       catch (error) 
       {
       return error_model.errorMessage(error,h); 
       } 
 }



 const invoiceSummary =async (request, h) => {
      try 
      {
       const res = await invoice_model.invoiceSummary(request);
       return h.view('app_views/invoice_summary', res);
       } 
       catch (error) 
       {
       return error_model.errorMessage(error,h); 
       } 
 }

 const invoiceStore = async (request, h) => {
    try 
     { 
      await invoice_model.invoiceStore(request);
      return h.redirect('/').temporary();
      } 
      catch (error) 
      {
      return error_model.errorMessage(error,h); 
      } 
 }

 const invoiceDelete= async (request, h) => {
      try 
      {
       await invoice_model.deleteInvoice(request);
       return h.redirect('/').temporary();
       } 
       catch (error) 
       {
       return error_model.errorMessage(error,h); 
       } 
  }

  const downloadSample = async (request, h) => {
     try 
     { 
      return await invoice_model.downloadFile(request, h);
      } 
      catch (error) 
      {
      return error_model.errorMessage(error,h); 
      } 
  }
 
  const uploadBulk = async (request, h) => {
     try 
     { 
     return await invoice_model.uploadBulk(request, h);
     } 
     catch (error) 
     {
      return error_model.errorMessage(error,h); 
     } 
  }

  const BulkDataUpload= async (request, h) => {
    try 
    { 
     await invoice_model.BulkDataUpload(request);
     return h.redirect('/').temporary();
     } 
     catch (error) 
     {
     return error_model.errorMessage(error,h); 
     } 
}

const Bulkview = async (request, h) => {
     try 
     {
      const res = await invoice_model.createBulk(request);
      return h.view('app_views/bulk_upload', res);
      } 
      catch (error) 
      {
      return error_model.errorMessage(error,h); 
      } 
}


module.exports = {downloadSample, Bulkview, BulkDataUpload, uploadBulk, invoiceList, invoiceCreate, invoiceStore, invoiceSummary, invoiceDelete};