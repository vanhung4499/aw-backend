###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:20-alpine As development

RUN npm -g i pnpm

WORKDIR /usr/src/app

COPY --chown=node:node pnpm-lock.yaml ./

ENV NPM_CONFIG_STORE_DIR=/pnpm
ENV NPM_CONFIG_PACKAGE_IMPORT_METHOD=copy

RUN pnpm fetch --prod

COPY --chown=node:node . .
RUN pnpm install

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine As build

WORKDIR /usr/src/app

RUN npm -g i pnpm

COPY --chown=node:node pnpm-lock.yaml ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN pnpm build

ENV NODE_ENV production

RUN pnpm install --prod

USER node


###################
# PRODUCTION
###################

FROM node:20-alpine As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]
