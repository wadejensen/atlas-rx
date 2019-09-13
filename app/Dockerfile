FROM node:12-alpine AS BUILD_ENV

WORKDIR /work
COPY . /work/

RUN npm install
RUN npm run package

FROM gcr.io/distroless/nodejs
COPY --from=BUILD_ENV /work/dist /app

CMD ["/app/index.js"]
