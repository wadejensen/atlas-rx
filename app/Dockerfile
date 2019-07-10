FROM node:12-alpine AS BUILD_ENV

WORKDIR /work
COPY . /work/

RUN npm install
RUN npm run package

FROM node:12-alpine
COPY --from=BUILD_ENV /work/dist/ /app/dist
COPY --from=BUILD_ENV /work/static/ /app/static

CMD ["node", "/app/dist/index.js"]
