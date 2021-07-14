FROM node:16 AS pnpm

ENV PNPM_VERSION 6.10.0
RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

FROM pnpm AS install

WORKDIR /repo

COPY packages/ packages/
COPY services/ services/

COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY pnpm-workspace.yaml pnpm-workspace.yaml

RUN pnpm install -r --frozen-lockfile

FROM install AS kivik_watch

WORKDIR /repo/services/couchdb

CMD ["pnpm", "run", "watch:docker"]
