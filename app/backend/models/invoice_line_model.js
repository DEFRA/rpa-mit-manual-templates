const db_con = require('../database/db_con')
const common_model = require('./common_model')
const external_request = require('../custom_requests/external_requests')
const payment_model = require('./payment_model')
const constant_model = require('../app_constants/app_constant')

const getTotalInvoiceLines = async (ID)=>{
    const total_lines = await db_con('invoicelines').count('* as total').where('paymentrequestid', ID); 
    return total_lines[0].total;
}

const deleteInvoiceLine=async (request)=>{
    const data = await db_con('invoicelines')
    .select('invoicelines.*')
    .where('invoicelines.id', request.params.id)
    const lineData = data[0];
    await db_con('invoicelines')
    .where('invoicelines.id', request.params.id)
    .delete();
    request.yar.flash('success_message', constant_model.invoiceline_deletion_success);
    return lineData.paymentrequestid;
};

const getAllInvoiceLines = async (request)=>{
    const success_message = request.yar.flash('success_message');
    const data = await db_con('invoicelines')
    .join('lookup_deliverybodycodes', 'invoicelines.deliverybody', '=', 'lookup_deliverybodycodes.code')
    .join('lookup_marketingyearcodes', 'invoicelines.marketingyear', '=', 'lookup_marketingyearcodes.code')
    .join('lookup_schemecodes', 'invoicelines.schemecode', '=', 'lookup_schemecodes.code')
    .join('lookup_accountcodes', 'invoicelines.mainaccount', '=', 'lookup_accountcodes.code')
    .join('lookup_fundcodes', 'invoicelines.fundcode', '=', 'lookup_fundcodes.code')
    .join('lookup_schemetypes', 'invoicelines.description', '=', 'lookup_schemetypes.code')
    .select('invoicelines.id',
            'invoicelines.value', 
            'lookup_deliverybodycodes.description as deliverybody', 
            'lookup_marketingyearcodes.description as marketingyear', 
            'lookup_schemecodes.description as schemecode',
            'lookup_accountcodes.description as mainaccount', 
            'lookup_fundcodes.description as fundcode',
            'lookup_schemetypes.description as schemetypes')
    .where('invoicelines.paymentrequestid', request.params.id)
    .orderBy('invoicelines.created_at', 'desc');
    const lineData = data;
    const lineHeader = [ {text: "Fund Code"}, {text: "Main Account"}, {text: "Scheme Code"}, {text: "Marketing Year"}, {text: "Delivery Body"}, {text: "Line Value"}, {text: "Description"}, {text: "Action"}];
    const lineTable = common_model.addForSummaryTableLine(lineData);
    const summaryPayment = await modifyPaymentResponse(request.params.id,true);
    request.yar.flash('success_message', '');
    return {
            pageTitle:constant_model.invoiceline_summary_title, 
            lineLink:`/createInvoiceLine/${request.params.id}`,
            summaryTable:lineTable,
            summaryHeader:lineHeader, 
            success_message:success_message,
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
    const summaryPayment = await modifyPaymentResponse(lineData.paymentrequestid,false);
    return {
        pageTitle:constant_model.invoiceline_view_title, 
        summaryPayment:summaryPayment,
        payment_id:lineData.paymentrequestid,
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
    const summaryPayment = await modifyPaymentResponse(lineData.paymentrequestid,false);
    return {
        pageTitle:constant_model.invoiceline_edit_title, 
        summaryPayment:summaryPayment,
        payment_id:lineData.paymentrequestid,
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
        await db_con('invoicelines')
        .where('id',payload.line_id)
        .update({
            value:payload.paymentvalue,
            description:payload.description,
            fundcode:payload.fundcode,
            mainaccount:payload.mainaccount,
            schemecode:payload.schemecode,
            marketingyear:payload.marketingyear,
            deliverybody:payload.deliverybody,
        })
        request.yar.flash('success_message', constant_model.invoiceline_update_success);
    }
    else
    {
    await external_request.sendExternalRequestPost(`${constant_model.request_host}/invoicelines/add`,{
        Value:payload.paymentvalue,
        PaymentRequestId:payload.payment_id,
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
        .where('paymentrequests.paymentrequestid', id);
        const payment = data[0];
        return {
            head:'Payment Request Id',
            actions : show_actions?[
                {link:`/editPayment/${payment.paymentrequestid}`, name:'Edit'},
            ]:[],
            id : payment.paymentrequestid,
            rows:payment_model.modifyForPaymentSummary(payment)
        }; 
}


module.exports = {getTotalInvoiceLines, getAllInvoiceLines, deleteInvoiceLine, viewInvoiceLine, invoiceLineStore, updateInvoiceLine, viewInvoiceLine, deleteInvoiceLine, createInvoiceLine};