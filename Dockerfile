FROM node:alpine

RUN apk update && apk add chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /build

COPY package.json package-lock.json config.mjs fetch.mjs /build

RUN npm install

ENTRYPOINT ["/usr/local/bin/npm", "run", "fetch"]

