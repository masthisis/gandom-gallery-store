#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  '@webbycrown',
  'webbycommerce',
  'admin',
  'src',
  'translations',
  'fa.json'
);

const minimal = {
  'webbycommerce.plugin.name': 'WebbyCommerce',
  'webbycommerce.plugin.description': 'Commerce',
};

try {
  if (!fs.existsSync(target)) {
    process.exit(0);
  }
  const raw = fs.readFileSync(target, 'utf8').trim();
  if (raw.length > 2) {
    JSON.parse(raw);
    process.exit(0);
  }
  fs.writeFileSync(target, `${JSON.stringify(minimal, null, 2)}\n`, 'utf8');
  console.log('[gandom] repaired @webbycrown/webbycommerce fa.json');
} catch (err) {
  fs.writeFileSync(target, `${JSON.stringify(minimal, null, 2)}\n`, 'utf8');
  console.log('[gandom] wrote fallback @webbycrown/webbycommerce fa.json:', err.message);
}
