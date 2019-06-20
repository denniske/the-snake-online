
FROM node:jessie as build

WORKDIR /

#COPY package.json ./
#COPY tsconfig.json ./

COPY . .

RUN npm install
RUN npm run build-ts

COPY assets dist/assets

#COPY node_modules .
#COPY dist .





FROM node:jessie

WORKDIR /app/dist

#COPY package.json ./
#COPY tsconfig.json ./

#RUN npm install
#RUN npm run build-ts

COPY --from=build node_modules node_modules
COPY --from=build dist .

#EXPOSE 8080

CMD [ "node", "server.js" ]
