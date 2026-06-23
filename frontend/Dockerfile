FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY frontend/package*.json /app/
RUN npm ci

# Copy frontend source
COPY frontend/ /app

EXPOSE 5173

# Vite dev server (hot reload; enabled by mounted volumes)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

