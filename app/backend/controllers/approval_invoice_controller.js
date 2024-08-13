const approval_invoice_model = require('../models/approval_invoice_model')
const error_model = require('../models/common_error')
const approveInvoiceList = async (request, h) => {
    try 
    {
     const res = await approval_invoice_model.getAllInvoices(request);
     return h.view('app_views/approval_invoice_list', res);
     } 
     catch (error) 
     {
     return error_model.errorMessage(error,h); 
     } 
}

const approvalInvoiceSummary = async (request, h) => {
    try 
    {
     return await approval_invoice_model.invoiceSummary(request, h);
     } 
     catch (error) 
     {
     return error_model.errorMessage(error,h); 
     } 
}

const approveInvoice = async (request, h) => {
    try 
    {
        await approval_invoice_model.approveInvoice(request);
        return h.redirect('/approvelist').temporary();
     } 
     catch (error) 
     {
     return error_model.errorMessage(error,h); 
     } 
}

const rejectInvoice = async (request, h) => {
    try 
    {
        await approval_invoice_model.rejectInvoice(request);
        return h.redirect('/approvelist').temporary();
     } 
     catch (error) 
     {
     return error_model.errorMessage(error,h); 
     } 
}

module.exports = {approveInvoiceList, approvalInvoiceSummary, approveInvoice, rejectInvoice};