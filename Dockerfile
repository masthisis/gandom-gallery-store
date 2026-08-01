# Liara basic plan ~5min build timeout: prebuild admin in CI (`npm run build` in backend/)
# then deploy so this image only installs production deps.
FROM node:20-alpine

WORKDIR /opt/app

ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

COPY backend/ ./

EXPOSE 1337
CMD ["npm", "run", "start"]
