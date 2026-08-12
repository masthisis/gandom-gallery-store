import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import {
  Main,
  Box,
  Flex,
  Typography,
  Button,
  Loader,
  TextInput,
  SingleSelect,
  SingleSelectOption,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Field,
} from '@strapi/design-system';
import { PLUGIN_ID } from '../pluginId';

const CM_CATEGORY = '/content-manager/collection-types/api::nav-category.nav-category';

function FormField({ label, children }) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      {children}
    </Field.Root>
  );
}

const CategoriesPage = () => {
  const { get } = useFetchClient();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, total: 0, pageCount: 0 });
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [parentFilter, setParentFilter] = useState('root');

  const loadParents = useCallback(async () => {
    try {
      const res = await get(`/${PLUGIN_ID}/categories/parent-options`);
      setParents(res.data?.data || []);
    } catch {
      setParents([]);
    }
  }, [get]);

  const loadCategories = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: '50' });
        if (q) params.set('q', q);
        if (parentFilter) params.set('parentId', parentFilter);
        const res = await get(`/${PLUGIN_ID}/categories?${params}`);
        const data = res.data?.data || {};
        setItems(data.items || []);
        setPagination(data.pagination || { page: 1, pageSize: 50, total: 0, pageCount: 0 });
      } catch (e) {
        setError(e?.message || 'خطا در بارگذاری دسته‌بندی‌ها');
      } finally {
        setLoading(false);
      }
    },
    [get, q, parentFilter]
  );

  useEffect(() => {
    loadParents();
  }, [loadParents]);

  useEffect(() => {
    loadCategories(1);
  }, [loadCategories]);

  return (
    <Main>
      <Box padding={8} background="neutral100">
        <Flex justifyContent="space-between" alignItems="flex-start" marginBottom={4} wrap="wrap" gap={3}>
          <Box>
            <Typography variant="alpha" as="h1" marginBottom={2}>
              دسته‌بندی‌ها
            </Typography>
            <Typography textColor="neutral600">
              فهرست و جستجو — ایجاد و ویرایش در{' '}
              <Link to={CM_CATEGORY}>مدیریت محتوا</Link>
            </Typography>
          </Box>
          <Button tag={Link} to={`${CM_CATEGORY}/create`}>
            دسته جدید
          </Button>
        </Flex>

        <Box background="neutral0" padding={4} shadow="filterShadow" hasRadius marginBottom={4}>
          <Flex gap={3} wrap="wrap" alignItems="flex-end">
            <Box minWidth="12rem" flex="1">
              <FormField label="جستجو">
                <TextInput
                  name="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="نام یا اسلاگ..."
                />
              </FormField>
            </Box>
            <Box minWidth="12rem">
              <FormField label="محدوده والد">
                <SingleSelect value={parentFilter} onChange={setParentFilter}>
                  <SingleSelectOption value="root">فقط ریشه</SingleSelectOption>
                  <SingleSelectOption value="">همه</SingleSelectOption>
                  {parents.map((p) => (
                    <SingleSelectOption key={p.id} value={String(p.id)}>
                      زیرمجموعه «{p.name}»
                    </SingleSelectOption>
                  ))}
                </SingleSelect>
              </FormField>
            </Box>
            <Button variant="secondary" onClick={() => loadCategories(1)}>
              اعمال
            </Button>
          </Flex>
        </Box>

        {error && (
          <Typography textColor="danger600" marginBottom={4}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Flex justifyContent="center" padding={8}>
            <Loader />
          </Flex>
        ) : !items.length ? (
          <Typography textColor="neutral600">دسته‌ای یافت نشد</Typography>
        ) : (
          <>
            <Box background="neutral0" shadow="filterShadow" hasRadius>
              <Table colCount={6} rowCount={items.length}>
                <Thead>
                  <Tr>
                    <Th><Typography variant="sigma">نام</Typography></Th>
                    <Th><Typography variant="sigma">اسلاگ</Typography></Th>
                    <Th><Typography variant="sigma">commerceSlug</Typography></Th>
                    <Th><Typography variant="sigma">والد</Typography></Th>
                    <Th><Typography variant="sigma">ترتیب / منو</Typography></Th>
                    <Th><Typography variant="sigma">عملیات</Typography></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {items.map((row) => (
                    <Tr key={row.id}>
                      <Td><Typography fontWeight="bold">{row.name}</Typography></Td>
                      <Td><Typography variant="pi">{row.slug}</Typography></Td>
                      <Td><Typography variant="pi">{row.commerceSlug || '—'}</Typography></Td>
                      <Td><Typography variant="pi">{row.parentName || '—'}</Typography></Td>
                      <Td>
                        <Typography variant="pi">
                          {row.menu_order} · {row.show_in_menu ? 'در منو' : 'مخفی'}
                        </Typography>
                      </Td>
                      <Td>
                        <Button
                          size="S"
                          variant="tertiary"
                          tag={Link}
                          to={`${CM_CATEGORY}/${row.documentId}`}
                        >
                          ویرایش در مدیریت محتوا
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            <Flex justifyContent="space-between" alignItems="center" marginTop={4}>
              <Typography variant="pi" textColor="neutral600">
                {pagination.total} دسته — صفحه {pagination.page} از {pagination.pageCount || 1}
              </Typography>
              <Flex gap={2}>
                <Button
                  variant="secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => loadCategories(pagination.page - 1)}
                >
                  قبلی
                </Button>
                <Button
                  variant="secondary"
                  disabled={pagination.page >= pagination.pageCount}
                  onClick={() => loadCategories(pagination.page + 1)}
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

export default CategoriesPage;
