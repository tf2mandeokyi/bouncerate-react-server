FROM node:16-alpine

EXPOSE 43

WORKDIR /app
COPY . /app
COPY package-docker.json /app/package.json
RUN npm i -g npm-check-updates
RUN ncu -u
RUN npm install

CMD [ "node", "server.js" ]