/* global it */

const { getAllInvoices, invoiceSummary, approveInvoice, rejectInvoice, modifyInvoiceResponse } = require('../../app/backend/models/approvalInvoiceModel')
const externalRequest = require('../../app/backend/custom_requests/externalRequests')
const constantModel = require('../../app/backend/app_constants/appConstant')
const commonModel = require('../../app/backend/models/commonModel')

jest.mock('../../app/backend/custom_requests/externalRequests')
jest.mock('../../app/backend/app_constants/appConstant')
jest.mock('../../app/backend/models/commonModel')

describe('Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllInvoices', () => {
    it('should return invoices with a success message', async () => {
      const mockData = { invoices: [{ id: '1' }] }
      externalRequest.sendExternalRequestPost.mockResolvedValue(mockData)

      const request = {
        yar: { flash: jest.fn() }
      }

      const result = await getAllInvoices(request)

      expect(externalRequest.sendExternalRequestPost).toHaveBeenCalledWith(`${constantModel.requestHost}/approvals/getmyapprovals`, {})
      expect(request.yar.flash).toHaveBeenCalledWith('successMessage', '')
      expect(result).toEqual({
        pageTitle: constantModel.approveInvoiceListTitle,
        invoices: expect.any(Array)
      })
    })
  })

  describe('modifyInvoiceResponse', () => {
    it('should modify invoice response correctly', () => {
      const invoiceList = [{ id: '1' }]
      commonModel.modifyForSummary.mockReturnValue([{ key: { text: 'Test' }, value: { html: 'Test' }, actions: { items: [] } }])
      const result = modifyInvoiceResponse(invoiceList)

      expect(result).toEqual([{
        head: 'Invoice Id',
        actions: [{ link: '/viewApprovalInvoice/1', name: 'View' }],
        id: '1',
        rows: [{ key: { text: 'Test' }, value: { html: 'Test' }, actions: { items: [] } }]
      }])
    })
  })

  describe('approveInvoice', () => {
    it('should approve an invoice and flash a success message', async () => {
      const request = {
        params: { id: '1' },
        yar: { flash: jest.fn() }
      }

      await approveInvoice(request)

      expect(externalRequest.sendExternalRequestPost).toHaveBeenCalledWith(`${constantModel.requestHost}/approvals/approve`, { id: '1' })
      expect(request.yar.flash).toHaveBeenCalledWith('successMessage', constantModel.invoiceApproveSuccess)
      expect(request.params.id).toBe('1')
    })
  })

  describe('rejectInvoice', () => {
    it('should reject an invoice and flash a success message', async () => {
      const request = {
        payload: { invoice_id: '1', reason: 'Not valid' },
        params: { id: '1' },
        yar: { flash: jest.fn() }
      }

      await rejectInvoice(request)

      expect(externalRequest.sendExternalRequestPost).toHaveBeenCalledWith(`${constantModel.requestHost}/approvals/reject`, { id: undefined, reason: 'Not valid' })
      expect(request.yar.flash).toHaveBeenCalledWith('successMessage', constantModel.invoiceRejectSuccess)
      expect(request.params.id).toBe('1')
    })
  })

  describe('invoiceSummary', () => {
    it('should return invoice summary view with data', async () => {
      const mockData = {
        invoice: {
          id: '1',
          invoiceRequests: [{ invoiceRequestId: 'IR1', invoiceId: '1', invoiceLines: [] }]
        }
      }

      externalRequest.sendExternalRequestPost.mockResolvedValue(mockData)
      commonModel.BulkHeadData.mockReturnValue([{ name: 'Test', value: 'Test' }])
      commonModel.BulkLineData.mockReturnValue([{ text: 'Test' }])

      const request = { params: { id: '1' } }
      const h = { view: jest.fn() }

      await invoiceSummary(request, h)

      expect(externalRequest.sendExternalRequestPost).toHaveBeenCalledWith(`${constantModel.requestHost}/approvals/getinvoiceforapproval`, { invoiceId: '1' })
      expect(h.view).toHaveBeenCalledWith('app_views/approvalInvoiceSummary', {
        pageTitle: constantModel.approvalInvoiceSummary,
        invoices: expect.any(Array),
        invoiceRequests: expect.any(Array),
        invoiceId: '1',
        approveUrl: '/approveInvoice/1'
      })
    })
  })
})
