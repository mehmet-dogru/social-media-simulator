FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /v1/src/

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

CMD ["node", "app.js"]

EXPOSE 3000
