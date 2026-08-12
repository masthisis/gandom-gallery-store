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

const DashboardPage = () => {
  const { get } = useFetchClient();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await get(`/${PLUGIN_ID}/overview`);
        if (!cancelled) setData(res.data?.data || res.data);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'خطا در دریافت داشبورد');
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
        <Flex justifyContent="space-between" alignItems="center" marginBottom={6} wrap="wrap" gap={3}>
          <Box>
            <Typography variant="alpha" as="h1">
              داشبورد فروشگاه
            </Typography>
            <Typography textColor="neutral600">خلاصه درآمد، سفارش‌ها و موجودی</Typography>
          </Box>
          <Button
            onClick={() => {
              window.location.href = `/admin/plugins/${PLUGIN_ID}/payments`;
            }}
          >
            پرداخت‌ها
          </Button>
          <Button
            onClick={() => {
              window.location.href = '/admin/content-manager/single-types/api::homepage.homepage';
            }}
          >
            ویرایش صفحه اصلی
          </Button>
        </Flex>

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
        {data && (
          <>
            <Flex gap={4} wrap="wrap" marginBottom={6}>
              {[
                { label: 'درآمد (پرداخت‌شده)', value: formatToman(data.incomeToman) },
                { label: 'درآمد امروز', value: formatToman(data.todayIncomeToman) },
                { label: 'سفارش‌های پرداخت‌شده', value: String(data.paidOrdersCount ?? 0) },
                { label: 'در انتظار پرداخت', value: String(data.pendingPaymentOrdersCount ?? 0) },
                { label: 'پرداخت ناموفق (۷ روز)', value: String(data.failedPaymentsCount7d ?? 0) },
                {
                  label: 'نرخ موفقیت (۷ روز)',
                  value:
                    data.paymentSuccessRate7d != null
                      ? `${data.paymentSuccessRate7d}%`
                      : '—',
                },
                { label: 'کل سفارش‌ها', value: String(data.ordersCount ?? 0) },
                { label: 'اقلام فروخته‌شده', value: String(data.soldUnits ?? 0) },
                { label: 'دیدگاه در انتظار', value: String(data.pendingCommentsCount ?? 0) },
              ].map((card) => (
                <Box
                  key={card.label}
                  padding={4}
                  background="neutral0"
                  shadow="filterShadow"
                  hasRadius
                  style={{ minWidth: 180, flex: 1 }}
                >
                  <Typography variant="pi" textColor="neutral600">
                    {card.label}
                  </Typography>
                  <Typography variant="alpha" as="p" marginTop={2}>
                    {card.value}
                  </Typography>
                </Box>
              ))}
            </Flex>

            <Box marginBottom={6} background="neutral0" shadow="filterShadow" hasRadius padding={4}>
              <Typography variant="delta" marginBottom={3} as="h2">
                موجودی کم (کمتر از {data.lowStockThreshold})
              </Typography>
              {!data.lowStockProducts?.length ? (
                <Typography textColor="neutral600">موردی نیست</Typography>
              ) : (
                <Table colCount={4} rowCount={data.lowStockProducts.length}>
                  <Thead>
                    <Tr>
                      <Th>
                        <Typography variant="sigma">محصول</Typography>
                      </Th>
                      <Th>
                        <Typography variant="sigma">اسلاگ</Typography>
                      </Th>
                      <Th>
                        <Typography variant="sigma">موجودی</Typography>
                      </Th>
                      <Th>
                        <Typography variant="sigma">وضعیت</Typography>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.lowStockProducts.map((p) => (
                      <Tr key={p.id}>
                        <Td>
                          <Typography>{p.name}</Typography>
                        </Td>
                        <Td>
                          <Typography textColor="neutral600">{p.slug}</Typography>
                        </Td>
                        <Td>
                          <Typography textColor="danger600">{p.stock_quantity}</Typography>
                        </Td>
                        <Td>
                          <Typography>{p.stock_status}</Typography>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>

            <Box background="neutral0" shadow="filterShadow" hasRadius padding={4}>
              <Typography variant="delta" marginBottom={3} as="h2">
                سفارش‌های اخیر
              </Typography>
              <Table colCount={5} rowCount={data.recentOrders?.length || 0}>
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
                    <Th>
                      <Typography variant="sigma">مشتری</Typography>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(data.recentOrders || []).map((o) => (
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
                        <Typography>{STATUS_FA[o.payment_status] || o.payment_status}</Typography>
                      </Td>
                      <Td>
                        <Typography>{o.user?.display_name || o.user?.phone_no || '—'}</Typography>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </>
        )}
      </Box>
    </Main>
  );
};

export default DashboardPage;
