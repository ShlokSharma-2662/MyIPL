# --- Build the Vite React SPA ----------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js postcss.config.js tailwind.config.js eslint.config.js ./
COPY public ./public
COPY src ./src

# Empty = same-origin requests (nginx proxies /api → api service).
# Override at build time for an absolute API URL, e.g.:
#   docker build --build-arg VITE_API_URL=https://api.example.com .
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Serve with nginx ------------------------------------------------------
FROM nginx:1.27-alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
