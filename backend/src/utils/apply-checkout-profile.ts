/**
 * Apply checkout/profile snapshot onto user + WC address after successful payment
 */

import { validateAddressParts, toWcAddress, type AddressInput } from './iran-validation';

export async function applyCheckoutProfile(
  strapi: any,
  userId: number,
  snapshot: AddressInput & { displayName?: string }
) {
  const validated = validateAddressParts(snapshot);
  if (!validated.ok) {
    return { ok: false as const, errors: validated.errors };
  }
  const data = validated.data;

  const display_name =
    String(snapshot.displayName || '').trim() || `${data.firstName} ${data.lastName}`.trim();

  await strapi.db.query('plugin::users-permissions.user').update({
    where: { id: userId },
    data: {
      first_name: data.firstName,
      last_name: data.lastName,
      display_name,
      phone_no: data.phone,
    },
  });

  const wcPayload = {
    ...toWcAddress(data, 1),
    user: userId,
  };

  try {
    const existing = await strapi.db.query('plugin::webbycommerce.address').findMany({
      where: { user: userId },
      limit: 20,
    });
    const match = (existing || []).find(
      (a: any) =>
        a.postcode === data.postcode &&
        a.city === data.city &&
        String(a.street_address || '').includes(data.address.slice(0, 20))
    );
    if (match) {
      await strapi.db.query('plugin::webbycommerce.address').update({
        where: { id: match.id },
        data: wcPayload,
      });
    } else {
      await strapi.db.query('plugin::webbycommerce.address').create({ data: wcPayload });
    }
  } catch (e) {
    strapi.log.warn('[profile] WC address save failed', e);
  }

  return { ok: true as const, data };
}
