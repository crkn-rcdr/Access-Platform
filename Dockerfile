# init
# Sets up pnpm and copies over workspace config.

FROM node:16.11.1-alpine AS init

ENV ADMIN_PORT=4747 \
    ADMIN_DEV_WS_PORT=14747 \
    LAPIN_PORT=5858

RUN apk add --no-cache curl
RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /repo

ENTRYPOINT [ "pnpm", "run" ]

# dev
# Downloads and installs package and service dependencies.

FROM init AS dev 

# Fetch dependencies from the lockfile. If you've changed package.json for some other reason,
# this stage is skipped, which is a lovely time-saver.
COPY pnpm-lock.yaml pnpm-lock.yaml
RUN pnpm fetch --silent

# Make sure .dockerignore has what it needs!
COPY . .

# The offline flag ensures that the dependencies are installed from the fetched cache 
RUN pnpm install -r --offline --silent

# Lets just build every package now, to be safe
RUN pnpm run -r build --filter ./packages

# builder 
# Gets things ready for production images

FROM dev AS builder

# Build services that need to be built
RUN pnpm run -r build --filter ./services

# Purge node_modules directories.
RUN pnpm -r exec -- rm -rf node_modules && rm -rf node_modules

# prod
# Fresh production image.

FROM init AS prod

COPY --from=builder /repo /repo

RUN pnpm i -r --silent --prod
