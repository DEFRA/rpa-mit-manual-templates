const db_con = require('../database/db_con')
const common_model = require('./common_model')
const external_request = require('../custom_requests/external_requests')
const constant_model = require('../app_constants/app_constant')

const getTotalPayments = async (invoiceID)=>{
    const total_payments = await db_con('invoicerequests').count('* as total').where('invoiceid', invoiceID); 
    return total_payments[0].total;
}

const createPayment = async (request)=>{
    const options_data = await external_request.sendExternalRequestGet(`${constant_model.request_host}/referencedata/getall`);
    const payment_type = common_model.modify_Response_Select(options_data.referenceData.paymentTypes);
    const invoice_data = await summaryPayments(request.params.id);
    return {pageTitle:constant_model.payment_add_title, payment_type:payment_type,...invoice_data,invoice_id:request.params.id,
        frn:'', sbi:'',vendor:'',
        description:'',
        claimreferencenumber:'',
        claimreference:'',
        disableditem:false,
        attributesitem:{},
        view_type:'create'};
}

const updatePayment = async (request)=>{
    const options_data = await external_request.sendExternalRequestGet(`${constant_model.request_host}/referencedata/getall`);
    const data = await db_con('invoicerequests')
    .join('lookup_paymenttypes', 'invoicerequests.currency', '=', 'lookup_paymenttypes.code')
    .select('invoicerequests.*')
    .where('invoicerequests.invoicerequestid', request.params.id);
    const paymentData = data[0];
    const payment_type = common_model.modify_Response_Select(options_data.referenceData.paymentTypes,paymentData.currency);
    const invoice_data = await summaryPayments(paymentData.invoiceid);
    return {pageTitle:constant_model.payment_edit_title, payment_type:payment_type,...invoice_data,invoice_id:paymentData.invoiceid,
        frn:paymentData.frn,sbi:paymentData.sbi,vendor:paymentData.vendor,
        description:paymentData.description,
        disableditem:false,
        payment_id:request.params.id,
        attributesitem:{},
        view_type:'edit'};
}

const viewPayment = async (request)=>{
    const options_data = await external_request.sendExternalRequestGet(`${constant_model.request_host}/referencedata/getall`);
    const data = await db_con('invoicerequests')
    .join('lookup_paymenttypes', 'invoicerequests.currency', '=', 'lookup_paymenttypes.code')
    .select('invoicerequests.*')
    .where('invoicerequests.invoicerequestid', request.params.id);
    const paymentData = data[0];
    const payment_type = common_model.modify_Response_Select(options_data.referenceData.paymentTypes,paymentData.currency);
    const invoice_data = await summaryPayments(paymentData.invoiceid);
    return {pageTitle:constant_model.payment_view_title, payment_type:payment_type,...invoice_data,invoice_id:paymentData.invoiceid,
        frn:paymentData.frn,sbi:paymentData.sbi,vendor:paymentData.vendor,
        description:paymentData.description,
        disableditem:true,
        attributesitem:{ readonly: 'readonly' },
        view_type:'view'};
}


const paymentStore = async (request)=>{
    const payload = request.payload;
    if(payload.payment_id)
    {
        await external_request.sendExternalRequestPut(`${constant_model.request_host}/paymentrequest/update`,{
            FRN:payload.frn,
            SBI:payload.sbi,
            Vendor:payload.vendor,
            Currency:payload.currency,
            Description:payload.description,
            InvoiceRequestId:payload.payment_id,
            ClaimReference:payload.claimreference,
            ClaimReferenceNumber:payload.claimreferencenumber
        })
        request.yar.flash('success_message', constant_model.payment_update_success);
    }
    else
    {
    const payment_id = common_model.generateID();
    await external_request.sendExternalRequestPost(`${constant_model.request_host}/invoicerequests/add`,{
        InvoiceId:payload.inv_id,
        FRN:payload.frn,
        SBI:payload.sbi,
        Vendor:payload.vendor,
        Currency:payload.currency,
        Description:payload.description,
        InvoiceRequestId:payment_id,
        ClaimReference:payload.claimreference,
        ClaimReferenceNumber:payload.claimreferencenumber
    })
    request.yar.flash('success_message', constant_model.payment_creation_success);
    }
    return payload.inv_id;
}


const summaryPayments = async (id) =>
{
    const data = await db_con('invoices')
    .join('lookup_accountcodes', 'invoices.accounttype', '=', 'lookup_accountcodes.code')
    .join('lookup_deliverybodyinitialselections', 'invoices.deliverybody', '=', 'lookup_deliverybodyinitialselections.code')
    .join('lookup_schemeinvoicetemplates', 'invoices.schemetype', '=', 'lookup_schemeinvoicetemplates.name')
    .join('lookup_schemeinvoicetemplatessecondaryrpaquestions', 'invoices.secondaryquestion', '=', 'lookup_schemeinvoicetemplatessecondaryrpaquestions.name')
    .join('lookup_paymenttypes', 'invoices.paymenttype', '=', 'lookup_paymenttypes.code')
    .select('invoices.id as generated_id', 'invoices.status', 'invoices.created as created_at', 
        'lookup_accountcodes.description as account_type', 'lookup_deliverybodyinitialselections.deliverybodydescription as delivery_body', 'lookup_schemeinvoicetemplates.name as invoice_template',
        'lookup_schemeinvoicetemplatessecondaryrpaquestions.name as invoice_template_secondary', 'lookup_paymenttypes.code as payment_type')
    .where('invoices.id',id);
    const summaryData = data[0];
    
    const summaryHeader = [ { text: "Account Type" }, { text: "Delivery Body" }, { text: "Scheme Type" }, { text: "Payment Type" } ];
    const summaryTable = common_model.modify_Response_Table(common_model.removeForSummaryTable(summaryData));
    console.log(summaryTable);
    return {summaryTable:summaryTable, summaryHeader:summaryHeader};
}

const getAllPayments = async (invoiceID)=>{
    const data = await db_con('invoicerequests')
    .join('lookup_paymenttypes', 'invoicerequests.currency', '=', 'lookup_paymenttypes.code')
    .select('invoicerequests.*')
    .where('invoicerequests.invoiceid', invoiceID);
    return modifyPaymentResponse(data);
}

const deletePayment=async (request)=>{
    await external_request.sendExternalRequestDelete(`${constant_model.request_host}/invoicerequests/delete`,{
        invoiceRequestId:request.params.id
    });
    request.yar.flash('success_message', constant_model.payment_deletion_success);
    return request.params.invoiceid;
};

const modifyPaymentResponse = (payment_list)=>{
    return payment_list.map((item) => {
        return {
            head:'Invoice Request Id',
            actions : [
                {link:`/viewPayment/${item.invoicerequestid}/${item.invoiceid}`, name:'View'},
                {link:`/viewPaymentLine/${item.invoicerequestid}/${item.invoiceid}`, name:'Detail Line'},
                {link:`/deletePayment/${item.invoicerequestid}/${item.invoiceid}`, name:'Delete'}
            ],
            id : item.invoicerequestid,
            rows:modifyForPaymentSummary(item)
        }
      }); 
}

const modifyForPaymentSummary = (payment)=>{
    const paymentData = [];
    paymentData.push({name:'FRN',value:payment.frn})
    paymentData.push({name:'Currency',value:payment.currency})
    paymentData.push({name:'Description',value:payment.description})
    paymentData.push({name:'Value',value:payment.value})
    return common_model.modify_Response_Summary(paymentData);
}

module.exports = {modifyForPaymentSummary, getTotalPayments, getAllPayments, createPayment, paymentStore, updatePayment, viewPayment, deletePayment};