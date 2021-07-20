# init
# Sets up pnpm and copies over workspace config.

FROM node:16-alpine AS init

RUN apk add --no-cache curl
RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /repo

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

ENTRYPOINT [ "pnpm", "run" ]
