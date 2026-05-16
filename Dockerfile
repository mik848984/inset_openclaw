FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN apk update && apk add ghostscript

RUN npm install --os=linux --libc=musl --cpu=x64 --legacy-peer-deps sharp && npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
