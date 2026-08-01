import React, { useEffect, useState } from 'react';
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

const CustomersPage = () => {
  const { get } = useFetchClient();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await get(`/${PLUGIN_ID}/customers`);
        if (!cancelled) setRows(res.data?.data || res.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'خطا در دریافت مشتریان');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [get]);

  return (
    <Main>
      <Box padding={8} background="neutral100">
        <Typography variant="alpha" as="h1" marginBottom={2}>
          مشتریان
        </Typography>
        <Typography textColor="neutral600" marginBottom={6} as="p">
          اطلاعات تماس و سفارش‌های هر مشتری
        </Typography>

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
        {!loading && !rows.length && (
          <Typography textColor="neutral600">مشتری ثبت نشده است</Typography>
        )}

        <Flex direction="column" gap={3} alignItems="stretch">
          {rows.map((c) => {
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
                            <Th>
                              <Typography variant="sigma">شماره</Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">مبلغ</Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">وضعیت</Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">پرداخت</Typography>
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {c.orders.map((o) => (
                            <Tr key={o.id}>
                              <Td>
                                <Typography>{o.order_number || o.id}</Typography>
                              </Td>
                              <Td>
                                <Typography>{formatToman(o.total)}</Typography>
                              </Td>
                              <Td>
                                <Typography>{STATUS_FA[o.status] || o.status}</Typography>
                              </Td>
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
      </Box>
    </Main>
  );
};

export default CustomersPage;
