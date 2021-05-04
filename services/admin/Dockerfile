FROM node:14.16
EXPOSE 3060


WORKDIR /home/node/admin

ENV \
  NODE_ENV=production \
  PORT=3060 \
  AUTH_ENDPOINT=https://auth.canadiana.ca
  # AUTH_SECRET deliberately unset

RUN npm install -g pnpm
COPY package.json build ./ 

# adapter-node doesn't package svelte and svelte-kit (yet?)
RUN NODE_ENV=development pnpm install

USER node

CMD [ "node", "." ]