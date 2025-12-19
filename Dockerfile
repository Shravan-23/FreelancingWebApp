# ---------- FRONTEND ----------
FROM node:18 AS frontend

WORKDIR /app/client

COPY client/package*.json ./
RUN npm install --legacy-peer-deps

COPY client .
RUN npm run build


# ---------- BACKEND ----------
FROM node:18

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --legacy-peer-deps

COPY server ./server

COPY --from=frontend /app/client/build ./server/public

EXPOSE 5000

CMD ["node", "server/index.js"]
