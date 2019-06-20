FROM node:jessie

WORKDIR /app

#COPY package.json ./

#RUN npm install
#RUN npm run build-ts

COPY dist .

EXPOSE 8080
CMD [ "node", "server.js" ]
