# # 1) Base image
# FROM node:18-alpine

# # 2) Working directory inside container
# WORKDIR /app

# # 3) Copy package files first (better for caching)
# COPY package*.json ./

# # 4) Install dependencies
# RUN npm install

# # 5) Copy the rest of the backend code
# COPY . .

# # 6) Environment variable for production (optional)
# ENV NODE_ENV=production

# # 7) Expose the backend port (change 5000 if your server uses another port)
# EXPOSE 5000

# # 8) Start the backend
# # Make sure your package.json has: "start": "node index.js" (or server.js)
# CMD ["npm", "start"]


# ---------- FRONTEND BUILD ----------
FROM node:18 AS frontend

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client .
RUN npm run build

# ---------- BACKEND ----------
FROM node:18

WORKDIR /app/server

COPY server/package*.json ./
RUN npm install

COPY server .

# Copy frontend build into backend public folder
COPY --from=frontend /app/client/build ./public

EXPOSE 5000

CMD ["node", "index.js"]
