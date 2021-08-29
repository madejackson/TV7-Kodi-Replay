FROM node:lts

WORKDIR /app

RUN mkdir -p /output

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

