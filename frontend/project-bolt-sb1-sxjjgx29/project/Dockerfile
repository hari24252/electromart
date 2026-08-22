FROM node:22-alpine AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY index.html tsconfig.json tsconfig.node.json vite.config.ts postcss.config.js tailwind.config.js ./
COPY src ./src
RUN pnpm build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O - http://127.0.0.1/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
