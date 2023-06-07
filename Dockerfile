FROM node:latest
WORKDIR /app
COPY package.json .
RUN npm install
COPY --from=build /app /app
CMD [ "npm", "start" ]
EXPOSE 3000