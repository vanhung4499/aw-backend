
# AW Platform API (Core)

ARG NODE_OPTIONS
ARG NODE_ENV
ARG API_BASE_URL
ARG CLIENT_BASE_URL
ARG API_HOST
ARG API_PORT
ARG DB_URI
ARG DB_HOST
ARG DB_NAME
ARG DB_PORT
ARG DB_USER
ARG DB_PASS
ARG DB_TYPE
ARG DB_SSL_MODE
ARG DB_CA_CERT
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_REGION
ARG AWS_S3_BUCKET
ARG EXPRESS_SESSION_SECRET
ARG JWT_SECRET
ARG JWT_REFRESH_TOKEN_SECRET
ARG REFRESH_TOKEN_EXPIRATION_TIME
ARG MAIL_FROM_ADDRESS
ARG MAIL_HOST
ARG MAIL_PORT
ARG MAIL_USERNAME
ARG MAIL_PASSWORD
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG GOOGLE_CALLBACK_URL
ARG INTEGRATED_USER_DEFAULT_PASS
ARG FILE_PROVIDER
ARG CLOUDINARY_CLOUD_NAME
ARG CLOUDINARY_API_KEY

FROM node:18-alpine3.17 AS dependencies

LABEL maintainer="vanhung4499@gmail.com"

ENV CI=true

# Set Python interpreter for `node-gyp` to use
ENV PYTHON /usr/bin/python

RUN apk --update add bash && npm i -g npm \
	&& apk add --no-cache --virtual build-dependencies curl jq python3 python3-dev py3-configobj py3-pip py3-setuptools build-base \
	snappy libheif dos2unix gcc g++ snappy-dev git libgcc libstdc++ linux-headers autoconf automake make nasm vips-dev vips

# Output Python3 version
RUN python3 --version

RUN npm install --quiet node-gyp@9.3.1 -g
RUN npm install yarn -g --force
RUN mkdir /srv/aw && chown -R node:node /srv/aw

COPY wait .deploy/api/entrypoint.prod.sh .deploy/api/entrypoint.compose.sh /
RUN chmod +x /wait /entrypoint.compose.sh /entrypoint.prod.sh && dos2unix /entrypoint.prod.sh && dos2unix /entrypoint.compose.sh

USER node:node

WORKDIR /srv/aw

COPY --chown=node:node apps/aw/package.json ./apps/aw/
COPY --chown=node:node apps/api/package.json ./apps/api/

COPY --chown=node:node packages/common/package.json ./packages/common/
COPY --chown=node:node packages/common-angular/package.json ./packages/common-angular/
COPY --chown=node:node packages/config/package.json ./packages/config/
COPY --chown=node:node packages/contracts/package.json ./packages/contracts/
COPY --chown=node:node packages/auth/package.json ./packages/auth/
COPY --chown=node:node packages/core/package.json ./packages/core/


RUN yarn install --network-timeout 1000000 --frozen-lockfile && yarn cache clean
# RUN apk del build-dependencies make gcc g++ python2 py2-setuptools vips-dev

FROM node:18-alpine3.17 AS prodDependencies

# Set Python interpreter for `node-gyp` to use
ENV PYTHON /usr/bin/python

RUN apk --update add bash && npm i -g npm \
	&& apk add --no-cache --virtual build-dependencies curl jq python3 python3-dev py3-configobj py3-pip py3-setuptools build-base \
	snappy libheif dos2unix gcc g++ snappy-dev git libgcc libstdc++ linux-headers autoconf automake make nasm vips-dev vips

# Output Python3 version
RUN python3 --version

RUN npm install --quiet node-gyp@9.3.1 -g
RUN npm install yarn -g --force
RUN mkdir /srv/aw && chown -R node:node /srv/aw

USER node:node

WORKDIR /srv/aw

COPY --chown=node:node apps/api/package.json ./apps/api/

COPY --chown=node:node packages/common/package.json ./packages/common/
COPY --chown=node:node packages/config/package.json ./packages/config/
COPY --chown=node:node packages/contracts/package.json ./packages/contracts/
COPY --chown=node:node packages/auth/package.json ./packages/auth/
COPY --chown=node:node packages/core/package.json ./packages/core/


# We do not build here Wakatime plugin, because it used in Desktop Apps for now
# COPY --chown=node:node packages/plugins/integration-wakatime/package.json ./packages/plugins/integration-wakatime/

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install --network-timeout 1000000 --frozen-lockfile --production && yarn cache clean
# RUN apk del build-dependencies make gcc g++ python2 py2-setuptools vips-dev

RUN rm -r node_modules/@angular

FROM node:18-alpine3.17 AS development

USER node:node

WORKDIR /srv/aw

COPY --chown=node:node --from=dependencies /wait /entrypoint.prod.sh /entrypoint.compose.sh /
COPY --chown=node:node --from=dependencies /srv/aw .
COPY . .

FROM node:18-alpine3.17 AS build

WORKDIR /srv/aw

RUN mkdir dist

COPY --chown=node:node --from=development /srv/aw .

ENV NODE_OPTIONS=${NODE_OPTIONS:-"--max-old-space-size=30000"}
ENV NODE_ENV=${NODE_ENV:-production}
ENV DEMO=${DEMO:-false}

ENV IS_DOCKER=true

# Temporary disable caching in NX Cloud for builds
ENV NX_NO_CLOUD=true

RUN yarn build:package:api
RUN yarn build:api:prod:docker

FROM node:18-alpine3.17 AS production

WORKDIR /srv/aw

COPY --chown=node:node --from=dependencies /wait /entrypoint.prod.sh /entrypoint.compose.sh ./
COPY --chown=node:node --from=prodDependencies /srv/aw/node_modules/ ./node_modules/
COPY --chown=node:node --from=build /srv/aw/packages/ ./packages/

# Copy static assets files which used for example in the seeds (e.g. images for features, reports, screenshots)
COPY --chown=node:node apps/api/src/assets apps/api/src/assets

# Copy folder to which we later move static assets (e.g. images for features, reports, screenshots)
COPY --chown=node:node apps/api/public apps/api/public

# Copy static assets used in seeds (e.g. reports screenshots images, see report.seed.ts) to public folder.
# We are doing it in the seed code too, however if DB seed already was done one time and
# docker container rebuilds, we will not have images unless we copy them during docker build manually here.
COPY --chown=node:node apps/api/src/assets/seed apps/api/public

COPY --chown=node:node --from=build /srv/aw/dist/apps/api .

RUN npm install pm2@4.5.1 -g && \
	mkdir /import && chown node:node /import && \
	touch ormlogs.log && chown node:node ormlogs.log && chown node:node wait && \
	chmod +x wait entrypoint.compose.sh entrypoint.prod.sh && chown -R node:node apps/

USER node:node

ENV NODE_OPTIONS=${NODE_OPTIONS:-"--max-old-space-size=7000"}
ENV NODE_ENV=${NODE_ENV:-production}
ENV API_HOST=${API_HOST:-api}
ENV API_PORT=${API_PORT:-3000}
ENV API_BASE_URL=${API_BASE_URL:-http://localhost:3000}
ENV CLIENT_BASE_URL=${CLIENT_BASE_URL:-http://localhost:4200}
ENV DB_URI=${DB_URI}
ENV DB_HOST=${DB_HOST:-db}
ENV DB_NAME=${DB_NAME:-postgres}
ENV DB_PORT=${DB_PORT:-5432}
ENV DB_USER=${DB_USER}
ENV DB_PASS=${DB_PASS}
ENV DB_TYPE=${DB_TYPE:-sqlite}
ENV DB_SSL_MODE=${DB_SSL_MODE}
ENV DB_CA_CERT=${DB_CA_CERT}
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV AWS_REGION=${AWS_REGION}
ENV AWS_S3_BUCKET=${AWS_S3_BUCKET}
ENV EXPRESS_SESSION_SECRET=${EXPRESS_SESSION_SECRET:-aw}
ENV JWT_SECRET=${JWT_SECRET:-secretKey}
ENV JWT_REFRESH_TOKEN_SECRET=${JWT_REFRESH_TOKEN_SECRET:-refreshSecretKey}
ENV REFRESH_TOKEN_EXPIRATION_TIME=${REFRESH_TOKEN_EXPIRATION_TIME:-86400}
ENV MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS}
ENV MAIL_HOST=${MAIL_HOST}
ENV MAIL_PORT=${MAIL_PORT}
ENV MAIL_USERNAME=${MAIL_USERNAME}
ENV MAIL_PASSWORD=${MAIL_PASSWORD}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL}
ENV INTEGRATED_USER_DEFAULT_PASS=${INTEGRATED_USER_DEFAULT_PASS}
ENV FILE_PROVIDER=${FILE_PROVIDER}
ENV CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
ENV CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}

EXPOSE ${API_PORT}

ENTRYPOINT [ "./entrypoint.prod.sh" ]

CMD [ "node", "main.js" ]
