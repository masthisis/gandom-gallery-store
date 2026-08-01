# Architecture — گندم گالری

```
Storefront (Vite/React, fa/RTL) ──┐
                                  ├──► Strapi 5
Backoffice (Vite/React, fa/RTL) ──┘         │
                                            ├── WebbyCommerce (catalog/cart/orders)
                                            ├── auth-otp (SMS.ir)
                                            ├── digipay (UPG)
                                            └── homepage / settings / pages CMS
```

WebbyCommerce owns ecommerce data. Custom code is adapters + presentation CMS only.
