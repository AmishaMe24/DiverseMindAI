FROM node:20-alpine as build

WORKDIR /app

COPY Frontend/package*.json ./
RUN npm install

COPY Frontend .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
