import React, { useEffect, useState } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import {
  Main,
  Box,
  Flex,
  Typography,
  Button,
  Loader,
  TextInput,
  Checkbox,
  Field,
} from '@strapi/design-system';
import { PLUGIN_ID } from '../pluginId';

const MASK = '••••••••';

function FormField({ label, hint, children }) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      {children}
      {hint ? <Field.Hint>{hint}</Field.Hint> : null}
    </Field.Root>
  );
}

const PaymentSettingsPage = () => {
  const { get, put, post } = useFetchClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [form, setForm] = useState({
    enabled: false,
    mockMode: true,
    baseUrl: 'https://uat.mydigipay.info',
    callbackUrl: 'http://localhost:5173/payment/callback',
    clientId: '',
    clientSecret: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await get(`/${PLUGIN_ID}/payment-settings`);
        const data = res.data?.data || res.data;
        if (!cancelled && data) {
          setForm({
            enabled: data.enabled ?? false,
            mockMode: data.mockMode ?? true,
            baseUrl: data.baseUrl || 'https://uat.mydigipay.info',
            callbackUrl: data.callbackUrl || '',
            clientId: data.hasClientId ? MASK : '',
            clientSecret: data.hasClientSecret ? MASK : '',
            username: data.hasUsername ? MASK : '',
            password: data.hasPassword ? MASK : '',
          });
        }
        const cl = await get(`/${PLUGIN_ID}/payment-settings/go-live-checklist`);
        if (!cancelled) setChecklist(cl.data?.data || cl.data);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'خطا در بارگذاری');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [get]);

  async function save() {
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (payload.clientId === MASK) delete payload.clientId;
      if (payload.clientSecret === MASK) delete payload.clientSecret;
      if (payload.username === MASK) delete payload.username;
      if (payload.password === MASK) delete payload.password;
      await put(`/${PLUGIN_ID}/payment-settings`, payload);
      const cl = await get(`/${PLUGIN_ID}/payment-settings/go-live-checklist`);
      setChecklist(cl.data?.data || cl.data);
    } catch (e) {
      setError(e?.message || 'ذخیره ناموفق');
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await post(`/${PLUGIN_ID}/payment-settings/test-connection`, {});
      setTestResult(res.data);
    } catch (e) {
      setTestResult({ ok: false, message: e?.message || 'خطا' });
    } finally {
      setTesting(false);
    }
  }

  const modeLabel =
    form.mockMode || !form.enabled
      ? 'شبیه‌سازی'
      : form.baseUrl?.includes('uat')
        ? 'UAT / زنده'
        : 'زنده';

  return (
    <Main>
      <Box padding={8} background="neutral100">
        <Typography variant="alpha" as="h1" marginBottom={2}>
          تنظیمات درگاه پرداخت
        </Typography>
        <Typography textColor="neutral600" marginBottom={4}>
          پیکربندی دیجی‌پی — وضعیت: {modeLabel}
        </Typography>

        {form.mockMode && (
          <Box padding={4} background="warning100" hasRadius marginBottom={4}>
            <Typography textColor="warning700">
              حالت شبیه‌سازی فعال است — پرداخت واقعی انجام نمی‌شود.
            </Typography>
          </Box>
        )}

        {loading && (
          <Flex justifyContent="center" padding={8}>
            <Loader />
          </Flex>
        )}

        {error && (
          <Typography textColor="danger600" marginBottom={4}>{error}</Typography>
        )}

        {!loading && (
          <Flex direction="column" gap={6}>
            <Box background="neutral0" padding={5} shadow="filterShadow" hasRadius>
              <Typography variant="delta" marginBottom={4}>حالت کلی</Typography>
              <Flex direction="column" gap={4}>
                <Checkbox
                  checked={form.enabled}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: !!v }))}
                >
                  درگاه فعال
                </Checkbox>
                <Checkbox
                  checked={form.mockMode}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, mockMode: !!v }))}
                >
                  شبیه‌سازی (بدون تماس با دیجی‌پی)
                </Checkbox>
              </Flex>
            </Box>

            <Box background="neutral0" padding={5} shadow="filterShadow" hasRadius>
              <Typography variant="delta" marginBottom={4}>اتصال دیجی‌پی</Typography>
              <Flex direction="column" gap={4}>
                <FormField label="آدرس پایه درگاه" hint="مثلاً UAT یا آدرس تولید">
                  <TextInput
                    name="baseUrl"
                    value={form.baseUrl}
                    onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
                  />
                </FormField>
                <FormField
                  label="آدرس بازگشت (callback)"
                  hint="باید با FRONTEND_URL فروشگاه یکسان باشد"
                >
                  <TextInput
                    name="callbackUrl"
                    value={form.callbackUrl}
                    onChange={(e) => setForm((f) => ({ ...f, callbackUrl: e.target.value }))}
                  />
                </FormField>
                <FormField label="شناسه کلاینت (Client ID)">
                  <TextInput
                    name="clientId"
                    value={form.clientId}
                    onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                  />
                </FormField>
                <FormField label="رمز کلاینت (Client Secret)">
                  <TextInput
                    name="clientSecret"
                    value={form.clientSecret}
                    onChange={(e) => setForm((f) => ({ ...f, clientSecret: e.target.value }))}
                  />
                </FormField>
                <FormField label="نام کاربری OAuth">
                  <TextInput
                    name="username"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  />
                </FormField>
                <FormField label="رمز عبور OAuth">
                  <TextInput
                    name="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  />
                </FormField>
              </Flex>
            </Box>

            <Box background="neutral0" padding={5} shadow="filterShadow" hasRadius>
              <Flex gap={3} wrap="wrap">
                <Button onClick={save} disabled={saving} data-testid="payment-settings-save">
                  {saving ? 'در حال ذخیره...' : 'ذخیره'}
                </Button>
                <Button variant="secondary" onClick={testConnection} disabled={testing}>
                  {testing ? 'در حال تست...' : 'تست اتصال'}
                </Button>
              </Flex>

              {testResult && (
                <Typography
                  textColor={testResult.ok ? 'success600' : 'danger600'}
                  marginTop={4}
                  data-testid="payment-test-result"
                >
                  {testResult.message || (testResult.ok ? 'موفق' : 'ناموفق')}
                </Typography>
              )}

              {checklist && (
                <Box padding={4} background="neutral100" hasRadius marginTop={4}>
                  <Typography variant="delta" marginBottom={2}>چک‌لیست آماده‌سازی</Typography>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    <li>{checklist.mockOff ? '✓' : '✗'} شبیه‌سازی خاموش</li>
                    <li>{checklist.enabledOn ? '✓' : '✗'} درگاه فعال</li>
                    <li>{checklist.callbackMatchesStorefront ? '✓' : '✗'} callback با فروشگاه</li>
                    <li>{checklist.hasCredentials ? '✓' : '✗'} اطلاعات ورود کامل</li>
                    <li>{checklist.connectionOk ? '✓' : '✗'} اتصال OAuth</li>
                  </ul>
                </Box>
              )}
            </Box>
          </Flex>
        )}
      </Box>
    </Main>
  );
};

export default PaymentSettingsPage;
