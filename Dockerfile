FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4173

COPY package.json ./
COPY server.js index.html game.js styles.css ./

USER node
EXPOSE 4173

CMD ["node", "server.js"]
