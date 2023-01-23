# see ./test.gitlab-ci.yml for cmdline example of how to run on local docker
FROM node:latest
ARG TARGET_PATH=/versionlens

COPY / $TARGET_PATH

WORKDIR $TARGET_PATH
RUN npm install
CMD npm test:unit