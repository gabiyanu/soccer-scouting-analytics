FROM node:20-slim

WORKDIR /app

# Copy package files and install ALL dependencies (need devDeps for build)
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Accept Gemini API key at build time so Vite can bake it into the bundle
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Build the React frontend
RUN npm run build

# Cloud Run sets PORT=8080 — server.ts reads process.env.PORT
ENV PORT=8080

EXPOSE 8080

# Run the Express server (serves both /api and the built frontend)
CMD ["npx", "tsx", "server.ts"]
