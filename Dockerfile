FROM node:16 as pnpm
ENV PNPM_VERSION 6.10.0
RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

FROM pnpm as install
WORKDIR /repo

COPY packages/ packages/
COPY services/ services/

COPY pnpm-lock.yaml pnpm-lock.yaml
COPY pnpm-workspace.yaml pnpm-workspace.yaml

RUN pnpm install -r --frozen-lockfile
