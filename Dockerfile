# Build client
FROM node:20-alpine AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Server + static
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
RUN mkdir -p /app/data
# Copy built client into server's expected location
COPY --from=client /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

COPY server/start.sh ./
RUN chmod +x start.sh
CMD ["./start.sh"]
