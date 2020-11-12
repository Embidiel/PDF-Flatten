FROM jameskyburz/graphicsmagick-alpine:v1.0.0 as gm
FROM minidocks/ghostscript as gs
FROM node:13-alpine

COPY --from=gm /usr/ /usr/
COPY --from=gs /usr/ /usr/

RUN apk update && apk add fontconfig libstdc++ libc6-compat 

ENV PATH=/usr/bin:$PATH

COPY package.json .

RUN npm install
WORKDIR /usr/app/src

COPY . .
CMD ["npm", "run", "start"]