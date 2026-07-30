FROM node:18-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy source
COPY . ./

ENV NODE_ENV=production
ENV PORT=5001

# Set non-root user for security
RUN chown -R node:node /app
USER node

EXPOSE 5001
CMD ["node", "server.js"]
