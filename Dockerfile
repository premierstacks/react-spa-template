# syntax=docker/dockerfile:1

ARG DEVCONTAINER_VERSION=24-trixie
ARG NGINX_VERSION=latest
ARG NODE_VERSION=24-trixie

FROM node:${NODE_VERSION} AS base
ENV APP_ENV=production
ENV NODE_ENV=production
ENV APP_VERSION=latest
WORKDIR /workspaces

FROM base AS development_deps
COPY ./package.json ./
RUN npm run npm:install

FROM development_deps AS build
COPY ./ ./
RUN npm run build

FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runtime
COPY --from=build /workspaces/dist /usr/share/nginx/html
COPY ./docker/nginx /etc/nginx

FROM mcr.microsoft.com/devcontainers/typescript-node:${DEVCONTAINER_VERSION} AS devcontainer
WORKDIR /workspaces
