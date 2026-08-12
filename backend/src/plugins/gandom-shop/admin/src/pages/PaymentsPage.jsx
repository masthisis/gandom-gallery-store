import React, { useEffect, useState } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import {
  Main,
  Box,
  Flex,
  Typography,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Loader,
  TextInput,
  SingleSelect,
  SingleSelectOption,
  Modal,
} from '@strapi/design-system';
import { PLUGIN_ID } from '../pluginId';

const STATUS_FA = {
  pending: 'در انتظار',
  completed: 'تکمیل‌شده',
  failed: 'ناموفق',
  refunded: 'مسترد',
};

function formatToman(n) {
  return `${new Intl.NumberFormat('fa-IR').format(Math.round(Number(n) || 0))} تومان`;
}

const PaymentsPage = () => {
  const { get, post } = useFetchClient();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [reconcileReason, setReconcileReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const qs = params.toString();
      const res = await get(`/${PLUGIN_ID}/payments${qs ? `?${qs}` : ''}`);
      setRows(res.data?.data || []);
    } catch (e) {
      setError(e?.message || 'خطا در بارگذاری پرداخت‌ها');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function openDetail(id) {
    const res = await get(`/${PLUGIN_ID}/payments/${id}`);
    setDetail(res.data?.data || res.data);
    setReconcileReason('');
  }

  async function refundPayment() {
    if (!detail) return;
    setActionLoading(true);
    try {
      await post(`/${PLUGIN_ID}/payments/${detail.id}/refund`, {
        amountToman: detail.amount,
      });
      await openDetail(detail.id);
      await load();
    } catch (e) {
      setError(e?.message || 'بازگشت وجه ناموفق');
    } finally {
      setActionLoading(false);
    }
  }

  async function markOrder(action) {
    if (!detail?.order?.id || !reconcileReason.trim()) return;
    setActionLoading(true);
    try {
      const path =
        action === 'paid'
          ? `/${PLUGIN_ID}/orders/${detail.order.id}/mark-paid`
          : `/${PLUGIN_ID}/orders/${detail.order.id}/mark-failed`;
      await post(path, { reason: reconcileReason.trim() });
      await openDetail(detail.id);
      await load();
    } catch (e) {
      setError(e?.message || 'عملیات ناموفق');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Main>
      <Box padding={8} background="neutral100">
        <Typography variant="alpha" as="h1" marginBottom={4}>
          پرداخت‌ها
        </Typography>

        <Flex gap={3} marginBottom={4} wrap="wrap">
          <Box style={{ minWidth: 200 }}>
            <SingleSelect
              label="وضعیت"
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="همه"
            >
              <SingleSelectOption value="">همه</SingleSelectOption>
              <SingleSelectOption value="pending">در انتظار</SingleSelectOption>
              <SingleSelectOption value="completed">تکمیل‌شده</SingleSelectOption>
              <SingleSelectOption value="failed">ناموفق</SingleSelectOption>
              <SingleSelectOption value="refunded">مسترد</SingleSelectOption>
            </SingleSelect>
          </Box>
          <TextInput
            label="جستجو (تیکت / سفارش)"
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={load} data-testid="payments-filter">اعمال فیلتر</Button>
        </Flex>

        {loading && (
          <Flex justifyContent="center" padding={8}>
            <Loader />
          </Flex>
        )}
        {error && <Typography textColor="danger600">{error}</Typography>}

        {!loading && (
          <Box background="neutral0" shadow="filterShadow" hasRadius padding={4} data-testid="payments-table">
            <Table colCount={6} rowCount={rows.length}>
              <Thead>
                <Tr>
                  <Th><Typography variant="sigma">تیکت</Typography></Th>
                  <Th><Typography variant="sigma">مبلغ</Typography></Th>
                  <Th><Typography variant="sigma">وضعیت</Typography></Th>
                  <Th><Typography variant="sigma">سفارش</Typography></Th>
                  <Th><Typography variant="sigma">مشتری</Typography></Th>
                  <Th><Typography variant="sigma">عملیات</Typography></Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((r) => (
                  <Tr key={r.id}>
                    <Td>
                      <Typography>{r.transaction_id}</Typography>
                      {r.mock && (
                        <Typography variant="pi" textColor="neutral500">شبیه‌سازی</Typography>
                      )}
                    </Td>
                    <Td><Typography>{formatToman(r.amount)}</Typography></Td>
                    <Td><Typography>{STATUS_FA[r.status] || r.status}</Typography></Td>
                    <Td><Typography>{r.order?.order_number || r.providerId || '—'}</Typography></Td>
                    <Td><Typography>{r.order?.user?.phone_no || '—'}</Typography></Td>
                    <Td>
                      <Button size="S" onClick={() => openDetail(r.id)}>جزئیات</Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {detail && (
          <Modal.Root open onOpenChange={() => setDetail(null)}>
            <Modal.Content>
              <Modal.Header>
                <Typography variant="beta">جزئیات پرداخت</Typography>
              </Modal.Header>
              <Modal.Body>
                <Typography>تیکت: {detail.transaction_id}</Typography>
                <Typography>وضعیت: {STATUS_FA[detail.status] || detail.status}</Typography>
                <Typography>مبلغ: {formatToman(detail.amount)}</Typography>
                <pre style={{ maxHeight: 200, overflow: 'auto', fontSize: 12 }}>
                  {JSON.stringify(detail.gateway_response, null, 2)}
                </pre>
                <TextInput
                  label="دلیل تطبیق دستی"
                  name="reason"
                  value={reconcileReason}
                  onChange={(e) => setReconcileReason(e.target.value)}
                />
                <Flex gap={2} marginTop={3} wrap="wrap">
                  {detail.status === 'completed' && (
                    <Button onClick={refundPayment} disabled={actionLoading}>
                      بازگشت وجه
                    </Button>
                  )}
                  {detail.order && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => markOrder('paid')}
                        disabled={actionLoading}
                      >
                        ثبت پرداخت دستی
                      </Button>
                      <Button
                        variant="danger-light"
                        onClick={() => markOrder('failed')}
                        disabled={actionLoading}
                      >
                        ثبت ناموفق دستی
                      </Button>
                    </>
                  )}
                </Flex>
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={() => setDetail(null)}>بستن</Button>
              </Modal.Footer>
            </Modal.Content>
          </Modal.Root>
        )}
      </Box>
    </Main>
  );
};

export default PaymentsPage;
