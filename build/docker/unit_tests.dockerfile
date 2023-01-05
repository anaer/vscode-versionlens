# docker build -t "versionlens:tests" -f ./unit_tests.dockerfile ../../
FROM node:18.12.1-buster-slim

COPY / /

RUN npm install

CMD npm run test:unit