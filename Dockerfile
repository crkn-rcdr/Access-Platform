# init
# Sets up pnpm and copies over workspace config. Configures pnpm to install packages locally.

FROM node:16 AS init

ENV PNPM_VERSION 6.10.2
RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /repo

RUN echo "store-dir=./.docker-pnpm-store" > .npmrc

COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY pnpm-workspace.yaml pnpm-workspace.yaml

# install
# Downloads and installs package and service dependencies.

FROM init AS install

COPY packages/ packages/
COPY services/ services/

RUN pnpm install -r --frozen-lockfile

# build
# Builds every package. TODO: I only need this for prod

# FROM init AS build

# COPY --from=install /repo/.docker-pnpm-store/ .docker-pnpm-store/
# COPY --from=install /repo/node_modules/ node_modules

# COPY packages/ packages/

# RUN pnpm install -r --frozen-lockfile
# RUN pnpm run -r build --filter ./packages

# package_watch
# Recompiles every package on file change.

FROM install AS package_watch

CMD ["pnpm", "run", "watch", "-r", "--filter", "./packages", "--parallel"]

# kivik_watch
# Runs `kivik deploy --watch`, pointing to the CouchDB endpoint spun up in docker-compose

FROM install AS kivik_watch

WORKDIR /repo/services/couchdb

CMD ["pnpm", "run", "watch:docker"]

FROM install AS lapin_dev

WORKDIR /repo/services/lapin

CMD ["pnpm", "run", "dev"]
