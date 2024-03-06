FROM node:alpine

RUN apk update && apk add chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /app

COPY package.json package-lock.json /app

RUN npm install

ENTRYPOINT ["/usr/local/bin/npm", "run", "fetch"]

COPY config.mjs fetch.mjs /app
