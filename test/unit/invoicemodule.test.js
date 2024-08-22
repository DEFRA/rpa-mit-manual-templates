const { getAllInvoices, createInvoice, createBulk, invoiceStore, invoiceSummary, modifyForSummaryBox, modifyInvoiceResponse, deleteInvoice, downloadFile, BulkDataUpload, uploadBulk } = require('../../app/backend/models/invoice_model');
const external_request = require('../../app/backend/custom_requests/external_requests');
const common_model = require('../../app/backend/models/common_model');
const payment_model = require('../../app/backend/models/payment_model');
const constant_model = require('../../app/backend/app_constants/app_constant');
const Path = require('path');

jest.mock('../../app/backend/custom_requests/external_requests');
jest.mock('../../app/backend/app_constants/app_constant');
jest.mock('../../app/backend/models/common_model');
jest.mock('../../app/backend/models/payment_model');

describe('Invoice Line Model Tests', () => {
    /*
    test('getAllInvoices should return formatted invoice list and messages', async () => {
        const mockInvoices = [{ id: '1' }, { id: '2' }];
        const mockFormattedInvoices = [{ head: 'Invoice Id', actions: [{"link": "/viewInvoice/1","name":"View"},{"link":"/deleteInvoice/1","name":"Delete"}], id: '1', rows: [] }, { head: 'Invoice Id', actions: [{"link": "/viewInvoice/2","name":"View"},{"link":"/deleteInvoice/2","name":"Delete"}], id: '2', rows: [] }];
        external_request.sendExternalRequestGet.mockResolvedValue({ invoices: mockInvoices });
        common_model.modifyForSummary.mockReturnValue([]);

        const request = {
            yar: {
                flash: jest.fn().mockReturnValue(null),
            },
        };

        const result = await getAllInvoices(request);

        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(`${constant_model.request_host}/invoices/getall`);
        expect(result).toEqual({
            pageTitle: constant_model.invoice_list_title,
            invoices: mockFormattedInvoices,
            success_message: null,
        });
    });
*/
    test('createInvoice should return invoice creation form data', async () => {
        const mockOptionsData = {
            referenceData: {
                accountCodes: [],
                initialDeliveryBodies: [],
                schemeInvoiceTemplates: [],
                schemeInvoiceTemplateSecondaryQuestions: [],
                paymentTypes: [],
            }
        };
        external_request.sendExternalRequestGet.mockResolvedValue(mockOptionsData);
        common_model.modify_Response_Radio.mockReturnValue([]);

        const request = {};

        const result = await createInvoice(request);

        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(`${constant_model.request_host}/referencedata/getall`);
        expect(result).toEqual({
            pageTitle: constant_model.invoice_add_title,
            account_type: [],
            delivery_body: [],
            invoice_template: [],
            invoice_template_secondary: [],
            payment_type: [],
        });
    });

    test('createBulk should return bulk upload form data', async () => {
        const mockOptionsData = {
            referenceData: {
                accountCodes: [],
                initialDeliveryBodies: [],
                schemeInvoiceTemplates: [],
            }
        };
        external_request.sendExternalRequestGet.mockResolvedValue(mockOptionsData);
        common_model.modify_Response_Radio.mockReturnValue([]);

        const request = {};

        const result = await createBulk(request);

        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(`${constant_model.request_host}/referencedata/getall`);
        expect(result).toEqual({
            pageTitle: constant_model.bulk_upload,
            account_type: [],
            delivery_body: [],
            invoice_template: [],
        });
    });

    test('invoiceStore should store invoice and set flash message', async () => {
        const request = {
            payload: {
                account_type: 'type1',
                delivery_body: 'body1',
                invoice_template: 'template1',
                invoice_template_secondary: 'secondary1',
                payment_type: 'payment1',
            },
            yar: {
                flash: jest.fn(),
            },
        };

        await invoiceStore(request);

        expect(external_request.sendExternalRequestPost).toHaveBeenCalledWith(
            `${constant_model.request_host}/invoices/add`,
            {
                AccountType: 'type1',
                DeliveryBody: 'body1',
                SchemeType: 'template1',
                SecondaryQuestion: 'secondary1',
                PaymentType: 'payment1',
            }
        );
        expect(request.yar.flash).toHaveBeenCalledWith('success_message', constant_model.invoice_creation_success);
    });

    test('invoiceSummary should return invoice summary data', async () => {
        const mockInvoiceData = { id: '1', status: 'active', created: '2024-08-11' };
        const mockPayments = [{ id: 'payment1' }];
        const mockSummaryData = [{ name: 'Status', value: '<strong class="govuk-tag">ACTIVE</strong>' }];
        external_request.sendExternalRequestGet.mockResolvedValue({ invoice: mockInvoiceData });
        payment_model.getAllPayments.mockResolvedValue(mockPayments);
        common_model.modify_Response_Summary.mockReturnValue(mockSummaryData);
        common_model.modify_Response_Table.mockReturnValue([]);

        const request = {
            params: { id: '1' },
            yar: { flash: jest.fn().mockReturnValue(null) }
        };

        const result = await invoiceSummary(request);

        expect(external_request.sendExternalRequestGet).toHaveBeenCalledWith(`${constant_model.request_host}/invoices/getbyid`, { invoiceId: '1' });
        expect(payment_model.getAllPayments).toHaveBeenCalledWith('1');
        expect(result).toEqual({
            pageTitle: constant_model.invoice_summary_title,
            summaryTable: [],
            summaryBox: {
                head: 'Invoice Id',
                actions: [],
                id: '1',
                rows: mockSummaryData
            },
            paymentLink: `/createPayment/1`,
            total_requests: 1,
            summaryHeader: [
                { text: 'Account Type' },
                { text: 'Delivery Body' },
                { text: 'Scheme Type' },
                { text: 'Payment Type' }
            ],
            allPayments: mockPayments,
            success_message: null
        });
    });

    test('modifyForSummaryBox should return formatted summary box data', async () => {
        const mockSummaryData = {
            status: 'active',
            created: '2024-08-11',
            invoiceRequests: [{ id: 'request1' }]
        };
        const mockFormattedData = [
            { name: 'Status', value: '<strong class="govuk-tag">ACTIVE</strong>' },
            { name: 'Created On', value: 'August 11, 2024' },
            { name: 'Number Of Invoice Requests', value: '1' }
        ];
        common_model.formatTimestamp.mockReturnValue('August 11, 2024');
        common_model.modify_Response_Summary.mockReturnValue(mockFormattedData);

        const result = await modifyForSummaryBox(mockSummaryData);

        expect(common_model.formatTimestamp).toHaveBeenCalledWith('2024-08-11');
        expect(common_model.modify_Response_Summary).toHaveBeenCalledWith([
            { name: 'Status', value: '<strong class="govuk-tag">ACTIVE</strong>' },
            { name: 'Created On', value: 'August 11, 2024' },
            { name: 'Number Of Invoice Requests', value: '1' }
        ]);
        expect(result).toEqual(mockFormattedData);
    });

    test('modifyInvoiceResponse should format invoice response correctly', () => {
        const mockInvoiceList = [{ id: '1' }, { id: '2' }];
        const mockFormattedInvoices = [
            { head: 'Invoice Id', actions: [{ link: '/viewInvoice/1', name: 'View' }, { link: '/deleteInvoice/1', name: 'Delete' }], id: '1', rows: [] },
            { head: 'Invoice Id', actions: [{ link: '/viewInvoice/2', name: 'View' }, { link: '/deleteInvoice/2', name: 'Delete' }], id: '2', rows: [] }
        ];
        common_model.modifyForSummary.mockReturnValue([]);

        const result = modifyInvoiceResponse(mockInvoiceList);

        expect(result).toEqual(mockFormattedInvoices);
    });

    test('deleteInvoice should delete invoice and set flash message', async () => {
        const request = {
            params: { id: '1' },
            yar: {
                flash: jest.fn(),
            },
        };

        await deleteInvoice(request);

        expect(external_request.sendExternalRequestDelete).toHaveBeenCalledWith(
            `${constant_model.request_host}/invoices/delete`,
            { invoiceId: '1' }
        );
        expect(request.yar.flash).toHaveBeenCalledWith('success_message', constant_model.invoice_deletion_success);
    });
/*
    test('downloadFile should return the file for download', async () => {
        const h = {
            file: jest.fn(),
        };
        const request = {};

        await downloadFile(request, h);

        expect(h.file).toHaveBeenCalledWith(Path.join(__dirname, 'sample_files', 'sample.xlsx').replace("\\test\\unit\\","\\app\\backend\\models\\"));
    });
    */

    test('BulkDataUpload should upload bulk data and set flash message', async () => {
        const request = {
            payload: {
                bulk_data: JSON.stringify({
                    bulkUploadInvoice: {
                        id: '1',
                    }
                })
            },
            yar: {
                flash: jest.fn(),
            },
        };

        await BulkDataUpload(request);

        expect(external_request.sendExternalRequestPost).toHaveBeenCalledWith(
            `${constant_model.request_host}/bulkuploads/confirm`,
            {
                invoiceId: '1',
                confirmUpload: true,
                confirm: true
            }
        );
        expect(request.yar.flash).toHaveBeenCalledWith('success_message', constant_model.invoiceline_bulkupload_success);
    });

});
