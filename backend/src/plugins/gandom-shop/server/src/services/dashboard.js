'use strict';

async function getLowStockThreshold(strapi) {
  try {
    const store = await strapi.documents('api::store-setting.store-setting').findFirst({});
    const n = Number(store?.lowStockThreshold);
    return Number.isFinite(n) && n >= 0 ? n : 5;
  } catch {
    return 5;
  }
}

module.exports = ({ strapi }) => ({
  async overview() {
    const threshold = await getLowStockThreshold(strapi);

    const orders = await strapi.db.query('plugin::webbycommerce.order').findMany({
      populate: ['items', 'user'],
      orderBy: { id: 'desc' },
      limit: 500,
    });

    const list = orders || [];
    const paid = list.filter(
      (o) =>
        o.payment_status === 'paid' &&
        o.status !== 'cancelled' &&
        o.status !== 'refunded'
    );

    const incomeToman = paid.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const soldUnits = paid.reduce((s, o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      return s + items.length;
    }, 0);

    const products = await strapi.db.query('plugin::webbycommerce.product').findMany({
      limit: 500,
      orderBy: { stock_quantity: 'asc' },
    });

    const lowStockProducts = (products || [])
      .filter((p) => (Number(p.stock_quantity) || 0) < threshold)
      .slice(0, 50)
      .map((p) => ({
        id: p.id,
        documentId: p.documentId,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        stock_quantity: p.stock_quantity,
        stock_status: p.stock_status,
      }));

    let pendingCommentsCount = 0;
    try {
      pendingCommentsCount = await strapi.db.query('api::store-comment.store-comment').count({
        where: { is_visible: false },
      });
    } catch {
      pendingCommentsCount = 0;
    }

    const recentOrders = list.slice(0, 10).map((o) => ({
      id: o.id,
      documentId: o.documentId,
      order_number: o.order_number,
      total: o.total,
      status: o.status,
      payment_status: o.payment_status,
      createdAt: o.createdAt,
      user: o.user
        ? {
            id: o.user.id,
            display_name: o.user.display_name || o.user.username,
            phone_no: o.user.phone_no,
          }
        : null,
      itemCount: Array.isArray(o.items) ? o.items.length : 0,
    }));

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayPaid = paid.filter((o) => new Date(o.createdAt).getTime() >= startOfToday.getTime());
    const todayIncomeToman = todayPaid.reduce((s, o) => s + (Number(o.total) || 0), 0);

    const pendingPaymentOrdersCount = list.filter((o) => o.payment_status === 'pending').length;

    let failedPaymentsCount7d = 0;
    let paymentSuccessRate7d = null;
    try {
      const txs = await strapi.db.query('plugin::webbycommerce.payment-transaction').findMany({
        orderBy: { id: 'desc' },
        limit: 500,
      });
      const recentTx = (txs || []).filter(
        (t) => new Date(t.createdAt).getTime() >= sevenDaysAgo
      );
      const completed = recentTx.filter((t) => t.status === 'completed').length;
      const failed = recentTx.filter((t) => t.status === 'failed').length;
      failedPaymentsCount7d = failed;
      const totalAttempts = completed + failed;
      paymentSuccessRate7d =
        totalAttempts > 0 ? Math.round((completed / totalAttempts) * 100) : null;
    } catch {
      failedPaymentsCount7d = 0;
    }

    return {
      incomeToman,
      todayIncomeToman,
      ordersCount: list.length,
      paidOrdersCount: paid.length,
      soldUnits,
      soldUnitsNote: 'تعداد اقلام سفارش‌های پرداخت‌شده (بدون تعداد خطی جداگانه در WC)',
      lowStockThreshold: threshold,
      lowStockProducts,
      pendingCommentsCount,
      pendingPaymentOrdersCount,
      failedPaymentsCount7d,
      paymentSuccessRate7d,
      recentOrders,
    };
  },

  async pendingComments() {
    const rows = await strapi.db.query('api::store-comment.store-comment').findMany({
      where: { is_visible: false },
      populate: ['user', 'parent'],
      orderBy: { id: 'desc' },
      limit: 100,
    });
    return (rows || []).map((r) => ({
      id: r.id,
      documentId: r.documentId,
      productSlug: r.productSlug,
      body: r.body,
      rating: r.rating,
      createdAt: r.createdAt,
      parentId: r.parent?.id || null,
      user: r.user
        ? {
            id: r.user.id,
            display_name: r.user.display_name || r.user.username || r.user.phone_no,
            phone_no: r.user.phone_no,
          }
        : null,
    }));
  },

  async setCommentVisibility(id, isVisible) {
    const updated = await strapi.db.query('api::store-comment.store-comment').update({
      where: { id: Number(id) },
      data: { is_visible: !!isVisible },
    });
    return updated;
  },

  async deleteComment(id) {
    await strapi.db.query('api::store-comment.store-comment').delete({
      where: { id: Number(id) },
    });
    return { ok: true };
  },

  async customers(query = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 25));
    const offset = (page - 1) * pageSize;
    const sort = String(query.sort || 'createdAt');
    const sortDir = query.sortDir === 'asc' ? 'asc' : 'desc';

    const where = {};
    if (query.q) {
      const q = String(query.q).trim();
      if (q) {
        where.$or = [
          { phone_no: { $containsi: q } },
          { username: { $containsi: q } },
          { email: { $containsi: q } },
          { display_name: { $containsi: q } },
          { first_name: { $containsi: q } },
          { last_name: { $containsi: q } },
        ];
      }
    }

    const orderBy =
      sort === 'name'
        ? { display_name: sortDir }
        : sort === 'ordersCount'
          ? { id: sortDir }
          : { createdAt: sortDir };

    const users = await strapi.db.query('plugin::users-permissions.user').findMany({
      where,
      orderBy,
      limit: pageSize,
      offset,
    });

    const total = await strapi.db.query('plugin::users-permissions.user').count({ where });

    const result = [];
    for (const u of users || []) {
      const orders = await strapi.db.query('plugin::webbycommerce.order').findMany({
        where: { user: u.id },
        orderBy: { id: 'desc' },
        limit: 20,
      });
      const ordersCount = await strapi.db.query('plugin::webbycommerce.order').count({
        where: { user: u.id },
      });

      if (query.hasOrders === 'yes' && ordersCount === 0) continue;
      if (query.hasOrders === 'no' && ordersCount > 0) continue;

      result.push({
        id: u.id,
        documentId: u.documentId,
        username: u.username,
        email: u.email,
        phone_no: u.phone_no,
        first_name: u.first_name,
        last_name: u.last_name,
        display_name: u.display_name,
        createdAt: u.createdAt,
        ordersCount,
        orders: (orders || []).map((o) => ({
          id: o.id,
          order_number: o.order_number,
          total: o.total,
          status: o.status,
          payment_status: o.payment_status,
          createdAt: o.createdAt,
        })),
      });
    }

    const filteredTotal =
      query.hasOrders === 'yes' || query.hasOrders === 'no' ? result.length : total;

    return {
      items: result,
      pagination: {
        page,
        pageSize,
        total: filteredTotal,
        pageCount: Math.ceil(filteredTotal / pageSize) || 0,
      },
    };
  },
});
