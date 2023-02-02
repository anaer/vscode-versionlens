# see ./publish.gitlab-ci.yml for cmdline example of how to run on local docker
FROM node:19.4-alpine
ARG TARGET_PATH=/versionlens

COPY / $TARGET_PATH

WORKDIR $TARGET_PATH

# install deps
RUN npm install @vscode/vsce rimraf -g
RUN npm install

# run tests
RUN npm run test:unit

# bundle
RUN npm run pack -- --mode=production

# remove all node modules
RUN rimraf ./node_modules

# install prod dependencies only
RUN npm install --omit dev

# package the extension
RUN vsce package

# move package to artifacts
RUN mkdir ./artifacts
RUN mv *.vsix ./artifacts

# publish
CMD vsce publish