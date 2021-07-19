# init
# Sets up pnpm and copies over workspace config. Configures pnpm to install packages locally.

FROM node:16 AS init

ENV PNPM_VERSION 6.10.2
RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /repo

COPY pnpm-lock.yaml pnpm-lock.yaml
RUN pnpm fetch

# install
# Downloads and installs package and service dependencies.

FROM init AS install

COPY . .
RUN pnpm install -r --offline --silent

ENTRYPOINT ["pnpm", "run"]

# # build
# # Builds every package. TODO: I only need this for prod

# FROM init AS build

# COPY --from=install /repo/.docker-pnpm-store/ .docker-pnpm-store/
# COPY --from=install /repo/node_modules/ node_modules

# COPY packages/ packages/

# RUN pnpm install -r --frozen-lockfile --silent
# RUN pnpm run -r build --filter ./packages

