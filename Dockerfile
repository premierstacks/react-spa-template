FROM node:lts AS build
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json .
RUN npm run npm:install
COPY . .
RUN npm run production

FROM nginxinc/nginx-unprivileged
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
ENV NGINX_ENTRYPOINT_WORKER_PROCESSES_AUTOTUNE=1
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx
ENV NGINX_ROOT=/usr/share/nginx/html
COPY ./docker/nginx /etc/nginx/templates
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./docker/entrypoint/* /docker-entrypoint.d
