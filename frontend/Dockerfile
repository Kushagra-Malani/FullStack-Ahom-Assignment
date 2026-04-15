# frontend/Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy application files
COPY . .

# Pass build args as env variables for Vite to pick them up
ARG VITE_GITHUB_CLIENT_ID
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GITHUB_CLIENT_ID=$VITE_GITHUB_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the app static files
RUN npm run build

# Install serve to host the static folder
RUN npm install -g serve

# Serve the application on port 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
