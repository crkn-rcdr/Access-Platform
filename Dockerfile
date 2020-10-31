FROM node:14-alpine

WORKDIR /access
RUN chown -R node:node .

USER node

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node Databases Databases
COPY --chown=node:node test test

EXPOSE 8081
CMD yarn run test
