FROM node:20-alpine

WORKDIR /app

COPY . .

RUN chmod +x setup.sh && ./setup.sh

RUN npm install

EXPOSE 25565

CMD ["npm", "start"]

CMD ["npm", "start"]