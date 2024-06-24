const db_con = require('../database/db_con')
const common_model = require('./common_model')
const external_request = require('../custom_requests/external_requests')
const constant_model = require('../app_constants/app_constant')

const getTotalPayments = async (invoiceID)=>{
    const total_payments = await db_con('paymentrequests').count('* as total').where('invoiceid', invoiceID); 
    return total_payments[0].total;
}

const createPayment = async (request)=>{
    const options_data = await external_request.sendExternalRequestGet(`${constant_model.request_host}/referencedata/getall`);
    const payment_type = common_model.modify_Response_Select(options_data.referenceData.paymentTypes);
    const invoice_data = await summaryPayments(request.params.id);
    return {pageTitle:constant_model.payment_add_title, payment_type:payment_type,...invoice_data,invoice_id:request.params.id,
        frn:'', sbi:'',vendor:'',
        marketing_year:'',
        agreement_number:'',
        description:'',
        disableditem:false,
        attributesitem:{},
        view_type:'create'};
}

const updatePayment = async (request)=>{
    const options_data = await external_request.sendExternalRequestGet(`${constant_model.request_host}/referencedata/getall`);
    const data = await db_con('paymentrequests')
    .join('lookup_paymenttypes', 'paymentrequests.currency', '=', 'lookup_paymenttypes.code')
    .select('paymentrequests.*')
    .where('paymentrequests.paymentrequestid', request.params.id);
    const paymentData = data[0];
    const payment_type = common_model.modify_Response_Select(options_data.referenceData.paymentTypes,paymentData.currency);
    const invoice_data = await summaryPayments(paymentData.invoiceid);
    return {pageTitle:constant_model.payment_edit_title, payment_type:payment_type,...invoice_data,invoice_id:paymentData.invoiceid,
        frn:paymentData.frn,sbi:paymentData.sbi,vendor:paymentData.vendor,
        marketing_year:paymentData.marketingyear,
        agreement_number:paymentData.agreementnumber,
        description:paymentData.description,
        disableditem:false,
        payment_id:request.params.id,
        attributesitem:{},
        view_type:'edit'};
}

const viewPayment = async (request)=>{
    const options_data = await external_request.sendExternalRequestGet(`${constant_model.request_host}/referencedata/getall`);
    const data = await db_con('paymentrequests')
    .join('lookup_paymenttypes', 'paymentrequests.currency', '=', 'lookup_paymenttypes.code')
    .select('paymentrequests.*')
    .where('paymentrequests.paymentrequestid', request.params.id);
    const paymentData = data[0];
    const payment_type = common_model.modify_Response_Select(options_data.referenceData.paymentTypes,paymentData.currency);
    const invoice_data = await summaryPayments(paymentData.invoiceid);
    return {pageTitle:constant_model.payment_view_title, payment_type:payment_type,...invoice_data,invoice_id:paymentData.invoiceid,
        frn:paymentData.frn,sbi:paymentData.sbi,vendor:paymentData.vendor,
        marketing_year:paymentData.marketingyear,
        agreement_number:paymentData.agreementnumber,
        description:paymentData.description,
        disableditem:true,
        attributesitem:{ readonly: 'readonly' },
        view_type:'view'};
}


const paymentStore = async (request)=>{
    const payload = request.payload;
    if(payload.payment_id)
    {
        await db_con('paymentrequests')
        .where('paymentrequestid',payload.payment_id)
        .update({
            frn:payload.frn,
            sbi:payload.sbi,
            vendor:payload.vendor,
            marketingyear:payload.marketing_year,
            agreementnumber:payload.agreement_number,
            currency:payload.currency,
            description:payload.description
        })
        request.yar.flash('success_message', constant_model.payment_update_success);
    }
    else
    {
    const payment_id = common_model.generateID();
    await external_request.sendExternalRequestPost(`${constant_model.request_host}/paymentrequest/add`,{
        InvoiceId:payload.inv_id,
        FRN:payload.frn,
        SBI:payload.sbi,
        Vendor:payload.vendor,
        MarketingYear:payload.marketing_year,
        AgreementNumber:payload.agreement_number,
        Currency:payload.currency,
        Description:payload.description,
        PaymentRequestId:payment_id
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
    .join('lookup_schemeinvoicetemplates', 'invoices.schemetype', '=', 'lookup_schemeinvoicetemplates.code')
    .join('lookup_schemeinvoicetemplatessecondaryrpaquestions', 'invoices.secondaryquestion', '=', 'lookup_schemeinvoicetemplatessecondaryrpaquestions.id')
    .join('lookup_paymenttypes', 'invoices.paymenttype', '=', 'lookup_paymenttypes.code')
    .select('invoices.id as generated_id', 'invoices.status', 'invoices.created as created_at', 
        'lookup_accountcodes.description as account_type', 'lookup_deliverybodyinitialselections.deliverybodydescription as delivery_body', 'lookup_schemeinvoicetemplates.name as invoice_template',
        'lookup_schemeinvoicetemplatessecondaryrpaquestions.name as invoice_template_secondary', 'lookup_paymenttypes.code as payment_type')
    .where('invoices.id',id);
    const summaryData = data[0];
    const summaryHeader = [ { text: "Account Type" }, { text: "Delivery Body" }, { text: "Scheme Type" }, { text: "Payment Type" } ];
    const summaryTable = common_model.modify_Response_Table(common_model.removeForSummaryTable(summaryData));
    return {summaryTable:summaryTable, summaryHeader:summaryHeader};
}

const getAllPayments = async (invoiceID)=>{
    const data = await db_con('paymentrequests')
    .join('lookup_paymenttypes', 'paymentrequests.currency', '=', 'lookup_paymenttypes.code')
    .select('paymentrequests.*')
    .where('paymentrequests.invoiceid', invoiceID)
    .orderBy('paymentrequests.created_at', 'desc');
    return modifyPaymentResponse(data);
}

const deletePayment=async (request)=>{
    const data = await db_con('paymentrequests')
    .join('lookup_paymenttypes', 'paymentrequests.currency', '=', 'lookup_paymenttypes.code')
    .select('paymentrequests.*')
    .where('paymentrequests.paymentrequestid', request.params.id)
    const paymentData = data[0];
    await db_con('paymentrequests')
    .where('paymentrequests.paymentrequestid', request.params.id)
    .delete();
    request.yar.flash('success_message', constant_model.payment_deletion_success);
    return paymentData.invoiceid;
};

const modifyPaymentResponse = (payment_list)=>{
    return payment_list.map((item) => {
        return {
            head:'Payment Request Id',
            actions : [
                {link:`/viewPayment/${item.paymentrequestid}`, name:'View'},
                {link:`/viewPaymentLine/${item.paymentrequestid}`, name:'Edit'},
                {link:`/deletePayment/${item.paymentrequestid}`, name:'Delete'}
            ],
            id : item.paymentrequestid,
            rows:modifyForPaymentSummary(item)
        }
      }); 
}

const modifyForPaymentSummary = (payment)=>{
    const paymentData = [];
    paymentData.push({name:'FRN',value:payment.frn})
    paymentData.push({name:'Marketing Year',value:payment.marketingyear})
    paymentData.push({name:'Agreement Number',value:payment.agreementnumber})
    paymentData.push({name:'Currency',value:payment.currency})
    paymentData.push({name:'Description',value:payment.description})
    paymentData.push({name:'Value',value:payment.value})
    return common_model.modify_Response_Summary(paymentData);
}

module.exports = {modifyForPaymentSummary, getTotalPayments, getAllPayments, createPayment, paymentStore, updatePayment, viewPayment, deletePayment};