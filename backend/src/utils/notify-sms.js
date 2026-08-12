'use strict';

const { sendSmsEvent } = require('./sms-settings.js');

/**
 * Send configurable SMS notification. Fire-and-forget; never throws to caller.
 */
async function notifySms(strapi, event, payload = {}) {
  try {
    const result = await sendSmsEvent(strapi, String(event), payload);
    if (result.skipped) {
      strapi.log.debug('[notify-sms] skipped', event, result.reason);
      return;
    }
    if (!result.ok) {
      strapi.log.warn('[notify-sms] send failed', event, result);
    } else {
      strapi.log.info('[notify-sms] sent', event, result.results?.length || 0);
    }
  } catch (e) {
    strapi.log.warn('[notify-sms] error', event, e);
  }
}

module.exports = { notifySms };
