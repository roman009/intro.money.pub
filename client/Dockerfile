# build environment
FROM node:15.14.0-alpine3.10 as build
RUN apk add --no-cache git
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install -g npm@7.11.1
RUN npm install react-scripts@3.0.1 -g 
RUN npm install 
COPY . /app
RUN npm run build

# production environment
FROM node:15.14.0-alpine3.10
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["npm", "start"]