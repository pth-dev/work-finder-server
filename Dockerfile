FROM node:21.7.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @nestjs/cli@10.4.8

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
