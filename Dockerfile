FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
