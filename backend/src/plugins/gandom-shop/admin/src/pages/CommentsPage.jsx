import React, { useCallback, useEffect, useState } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import {
  Main,
  Box,
  Flex,
  Typography,
  Button,
  Loader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@strapi/design-system';
import { PLUGIN_ID } from '../pluginId';

const CommentsPage = () => {
  const { get, post } = useFetchClient();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get(`/${PLUGIN_ID}/pending-comments`);
      setRows(res.data?.data || res.data || []);
    } catch (e) {
      setError(e?.message || 'خطا در دریافت دیدگاه‌ها');
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(id) {
    setBusyId(id);
    try {
      await post(`/${PLUGIN_ID}/pending-comments/${id}/approve`);
      await load();
    } catch (e) {
      setError(e?.message || 'تأیید ناموفق بود');
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id) {
    if (!window.confirm('این دیدگاه حذف شود؟')) return;
    setBusyId(id);
    try {
      await post(`/${PLUGIN_ID}/pending-comments/${id}/reject`);
      await load();
    } catch (e) {
      setError(e?.message || 'حذف ناموفق بود');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Main>
      <Box padding={8} background="neutral100">
        <Typography variant="alpha" as="h1" marginBottom={2}>
          دیدگاه‌های در انتظار تأیید
        </Typography>
        <Typography textColor="neutral600" marginBottom={6} as="p">
          پس از تأیید، دیدگاه در صفحه محصول نمایش داده می‌شود
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
          <Typography textColor="neutral600">دیدگاه در انتظاری نیست</Typography>
        )}
        {!!rows.length && (
          <Box background="neutral0" shadow="filterShadow" hasRadius padding={4}>
            <Table colCount={6} rowCount={rows.length}>
              <Thead>
                <Tr>
                  <Th>
                    <Typography variant="sigma">محصول</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">کاربر</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">متن</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">امتیاز</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">زمان</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">عملیات</Typography>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((r) => (
                  <Tr key={r.id}>
                    <Td>
                      <Typography>{r.productSlug}</Typography>
                      {r.parentId ? (
                        <Typography variant="pi" textColor="neutral500">
                          (پاسخ)
                        </Typography>
                      ) : null}
                    </Td>
                    <Td>
                      <Typography>
                        {r.user?.display_name || '—'}
                        {r.user?.phone_no ? (
                          <Typography variant="pi" textColor="neutral600" as="span">
                            {' '}
                            · {r.user.phone_no}
                          </Typography>
                        ) : null}
                      </Typography>
                    </Td>
                    <Td>
                      <Typography style={{ maxWidth: 280 }}>{r.body}</Typography>
                    </Td>
                    <Td>
                      <Typography>{r.rating ?? '—'}</Typography>
                    </Td>
                    <Td>
                      <Typography>
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleString('fa-IR')
                          : '—'}
                      </Typography>
                    </Td>
                    <Td>
                      <Flex gap={2}>
                        <Button
                          size="S"
                          disabled={busyId === r.id}
                          onClick={() => approve(r.id)}
                        >
                          تأیید
                        </Button>
                        <Button
                          size="S"
                          variant="danger-light"
                          disabled={busyId === r.id}
                          onClick={() => reject(r.id)}
                        >
                          رد
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </Main>
  );
};

export default CommentsPage;
