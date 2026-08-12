import React, { useCallback, useEffect, useState } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import {
  Main,
  Box,
  Flex,
  Typography,
  Loader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  TextInput,
  SingleSelect,
  SingleSelectOption,
  Field,
} from '@strapi/design-system';
import { PLUGIN_ID } from '../pluginId';

const STATUS_FA = {
  pending: 'در انتظار',
  processing: 'در حال پردازش',
  shipped: 'ارسال‌شده',
  delivered: 'تحویل‌شده',
  cancelled: 'لغوشده',
  refunded: 'مسترد',
  paid: 'پرداخت‌شده',
  failed: 'ناموفق',
};

function formatToman(n) {
  return `${new Intl.NumberFormat('fa-IR').format(Math.round(Number(n) || 0))} تومان`;
}

function FormField({ label, children }) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      {children}
    </Field.Root>
  );
}

const CustomersPage = () => {
  const { get } = useFetchClient();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0, pageCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  const [q, setQ] = useState('');
  const [hasOrders, setHasOrders] = useState('');
  const [sort, setSort] = useState('createdAt');

  const loadCustomers = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: '25', sort });
        if (q) params.set('q', q);
        if (hasOrders) params.set('hasOrders', hasOrders);
        const res = await get(`/${PLUGIN_ID}/customers?${params}`);
        const data = res.data?.data || {};
        setItems(data.items || []);
        setPagination(data.pagination || { page: 1, pageSize: 25, total: 0, pageCount: 0 });
      } catch (e) {
        setError(e?.message || 'خطا در دریافت مشتریان');
      } finally {
        setLoading(false);
      }
    },
    [get, q, hasOrders, sort]
  );

  useEffect(() => {
    loadCustomers(1);
  }, [loadCustomers]);

  return (
    <Main>
      <Box padding={8} background="neutral100">
        <Typography variant="alpha" as="h1" marginBottom={2}>
          مشتریان
        </Typography>
        <Typography textColor="neutral600" marginBottom={6} as="p">
          جستجو، فیلتر و مشاهده سفارش‌های هر مشتری
        </Typography>

        <Box background="neutral0" padding={4} shadow="filterShadow" hasRadius marginBottom={4}>
          <Flex gap={3} wrap="wrap" alignItems="flex-end">
            <Box minWidth="12rem" flex="1">
              <FormField label="جستجو (موبایل / نام)">
                <TextInput
                  name="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="جستجو..."
                />
              </FormField>
            </Box>
            <Box minWidth="10rem">
              <FormField label="سفارش">
                <SingleSelect value={hasOrders} onChange={setHasOrders} placeholder="همه">
                  <SingleSelectOption value="">همه</SingleSelectOption>
                  <SingleSelectOption value="yes">دارای سفارش</SingleSelectOption>
                  <SingleSelectOption value="no">بدون سفارش</SingleSelectOption>
                </SingleSelect>
              </FormField>
            </Box>
            <Box minWidth="10rem">
              <FormField label="مرتب‌سازی">
                <SingleSelect value={sort} onChange={setSort}>
                  <SingleSelectOption value="createdAt">تاریخ عضویت</SingleSelectOption>
                  <SingleSelectOption value="name">نام</SingleSelectOption>
                </SingleSelect>
              </FormField>
            </Box>
            <Button variant="secondary" onClick={() => loadCustomers(1)}>
              اعمال
            </Button>
          </Flex>
        </Box>

        {loading && (
          <Flex justifyContent="center" padding={8}>
            <Loader />
          </Flex>
        )}
        {error && (
          <Box paddingBottom={4}>
            <Typography textColor="danger600">{error}</Typography>
          </Box>
        )}
        {!loading && !items.length && (
          <Typography textColor="neutral600">مشتری یافت نشد</Typography>
        )}

        {!loading && items.length > 0 && (
          <>
            <Flex direction="column" gap={3} alignItems="stretch">
              {items.map((c) => {
                const title =
                  c.display_name ||
                  `${c.first_name || ''} ${c.last_name || ''}`.trim() ||
                  c.username ||
                  c.phone_no ||
                  `کاربر #${c.id}`;
                const open = expanded === c.id;
                return (
                  <Box key={c.id} background="neutral0" shadow="filterShadow" hasRadius padding={4}>
                    <Flex justifyContent="space-between" alignItems="center" gap={3} wrap="wrap">
                      <Box>
                        <Typography fontWeight="bold">{title}</Typography>
                        <Typography variant="pi" textColor="neutral600" as="p">
                          {c.phone_no || '—'} · {c.ordersCount || 0} سفارش
                        </Typography>
                      </Box>
                      <Button
                        size="S"
                        variant="tertiary"
                        onClick={() => setExpanded(open ? null : c.id)}
                      >
                        {open ? 'بستن' : 'مشاهده سفارش‌ها'}
                      </Button>
                    </Flex>
                    {open && (
                      <Box paddingTop={4}>
                        <Typography variant="pi" textColor="neutral600" as="p" marginBottom={2}>
                          ایمیل: {c.email || '—'} · عضویت:{' '}
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('fa-IR') : '—'}
                        </Typography>
                        {!c.orders?.length ? (
                          <Typography textColor="neutral600">سفارشی ندارد</Typography>
                        ) : (
                          <Table colCount={4} rowCount={c.orders.length}>
                            <Thead>
                              <Tr>
                                <Th><Typography variant="sigma">شماره</Typography></Th>
                                <Th><Typography variant="sigma">مبلغ</Typography></Th>
                                <Th><Typography variant="sigma">وضعیت</Typography></Th>
                                <Th><Typography variant="sigma">پرداخت</Typography></Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {c.orders.map((o) => (
                                <Tr key={o.id}>
                                  <Td><Typography>{o.order_number || o.id}</Typography></Td>
                                  <Td><Typography>{formatToman(o.total)}</Typography></Td>
                                  <Td><Typography>{STATUS_FA[o.status] || o.status}</Typography></Td>
                                  <Td>
                                    <Typography>
                                      {STATUS_FA[o.payment_status] || o.payment_status}
                                    </Typography>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        )}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Flex>
            <Flex justifyContent="space-between" alignItems="center" marginTop={4}>
              <Typography variant="pi" textColor="neutral600">
                {pagination.total} مشتری — صفحه {pagination.page} از {pagination.pageCount || 1}
              </Typography>
              <Flex gap={2}>
                <Button
                  variant="secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => loadCustomers(pagination.page - 1)}
                >
                  قبلی
                </Button>
                <Button
                  variant="secondary"
                  disabled={pagination.page >= pagination.pageCount}
                  onClick={() => loadCustomers(pagination.page + 1)}
                >
                  بعدی
                </Button>
              </Flex>
            </Flex>
          </>
        )}
      </Box>
    </Main>
  );
};

export default CustomersPage;
