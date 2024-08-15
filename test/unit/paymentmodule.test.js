const {
    modifyForPaymentSummary,
    getTotalPayments,
    getAllPayments,
    createPayment,
    paymentStore,
    updatePayment,
    viewPayment,
    deletePayment
} = require('../../app/backend/models/payment_model');

const external_request = require('../../app/backend/custom_requests/external_requests');
const common_model = require('../../app/backend/models/common_model');
const constant_model = require('../../app/backend/app_constants/app_constant');
jest.mock('../../app/backend/custom_requests/external_requests');
jest.mock('../../app/backend/app_constants/app_constant');
jest.mock('../../app/backend/models/common_model');

describe('Payment Model Tests', () => {
    test('modifyForPaymentSummary should format payment summary data', () => {
        const mockPayment = {
            frn: 'FRN123',
            currency: 'USD',
            description: 'Payment for services',
            value: 1000
        };
        const mockFormattedData = [
            { name: 'FRN', value: 'FRN123' },
            { name: 'Currency', value: 'USD' },
            { name: 'Description', value: 'Payment for services' },
            { name: 'Value', value: '1000' }
        ];
        common_model.modify_Response_Summary.mockReturnValue(mockFormattedData);

        const result = modifyForPaymentSummary(mockPayment);

        expect(common_model.modify_Response_Summary).toHaveBeenCalledWith([
            { name: 'FRN', value: 'FRN123' },
            { name: 'Currency', value: 'USD' },
            { name: 'Description', value: 'Payment for services' },
            { name: 'Value', value: '1000' }
        ]);
        expect(result).toEqual(mockFormattedData);
    });

    test('getTotalPayments should return total number of payments', async () => {
        const mockTotalPayments = { invoiceRequests: [{}, {}] };
        external_request.sendExternalRequestGet.mockResolvedValue(mockTotalPayments);

        const result = await getTotalPayments('invoiceID');

        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constant_model.request_host}/invoicerequests/getbyinvoiceid`,
            { invoiceId: 'invoiceID' }
        );
        expect(result).toBe(2);
    });

    test('getAllPayments should return formatted list of payments', async () => {
        const mockPayments = [{ invoiceRequestId: '1', invoiceId: '2' }];
        const mockFormattedPayments = [{
            head: 'Invoice Request Id',
            actions: [
                { link: '/viewPayment/1/2', name: 'View' },
                { link: '/viewPaymentLine/1', name: 'Detail Line' },
                { link: '/deletePayment/1/2', name: 'Delete' }
            ],
            id: '1',
            rows: []
        }];
        external_request.sendExternalRequestGet.mockResolvedValue({ invoiceRequests: mockPayments });
        common_model.modify_Response_Summary.mockReturnValue([]);

        const result = await getAllPayments('invoiceID');

        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constant_model.request_host}/invoicerequests/getbyinvoiceid`,
            { invoiceId: 'invoiceID' }
        );
        expect(result).toEqual(mockFormattedPayments);
    });

    test('createPayment should return payment creation data', async () => {
        const mockOptionsData = {
            referenceData: {
                paymentTypes: []
            }
        };
        const mockInvoiceData = { summaryTable: undefined, summaryHeader:  [
            { text: "Account Type" },
            { text: "Delivery Body" },
            { text: "Scheme Type" },
            { text: "Payment Type" }
        ] };
        external_request.sendExternalRequestGet
            .mockResolvedValueOnce(mockOptionsData)
            .mockResolvedValueOnce(mockInvoiceData);
        common_model.modify_Response_Select.mockReturnValue([]);

        const request = { params: { id: 'invoiceID' } };

        const result = await createPayment(request);

        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constant_model.request_host}/referencedata/getall`
        );
        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constant_model.request_host}/invoices/getbyid`,
            { invoiceId: 'invoiceID' }
        );
        expect(result).toEqual({
            pageTitle: constant_model.payment_add_title,
            payment_type: [],
            ...mockInvoiceData,
            invoice_id: 'invoiceID',
            frn: '',
            sbi: '',
            vendor: '',
            description: '',
            claimreferencenumber: '',
            claimreference: '',
            disableditem: false,
            attributesitem: {},
            view_type: 'create'
        });
    });

    test('updatePayment should return payment update data', async () => {
        const mockOptionsData = {
            referenceData: {
                paymentTypes: []
            }
        };
        const mockPaymentData = {
            invoiceRequest: {
                frn: 'FRN123',
                sbi: 'SBI123',
                vendor: 'VendorName',
                description: 'Payment description',
                claimReferenceNumber: 'ClaimRef123',
                claimReference: 'ClaimRef'
            }
        };
        const mockInvoiceData = {  summaryTable: undefined, summaryHeader:  [
            { text: "Account Type" },
            { text: "Delivery Body" },
            { text: "Scheme Type" },
            { text: "Payment Type" }
        ] }
        external_request.sendExternalRequestGet
            .mockResolvedValueOnce(mockOptionsData)
            .mockResolvedValueOnce(mockPaymentData)
            .mockResolvedValueOnce(mockInvoiceData);
        common_model.modify_Response_Select.mockReturnValue([]);

        const request = { params: { id: 'paymentID', invoiceid: 'invoiceID' } };

        const result = await updatePayment(request);

        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constant_model.request_host}/referencedata/getall`
        );
        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constant_model.request_host}/invoicerequests/getbyid`,
            { invoiceRequestId: 'paymentID' }
        );
        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constant_model.request_host}/invoices/getbyid`,
            { invoiceId: 'invoiceID' }
        );
        expect(result).toEqual({
            pageTitle: constant_model.payment_edit_title,
            payment_type: [],
            ...mockInvoiceData,
            invoice_id: 'invoiceID',
            frn: 'FRN123',
            sbi: 'SBI123',
            vendor: 'VendorName',
            description: 'Payment description',
            claimreferencenumber: 'ClaimRef123',
            claimreference: 'ClaimRef',
            disableditem: false,
            payment_id: 'paymentID',
            attributesitem: {},
            view_type: 'edit'
        });
    });

    test('viewPayment should return payment view data', async () => {
        const mockOptionsData = {
            referenceData: {
                paymentTypes: []
            }
        };
        const mockPaymentData = {
            invoiceRequest: {
                frn: 'FRN123',
                sbi: 'SBI123',
                vendor: 'VendorName',
                description: 'Payment description',
                claimReferenceNumber: 'ClaimRef123',
                claimReference: 'ClaimRef'
            }
        };
        const mockInvoiceData = {  summaryTable: undefined, summaryHeader:  [
            { text: "Account Type" },
            { text: "Delivery Body" },
            { text: "Scheme Type" },
            { text: "Payment Type" }
        ] }
        external_request.sendExternalRequestGet
            .mockResolvedValueOnce(mockOptionsData)
            .mockResolvedValueOnce(mockPaymentData)
            .mockResolvedValueOnce(mockInvoiceData);
        common_model.modify_Response_Select.mockReturnValue([]);

        const request = { params: { id: 'paymentID', invoiceid: 'invoiceID' } };

        const result = await viewPayment(request);

        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constant_model.request_host}/referencedata/getall`
        );
        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constant_model.request_host}/invoicerequests/getbyid`,
            { invoiceRequestId: 'paymentID' }
        );
        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(
            `${constant_model.request_host}/invoices/getbyid`,
            { invoiceId: 'invoiceID' }
        );
        expect(result).toEqual({
            pageTitle: constant_model.payment_view_title,
            payment_type: [],
            ...mockInvoiceData,
            invoice_id: 'invoiceID',
            frn: 'FRN123',
            sbi: 'SBI123',
            vendor: 'VendorName',
            description: 'Payment description',
            claimreferencenumber: 'ClaimRef123',
            claimreference: 'ClaimRef',
            disableditem: true,
            attributesitem: { readonly: 'readonly' },
            view_type: 'view'
        });
    });

    test('paymentStore should store payment and set flash message', async () => {
        const request = {
            payload: {
                frn: 'FRN123',
                sbi: 'SBI123',
                vendor: 'VendorName',
                currency: 'USD',
                description: 'Payment description',
                payment_id: 'paymentID',
                inv_id: 'invoiceID',
                claimreference: 'ClaimRef',
                claimreferencenumber: 'ClaimRef123'
            },
            yar: {
                flash: jest.fn()
            }
        };

        await paymentStore(request);

        expect(request.payload.payment_id ? external_request.sendExternalRequestPut : external_request.sendExternalRequestPost).toHaveBeenCalledWith(
            `${constant_model.request_host}/invoicerequests/${request.payload.payment_id ? 'update' : 'add'}`,
            {
                FRN: 'FRN123',
                SBI: 'SBI123',
                Vendor: 'VendorName',
                Currency: 'USD',
                Description: 'Payment description',
                InvoiceRequestId: request.payload.payment_id,
                ClaimReference: 'ClaimRef',
                ClaimReferenceNumber: 'ClaimRef123',
                AgreementNumber: '',
                MarketingYear: '',
                AccountType: ''
            }
        );
        expect(request.yar.flash).toHaveBeenCalledWith(
            'success_message',
            request.payload.payment_id ? constant_model.payment_update_success : constant_model.payment_creation_success
        );
    });

    test('deletePayment should delete a payment and set flash message', async () => {
        const request = {
            params: {
                id: 'paymentID',
                invoiceid: 'invoiceID'
            },
            yar: {
                flash: jest.fn()
            }
        };

        await deletePayment(request);

        expect(external_request.sendExternalRequestDelete).toHaveBeenCalledWith(
            `${constant_model.request_host}/invoicerequests/delete`,
            {
                invoiceRequestId: 'paymentID'
            }
        );
        expect(request.yar.flash).toHaveBeenCalledWith(
            'success_message',
            constant_model.payment_deletion_success
        );
    });
});
