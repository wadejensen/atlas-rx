FROM node:12-alpine AS BUILD_ENV

WORKDIR /work
COPY . /work/

RUN npm install
RUN npm run package

FROM node:12-alpine
WORKDIR /root
COPY --from=BUILD_ENV /work/dist/ .

ENTRYPOINT ["node", "/root/server.js"]
