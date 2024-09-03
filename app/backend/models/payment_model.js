const common_model = require('./common_model')
const external_request = require('../custom_requests/external_requests')
const constant_model = require('../app_constants/app_constant')

const getTotalPayments = async (invoiceID)=>{
    const total_payments = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoicerequests/getbyinvoiceid`,{
        invoiceId:invoiceID
    });
    return (total_payments?.invoiceRequests.length || 0);
}

const createPayment = async (request)=>{
    const options_data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/referencedata/getall`);
    const payment_type = common_model.modify_Response_Select(options_data.referenceData.paymentTypes);
    const invoice_data = await summaryPayments(request.params.id);
    return {
        pageTitle:constant_model.payment_add_title, 
        payment_type:payment_type,
        ...invoice_data,
        invoice_id:request.params.id,
        frn:'', 
        sbi:'',
        vendor:'',
        description:'',
        claimreferencenumber:'',
        claimreference:'',
        disableditem:false,
        attributesitem:{},
        view_type:'create'
      };
}

const updatePayment = async (request)=>{
    const options_data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/referencedata/getall`);
    const data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoicerequests/getbyid`,{invoiceRequestId:request.params.id});
    const paymentData = data?.invoiceRequest || [];
    const payment_type = common_model.modify_Response_Select(options_data.referenceData.paymentTypes,paymentData.currency);
    const invoice_data = await summaryPayments(request.params.invoiceid);
    return {pageTitle:constant_model.payment_edit_title, 
        payment_type:payment_type,
        ...invoice_data,
        invoice_id:request.params.invoiceid,
        frn:paymentData.frn,
        sbi:paymentData.sbi,
        vendor:paymentData.vendor,
        description:paymentData.description,
        claimreferencenumber:paymentData.claimReferenceNumber,
        claimreference:paymentData.claimReference,
        disableditem:false,
        payment_id:request.params.id,
        attributesitem:{},
        view_type:'edit'
    };
}

const viewPayment = async (request)=>{
    const options_data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/referencedata/getall`);
    const data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoicerequests/getbyid`,{invoiceRequestId:request.params.id});
    const paymentData = data?.invoiceRequest || [];
    const payment_type = common_model.modify_Response_Select(options_data.referenceData.paymentTypes,paymentData.currency);
    const invoice_data = await summaryPayments(request.params.invoiceid);
    return {
        pageTitle:constant_model.payment_view_title, 
        payment_type:payment_type,
        ...invoice_data,
        invoice_id:request.params.invoiceid,
        frn:paymentData.frn,
        sbi:paymentData.sbi,
        vendor:paymentData.vendor,
        description:paymentData.description,
        claimreferencenumber:paymentData.claimReferenceNumber,
        claimreference:paymentData.claimReference,
        disableditem:true,
        attributesitem:{ readonly: 'readonly' },
        view_type:'view'
    };
}


const paymentStore = async (request)=>{
    const payload = request.payload;
    if(payload.payment_id)
    {
        await external_request.sendExternalRequestPut(`${process.env.REQUEST_HOST}/invoicerequests/update`,{
            FRN:payload.frn,
            SBI:payload.sbi,
            Vendor:payload.vendor,
            Currency:payload.currency,
            Description:payload.description,
            InvoiceRequestId:payload.payment_id,
            ClaimReference:payload.claimreference,
            ClaimReferenceNumber:payload.claimreferencenumber,
            AgreementNumber:'',
            MarketingYear:'',
            AccountType:''
        })
        request.yar.flash('success_message', constant_model.payment_update_success);
    }
    else
    {
    await external_request.sendExternalRequestPost(`${process.env.REQUEST_HOST}/invoicerequests/add`,{
        InvoiceId:payload.inv_id,
        FRN:payload.frn,
        SBI:payload.sbi,
        Vendor:payload.vendor,
        Currency:payload.currency,
        Description:payload.description,
        ClaimReference:payload.claimreference,
        ClaimReferenceNumber:payload.claimreferencenumber,
        AgreementNumber:'',
        MarketingYear:'',
        AccountType:''
    })
    request.yar.flash('success_message', constant_model.payment_creation_success);
    }
    return payload.inv_id;
}


const summaryPayments = async (id) =>
{
    const data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoices/getbyid`,{invoiceId:id});
    const summaryData = data?.invoice || [];
    const summaryHeader = [ { text: "Account Type" }, { text: "Delivery Body" }, { text: "Scheme Type" }, { text: "Payment Type" } ];
    const summaryTable = common_model.modify_Response_Table(common_model.removeForSummaryTable(summaryData));
    return {summaryTable:summaryTable, summaryHeader:summaryHeader};
}

const getAllPayments = async (invoiceID)=>{
    const data = await external_request.sendExternalRequestGet(`${process.env.REQUEST_HOST}/invoicerequests/getbyinvoiceid`,{
        invoiceId:invoiceID
    });
    return modifyPaymentResponse((data?.invoiceRequests || []));
}

const deletePayment=async (request)=>{
    await external_request.sendExternalRequestDelete(`${process.env.REQUEST_HOST}/invoicerequests/delete`,{
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
                {link:`/viewPayment/${item.invoiceRequestId}/${item.invoiceId}`, name:'View'},
                {link:`/viewPaymentLine/${item.invoiceRequestId}`, name:'Detail Line'},
                {link:`/deletePayment/${item.invoiceRequestId}/${item.invoiceId}`, name:'Delete'}
            ],
            id : item.invoiceRequestId,
            rows:modifyForPaymentSummary(item)
        }
      }); 
}

const modifyForPaymentSummary = (payment)=>{
    const paymentData = [];
    paymentData.push({name:'FRN',value:payment.frn})
    paymentData.push({name:'Currency',value:payment.currency})
    paymentData.push({name:'Description',value:payment.description})
    paymentData.push({name:'Value',value:payment.value?.toString()})
    return common_model.modify_Response_Summary(paymentData);
}

module.exports = {modifyForPaymentSummary, getTotalPayments, getAllPayments, createPayment, paymentStore, updatePayment, viewPayment, deletePayment};