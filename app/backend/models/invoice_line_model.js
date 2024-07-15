const db_con = require('../database/db_con')
const common_model = require('./common_model')
const external_request = require('../custom_requests/external_requests')
const payment_model = require('./payment_model')
const constant_model = require('../app_constants/app_constant')
const Path = require('path');

const getTotalInvoiceLines = async (ID)=>{
    const total_lines = await db_con('invoicelines').count('* as total').where('invoicerequestid', ID); 
    return total_lines[0].total;
}

const downloadFile = async (request, h)=>{
    const filePath = Path.join(__dirname, 'sample_files', 'sample.csv');
    return h.file(filePath);
}

const deleteInvoiceLine=async (request)=>{
    await external_request.sendExternalRequestDelete(`${constant_model.request_host}/invoicelines/delete`,{
        invoiceLineId:request.params.id
    });
    request.yar.flash('success_message', constant_model.invoiceline_deletion_success);
    return request.params.invoiceid;
};

const getAllInvoiceLines = async (request)=>{
    const success_message = request.yar.flash('success_message');
    const error_message = request.yar.flash('error_message');
    const data = await db_con('invoicelines')
    .join('lookup_deliverybodycodes', 'invoicelines.deliverybody', '=', 'lookup_deliverybodycodes.code')
    .join('lookup_marketingyearcodes', 'invoicelines.marketingyear', '=', 'lookup_marketingyearcodes.code')
    .join('lookup_schemecodes', 'invoicelines.schemecode', '=', 'lookup_schemecodes.code')
    .join('lookup_accountcodes', 'invoicelines.mainaccount', '=', 'lookup_accountcodes.code')
    .join('lookup_fundcodes', 'invoicelines.fundcode', '=', 'lookup_fundcodes.code')
    .join('lookup_schemetypes', 'invoicelines.description', '=', 'lookup_schemetypes.code')
    .select('invoicelines.id',
            'invoicelines.value', 
            'invoicelines.invoicerequestid', 
            'lookup_deliverybodycodes.description as deliverybody', 
            'lookup_marketingyearcodes.description as marketingyear', 
            'lookup_schemecodes.description as schemecode',
            'lookup_accountcodes.description as mainaccount', 
            'lookup_fundcodes.description as fundcode',
            'lookup_schemetypes.description as schemetypes')
    .where('invoicelines.invoicerequestid', request.params.id)
    .orderBy('invoicelines.created_at', 'desc');
    const lineData = data;
    const lineHeader = [ {text: "Fund Code"}, {text: "Main Account"}, {text: "Scheme Code"}, {text: "Marketing Year"}, {text: "Delivery Body"}, {text: "Line Value"}, {text: "Description"}, {text: "Action"}];
    const lineTable = common_model.addForSummaryTableLine(lineData);
    const summaryPayment = await modifyPaymentResponse(request.params.id,true);
    request.yar.flash('success_message', '');
    request.yar.flash('error_message', '');
    return {
            pageTitle:constant_model.invoiceline_summary_title, 
            payment_id:request.params.id,
            lineLink:`/createInvoiceLine/${request.params.id}`,
            summaryTable:lineTable,
            summaryHeader:lineHeader, 
            success_message:success_message,
            error_message:error_message,
            summaryPayment:summaryPayment
           }
}

const viewInvoiceLine = async (request)=>{
   const options_data = await external_request.sendExternalRequestGet(`${constant_model.request_host}/referencedata/getall`);
   const data = await db_con('invoicelines')
    .join('lookup_deliverybodycodes', 'invoicelines.deliverybody', '=', 'lookup_deliverybodycodes.code')
    .join('lookup_marketingyearcodes', 'invoicelines.marketingyear', '=', 'lookup_marketingyearcodes.code')
    .join('lookup_schemecodes', 'invoicelines.schemecode', '=', 'lookup_schemecodes.code')
    .join('lookup_accountcodes', 'invoicelines.mainaccount', '=', 'lookup_accountcodes.code')
    .join('lookup_fundcodes', 'invoicelines.fundcode', '=', 'lookup_fundcodes.code')
    .join('lookup_schemetypes', 'invoicelines.description', '=', 'lookup_schemetypes.code')
    .select('invoicelines.*')
    .where('invoicelines.id', request.params.id);
    const lineData = data[0];
    const summaryPayment = await modifyPaymentResponse(lineData.invoicerequestid,false);
    return {
        pageTitle:constant_model.invoiceline_view_title, 
        summaryPayment:summaryPayment,
        payment_id:lineData.invoicerequestid,
        line_id:request.params.id,
        paymentvalue:lineData.value,
        description:common_model.modify_Response_Select(options_data.referenceData.schemeTypes,lineData.description),
        fundcode:common_model.modify_Response_Select(options_data.referenceData.fundCodes,lineData.fundcode),
        mainaccount:common_model.modify_Response_Select(options_data.referenceData.accountCodes,lineData.mainaccount),
        schemecode:common_model.modify_Response_Select(options_data.referenceData.schemeCodes,lineData.schemecode),
        marketingyear:common_model.modify_Response_Select(options_data.referenceData.marketingYears,lineData.marketingyear),
        deliverybody:common_model.modify_Response_Select(options_data.referenceData.deliveryBodies,lineData.deliverybody),
        disableditem:true,
        attributesitem:{ readonly: 'readonly' },
        view_type:'view'
    };
}

const createInvoiceLine = async (request)=>{
    const options_data = await external_request.sendExternalRequestGet(`${constant_model.request_host}/referencedata/getall`);
    const summaryPayment = await modifyPaymentResponse(request.params.id,false);
    return {
        pageTitle:constant_model.invoiceline_add_title, 
        summaryPayment:summaryPayment,
        payment_id:request.params.id,
        paymentvalue:'0.00',
        description:common_model.modify_Response_Select(options_data.referenceData.schemeTypes),
        fundcode:common_model.modify_Response_Select(options_data.referenceData.fundCodes),
        mainaccount:common_model.modify_Response_Select(options_data.referenceData.accountCodes),
        schemecode:common_model.modify_Response_Select(options_data.referenceData.schemeCodes),
        marketingyear:common_model.modify_Response_Select(options_data.referenceData.marketingYears),
        deliverybody:common_model.modify_Response_Select(options_data.referenceData.deliveryBodies),
        disableditem:false,
        attributesitem:{},
        view_type:'create'
    };
}

const updateInvoiceLine = async (request)=>{
    const options_data = await external_request.sendExternalRequestGet(`${constant_model.request_host}/referencedata/getall`);
    const data = await db_con('invoicelines')
    .join('lookup_deliverybodycodes', 'invoicelines.deliverybody', '=', 'lookup_deliverybodycodes.code')
    .join('lookup_marketingyearcodes', 'invoicelines.marketingyear', '=', 'lookup_marketingyearcodes.code')
    .join('lookup_schemecodes', 'invoicelines.schemecode', '=', 'lookup_schemecodes.code')
    .join('lookup_accountcodes', 'invoicelines.mainaccount', '=', 'lookup_accountcodes.code')
    .join('lookup_fundcodes', 'invoicelines.fundcode', '=', 'lookup_fundcodes.code')
    .join('lookup_schemetypes', 'invoicelines.description', '=', 'lookup_schemetypes.code')
    .select('invoicelines.*')
    .where('invoicelines.id', request.params.id);
    const lineData = data[0];
    const summaryPayment = await modifyPaymentResponse(lineData.invoicerequestid,false);
    return {
        pageTitle:constant_model.invoiceline_edit_title, 
        summaryPayment:summaryPayment,
        payment_id:lineData.invoicerequestid,
        line_id:request.params.id,
        paymentvalue:lineData.value,
        description:common_model.modify_Response_Select(options_data.referenceData.schemeTypes,lineData.description),
        fundcode:common_model.modify_Response_Select(options_data.referenceData.fundCodes,lineData.fundcode),
        mainaccount:common_model.modify_Response_Select(options_data.referenceData.accountCodes,lineData.mainaccount),
        schemecode:common_model.modify_Response_Select(options_data.referenceData.schemeCodes,lineData.schemecode),
        marketingyear:common_model.modify_Response_Select(options_data.referenceData.marketingYears,lineData.marketingyear),
        deliverybody:common_model.modify_Response_Select(options_data.referenceData.deliveryBodies,lineData.deliverybody),
        disableditem:false,
        attributesitem:{},
        view_type:'edit'
    };
}

const invoiceLineStore = async (request)=>{
    const payload = request.payload;
    if(payload.line_id)
    {
        await external_request.sendExternalRequestPut(`${constant_model.request_host}/invoicelines/update`,{
            Value:payload.paymentvalue,
            InvoiceRequestId:payload.payment_id,
            Description:payload.description,
            FundCode:payload.fundcode,
            MainAccount:payload.mainaccount,
            SchemeCode:payload.schemecode,
            MarketingYear:payload.marketingyear,
            DeliveryBody:payload.deliverybody,
            Id:payload.line_id
        })
        request.yar.flash('success_message', constant_model.invoiceline_update_success);
    }
    else
    {
    await external_request.sendExternalRequestPost(`${constant_model.request_host}/invoicelines/add`,{
        Value:payload.paymentvalue,
        InvoiceRequestId:payload.payment_id,
        Description:payload.description,
        FundCode:payload.fundcode,
        MainAccount:payload.mainaccount,
        SchemeCode:payload.schemecode,
        MarketingYear:payload.marketingyear,
        DeliveryBody:payload.deliverybody,
    })
    request.yar.flash('success_message', constant_model.invoiceline_creation_success);
    }
    return payload.payment_id;
}

const modifyPaymentResponse = async (id, show_actions)=>{
         const data = await db_con('paymentrequests')
        .join('lookup_paymenttypes', 'paymentrequests.currency', '=', 'lookup_paymenttypes.code')
        .select('paymentrequests.*')
        .where('paymentrequests.invoicerequestid', id);
        const payment = data[0];
        return {
            head:'Invoice Request Id',
            actions : show_actions?[
                {link:`/editPayment/${payment.invoicerequestid}/${payment.invoiceid}`, name:'Edit'},
            ]:[],
            id : payment.invoicerequestid,
            rows:payment_model.modifyForPaymentSummary(payment)
        }; 
}


const BulkDataUpload = async (request) =>{
    const { payload } = request;
    const bulk_data = JSON.parse(payload.bulk_data)
    for (const single_data of bulk_data) {
        await external_request.sendExternalRequestPost(`${constant_model.request_host}/invoicelines/add`,{
            Value:single_data[0],
            InvoiceRequestId:payload.payment_id,
            Description:single_data[1],
            DeliveryBody:single_data[2],
            FundCode:single_data[3],
            MainAccount:single_data[4],
            SchemeCode:single_data[5],
            MarketingYear:single_data[6]
        })
    }
    request.yar.flash('success_message', constant_model.invoiceline_bulkupload_success);
    return payload.payment_id;
}

const uploadBulk = async (request, h)=>{
    const { payload } = request;
    const bulk_data = await common_model.processUploadedCSV(payload.bulk_file);
    if (!bulk_data) {
        request.yar.flash('error_message', constant_model.invoiceline_bulkupload_failed);
        return h.redirect(`/viewPaymentLine/${payload.payment_id}`).temporary();
    }
    else
    {
        const lineHeader = [ {text: "Line Value"}, {text: "Description"}, {text: "Delivery Body"}, {text: "Fund Code"}, {text: "Main Account"}, {text: "Scheme Code"}, {text: "Marketing Year"}];
        const lineTable = common_model.addForSummaryTableLineCSV(bulk_data.slice(1)); 
        return h.view('app_views/bulk_view',{
            pageTitle:constant_model.bulk_upload, 
            payment_id:payload.payment_id,
            summaryTable:lineTable,
            summaryHeader:lineHeader, 
            bulk_data:JSON.stringify(bulk_data.slice(1))
           });
    }
}

module.exports = {BulkDataUpload, uploadBulk, getTotalInvoiceLines, downloadFile, getAllInvoiceLines, deleteInvoiceLine, viewInvoiceLine, invoiceLineStore, updateInvoiceLine, viewInvoiceLine, deleteInvoiceLine, createInvoiceLine};