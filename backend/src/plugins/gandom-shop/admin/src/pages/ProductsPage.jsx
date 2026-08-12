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

const CM_PRODUCT = '/content-manager/collection-types/plugin::webbycommerce.product';
const CM_CATEGORY = '/content-manager/collection-types/api::nav-category.nav-category';

const STOCK_FA = {
  in_stock: 'موجود',
  out_of_stock: 'ناموجود',
  on_backorder: 'پیش‌سفارش',
};

function formatToman(n) {
  return new Intl.NumberFormat('fa-IR').format(Math.round(Number(n) || 0));
}

function truncate(text, maxLen = 48) {
  const s = String(text ?? '');
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen - 1)}…`;
}

const cellEllipsis = {
  maxWidth: '14rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
};

function formatCategoryLabel(row) {
  const summary = row.categorySummary;
  if (summary?.primary) {
    return summary.extraCount > 0
      ? `${summary.primary} (+${summary.extraCount})`
      : summary.primary;
  }
  const names = (row.categories || []).map((c) => c.name).filter(Boolean);
  if (!names.length) return '—';
  if (names.length === 1) return names[0];
  return `${names[0]} (+${names.length - 1})`;
}

function fullCategoryLabel(row) {
  const names = (row.categories || []).map((c) => c.name).filter(Boolean);
  return names.length ? names.join('، ') : '—';
}

function FormField({ label, children }) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      {children}
    </Field.Root>
  );
}

const ProductsPage = () => {
  const { get } = useFetchClient();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0, pageCount: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [published, setPublished] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const loadCategories = useCallback(async () => {
    try {
      const res = await get(`/${PLUGIN_ID}/products/category-options`);
      setCategories(res.data?.data || []);
    } catch {
      setCategories([]);
    }
  }, [get]);

  const loadProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: '25' });
        if (q) params.set('q', q);
        if (category) params.set('category', category);
        if (stockStatus) params.set('stockStatus', stockStatus);
        if (published) params.set('published', published);
        if (priceMin) params.set('priceMin', priceMin);
        if (priceMax) params.set('priceMax', priceMax);
        const res = await get(`/${PLUGIN_ID}/products?${params}`);
        const data = res.data?.data || {};
        setItems(data.items || []);
        setPagination(data.pagination || { page: 1, pageSize: 25, total: 0, pageCount: 0 });
      } catch (e) {
        setError(e?.message || 'خطا در بارگذاری محصولات');
      } finally {
        setLoading(false);
      }
    },
    [get, q, category, stockStatus, published, priceMin, priceMax]
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  return (
    <Main>
      <Box padding={8} background="neutral100">
        <Flex justifyContent="space-between" alignItems="flex-start" marginBottom={4} wrap="wrap" gap={3}>
          <Box>
            <Typography variant="alpha" as="h1" marginBottom={2}>
              محصولات
            </Typography>
            <Typography textColor="neutral600">
              فهرست و فیلتر — ایجاد و ویرایش در{' '}
              <Link to={CM_PRODUCT}>مدیریت محتوا</Link>
              {' · '}
              <Link to={`/plugins/${PLUGIN_ID}/categories`}>دسته‌بندی‌ها</Link>
            </Typography>
          </Box>
          <Button tag={Link} to={`${CM_PRODUCT}/create`}>
            محصول جدید
          </Button>
        </Flex>

        <Box background="neutral0" padding={4} shadow="filterShadow" hasRadius marginBottom={4}>
          <Flex gap={3} wrap="wrap" alignItems="flex-end">
            <Box minWidth="12rem" flex="1">
              <FormField label="جستجو (نام / اسلاگ / SKU)">
                <TextInput
                  name="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="جستجو..."
                />
              </FormField>
            </Box>
            <Box minWidth="10rem">
              <FormField label="دسته">
                <SingleSelect value={category} onChange={setCategory} placeholder="همه">
                  <SingleSelectOption value="">همه</SingleSelectOption>
                  {categories.map((c) => (
                    <SingleSelectOption key={c.id} value={c.commerceSlug || c.slug}>
                      {c.name}
                    </SingleSelectOption>
                  ))}
                </SingleSelect>
              </FormField>
            </Box>
            <Box minWidth="10rem">
              <FormField label="موجودی">
                <SingleSelect value={stockStatus} onChange={setStockStatus} placeholder="همه">
                  <SingleSelectOption value="">همه</SingleSelectOption>
                  {Object.entries(STOCK_FA).map(([k, v]) => (
                    <SingleSelectOption key={k} value={k}>
                      {v}
                    </SingleSelectOption>
                  ))}
                </SingleSelect>
              </FormField>
            </Box>
            <Box minWidth="8rem">
              <FormField label="انتشار">
                <SingleSelect value={published} onChange={setPublished} placeholder="همه">
                  <SingleSelectOption value="">همه</SingleSelectOption>
                  <SingleSelectOption value="true">منتشرشده</SingleSelectOption>
                  <SingleSelectOption value="false">پیش‌نویس</SingleSelectOption>
                </SingleSelect>
              </FormField>
            </Box>
            <Box minWidth="7rem">
              <FormField label="حداقل قیمت">
                <TextInput name="priceMin" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
              </FormField>
            </Box>
            <Box minWidth="7rem">
              <FormField label="حداکثر قیمت">
                <TextInput name="priceMax" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
              </FormField>
            </Box>
            <Button variant="secondary" onClick={() => loadProducts(1)}>
              اعمال فیلتر
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
          <Typography textColor="neutral600">محصولی یافت نشد</Typography>
        ) : (
          <>
            <Box background="neutral0" shadow="filterShadow" hasRadius style={{ overflowX: 'auto' }}>
              <Table colCount={6} rowCount={items.length} style={{ tableLayout: 'fixed', width: '100%' }}>
                <Thead>
                  <Tr>
                    <Th><Typography variant="sigma">نام</Typography></Th>
                    <Th><Typography variant="sigma">قیمت</Typography></Th>
                    <Th><Typography variant="sigma">موجودی</Typography></Th>
                    <Th><Typography variant="sigma">دسته</Typography></Th>
                    <Th><Typography variant="sigma">انتشار</Typography></Th>
                    <Th><Typography variant="sigma">عملیات</Typography></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {items.map((row) => {
                    const categoryLabel = formatCategoryLabel(row);
                    return (
                    <Tr key={row.id}>
                      <Td>
                        <Typography fontWeight="bold" style={cellEllipsis} title={row.name}>
                          {truncate(row.name, 56)}
                        </Typography>
                        <Typography variant="pi" textColor="neutral600" style={cellEllipsis} title={row.slug}>
                          {truncate(row.slug, 40)}
                        </Typography>
                      </Td>
                      <Td><Typography style={{ whiteSpace: 'nowrap' }}>{formatToman(row.price)} تومان</Typography></Td>
                      <Td>
                        <Typography style={{ whiteSpace: 'nowrap' }}>
                          {row.stock_quantity} — {STOCK_FA[row.stock_status] || row.stock_status}
                        </Typography>
                      </Td>
                      <Td>
                        <Typography variant="pi" style={cellEllipsis} title={fullCategoryLabel(row)}>
                          {categoryLabel}
                        </Typography>
                      </Td>
                      <Td>
                        <Typography textColor={row.published ? 'success600' : 'neutral600'}>
                          {row.published ? 'منتشرشده' : 'پیش‌نویس'}
                        </Typography>
                      </Td>
                      <Td>
                        <Button
                          size="S"
                          variant="tertiary"
                          tag={Link}
                          to={`${CM_PRODUCT}/${row.documentId}`}
                        >
                          ویرایش در مدیریت محتوا
                        </Button>
                      </Td>
                    </Tr>
                  );
                  })}
                </Tbody>
              </Table>
            </Box>
            <Flex justifyContent="space-between" alignItems="center" marginTop={4}>
              <Typography variant="pi" textColor="neutral600">
                {pagination.total} محصول — صفحه {pagination.page} از {pagination.pageCount || 1}
              </Typography>
              <Flex gap={2}>
                <Button
                  variant="secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => loadProducts(pagination.page - 1)}
                >
                  قبلی
                </Button>
                <Button
                  variant="secondary"
                  disabled={pagination.page >= pagination.pageCount}
                  onClick={() => loadProducts(pagination.page + 1)}
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

export default ProductsPage;
