const db_con = require('../database/db_con');
const common_model = require('./common_model')
const payment_model = require('./payment_model')
const external_request = require('../custom_requests/external_requests')
const constant_model = require('../app_constants/app_constant')

const getAllInvoices = async (request)=>{
    const success_message = request.yar.flash('success_message');
    const data = await db_con('invoices')
    .join('lookup_accountcodes', 'invoices.accounttype', '=', 'lookup_accountcodes.code')
    .join('lookup_deliverybodyinitialselections', 'invoices.deliverybody', '=', 'lookup_deliverybodyinitialselections.code')
    .join('lookup_schemeinvoicetemplates', 'invoices.schemetype', '=', 'lookup_schemeinvoicetemplates.code')
    .join('lookup_schemeinvoicetemplatessecondaryrpaquestions', 'invoices.secondaryquestion', '=', 'lookup_schemeinvoicetemplatessecondaryrpaquestions.id')
    .join('lookup_paymenttypes', 'invoices.paymenttype', '=', 'lookup_paymenttypes.code')
    .select('invoices.id as generated_id', 'invoices.status', 'invoices.created as created_at', 
        'lookup_accountcodes.description as account_type', 'lookup_deliverybodyinitialselections.deliverybodydescription as delivery_body', 'lookup_schemeinvoicetemplates.name as invoice_template',
        'lookup_schemeinvoicetemplatessecondaryrpaquestions.name as invoice_template_secondary', 'lookup_paymenttypes.code as payment_type')
    .orderBy('invoices.created', 'desc');
    request.yar.flash('success_message', '');
    return {pageTitle:constant_model.invoice_list_title,invoices:modifyInvoiceResponse(data),success_message:success_message};
}

const createInvoice = async (request)=>{
    const options_data = await external_request.sendExternalRequestGet(`${constant_model.request_host}/referencedata/getall`);
    const account_type = common_model.modify_Response_Radio(options_data.referenceData.accountCodes);
    const delivery_body = options_data.referenceData.initialDeliveryBodies;
    const invoice_template = options_data.referenceData.schemeInvoiceTemplates;
    const invoice_template_secondary = options_data.referenceData.schemeInvoiceTemplateSecondaryQuestions;
    const payment_type = common_model.modify_Response_Radio(options_data.referenceData.paymentTypes);
    return {pageTitle:constant_model.invoice_add_title,account_type:account_type,delivery_body:delivery_body,
            invoice_template:invoice_template,invoice_template_secondary:invoice_template_secondary,
            payment_type:payment_type};
}

const invoiceStore = async (request)=>{
    const payload = request.payload;
    await external_request.sendExternalRequestPost(`${constant_model.request_host}/invoices/add`,{
        AccountType:payload.account_type,
        DeliveryBody:payload.delivery_body,
        SchemeType:payload.invoice_template,
        SecondaryQuestion:payload.invoice_template_secondary,
        PaymentType:payload.payment_type
    })
    request.yar.flash('success_message', constant_model.invoice_creation_success);
}


const invoiceSummary = async (request)=>{
   const success_message = request.yar.flash('success_message');
   const data = await db_con('invoices')
   .join('lookup_accountcodes', 'invoices.accounttype', '=', 'lookup_accountcodes.code')
   .join('lookup_deliverybodyinitialselections', 'invoices.deliverybody', '=', 'lookup_deliverybodyinitialselections.code')
   .join('lookup_schemeinvoicetemplates', 'invoices.schemetype', '=', 'lookup_schemeinvoicetemplates.code')
   .join('lookup_schemeinvoicetemplatessecondaryrpaquestions', 'invoices.secondaryquestion', '=', 'lookup_schemeinvoicetemplatessecondaryrpaquestions.id')
   .join('lookup_paymenttypes', 'invoices.paymenttype', '=', 'lookup_paymenttypes.code')
   .select('invoices.id as generated_id', 'invoices.status', 'invoices.created as created_at', 
       'lookup_accountcodes.description as account_type', 'lookup_deliverybodyinitialselections.deliverybodydescription as delivery_body', 'lookup_schemeinvoicetemplates.name as invoice_template',
       'lookup_schemeinvoicetemplatessecondaryrpaquestions.name as invoice_template_secondary', 'lookup_paymenttypes.code as payment_type')
   .where('invoices.id',request.params.id);
   const summaryData = data[0];
   const summaryBox =  {head:'Invoice Id',actions : [], id : summaryData.generated_id,rows:await modifyForSummaryBox(summaryData)}
   const total_requests= summaryData["total_requests"];
   const summaryHeader = [ { text: "Account Type" }, { text: "Delivery Body" }, { text: "Scheme Type" }, { text: "Payment Type" } ];
   const summaryTable = common_model.modify_Response_Table(common_model.removeForSummaryTable(summaryData));
   const getAllPayments = await payment_model.getAllPayments(request.params.id)
   request.yar.flash('success_message', '');
   return {pageTitle:constant_model.invoice_summary_title, summaryTable:summaryTable,summaryBox:summaryBox, paymentLink:`/createPayment/${request.params.id}`,
          total_requests:total_requests, summaryHeader:summaryHeader, allPayments:getAllPayments,success_message:success_message}
}

const modifyForSummaryBox = async (summaryData)=>{
    const summaryBoxData = [];
    const total_requests = await payment_model.getTotalPayments(summaryData.generated_id)
    summaryData["total_requests"] = total_requests;
    summaryBoxData.push({name:'Status',value:`<strong class="govuk-tag">${summaryData.status.toUpperCase()}</strong>`})
    summaryBoxData.push({name:'Created On',value:common_model.formatTimestamp(summaryData.created_at)})
    summaryBoxData.push({name:'Number Of Invoice Requests',value:total_requests.toString()})
    return common_model.modify_Response_Summary(summaryBoxData);
}


const modifyInvoiceResponse = (invoice_list)=>{
    return invoice_list.map((item) => {
        return {
            head:'Invoice Id',
            actions : [
                {link:`/viewInvoice/${item.generated_id}`, name:'View'},
                {link:`/deleteInvoice/${item.generated_id}`, name:'Delete'}
           ],
            id : item.generated_id,
            rows:modifyForSummary(item)
        }
      }); 
}

const deleteInvoice=async (request)=>{
    await external_request.sendExternalRequestPost(`${constant_model.request_host}/invoices/delete`,{
        InvoiceId:request.params.id
    });
    request.yar.flash('success_message', constant_model.invoice_deletion_success);
    return request.params.id;
};

const modifyForSummary = (invoice)=>{
    const summaryData = [];
    summaryData.push({name:'Account Type',value:invoice.account_type})
    summaryData.push({name:'Delivery Body',value:invoice.delivery_body})
    summaryData.push({name:'Invoice Template',value:invoice.invoice_template})
    summaryData.push({name:'Invoice Template Secondary',value:invoice.invoice_template_secondary})
    summaryData.push({name:'Payment Type',value:invoice.payment_type})
    return common_model.modify_Response_Summary(summaryData);

}

module.exports = {getAllInvoices, deleteInvoice, createInvoice, invoiceStore, invoiceSummary}