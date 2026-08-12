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
  Textarea,
  Field,
} from '@strapi/design-system';
import { ChevronDown, ChevronUp } from '@strapi/icons';
import { PLUGIN_ID } from '../pluginId';

const MASK = '••••••••';
const DEFAULT_TEST_MOBILE = '09366531567';
const DEFAULT_LINE = '30002108020007';

const EVENT_ORDER = [
  'auth_otp',
  'low_stock',
  'order_paid',
  'payment_failed',
  'pending_comment',
];

const CUSTOMER_EVENTS = new Set(['auth_otp', 'order_paid', 'payment_failed']);

function FormField({ label, hint, children }) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      {children}
      {hint ? <Field.Hint>{hint}</Field.Hint> : null}
    </Field.Root>
  );
}

function emptyEventTemplates() {
  return {
    auth_otp: {
      enabled: true,
      notifyAdmin: false,
      notifyCustomer: true,
      adminMessage: '',
      customerMessage: 'کد ورود گندم گالری: {code}',
      useVerifyApi: false,
    },
    low_stock: {
      enabled: true,
      notifyAdmin: true,
      notifyCustomer: false,
      adminMessage: 'هشدار موجودی کم: {name} — {qty} عدد (آستانه {threshold})',
      customerMessage: '',
      useVerifyApi: false,
    },
    order_paid: {
      enabled: true,
      notifyAdmin: true,
      notifyCustomer: true,
      adminMessage: 'سفارش پرداخت شد: {orderNumber} — {amountToman} تومان',
      customerMessage: 'پرداخت شما با موفقیت انجام شد. سفارش {orderNumber}',
      useVerifyApi: false,
    },
    payment_failed: {
      enabled: true,
      notifyAdmin: true,
      notifyCustomer: true,
      adminMessage: 'پرداخت ناموفق: {orderNumber}',
      customerMessage: 'پرداخت سفارش {orderNumber} ناموفق بود. لطفاً دوباره تلاش کنید.',
      useVerifyApi: false,
    },
    pending_comment: {
      enabled: true,
      notifyAdmin: true,
      notifyCustomer: false,
      adminMessage: 'دیدگاه جدید برای {productSlug} در انتظار تأیید',
      customerMessage: '',
      useVerifyApi: false,
    },
  };
}

function EventAccordion({ eventKey, label, open, onToggle, children }) {
  return (
    <Box background="neutral100" hasRadius>
      <Button
        variant="tertiary"
        onClick={onToggle}
        fullWidth
        endIcon={open ? <ChevronUp /> : <ChevronDown />}
        style={{ justifyContent: 'space-between' }}
      >
        {label}
      </Button>
      {open && <Box padding={4}>{children}</Box>}
    </Box>
  );
}

const SmsSettingsPage = () => {
  const { get, put, post } = useFetchClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testingAll, setTestingAll] = useState(false);
  const [testingEvent, setTestingEvent] = useState('');
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [eventLabels, setEventLabels] = useState({});
  const [openEvents, setOpenEvents] = useState({ auth_otp: true });
  const [testMobile, setTestMobile] = useState(DEFAULT_TEST_MOBILE);
  const [form, setForm] = useState({
    enabled: false,
    devMode: true,
    templateId: '',
    lineNumber: DEFAULT_LINE,
    adminMobile: DEFAULT_TEST_MOBILE,
    apiKey: '',
    devOtpCode: '11111',
    eventTemplates: emptyEventTemplates(),
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await get(`/${PLUGIN_ID}/sms-settings`);
        const data = res.data?.data || res.data;
        if (!cancelled && data) {
          setEventLabels(data.eventLabels || {});
          setForm({
            enabled: data.enabled ?? false,
            devMode: data.devMode ?? true,
            templateId: data.templateId != null ? String(data.templateId) : '',
            lineNumber: data.lineNumber || DEFAULT_LINE,
            adminMobile: data.adminMobile || DEFAULT_TEST_MOBILE,
            apiKey: data.hasApiKey ? MASK : '',
            devOtpCode: data.devOtpCode || '11111',
            eventTemplates: { ...emptyEventTemplates(), ...(data.eventTemplates || {}) },
          });
        }
        const cl = await get(`/${PLUGIN_ID}/sms-settings/go-live-checklist`);
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

  function updateEvent(eventKey, patch) {
    setForm((f) => ({
      ...f,
      eventTemplates: {
        ...f.eventTemplates,
        [eventKey]: { ...f.eventTemplates[eventKey], ...patch },
      },
    }));
  }

  function toggleEvent(eventKey) {
    setOpenEvents((prev) => ({ ...prev, [eventKey]: !prev[eventKey] }));
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (payload.apiKey === MASK) delete payload.apiKey;
      await put(`/${PLUGIN_ID}/sms-settings`, payload);
      const cl = await get(`/${PLUGIN_ID}/sms-settings/go-live-checklist`);
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
      const res = await post(`/${PLUGIN_ID}/sms-settings/test-connection`, { mobile: testMobile });
      setTestResult(res.data);
    } catch (e) {
      setTestResult({ ok: false, message: e?.message || 'خطا' });
    } finally {
      setTesting(false);
    }
  }

  async function testEvent(eventKey) {
    setTestingEvent(eventKey);
    setTestResult(null);
    try {
      const res = await post(`/${PLUGIN_ID}/sms-settings/test-event`, {
        event: eventKey,
        mobile: testMobile,
      });
      setTestResult(res.data);
    } catch (e) {
      setTestResult({ ok: false, message: e?.message || 'خطا' });
    } finally {
      setTestingEvent('');
    }
  }

  async function testAll() {
    setTestingAll(true);
    setTestResult(null);
    try {
      const res = await post(`/${PLUGIN_ID}/sms-settings/test-all`, { mobile: testMobile });
      setTestResult(res.data);
    } catch (e) {
      setTestResult({ ok: false, message: e?.message || 'خطا' });
    } finally {
      setTestingAll(false);
    }
  }

  const modeLabel = form.devMode ? 'OTP توسعه' : form.enabled ? 'زنده' : 'غیرفعال';

  return (
    <Main>
      <Box padding={8} background="neutral100">
        <Typography variant="alpha" as="h1" marginBottom={2}>
          تنظیمات پیامک
        </Typography>
        <Typography textColor="neutral600" marginBottom={4}>
          اعلان‌ها و OTP فقط از طریق SMS.ir — وضعیت: {modeLabel}
        </Typography>

        {form.devMode && (
          <Box padding={4} background="warning100" hasRadius marginBottom={4}>
            <Typography textColor="warning700">
              حالت توسعه OTP فعال است — کد ثابت {form.devOtpCode} بدون ارسال SMS واقعی برای ورود.
            </Typography>
          </Box>
        )}

        {loading && (
          <Flex justifyContent="center" padding={8}>
            <Loader />
          </Flex>
        )}

        {error && <Typography textColor="danger600" marginBottom={4}>{error}</Typography>}

        {!loading && (
          <Flex direction="column" gap={6}>
            <Box background="neutral0" padding={5} shadow="filterShadow" hasRadius>
              <Typography variant="delta" marginBottom={4}>اتصال SMS.ir</Typography>
              <Flex direction="column" gap={4}>
                <Checkbox
                  checked={form.enabled}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: !!v }))}
                >
                  ارسال پیامک فعال
                </Checkbox>
                <Checkbox
                  checked={form.devMode}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, devMode: !!v }))}
                >
                  حالت توسعه OTP (کد ثابت، بدون SMS واقعی برای ورود)
                </Checkbox>
                <FormField label="شماره خط ارسال" hint="خط اختصاصی SMS.ir">
                  <TextInput
                    name="lineNumber"
                    value={form.lineNumber}
                    onChange={(e) => setForm((f) => ({ ...f, lineNumber: e.target.value }))}
                  />
                </FormField>
                <FormField label="موبایل مدیر فروشگاه">
                  <TextInput
                    name="adminMobile"
                    value={form.adminMobile}
                    onChange={(e) => setForm((f) => ({ ...f, adminMobile: e.target.value }))}
                  />
                </FormField>
                <FormField label="شناسه قالب Verify (اختیاری)" hint="فقط در صورت استفاده از API تأیید">
                  <TextInput
                    name="templateId"
                    value={form.templateId}
                    onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
                  />
                </FormField>
                <FormField label="کلید API">
                  <TextInput
                    name="apiKey"
                    value={form.apiKey}
                    onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                  />
                </FormField>
                <FormField label="کد OTP توسعه">
                  <TextInput
                    name="devOtpCode"
                    value={form.devOtpCode}
                    onChange={(e) => setForm((f) => ({ ...f, devOtpCode: e.target.value }))}
                  />
                </FormField>
                <FormField label="شماره موبایل تست">
                  <TextInput
                    name="testMobile"
                    value={testMobile}
                    onChange={(e) => setTestMobile(e.target.value)}
                  />
                </FormField>
                <Flex gap={3} wrap="wrap">
                  <Button onClick={save} disabled={saving} data-testid="sms-settings-save">
                    {saving ? 'در حال ذخیره...' : 'ذخیره'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={testConnection}
                    disabled={testing}
                    data-testid="sms-test-connection"
                  >
                    {testing ? 'در حال تست...' : 'تست اتصال'}
                  </Button>
                  <Button variant="tertiary" onClick={testAll} disabled={testingAll}>
                    {testingAll ? 'در حال ارسال همه...' : 'ارسال آزمایشی همه رویدادها'}
                  </Button>
                </Flex>
              </Flex>
            </Box>

            <Box background="neutral0" padding={5} shadow="filterShadow" hasRadius>
              <Typography variant="delta" marginBottom={2}>قالب پیامک رویدادها</Typography>
              <Typography variant="pi" textColor="neutral600" marginBottom={4}>
                متغیرها: {'{code}'} {'{name}'} {'{qty}'} {'{threshold}'} {'{orderNumber}'}{' '}
                {'{amountToman}'} {'{ticket}'} {'{productSlug}'} {'{body}'}
              </Typography>
              <Flex direction="column" gap={3}>
                {EVENT_ORDER.map((eventKey) => {
                  const ev = form.eventTemplates[eventKey] || {};
                  const label = eventLabels[eventKey] || eventKey;
                  const showCustomer = CUSTOMER_EVENTS.has(eventKey);
                  return (
                    <EventAccordion
                      key={eventKey}
                      eventKey={eventKey}
                      label={label}
                      open={!!openEvents[eventKey]}
                      onToggle={() => toggleEvent(eventKey)}
                    >
                      <Flex direction="column" gap={3}>
                        <Checkbox
                          checked={!!ev.enabled}
                          onCheckedChange={(v) => updateEvent(eventKey, { enabled: !!v })}
                        >
                          رویداد فعال
                        </Checkbox>
                        <Checkbox
                          checked={!!ev.notifyAdmin}
                          onCheckedChange={(v) => updateEvent(eventKey, { notifyAdmin: !!v })}
                        >
                          ارسال به مدیر
                        </Checkbox>
                        {showCustomer && (
                          <Checkbox
                            checked={!!ev.notifyCustomer}
                            onCheckedChange={(v) => updateEvent(eventKey, { notifyCustomer: !!v })}
                          >
                            ارسال به مشتری
                          </Checkbox>
                        )}
                        <FormField label="پیام مدیر">
                          <Textarea
                            name={`admin-${eventKey}`}
                            value={ev.adminMessage || ''}
                            onChange={(e) => updateEvent(eventKey, { adminMessage: e.target.value })}
                          />
                        </FormField>
                        {showCustomer && (
                          <FormField label="پیام مشتری">
                            <Textarea
                              name={`customer-${eventKey}`}
                              value={ev.customerMessage || ''}
                              onChange={(e) =>
                                updateEvent(eventKey, { customerMessage: e.target.value })
                              }
                            />
                          </FormField>
                        )}
                        <Button
                          variant="secondary"
                          size="S"
                          onClick={() => testEvent(eventKey)}
                          disabled={testingEvent === eventKey}
                          data-testid={`sms-test-${eventKey}`}
                        >
                          {testingEvent === eventKey ? 'در حال ارسال...' : 'ارسال آزمایشی'}
                        </Button>
                      </Flex>
                    </EventAccordion>
                  );
                })}
              </Flex>
            </Box>

            {testResult && (
              <Box background="neutral0" padding={4} hasRadius>
                <Typography
                  textColor={testResult.ok ? 'success600' : 'danger600'}
                  data-testid="sms-test-result"
                >
                  {testResult.message || (testResult.ok ? 'موفق' : 'ناموفق')}
                </Typography>
                {testResult.results && (
                  <Typography variant="pi" textColor="neutral600" marginTop={2}>
                    {JSON.stringify(testResult.results)}
                  </Typography>
                )}
              </Box>
            )}

            {checklist && (
              <Box padding={4} background="neutral0" hasRadius>
                <Typography variant="delta" marginBottom={2}>چک‌لیست آماده‌سازی</Typography>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>{checklist.hasApiKey ? '✓' : '✗'} کلید API</li>
                  <li>{checklist.hasLineNumber ? '✓' : '✗'} شماره خط</li>
                  <li>{checklist.hasAdminMobile ? '✓' : '✗'} موبایل مدیر</li>
                  <li>{checklist.enabledOn ? '✓' : '✗'} ارسال فعال</li>
                  <li>{checklist.connectionOk ? '✓' : '✗'} اتصال SMS.ir</li>
                </ul>
              </Box>
            )}
          </Flex>
        )}
      </Box>
    </Main>
  );
};

export default SmsSettingsPage;
