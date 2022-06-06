FROM node:14.15.5

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4200
EXPOSE 3000

CMD ["npm", "start"]