FROM node:jessie

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./

RUN npm install
RUN npm run build-ts

COPY dist .

EXPOSE 8080
CMD [ "node", "dist/server.js" ]
