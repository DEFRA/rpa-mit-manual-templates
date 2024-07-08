const invoice_line_model = require('../models/invoice_line_model')
const error_model = require('../models/common_error')


const invoiceLineAll= async (request, h) => {
    try 
    {
     const res = await invoice_line_model.getAllInvoiceLines(request);
     return h.view('app_views/payment_summary',res);
     } 
     catch (error) 
     {
     return error_model.errorMessage(error,h); 
     } 
}

const invoiceLineCreate= async (request, h) => {
    try 
    {
     const res = await invoice_line_model.createInvoiceLine(request);
     return h.view('app_views/create_invoiceline',res);
     } 
     catch (error) 
     {
     return error_model.errorMessage(error,h); 
     } 
}

const invoiceLineView= async (request, h) => {
    try 
    {
     const res = await invoice_line_model.viewInvoiceLine(request);
     return h.view('app_views/create_invoiceline',res);
     } 
     catch (error) 
     {
     return error_model.errorMessage(error,h); 
     } 
}

const invoiceLineEdit= async (request, h) => {
    try 
    {
     const res = await invoice_line_model.updateInvoiceLine(request);
     return h.view('app_views/create_invoiceline',res);
     } 
     catch (error) 
     {
     return error_model.errorMessage(error,h); 
     } 
}

const BulkDataUpload= async (request, h) => {
    try 
    { 
     const payment_id = await invoice_line_model.BulkDataUpload(request);
     return h.redirect(`/viewPaymentLine/${payment_id}`).temporary();
     } 
     catch (error) 
     {
     return error_model.errorMessage(error,h); 
     } 
}

const invoiceLineDelete= async (request, h) => {
    try 
    {
     const payment_id = await invoice_line_model.deleteInvoiceLine(request);
     return h.redirect(`/viewPaymentLine/${payment_id}`).temporary();
     } 
     catch (error) 
     {
     return error_model.errorMessage(error,h); 
     } 
}

const invoiceLineStore = async (request, h) => {
    try 
     { 
      const payment_id = await invoice_line_model.invoiceLineStore(request);
      return h.redirect(`/viewPaymentLine/${payment_id}`).temporary();
      } 
      catch (error) 
      {
      return error_model.errorMessage(error,h); 
      } 
 }

 const downloadSample = async (request, h) => {
    try 
    { 
     return await invoice_line_model.downloadFile(request, h);
     } 
     catch (error) 
     {
     return error_model.errorMessage(error,h); 
     } 
 }

 const uploadBulk = async (request, h) => {
    try 
    { 
    return await invoice_line_model.uploadBulk(request, h);
    } 
    catch (error) 
    {
     return error_model.errorMessage(error,h); 
    } 
 }

module.exports = {BulkDataUpload, uploadBulk, invoiceLineAll, invoiceLineCreate, downloadSample, invoiceLineStore, invoiceLineEdit, invoiceLineView, invoiceLineDelete};