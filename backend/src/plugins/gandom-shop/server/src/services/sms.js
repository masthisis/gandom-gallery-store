'use strict';

const path = require('path');

module.exports = ({ strapi }) => {
  const smsUtils = require(path.join(strapi.dirs.app.root, 'src/utils/sms-settings.js'));
  const { EVENT_LABELS_FA, CUSTOMER_EVENTS } = require(path.join(
    strapi.dirs.app.root,
    'src/utils/sms-event-templates.js'
  ));

  return {
    async getSettings() {
      const settings = await smsUtils.getSmsSettings(strapi);
      return {
        ...smsUtils.maskSmsSettings(settings),
        eventLabels: EVENT_LABELS_FA,
        customerEvents: [...CUSTOMER_EVENTS],
      };
    },

    async updateSettings(input) {
      const updated = await smsUtils.updateSmsSettings(strapi, input || {});
      return smsUtils.maskSmsSettings(updated);
    },

    async testConnection({ mobile } = {}) {
      return smsUtils.testSmsConnection(strapi, { mobile });
    },

    async testEvent({ event, mobile } = {}) {
      if (!event) return { ok: false, message: 'event الزامی است' };
      return smsUtils.testSmsEvent(strapi, event, { mobile });
    },

    async testAll({ mobile } = {}) {
      return smsUtils.testAllSmsEvents(strapi, { mobile });
    },

    async getGoLiveChecklist() {
      const settings = await smsUtils.getSmsSettings(strapi);
      const connection = await smsUtils.testSmsConnection(strapi);
      return smsUtils.getSmsGoLiveChecklist(settings, connection);
    },
  };
};
