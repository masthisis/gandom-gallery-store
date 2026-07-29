# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /opt/app

# Copy package files and install dependencies
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

# Copy full application source code
COPY backend/ ./

# Build Strapi admin interface
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS runtime

WORKDIR /opt/app

ENV NODE_ENV=production

# Copy package files and install production dependencies only
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --only=production

# Copy built application and artifacts from build stage
COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/public ./public
COPY --from=build /opt/app/config ./config
COPY --from=build /opt/app/src ./src
COPY --from=build /opt/app/database ./database
COPY --from=build /opt/app/favicon.png ./favicon.png
COPY --from=build /opt/app/tsconfig.json ./tsconfig.json

EXPOSE 1337

CMD ["npm", "run", "start"]
