FROM node:lts AS build
ENV NODE_ENV=production
WORKDIR /app
COPY . .
RUN make production

FROM nginxinc/nginx-unprivileged AS nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./docker/nginx /etc/nginx
