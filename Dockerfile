# init
# Sets up pnpm and copies over workspace config. Configures pnpm to install packages locally.

FROM node:16 AS init

ENV PNPM_VERSION 6.10.2
RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /repo

COPY pnpm-lock.yaml pnpm-lock.yaml
RUN pnpm fetch --silent

# install
# Downloads and installs package and service dependencies.

FROM init AS install

COPY . .
RUN pnpm install --offline --silent

ENTRYPOINT ["pnpm", "run"]

# build
# Builds every package.

FROM install AS build

RUN pnpm run -r build

ENTRYPOINT [ "pnpm", "run" ]